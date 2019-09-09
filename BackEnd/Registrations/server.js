const express = require('express')

require('./app')
	.then((domainService) => {
		const app = express()
		app.get('/ping', (_, res) => {
			res.status(200).send('ok')
		})
		app.use('/', domainService)
		app.set('port', process.env.PORT || 3000)
		app.listen(app.get('port'), () => {
			const port = app.get('port')
			console.log(`Running company service on port ${port}`)
		})
	})
