const RegistrationOperations = require('./RegistrationPersistence')

module.exports.init = (models) => {
	const RegistrationPersistence = RegistrationOperations(models)
	return {
		RegistrationPersistence,
	}
}
