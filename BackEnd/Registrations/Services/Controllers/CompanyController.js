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

module.exports = ({ CompanyLogic, LocationLogic }) => ({

	createCompany: (req, res, next) => CompanyLogic.createCompany(req.body)
		.then(company => res.json(company))
		.catch(next),

	readCompanies: (req, res, next) => {
		const query = parseQuery(req.query)
		return CompanyLogic.getCompanies(query)
			.then((companies) => {
				const responseToken = generateToken(companies)
				res.json({ companies, token: responseToken })
			})
			.catch(next)
	},

	updateCompany: (req, res, next) => CompanyLogic.updateCompany(req.params.id, req.body)
		.then(updatedCompany => res.json(updatedCompany))
		.catch(next),

	deleteCompany: (req, res, next) => CompanyLogic.deleteCompany(req.params.id)
		.then(company => res.json(company))
		.catch(next),

	readBatchCompanies: (req, res, next) => CompanyLogic.getBatchCompanies(req.body.ids)
		.then(results => res.json(results))
		.catch(next),

	createLocation: (req, res, next) => LocationLogic.createLocation(req.params.id, req.body)
		.then(location => res.json(location))
		.catch(next),

})
