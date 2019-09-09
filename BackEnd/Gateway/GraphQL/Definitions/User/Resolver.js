const Services = require('../../../Connectors')

const DataLoaders = require('../../../DataLoaders')

const PermissionManager = require('../../../PermissionManager')

const CognitoHelper = require('./CognitoHelper')

const NotificationManager = require('../../../NotificationManager')

module.exports = {
	Model: {
		id: parent => parent.username,
		lastName: parent => parent.family_name,
		email: parent => parent.email.trim(' ').toLowerCase(),
		document: parent => ({ type: parent['custom:documentType'], number: parent['custom:documentNumber'] }),
		report: parent => DataLoaders.instance().reportLoader(false).load(parent.username).then((report) => {
			if (report) {
				return ({ ...report, id: report.user })
			}
			return null
		}),
	},
	Procedures: {
		Query: {
			all: (_, args) => CognitoHelper.listUsers(args.token, args.limit),
			me: (_, args, context) => {
				if (context.authorization) {
					return CognitoHelper.getUser(context.authorization.username)
				}
				throw new Error('Unauthorized')
			},
			validateDocumentNumber: (_, { number }) => CognitoHelper.findUser(number)
				.then(() => false)
				.catch(() => true),
		},
		Mutation: {
			uploadImage: (_, args, context) => {
				if (context.authorization) {
					return CognitoHelper.getUser(context.authorization.username)
						.then((data) => {
							const uploadPromise = args.file.then((img) => {
								if (!Services.StorageService.isImage(img)) {
									throw new Error('The provided file should be a supported image type')
								}
								return Services.StorageService.upload(img, `users/${data.username}`)
							})
							return uploadPromise
								.then((uploadData) => {
									if (uploadData) {
										return uploadData.remoteUrl
									}
									throw new Error('The provided image was not uploaded')
								})
						})
				}
				throw new Error('Unauthorized')
			},
			uploadMobileCredentials: (_, { platform, token, deviceId }, context) => {
				if (context.authorization) {
					return CognitoHelper.getUser(context.authorization.username)
						.then(user => NotificationManager.setupNotifications(platform, token, context.authorization.username, deviceId)
							.then((subscription) => {
								const custom = JSON.parse(user['custom:custom'])
								let ios = custom.ios || []
								let android = custom.android || []
								if (platform === 'ios') {
									ios = [...new Set([...ios.filter(subs => subs.deviceId !== deviceId && subs.subscription !== subscription), { deviceId, subscription }])]
								}
								if (platform === 'android') {
									android = [...new Set([...android.filter(subs => subs.deviceId !== deviceId && subs.subscription !== subscription), { deviceId, subscription }])]
								}
								return CognitoHelper.updateCustomAttribute(context.authorization.username, { ...custom, ios, android })
							}))
						.then(() => true)
				}
				throw new Error('Unauthorized')
			},

			unsubscribeDevice: (_, { platform, deviceId }, context) => {
				if (context.authorization) {
					return CognitoHelper.getUser(context.authorization.username)
						.then((user) => {
							const custom = JSON.parse(user['custom:custom'])
							const subscription = (custom[platform] || []).find(sub => sub.deviceId === deviceId)
							if (subscription) {
								return NotificationManager.unsubscribe(subscription.subscription)
									.then(() => {
										let { ios = [], android = [] } = custom
										if (platform === 'ios') {
											ios = custom.ios.filter(sub => sub.deviceId !== deviceId)
										}
										if (platform === 'android') {
											android = custom.android.filter(sub => sub.deviceId !== deviceId)
										}
										return CognitoHelper.updateCustomAttribute(context.authorization.username, { ...custom, ios, android })
									})
							}
							return Promise.resolve()
						})
						.then(() => true)
				}
				throw new Error('Unauthorized')
			},

			deleteUser: (_, { id, domain, subdomain }, context) => PermissionManager.verifyPermissionInAnyDomain([{ domain: 'Pro', subdomain: '*' }, { domain, subdomain }], context.access, PermissionManager.permissions.USER_DELETE)
				.then(() => Services.UserService.deleteUser(id))
				.then(() => true),

			enableUser: (_, { id }) => CognitoHelper.enableUser(id).then(() => true),

			disableUser: (_, { id }) => CognitoHelper.disableUser(id).then(() => true),
		},
	},
}
