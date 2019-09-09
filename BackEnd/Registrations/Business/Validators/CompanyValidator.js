const flatten = require('flat')

const mongoose = require('mongoose')

const Validator = require('./Validator')

const DataLoaders = require('../DataLoaders')

const CustomError = require('../../CustomError')

module.exports.init = ({ CompanyPersistence }) => ({
	create: Validator({
		validators: {
			verifyNameDuplicate: ({ company }) => new Promise((resolve, reject) => {
				CompanyPersistence.getCompanies({ filter: { name: company.name } })
					.then((companies) => {
						if (companies.length > 0) {
							reject(new CustomError(CustomError.errors.DUPLICATE, 'A company already has this name'))
						}
						else {
							resolve()
						}
					})
			}),
		},
	}),
	getAll: Validator({
		transformations: {
			flattenConditions: (filter) => {
				const mongooseCondition = Object.keys(filter).reduce((accumulatedConditions, currentCondition) => {
					const obj = {}
					obj[currentCondition] = filter[currentCondition]
					accumulatedConditions = Object.assign(accumulatedConditions, obj)
					return accumulatedConditions
				}, {})
				return Promise.resolve(flatten(mongooseCondition, { safe: true }))
			},
			convertArraysToIn: (filter) => {
				Object.keys(filter).forEach((condition) => {
					if (filter[condition] && filter[condition].constructor === Array) {
						filter[condition] = {
							$in: filter[condition].map((value) => {
								if (mongoose.Types.ObjectId.isValid(value)) {
									return new mongoose.mongo.ObjectID(value)
								}
								return value
							}),
						}
					}
				})
				return Promise.resolve(filter)
			},
			convertSearch: (filter) => {
				if (filter.search) {
					const regex = new RegExp(filter.search, 'i')
					filter.$or = [
						{ name: { $in: [regex] } },
						{ document: { number: { $in: [regex] } } },
					]
					delete filter.search
				}
				return Promise.resolve(filter)
			},
		},
	}),
	update: Validator({
		validators: {
			verifyExistence: ({ id }) => DataLoaders.instance().companyLoader().load(id),
		},
	}),
	delete: Validator({
		validators: {
			verifyExistence: ({ id }) => DataLoaders.instance().companyLoader().load(id),
		},
	}),
})
