const CompanyLogic = require('./CompanyLogic')
const LocationLogic = require('./LocationLogic')

module.exports.init = (validators, persistence) => ({
	CompanyLogic: CompanyLogic(validators, persistence),
	LocationLogic: LocationLogic(validators, persistence),
})
