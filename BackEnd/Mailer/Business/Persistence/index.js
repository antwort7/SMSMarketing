const mongoose = require('mongoose')

const TableAccess = require('./Models')

const Operations = require('./Operations')

module.exports.init = () => new Promise((resolve, reject) => {
	const db = mongoose.connection
	mongoose.Promise = global.Promise
	mongoose.connect(process.env.DATABASE_URI)
	setTimeout(() => {
		reject(new Error('Database not available'))
	}, 20000)

	db.on('connected', () => {
		resolve()
	})
	db.on('error', () => {
		mongoose.connect(process.env.DATABASE_URI)
	})
})
	.then(() => {
		const Persistence = Operations.init(TableAccess)
		return { persistence: Persistence, tableAccess: TableAccess }
	})

module.exports.errorHandler = (error) => {
	if (error.code === 11000) {
		return new Error(`Duplicated field ${error.toJSON().errmsg.split('"')[1]}`)
	}
	if (error.errors) {
		Object.keys(error.errors).forEach((key) => {
			if (error.errors[key].name === 'CastError') {
				return new Error(`Invalid field ${key}`)
			}
			return new Error(error.errors[key].message)
		})
	}
	else if (error.name === 'CastError') {
		return new Error(error.value)
	}
	else if (error.message.indexOf('E11000 duplicate key error collection') !== -1) {
		const value = error.message.split('{ : "')[1].split('"')[0]
		return new Error(`Duplicated value ${value}`)
	}
	return error
}
