const CompanyOperations = require('./CompanyPersistence')
const LocationOperations = require('./LocationPersistence')

module.exports.init = (models) => {
	const CompanyPersistence = CompanyOperations(models)
	const LocationPersistence = LocationOperations(models)
	return {
		CompanyPersistence,
		LocationPersistence,
	}
}
