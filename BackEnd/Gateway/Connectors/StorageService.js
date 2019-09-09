const aws = require('aws-sdk')
const uuidv1 = require('uuid/v1')
const fs = require('fs')
const imagemin = require('imagemin')
const imageminJpegtran = require('imagemin-jpegtran')
const imageminPngquant = require('imagemin-pngquant')

const s3 = new aws.S3()

const imageminOptions = {
	progressive: true,
	quality: '65-80',
}

const isImage = file => ['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)

const isApprovedFile = file => ['pdf', 'xlsx', 'docx', 'png', 'jpg', 'jpeg'].includes(file.filename.split('.').pop())

const isVideo = () => true

const optimizeImage = (imagePath) => {
	if (!fs.existsSync('/Gateway/tmp/optimized')) {
		fs.mkdirSync('/Gateway/tmp/optimized')
	}
	return imagemin([imagePath], '/Gateway/tmp/optimized', {
		plugins: [
			imageminJpegtran(imageminOptions),
			imageminPngquant(imageminOptions),
		],
	})
		.then((file) => {
			deleteLocally(imagePath)
			return file[0]
		})
}

const storeLocally = (file) => {
	let fileName = `${uuidv1()}.${file.filename.split('.').pop()}`
	fileName = fileName.replace(/[^a-zA-Z0-9.]/g, '')
	return new Promise((resolve, reject) => {
		if (!fs.existsSync('/Gateway/tmp')) {
			fs.mkdirSync('/Gateway/tmp')
		}
		const writeStream = fs.createWriteStream(`/Gateway/tmp/${fileName}`, { flags: 'w' })
		file.stream.pipe(writeStream)
		writeStream.on('close', () => {
			fs.readFile(`/Gateway/tmp/${fileName}`, (err, data) => {
				if (err) reject(new Error('Error writing file to system'))
				resolve({ name: fileName, path: `/Gateway/tmp/${fileName}`, data })
			})
		})
	})
}

const deleteLocally = path => new Promise((resolve) => {
	fs.unlinkSync(path)
	resolve()
})

const upload = (file, path) => storeLocally(file)
	.then(({ name, path: localPath, data }) => new Promise((resolve, reject) => {
		let promise = Promise.resolve({ data, path: localPath })
		if (isImage(file)) {
			promise = optimizeImage(localPath)
		}
		promise.then(({ data: optimizedData, path: optimizedPath }) => {
			s3.putObject({
				ACL: 'public-read',
				Bucket: process.env.BUCKET_NAME,
				Key: `${path}/${name}`,
				Body: optimizedData,
				ContentType: file.mimetype,
			}, (error) => {
				if (error) reject(new Error('Error uploading file'))
				else deleteLocally(optimizedPath).then(() => resolve({ remoteUrl: `https://s3.amazonaws.com/${process.env.BUCKET_NAME}/${path}/${name}`, relativeUrl: `${path}/${name}` }))
			})
		})
	}))

module.exports = {
	isImage,
	isApprovedFile,
	isVideo,
	storeLocally,
	deleteLocally,
	upload,
	batchUpload: (files, path, condition = () => true) => files.reduce((acc, img) => Promise.all([acc, img])
		.then(([urls, image]) => {
			if (condition(image)) {
				return upload(image, path)
					.then((url) => {
						urls.push(url)
						return urls
					})
			}
			storeLocally(image).then(({ path: localPath }) => deleteLocally(localPath))
			urls.push(null)
			return Promise.resolve(urls)
		}), Promise.resolve([])),
	deleteRemote: remotePath => new Promise((resolve, reject) => {
		const params = {
			Bucket: process.env.BUCKET_NAME,
			Key: remotePath,
		}
		s3.deleteObject(params, (error) => {
			if (error) reject(new Error('Error deleting file'))
			else resolve()
		})
	}),
}
