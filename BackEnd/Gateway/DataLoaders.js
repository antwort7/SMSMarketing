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
	registrationLoader: () => new Error('Loader not initialized'),
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
			registrationLoader: (error = true) => new DataLoader(keys => generateLoaderPath(process.env.REGISTRATION_SERVICE, '/registrations/batch')
				.then(url => request({
					method: 'POST',
					uri: `${url}`,
					body: { ids: keys },
					json: true,
				}))
				.then(results => results.map((val, i) => {
					if (!val) {
						if (error) {
							return new CustomError(CustomError.errors.NOT_FOUND, `Registration not found: ${keys[i]}`)
						}
						return null
					}
					return val
				}))
				.catch(() => new CustomError(CustomError.errors.SERVICE_ERROR, 'registration service failed'))),
			}
		return instance
	}
	initialize()
	return {
		initialize,
		loaders: instance,
	}
}
