const Common = require('../Common')

const Company = require('./Company')

const Location = require('./Location')

const Resolver = require('./Resolver')

module.exports = () => {
	const LocationModels = Location.Models({ Common }, Resolver.Model.location)
	const LocationProcedures = Location.Procedures({ Common, Location: LocationModels }, Resolver.Procedures.location)
	const CompanyModels = Company.Models({ Common, Location: { Procedures: LocationProcedures, Models: LocationModels } }, Resolver.Model.company)
	return {
		Models: {
			Company: CompanyModels,
			Location: LocationModels,
		},
		Procedures: {
			Company: Company.Procedures({ Company: CompanyModels }, Resolver.Procedures.company),
			Location: LocationProcedures,
		},
	}
}
