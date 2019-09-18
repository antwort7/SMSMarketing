const DataLoaders = require('../DataLoaders')

module.exports = ({ RegistrationValidator }, { RegistrationPersistence }) => {
	return {
		createRegistration: registration => RegistrationValidator.create.validate({ registration })
			.then(() => {
				return RegistrationPersistence.createRegistration(registration)
			}),

		getRegistrations: ({ lastSeen, ...params }) => RegistrationValidator.getAll.validate(params.filter)
			.then((transformedFilter) => {
				params.filter = transformedFilter
				params.lastSeen = lastSeen
				return RegistrationPersistence.getRegistrations(params)
			}),

		updateRegistration: (id, registration) => RegistrationValidator.update.validate({ id, registration })
			.then(() => RegistrationPersistence.updateRegistration(id, registration)),

		updateBatchRegistrations: (ids, update) => RegistrationPersistence.updateRegistrations(ids, update),

		deleteRegistration: id => RegistrationValidator.delete.validate({ id })
			.then(() => RegistrationPersistence.updateRegistration(id, { deleted: true })),

		getBatchRegistrations: ids => DataLoaders.instance().registrationLoader(false).loadMany(ids),

	}
}
