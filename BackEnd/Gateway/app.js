const express = require('express')

const expressGraphQL = require('express-graphql')

const { apolloUploadExpress } = require('apollo-upload-server')

const bodyParser = require('body-parser')

const qr = require('qr-image')

const AuthenticationHelper = require('./AuthenticationHelper')

const Schema = require('./GraphQL')

const Services = require('./Connectors')

const CognitoHelper = require('./GraphQL/Definitions/User/CognitoHelper')

const NotificationManager = require('./NotificationManager')

const app = express()

const DataLoaders = require('./DataLoaders')

module.exports = () => {
	const { initialize } = DataLoaders.init()
	app.use(apolloUploadExpress())
	app.use(bodyParser.json({ limit: '50mb' }))
	app.use(bodyParser.urlencoded({ extended: false }))
	app.use((req, res, next) => {
		if (req.header('Authorization')) {
			AuthenticationHelper.verify(req.header('Authorization'))
				.then((data) => {
					req.authorization = data
					res.header('Access-Control-Allow-Headers', 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
					res.header('Access-Control-Allow-Methods', 'POST,OPTIONS')
					res.header('Access-Control-Allow-Origin', '*')
					next()
				})
				.catch(() => {
					res.status(401).send()
				})
		}
		else {
			res.header('Access-Control-Allow-Headers', 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,PLIP_TOKEN,PLIP_SECRET')
			res.header('Access-Control-Allow-Methods', 'POST,OPTIONS')
			res.header('Access-Control-Allow-Origin', '*')
			next()
		}
	})
	app.options('/graphql', (_, res) => {
		res.send()
	})
	app.use('/graphql', expressGraphQL((req, res) => {
		initialize()
		const startTime = Date.now()
		return {
			schema: Schema,
			context: {
				authorization: req.authorization,
				ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(':').pop(),
			},
			formatError: (error) => {
				if (process.env.STAGE === 'Dev' || process.env.STAGE === 'Test') {
					console.log(error.stack)
				}
				else {
					console.log(error)
				}
				if (error.message.startsWith('400 - ')) {
					const [, json] = error.message.split('400 - ')
					const jsonError = JSON.parse(json)
					return {
						message: jsonError,
						data: error.originalError && error.originalError.state,
						path: error.path,
					}
				}
				if (error.message === 'Unauthorized') {
					res.status(401)
					return {
						message: 'Unauthorized',
					}
				}
				return {
					message: error.message,
					data: error.originalError && error.originalError.state,
					path: error.path,
				}
			},
			extensions() {
				return { runTime: Date.now() - startTime }
			},
		}
	}))
	app.options('/invoices', (_, res) => {
		res.send()
	})
	app.post('/invoices', async (req, res, next) => {
		initialize()
		const plipToken = req.header('PLIP_TOKEN')
		const plipSecret = req.header('PLIP_SECRET')
		let keyData = {}
		let company = {}
		let location = {}
		try {
			keyData = await Services.KeyService.validateKey(plipToken, plipSecret)
		}
		catch (e) {
			return res.status(401).json(e.error)
		}
		try {
			[company, location] = await Promise.all([DataLoaders.instance().companyLoader().load(keyData.tags.company), await DataLoaders.instance().locationLoader().load(keyData.tags.location)])
		}
		catch (e) {
			return res.status(404).json(e.error)
		}
		const { tags: locationTags, ...locationData } = location
		try {
			const invoiceData = req.body.content.find(section => section.type === 'invoiceData')
			const createdInvoice = await Services.InvoiceService.createInvoice({
				number: invoiceData.generalInformation.number,
				company,
				location: locationData,
				items: invoiceData.items,
				subtotal: invoiceData.totalInformation.subtotal,
				totalTax: invoiceData.totalInformation.totalTax,
				total: invoiceData.totalInformation.total,
				locationTags,
				keyTags: keyData.tags.tags,
				country: location.address.country,
				invoiceTemplate: req.body,
			})
			if (req.header('Accept') === 'image/png') {
				const pngString = qr.imageSync(JSON.stringify({ id: createdInvoice.id }), { type: 'png' })
				res.set('Content-Type', 'image/png').status(201).end(pngString)
			}
			else {
				res.status(201).json({ id: createdInvoice.id })
			}
		}
		catch (e) {
			return res.status(400).json(e.error)
		}
	})
	app.options('/assign-user', (_, res) => {
		res.send()
	})
	app.post('/assign-user', async (req, res, next) => {
		const plipToken = req.header('PLIP_TOKEN')
		const plipSecret = req.header('PLIP_SECRET')
		let keyData = {}
		let user = null
		let updatedInvoice = {}
		try {
			keyData = await Services.KeyService.validateKey(plipToken, plipSecret)
		}
		catch (e) {
			return res.status(401)
		}
		try {
			user = await CognitoHelper.findUser(req.body.user)
		}
		catch (e) {
			return res.status(404).json({ code: 'UserNotFound' })
		}
		try {
			await DataLoaders.instance().companyLoader().load(keyData.tags.company)
		}
		catch (e) {
			return res.status(404).json({ code: 'InvoiceNotFound' })
		}
		try {
			updatedInvoice = await Services.InvoiceService.updateInvoice(req.body.id, { user: user.sub })
		}
		catch (e) {
			return res.status(400).json({ code: 'InvoiceAlreadyAssigned' })
		}
		const company = await DataLoaders.instance().companyLoader().load(keyData.tags.company)
		const { invoices } = await Services.InvoiceService.getInvoices({ filter: { user: user.sub, category: null }, limit: Number.MAX_SAFE_INTEGER })
		await NotificationManager.sendPushNotification(user.sub, `Tienes una nueva factura de ${company.name}`,
			{
				data: {
					type: 'NewInvoice',
					message: `Tienes una nueva factura de ${company.name}`,
					invoice: updatedInvoice.id,
					points: updatedInvoice.points,
					paperSaved: updatedInvoice.paperSaved,
				},
			},
			{
				aps: {
					alert: `Tienes una nueva factura de ${company.name}`,
					badge: invoices.length,
					sound: 'default',
				},
				type: 'NewInvoice',
				invoice: updatedInvoice.id,
				points: updatedInvoice.points,
				paperSaved: updatedInvoice.paperSaved,
			})
		return res.status(200).send()
	})
	return Promise.resolve(app)
}
