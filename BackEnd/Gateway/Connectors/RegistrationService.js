const connector = require('./Connector')(process.env.REGISTRATION_SERVICE)

module.exports = {

	// Registration

	createRegistration: registration => connector.makeRequest('/registrations', 'POST', registration),

	getRegistrations: params => connector.makeTokenRequest('/registrations', params),

	updateRegistration: (id, registration) => connector.makeRequest(`/registrations/${id}`, 'PUT', registration),

	deleteRegistration: registrationId => connector.makeRequest(`/registrations/${registrationId}`, 'DELETE'),

}
