const Registration = require('./Registration')
const User = require('./User')

const registration = Registration({})
const user = User({ Invoice: invoice.Models })

module.exports = {
	Procedures: {
		...registration.Procedures,
		...user.Procedures,
	},
	Types: { },
}
