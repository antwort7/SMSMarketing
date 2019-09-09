const MailController = require('./MailController')

module.exports = logic => ({
	MailController: MailController(logic),
})
