const express = require('express')

const router = express.Router()

module.exports = ({ LocationController }) => {
	router.route('/')
		.get(LocationController.readLocations)

	router.route('/:id')
		.put(LocationController.updateLocation)
		.delete(LocationController.deleteLocation)

	router.route('/batch')
		.post(LocationController.readBatchLocations)

	return router
}
