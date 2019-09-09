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

module.exports = ({ Company }) => ({
	createCompany: (company) => {
		const newDocument = new Company(company)
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

	getCompanies: ({
		filter = {}, limit = 50, sortBy = '_id', lastSeen,
	}) => filterCollection(Company, {
		filter, sortBy, limit, lastSeen,
	}),

	updateCompany: (id, updatedFields) => Company.findByIdAndUpdate(id, updatedFields, { new: true }),

})
