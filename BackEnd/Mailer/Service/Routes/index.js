const MailRoutes = require('./Mail')

module.exports = controllers => ({
	mail: MailRoutes(controllers),
})
