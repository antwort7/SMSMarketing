const RegistrationController = require('./RegistrationController')

const LocationController = require('./LocationController')

module.exports = logic => ({
	RegistrationController: RegistrationController(logic),
	LocationController: LocationController(logic),
})
