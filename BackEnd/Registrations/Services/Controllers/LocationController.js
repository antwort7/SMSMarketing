const CustomError = require('../../CustomError')

const parseQuery = ({
	filter = '{}', token = null, limit = 50, sortBy = '_id', order = 1,
}) => {
	const query = { sortBy: {} }

	query.sortBy[sortBy] = parseInt(order, 10)

	if (limit) {
		query.limit = parseInt(limit, 10)
	}

	if (filter) {
		query.filter = JSON.parse(filter)
	}

	if (token) {
		try {
			const tokenData = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))
			const [, index] = tokenData.split('index=')
			query.lastSeen = index
		}
		catch (e) {
			throw new CustomError(CustomError.errors.INVALID_TOKEN, 'Invalid continuation token')
		}
	}
	return query
}

const generateToken = (collection) => {
	let responseToken = null
	if (collection.length > 0) {
		const tokenString = `index=${collection[collection.length - 1].id}`
		responseToken = Buffer.from(JSON.stringify(tokenString)).toString('base64')
	}
	return responseToken
}

module.exports = ({ LocationLogic }) => ({
	readLocations: (req, res, next) => {
		const query = parseQuery(req.query)
		return LocationLogic.getLocations(query)
			.then((locations) => {
				const responseToken = generateToken(locations)
				res.json({ locations, token: responseToken })
			})
			.catch(next)
	},

	updateLocation: (req, res, next) => LocationLogic.updateLocation(req.params.id, req.body)
		.then(updatedLocation => res.json(updatedLocation))
		.catch(next),

	deleteLocation: (req, res, next) => LocationLogic.deleteLocation(req.params.id)
		.then(location => res.json(location))
		.catch(next),

	readBatchLocations: (req, res, next) => LocationLogic.getBatchLocations(req.body.ids)
		.then(results => res.json(results))
		.catch(next),

})
