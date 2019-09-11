const RegistrationRoutes = require('./Registration')

module.exports = controllers => ({
	registrations: RegistrationRoutes(controllers),
})
