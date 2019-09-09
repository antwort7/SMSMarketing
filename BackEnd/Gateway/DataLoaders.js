const DataLoader = require('dataloader')

const request = require('request-promise')

const dns = require('dns')

const CustomError = require('./CustomError')

const resolveUrl = (url) => {
	const getRandomInt = max => Math.floor(Math.random() * (max + 1))
	const record = url.split('http://')[1]
	return new Promise((resolve) => {
		dns.resolveSrv(record, (err, addresses) => {
			if (addresses && addresses.length === 0) {
				throw new Error(`Service unavailable ${record}`)
			}
			const randomNumber = getRandomInt(addresses.length - 1)
			const address = addresses[randomNumber]
			const { port } = address
			dns.resolve4(address.name, (error, typeA) => {
				resolve(`http://${typeA}:${port}`)
			})
		})
	})
}

const generateLoaderPath = (baseUrl, path) => {
	let urlPromise = Promise.resolve(`${baseUrl}${path}`)
	if (process.env.STAGE === 'Production' || process.env.STAGE === 'Test') {
		urlPromise = resolveUrl(baseUrl).then(newBase => `${newBase}${path}`)
	}
	return urlPromise
}

let instance = {
	companyLoader: () => new Error('Loader not initialized'),
	locationLoader: () => new Error('Loader not initialized'),
	keyLoader: () => new Error('Loader not initialized'),
	invoiceLoader: () => new Error('Loader not initialized'),
	reportLoader: () => new Error('Loader not initialized'),
	categoryLoader: () => new Error('Loader not initialized'),
}

const getInstance = () => {
	if (instance !== undefined) {
		return instance
	}
	throw Error('Loaders not initialized')
}

module.exports.instance = () => getInstance()

module.exports.init = () => {
	const initialize = () => {
		instance = {
			companyLoader: (error = true) => new DataLoader(keys => generateLoaderPath(process.env.COMPANY_SERVICE, '/companies/batch')
				.then(url => request({
					method: 'POST',
					uri: `${url}`,
					body: { ids: keys },
					json: true,
				}))
				.then(results => results.map((val, i) => {
					if (!val) {
						if (error) {
							return new CustomError(CustomError.errors.NOT_FOUND, `Company not found: ${keys[i]}`)
						}
						return null
					}
					return val
				}))
				.catch(() => new CustomError(CustomError.errors.SERVICE_ERROR, 'company service failed'))),
			locationLoader: (error = true) => new DataLoader(keys => generateLoaderPath(process.env.COMPANY_SERVICE, '/locations/batch')
				.then(url => request({
					method: 'POST',
					uri: `${url}`,
					body: { ids: keys },
					json: true,
				}))
				.then(results => results.map((val, i) => {
					if (!val) {
						if (error) {
							return new CustomError(CustomError.errors.NOT_FOUND, `Location not found: ${keys[i]}`)
						}
						return null
					}
					return val
				}))
				.catch(() => new CustomError(CustomError.errors.SERVICE_ERROR, 'company service failed'))),
			keyLoader: (error = true) => new DataLoader(keys => generateLoaderPath(process.env.KEY_SERVICE, '/keys/batch')
				.then(url => request({
					method: 'POST',
					uri: `${url}`,
					body: { ids: keys },
					json: true,
				}))
				.then(results => results.map((val, i) => {
					if (!val) {
						if (error) {
							return new CustomError(CustomError.errors.NOT_FOUND, `Key not found: ${keys[i]}`)
						}
						return null
					}
					return val
				}))
				.catch(() => new CustomError(CustomError.errors.SERVICE_ERROR, 'key service failed'))),
			invoiceLoader: (error = true) => new DataLoader(keys => generateLoaderPath(process.env.INVOICE_SERVICE, '/invoices/batch')
				.then(url => request({
					method: 'POST',
					uri: `${url}`,
					body: { ids: keys },
					json: true,
				}))
				.then(results => results.map((val, i) => {
					if (!val) {
						if (error) {
							return new CustomError(CustomError.errors.NOT_FOUND, `Invoice not found: ${keys[i]}`)
						}
						return null
					}
					return val
				}))
				.catch(() => new CustomError(CustomError.errors.SERVICE_ERROR, 'Invoice service failed'))),
			reportLoader: (error = true) => new DataLoader(keys => generateLoaderPath(process.env.INVOICE_SERVICE, '/invoices/report/batch')
				.then(url => request({
					method: 'POST',
					uri: `${url}`,
					body: { ids: keys },
					json: true,
				}))
				.then(results => results.map((val, i) => {
					if (!val) {
						if (error) {
							return new CustomError(CustomError.errors.NOT_FOUND, `Report not found: ${keys[i]}`)
						}
						return null
					}
					return val
				}))
				.catch(() => new CustomError(CustomError.errors.SERVICE_ERROR, 'Report service failed'))),
			categoryLoader: (error = true) => new DataLoader(keys => generateLoaderPath(process.env.INVOICE_SERVICE, '/categories/batch')
				.then(url => request({
					method: 'POST',
					uri: `${url}`,
					body: { ids: keys },
					json: true,
				}))
				.then(results => results.map((val, i) => {
					if (!val) {
						if (error) {
							return new CustomError(CustomError.errors.NOT_FOUND, `Category not found: ${keys[i]}`)
						}
						return null
					}
					return val
				}))
				.catch(() => new CustomError(CustomError.errors.SERVICE_ERROR, 'Category service failed'))),
			}
		return instance
	}
	initialize()
	return {
		initialize,
		loaders: instance,
	}
}
