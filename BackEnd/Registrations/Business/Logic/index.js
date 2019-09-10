const RegistrationLogic = require('./RegistrationLogic')

module.exports.init = (validators, persistence) => ({
	RegistrationLogic: RegistrationLogic(validators, persistence),
})
