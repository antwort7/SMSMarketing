const express = require('express')

const router = express.Router()

module.exports = ({ RegistrationController }) => {
	router.route('/')
		.post(RegistrationController.createRegistration)
		.get(RegistrationController.readRegistrations)

	router.route('/:id/locations')
		.post(RegistrationController.createLocation)

	router.route('/:id')
		.put(RegistrationController.updateRegistration)
		.delete(RegistrationController.deleteRegistration)

	router.route('/batch')
		.post(RegistrationController.readBatchRegistrations)

	return router
}
