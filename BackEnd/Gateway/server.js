const express = require('express')

const { SubscriptionServer } = require('subscriptions-transport-ws')

const { execute, subscribe } = require('graphql')

const expressPlayground = require('graphql-playground-middleware-express').default

const { createServer } = require('http')

const Schema = require('./GraphQL')

const AuthenticationHelper = require('./AuthenticationHelper')

const DataLoaders = require('./DataLoaders')

const basePath = process.env.BASE_PATH || '/'

require('./app')()
	.then((zuiite) => {
		const app = express()
		app.get('/ping', (_, res) => {
			res.status(200).send('ok')
		})
		app.use(basePath, zuiite)

		app.set('port', process.env.PORT || 3000)

		if (process.env.STAGE === 'dev') {
			app.get('/playground', expressPlayground({
				endpoint: 'http://localhost:3001/graphql',
				subscriptionsEndpoint: 'ws://localhost:3001/subscriptions',
			}))
		}

		const server = createServer(app)

		server.listen(app.get('port'), () => {
			const port = app.get('port')
			console.log(`Running gateway on port ${port} with base-path: ${basePath}`)
			SubscriptionServer.create(
				{
					schema: Schema,
					execute,
					subscribe,
					onConnect: (connectionParams, webSocket) => {
						if (connectionParams.Authorization) {
							return AuthenticationHelper.verify(connectionParams.Authorization)
								.then(data => DataLoaders.instance().userLoader().load(data.sub).then(user => DataLoaders.instance().accessLoader(false).load(user.id)
									.then(accesses => Promise.all(accesses.map(access => DataLoaders.instance().roleLoader(false).loadMany(access.roles)
										.then(roles => roles.reduce((acc, role) => [...acc, ...role.permissions], []))
										.then(rolePermissions => [...new Set([...rolePermissions, ...access.permissions])])
										.then((finalPermissions) => {
											if (finalPermissions.find(p => p === '*')) {
												return ['*']
											}
											return DataLoaders.instance().permissionsLoader.loadMany(finalPermissions)
										})
										.then(permissions => ({ chain: access.chain, hotel: access.hotel, permissions })))))
									.then(access => ({
										authorization: data,
										user,
										access,
										ipAddress: webSocket._socket.remoteAddress.split(':').pop(),
									}))))
								.catch(() => {
									throw new Error('Unauthorized')
								})
						}
						return Promise.resolve({ ipAddress: webSocket._socket.remoteAddress.split(':').pop() })
					},
				},
				{
					server,
					path: '/subscriptions',
				},
			)
		})
	})
