module.exports = ({ MailLogic }) => ({
	sendWelcomeMail: (req, res, next) => MailLogic.sendWelcomeEmail(req.body)
		.then(info => res.json(info))
		.catch(next),

	validateWelcomeToken: (req, res, next) => MailLogic.validateWelcomeToken(req.query.reference)
		.then(info => res.json(info))
		.catch(next),

	welcomeUser: (req, res, next) => MailLogic.welcomeUser(req.body.reference)
		.then(info => res.json(info))
		.catch(next),

	resendWelcomeMail: (req, res, next) => MailLogic.resendWelcomeMail(req.body)
		.then(info => res.json(info))
		.catch(next),
})
