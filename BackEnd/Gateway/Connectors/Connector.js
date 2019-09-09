const request = require('request-promise')
const dns = require('dns')
const querystring = require('querystring')

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

module.exports = baseUrl => ({
	makeRequest: (path, method, body = {}) => {
		let urlPromise = Promise.resolve(baseUrl)
		if (process.env.STAGE === 'Production' || process.env.STAGE === 'Test') {
			urlPromise = resolveUrl(baseUrl)
		}
		return urlPromise
			.then(url => request({
				method,
				uri: `${url}${path}`,
				body,
				json: true,
			}))
	},

	makeTokenRequest: (path, {
		filter, token, limit, sortBy, order,
	}) => {
		const queryObject = {}
		if (filter) {
			queryObject.filter = JSON.stringify(filter)
		}
		if (token) {
			queryObject.token = token
		}
		if (limit) {
			queryObject.limit = limit
		}
		if (sortBy) {
			queryObject.sortBy = sortBy
		}
		if (order) {
			queryObject.order = order
		}
		if (Object.keys(queryObject).length > 0) {
			path = `${path}?${querystring.stringify(queryObject)}`
		}
		let urlPromise = Promise.resolve(baseUrl)
		if (process.env.STAGE === 'Production' || process.env.STAGE === 'Test') {
			urlPromise = resolveUrl(baseUrl)
		}
		return urlPromise
			.then(url => request({
				method: 'GET',
				uri: `${url}${path}`,
				json: true,
			}))
	},
})
