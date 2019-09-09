const MailValidator = require('./MailValidator')

module.exports.init = persistence => ({
	MailValidator: MailValidator.init(persistence),
})
