const express = require('express')

const expressGraphQL = require('express-graphql')

const { apolloUploadExpress } = require('apollo-upload-server')

const bodyParser = require('body-parser')

const AuthenticationHelper = require('./AuthenticationHelper')

const Schema = require('./GraphQL')

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

	return Promise.resolve(app)
}
