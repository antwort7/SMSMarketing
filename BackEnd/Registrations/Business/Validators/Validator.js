module.exports = ({ validators = {}, transformations = {} }) => ({
	validators,
	transformations,
	validate(data) {
		return Promise.all(Object.keys(this.validators).map(key => this.validators[key](data)))
			.then(() => {
				const transformationsArray = Object.keys(this.transformations).map(key => this.transformations[key])
				return transformationsArray.reduce((previousTransformation, currentTransformation) => {
					return previousTransformation.then(transformedData => currentTransformation(transformedData))
				}, Promise.resolve(data))
			})
	},
})

module.exports.identifyDuplicates = ({ collection, predicates }) => {
	Object.keys(predicates).forEach((key) => {
		collection.reduce((items, item) => {
			const existingItem = items.filter(collectionItem => predicates[key].filterFn(collectionItem, item))[0]
			if (existingItem) {
				throw new Error(`Duplicated ${key}: ${predicates[key].itemAttributeFn(existingItem)}`)
			}
			else {
				items.push(item)
			}
			return items
		}, [])
	})
}
