const RegistrationValidator = require('./RegistrationValidator')

module.exports.init = persistence => ({
	RegistrationValidator: RegistrationValidator.init(persistence),
})
