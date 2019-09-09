const CompanyValidator = require('./CompanyValidator')
const LocationValidator = require('./LocationValidator')

module.exports.init = persistence => ({
	CompanyValidator: CompanyValidator.init(persistence),
	LocationValidator: LocationValidator.init(persistence),
})
