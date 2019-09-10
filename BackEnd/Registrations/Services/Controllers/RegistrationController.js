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

module.exports = ({ RegistrationLogic, LocationLogic }) => ({

	createRegistration: (req, res, next) => RegistrationLogic.createRegistration(req.body)
		.then(registration => res.json(registration))
		.catch(next),

	readRegistrations: (req, res, next) => {
		const query = parseQuery(req.query)
		return RegistrationLogic.getRegistrations(query)
			.then((Registration) => {
				const responseToken = generateToken(Registration)
				res.json({ Registration, token: responseToken })
			})
			.catch(next)
	},

	updateRegistration: (req, res, next) => RegistrationLogic.updateRegistration(req.params.id, req.body)
		.then(updatedRegistration => res.json(updatedRegistration))
		.catch(next),

	deleteRegistration: (req, res, next) => RegistrationLogic.deleteRegistration(req.params.id)
		.then(registration => res.json(registration))
		.catch(next),

	readBatchRegistrations: (req, res, next) => RegistrationLogic.getBatchRegistrations(req.body.ids)
		.then(results => res.json(results))
		.catch(next),

})
