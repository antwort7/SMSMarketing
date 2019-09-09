const CompanyRoutes = require('./Company')
const LocationRoutes = require('./Location')

module.exports = controllers => ({
	companies: CompanyRoutes(controllers),
	locations: LocationRoutes(controllers),
})
