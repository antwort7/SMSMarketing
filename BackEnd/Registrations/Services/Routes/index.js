const RegistrationRoutes = require('./Registration')

module.exports = controllers => ({
	Registration: RegistrationRoutes(controllers),
})
