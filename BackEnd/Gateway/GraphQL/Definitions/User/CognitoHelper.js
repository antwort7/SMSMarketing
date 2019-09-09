const AWS = require('aws-sdk')

const AmazonCognitoIdentity = new AWS.CognitoIdentityServiceProvider({ region: process.env.AWS_REGION })

module.exports = {
	findUser: (id) => {
		const params = {
			UserPoolId: process.env.AWS_COGNITO_POOLID,
			AttributesToGet: [
				'name', 'email', 'family_name', 'sub',
			],
			Filter: `preferred_username= \"${id}\"`,
		}
		return new Promise((resolve, reject) => {
			AmazonCognitoIdentity.listUsers(params, (err, result) => {
				if (err) reject(new Error('Cognito user not found'))
				else {
					const user = result.Users[0]
					if (user) {
						const reduced = user.Attributes.reduce((accumulated, attr) => {
							if (attr.Name === 'preferred_username') {
								accumulated.username = attr.Value
							}
							else {
								accumulated[attr.Name] = attr.Value
							}
							return accumulated
						}, {})
						reduced.username = user.Username
						reduced.status = user.UserStatus
						reduced.enabled = user.Enabled
						resolve(reduced)
					}
					reject(new Error('User not found'))
				}
			})
		})
	},
	listUsers: (token = null, limit = 50) => {
		const paginationToken = {}
		if (token) {
			paginationToken.PaginationToken = token
		}
		const params = {
			UserPoolId: process.env.AWS_COGNITO_POOLID,
			AttributesToGet: [
				'name', 'email', 'family_name', 'sub',
			],
			Limit: limit,
			...paginationToken,
		}
		return new Promise((resolve, reject) => {
			AmazonCognitoIdentity.listUsers(params, (err, result) => {
				if (err) reject(new Error('Cognito user not found'))
				else {
					const transformed = result.Users.map((user) => {
						const reduced = user.Attributes.reduce((accumulated, attr) => {
							if (attr.Name === 'preferred_username') {
								accumulated.username = attr.Value
							}
							else {
								accumulated[attr.Name] = attr.Value
							}
							return accumulated
						}, {})
						reduced.username = user.Username
						reduced.status = user.UserStatus
						reduced.enabled = user.Enabled
						return reduced
					})
					resolve({ users: transformed, token: result.PaginationToken })
				}
			})
		})
	},

	getUser: (Username) => {
		const params = {
			UserPoolId: process.env.AWS_COGNITO_POOLID,
			Username,
		}
		return new Promise((resolve, reject) => {
			AmazonCognitoIdentity.adminGetUser(params, (err, data) => {
				if (err) reject(err)
				else {
					const user = data.UserAttributes.reduce((accumulated, attr) => {
						if (attr.Name === 'preferred_username') {
							accumulated.username = attr.Value
						}
						else {
							accumulated[attr.Name] = attr.Value
						}
						return accumulated
					}, {})
					user.username = data.Username
					user.status = data.UserStatus
					user.enabled = data.Enabled
					resolve(user)
				}
			})
		})
	},

	enableUser: (Username) => {
		const params = {
			UserPoolId: process.env.AWS_COGNITO_POOLID,
			Username,
		}
		return new Promise((resolve, reject) => {
			AmazonCognitoIdentity.adminEnableUser(params, (err, data) => {
				if (err) reject(err)
				else resolve(data)
			})
		})
	},

	disableUser: (Username) => {
		const params = {
			UserPoolId: process.env.AWS_COGNITO_POOLID,
			Username,
		}
		return new Promise((resolve, reject) => {
			AmazonCognitoIdentity.adminDisableUser(params, (err, data) => {
				if (err) reject(err)
				else resolve(data)
			})
		})
	},

	updateCustomAttribute: (Username, payload = {}) => {
		const params = {
			UserAttributes: [
				{
					Name: 'custom:custom',
					Value: JSON.stringify(payload),
				},
			],
			UserPoolId: process.env.AWS_COGNITO_POOLID,
			Username,
		}
		return new Promise((resolve, reject) => {
			AmazonCognitoIdentity.adminUpdateUserAttributes(params, (err, data) => {
				if (err) reject(err)
				else resolve(data)
			})
		})
	},
}
