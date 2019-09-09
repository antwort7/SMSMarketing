const express = require('express')

const bodyParser = require('body-parser')

const Business = require('./Business')

const Service = require('./Service')

const CustomError = require('./CustomError')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

module.exports = Business.init().then((business) => {
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
	return app
})
