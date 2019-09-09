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
			const { port, name } = addresses[randomNumber]
			dns.resolve4(name, (error, typeA) => {
				resolve(`http://${typeA}:${port}`)
			})
		})
	})
}

module.exports = (baseUrl) => {
	const urlPromise = resolveUrl(baseUrl)
	return {
		makeRequest: (path, method, body = {}) => urlPromise
			.then(url => request({
				method,
				uri: `${url}${path}`,
				body,
				json: true,
			})),

		makeTokenRequest: (path, { filter, token, limit, sortBy, order }) => {
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
			return urlPromise
				.then(url => request({
					method: 'GET',
					uri: `${url}${path}`,
					json: true,
				}))
		},
	}
}
