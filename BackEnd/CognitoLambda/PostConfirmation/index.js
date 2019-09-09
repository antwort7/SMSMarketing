const Connector = require('./Connector')

exports.handler = async (event) => {
	let serviceUrl = 'http://test.invoices.plip'
	if (event.userPoolId === process.env.AWS_COGNITO_POOL_PROD) {
		serviceUrl = 'http://invoices.plip'
	}
	if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
		const userServiceConnector = Connector(serviceUrl)
		const { sub } = event.request.userAttributes
		return userServiceConnector.makeRequest('/categories/initialize', 'POST', { id: sub })
			.then(() => event)
	}
	return event
}
