const express = require('express')

const router = express.Router()

module.exports = ({ MailController }) => {
	router.route('/welcome/resend')
		.post(MailController.resendWelcomeMail)

	router.route('/welcome')
		.post(MailController.sendWelcomeMail)
		.get(MailController.validateWelcomeToken)
		.put(MailController.welcomeUser)

	return router
}
