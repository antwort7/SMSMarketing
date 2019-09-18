const express = require('express')

const bodyParser = require('body-parser')

const { CronJob } = require('cron')

const Business = require('./Business')

const Service = require('./Services')

const CustomError = require('./CustomError')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

module.exports = Business.init().then((business) => {
	app.use((req, res, next) => {
		req.loaders = business.RestartLoaders()
		next()
	})
	const services = Service(business.Logic)
	Object.keys(services).forEach((path) => {
		app.use(`/${path}`, services[path])
	})
	app.use((error, req, res, next) => {
		if (error instanceof CustomError) {
			res.status(400).json({ code: error.code, message: error.message })
		}
		else {
			res.status(400).json({ code: CustomError.errors.UNKNOWN, message: error.message })
		}
	})
	const job = new CronJob('0 */1 * * * *', () => {
		business.Logic.RegistrationLogic.getRegistrations({ filter: { status: 'Pending', deliveryDate: new Date().toISOString() }, limit: 200 })
			.then((registrations) => {
				business.Logic.RegistrationLogic.updateBatchRegistrations(registrations.map(r => r._id.toString()), { status: 'Delivered' })
					.then(() => console.log('executed'))
			})
	})
	job.start()
	return app
})
