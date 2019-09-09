const express = require('express')

const router = express.Router()

module.exports = ({ CompanyController }) => {
	router.route('/')
		.post(CompanyController.createCompany)
		.get(CompanyController.readCompanies)

	router.route('/:id/locations')
		.post(CompanyController.createLocation)

	router.route('/:id')
		.put(CompanyController.updateCompany)
		.delete(CompanyController.deleteCompany)

	router.route('/batch')
		.post(CompanyController.readBatchCompanies)

	return router
}
