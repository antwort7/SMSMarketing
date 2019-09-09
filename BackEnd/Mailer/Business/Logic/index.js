const MailLogic = require('./MailLogic')

module.exports.init = (validators, persistence) => ({
	MailLogic: MailLogic(validators, persistence),
})
