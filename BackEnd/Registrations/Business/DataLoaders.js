const DataLoader = require('dataloader')

const mongoose = require('mongoose')

const CustomError = require('../CustomError')

const idFinderPredicate = (ids, validMongoIds, alternativeIds) => {
	const modelPredicates = alternativeIds.reduce((items, item) => {
		const itemPredicate = {}
		itemPredicate[item] = { $in: ids }
		items.push(itemPredicate)
		return items
	}, [])
	modelPredicates.push({ _id: { $in: validMongoIds } })
	return { $or: modelPredicates, deleted: false }
}

const resultValidatorPredicate = (result, id, alternativeIds) => {
	const validatePredicate = alternativeIds.reduce((condition, item) => condition || result[item] === id, false)
	return result._id.toString() === id || validatePredicate
}

const getByIds = (model, ids, error = true, alternativeIds = []) => {
	const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id))
	return model.find(idFinderPredicate(ids, validIds, alternativeIds))
		.then(results => ids.map((id) => {
			const found = results.find(result => resultValidatorPredicate(result, id, alternativeIds))
			if (found) {
				return found
			}
			if (error) {
				return new CustomError(CustomError.errors.NOT_FOUND, `${model.modelName} not found: ${id}`)
			}
			return null
		}))
}

let instance = {
	registrationLoader: () => new Error('Registration loader not initialized'),
}

const getInstance = () => {
	if (instance !== undefined) {
		return instance
	}
	throw Error('Loaders not initialized')
}

module.exports.instance = () => getInstance()

module.exports.init = ({ Registration }) => {
	const initialize = () => {
		instance = {
			registrationLoader: (error = true) => new DataLoader(keys => getByIds(Registration, keys, error)),
		}
		return instance
	}
	initialize()
	return {
		initialize,
		loaders: instance,
	}
}
