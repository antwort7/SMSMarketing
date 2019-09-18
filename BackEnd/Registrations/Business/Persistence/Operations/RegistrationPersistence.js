const mongoose = require('mongoose')

const CustomError = require('../../../CustomError')

const filterCollection = (Collection, {
	filter, sortBy, lastSeen, limit,
}) => {
	if (lastSeen) {
		if (mongoose.Types.ObjectId.isValid(lastSeen)) {
			return Collection.aggregate([
				{ $match: { ...filter, deleted: false } },
				{ $sort: sortBy },
				{
					$group: {
						_id: false,
						document: {
							$push: '$$ROOT',
						},
					},
				},
				{
					$unwind: {
						path: '$document',
						includeArrayIndex: 'index',
					},
				},
				{ $match: { 'document._id': new mongoose.mongo.ObjectID(lastSeen) } },
			])
				.then((lastDocument) => {
					if (lastDocument[0]) {
						return Collection.aggregate([
							{ $match: { ...filter, deleted: false } },
							{ $sort: sortBy },
							{
								$group: {
									_id: false,
									document: {
										$push: '$$ROOT',
									},
								},
							},
							{
								$unwind: {
									path: '$document',
									includeArrayIndex: 'index',
								},
							},
							{ $match: { index: { $gt: lastDocument[0].index } } },
							{ $limit: limit },
						])
							.then(res => res.map(document => ({ ...document.document, id: document.document._id.toString() })))
					}
					throw new CustomError(CustomError.errors.VALIDATION_FAILED, 'Invalid token')
				})
		}
		throw new CustomError(CustomError.errors.VALIDATION_FAILED, 'Invalid token')
	}
	return Collection.find({ ...filter, deleted: false }).sort(sortBy).limit(limit)
}

module.exports = ({ Registration }) => ({
	createRegistration: (registration) => {
		const newDocument = new Registration(registration)
		return new Promise((resolve, reject) => {
			newDocument.validate((err) => {
				if (err) {
					reject(new CustomError(CustomError.errors.VALIDATION_FAILED, err.message))
				}
				resolve()
			})
		})
			.then(() => newDocument.save())
	},

	getRegistrations: ({
		filter = {}, limit = 50, sortBy = '_id', lastSeen,
	}) => filterCollection(Registration, {
		filter, sortBy, limit, lastSeen,
	}),

	updateRegistration: (id, updatedFields) => Registration.findByIdAndUpdate(id, updatedFields, { new: true }),

	updateRegistrations: (ids, updatedFields) => Registration.update({ _id: { $in: ids } }, updatedFields, { new: true }),

})
