const DataLoaders = require('../DataLoaders')

module.exports = ({ LocationValidator }, { LocationPersistence }) => {
	return {
		createLocation: (registration, location) => LocationValidator.create.validate({ registration, location })
			.then(() => LocationPersistence.createLocation({ ...location, registration })),

		getLocations: ({ lastSeen, ...params }) => LocationValidator.getAll.validate(params.filter)
			.then((transformedFilter) => {
				params.filter = transformedFilter
				params.lastSeen = lastSeen
				return LocationPersistence.getLocations(params)
			}),

		updateLocation: (id, location) => LocationValidator.update.validate({ id, location })
			.then((transformedLocation) => LocationPersistence.updateLocation(id, transformedLocation)),

		deleteLocation: id => LocationValidator.delete.validate({ id })
			.then(() => LocationPersistence.updateLocation(id, { deleted: true })),

		getBatchLocations: ids => DataLoaders.instance().locationLoader(false).loadMany(ids),
	}
}
