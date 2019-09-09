const Common = require('../Common')

const Registration = require('./Registration')

const Resolver = require('./Resolver')

module.exports = () => {
	const RegistrationModels = Registration.Models({ Common }, Resolver.Model.registration)
	return {
		Models: {
			Registration: RegistrationModels,
		},
		Procedures: {
			Registration: Registration.Procedures({ Registration: RegistrationModels }, Resolver.Procedures.registration),
		},
	}
}
