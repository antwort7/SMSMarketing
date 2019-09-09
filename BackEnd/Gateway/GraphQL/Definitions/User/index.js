const Common = require('../Common')

const User = require('./User')

const Resolver = require('./Resolver')

module.exports = ({ Invoice }) => {
	const UserModels = User.Models({ Common, Invoice }, Resolver.Model)

	return {
		Models: {
			User: UserModels,
		},
		Procedures: {
			User: User.Procedures({ User: UserModels, Common }, Resolver.Procedures),
		},
	}
}
