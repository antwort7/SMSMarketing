const Registration = require('./Registration')
const User = require('./User')

const registration = Registration({})
const user = User({})

module.exports = {
	Procedures: {
		...registration.Procedures,
		...user.Procedures,
	},
	Types: { },
}
