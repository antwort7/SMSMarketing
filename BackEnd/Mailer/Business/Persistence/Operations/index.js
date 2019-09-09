const MailOperations = require('./MailPersistence')

module.exports.init = models => (
	{
		MailPersistence: MailOperations(models, {}),
	}
)
