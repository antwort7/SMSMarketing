const RegistrationValidator = require('./RegistrationValidator')
const LocationValidator = require('./LocationValidator')

module.exports.init = persistence => ({
	RegistrationValidator: RegistrationValidator.init(persistence),
	LocationValidator: LocationValidator.init(persistence),
})
