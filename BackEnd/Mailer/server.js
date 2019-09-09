const express = require('express')

require('./app')
	.then((mailService) => {
		const app = express()
		app.get('/ping', (_, res) => {
			res.status(200).send('ok')
		})
		app.use('/', mailService)
		app.set('port', process.env.PORT || 3000)
		app.listen(app.get('port'), () => {
			const port = app.get('port')
			console.log(`Running mail service on port ${port}`)
		})
	})
