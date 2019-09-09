const RegistrationLogic = require('./RegistrationLogic')
const LocationLogic = require('./LocationLogic')

module.exports.init = (validators, persistence) => ({
	RegistrationLogic: RegistrationLogic(validators, persistence),
	LocationLogic: LocationLogic(validators, persistence),
})
