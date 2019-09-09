const Company = require('./Company')
const Key = require('./Key')
const Invoice = require('./Invoice')
const User = require('./User')

const company = Company({})
const key = Key({})
const invoice = Invoice({ Company: company.Models.Company, Location: company.Models.Location })
const user = User({ Invoice: invoice.Models })

module.exports = {
	Procedures: {
		...company.Procedures,
		...key.Procedures,
		...invoice.Procedures,
		...user.Procedures,
	},
	Types: { },
}
