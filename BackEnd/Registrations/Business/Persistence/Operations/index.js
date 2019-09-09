const RegistrationOperations = require('./RegistrationPersistence')
const LocationOperations = require('./LocationPersistence')

module.exports.init = (models) => {
	const RegistrationPersistence = RegistrationOperations(models)
	const LocationPersistence = LocationOperations(models)
	return {
		RegistrationPersistence,
		LocationPersistence,
	}
}
