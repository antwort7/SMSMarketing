const CompanyController = require('./CompanyController')

const LocationController = require('./LocationController')

module.exports = logic => ({
	CompanyController: CompanyController(logic),
	LocationController: LocationController(logic),
})
