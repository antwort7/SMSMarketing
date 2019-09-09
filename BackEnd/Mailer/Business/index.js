const Persistence = require('./Persistence')

const Logic = require('./Logic')

const Validators = require('./Validators')

let instance

const getInstance = () => {
	if (instance !== undefined) {
		return instance
	}
	throw Error('Actores en linea not initialized')
}

module.exports.instance = () => getInstance()

module.exports.init = () => Persistence.init()
	.then(({ persistence }) => {
		const validators = Validators.init(persistence)
		instance = {
			Logic: Logic.init(validators, persistence),
			Validators: validators,
		}
		return instance
	})
