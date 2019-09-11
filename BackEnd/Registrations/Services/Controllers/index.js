const RegistrationController = require('./RegistrationController')

module.exports = logic => ({
	RegistrationController: RegistrationController(logic),
})
