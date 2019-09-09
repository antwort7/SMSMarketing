const Services = require('../../../Connectors')

const DataLoaders = require('../../../DataLoaders')

module.exports = {
	Model: {

	},
	Procedures: {
		registration: {
			Query: {
				one: (_, { id }) => DataLoaders.instance().registrationLoader().load(id),
				all: (_, args) => Services.RegistrationService.getRegistrations(args),
			},
			Mutation: {
				createRegistration: (_, {registration}) => Services.RegistrationService.createRegistration(registration),
				deleteRegistration: (_, { id }) => Services.RegistrationService.deleteRegistration(id).then(() => true),
			},
		},
	},
}
