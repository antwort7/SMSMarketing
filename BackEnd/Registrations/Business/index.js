const Persistence = require('./Persistence')

const Logic = require('./Logic')

const Validators = require('./Validators')

const DataLoaders = require('./DataLoaders')

let instance

const getInstance = () => {
	if (instance !== undefined) {
		return instance
	}
	throw Error('Application not initialized')
}

module.exports.instance = () => getInstance()

module.exports.init = () => Persistence.init()
	.then(({ persistence, models }) => {
		const { loaders, initialize } = DataLoaders.init(models)
		const validators = Validators.init(persistence)
		instance = {
			Logic: Logic.init(validators, persistence),
			Validators: validators,
			Loaders: loaders,
			RestartLoaders: initialize,
		}
		return instance
	})
