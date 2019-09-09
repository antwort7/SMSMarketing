const express = require('express')

const bodyParser = require('body-parser')

const { CronJob } = require('cron-job')

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
		const d = new Date()
		console.log('Every Tenth Minute:', d)
	})
	job.start()
	return app
})
