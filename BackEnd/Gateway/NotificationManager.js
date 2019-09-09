const AWS = require('aws-sdk')

const SNS = new AWS.SNS({ region: process.env.AWS_REGION })

const resolveTopic = topicName => `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:${topicName}`

const createPlatformEndpoint = (platform = 'ios', token, deviceId) => {
	const PlatformApplicationArn = resolveTopic(platform === 'ios' ? process.env.APN_PLATFORM_APPLICATION : process.env.GCM_PLATFORM_APPLICATION)
	const params = {
		PlatformApplicationArn,
		Token: token,
		CustomUserData: JSON.stringify({ platform, deviceId }),
	}
	return new Promise((resolve, reject) => {
		SNS.createPlatformEndpoint(params, (err, data) => {
			if (err) {
				reject(err)
			}
			resolve(data)
		})
	})
}

const getTopic = (userId) => {
	const params = {
		TopicArn: resolveTopic(`${process.env.STAGE}${userId}`),
	}
	return new Promise((resolve, reject) => {
		SNS.getTopicAttributes(params, (err, data) => {
			if (err) {
				reject(err)
			}
			resolve(data)
		})
	})
}

const createTopic = (userId) => {
	const params = {
		Name: `${process.env.STAGE}${userId}`,
	}
	return new Promise((resolve, reject) => {
		SNS.createTopic(params, (err, data) => {
			if (err) {
				reject(err)
			}
			resolve(data)
		})
	})
}

const subscribePlatformToTopic = (userId, applicationEndpoint) => {
	const params = {
		Protocol: 'application',
		TopicArn: resolveTopic(`${process.env.STAGE}${userId}`),
		Endpoint: applicationEndpoint,
		ReturnSubscriptionArn: true,
	}
	return new Promise((resolve, reject) => {
		SNS.subscribe(params, (err, data) => {
			if (err) {
				reject(err)
			}
			resolve(data.SubscriptionArn)
		})
	})
}

module.exports = {
	setupNotifications: (platform, token, userId, deviceId) => {
		const verifyOrCreateTopic = () => getTopic(userId)
			.catch(() => createTopic(userId))

		return verifyOrCreateTopic()
			.then(() => createPlatformEndpoint(platform, token, deviceId))
			.then(data => subscribePlatformToTopic(userId, data.EndpointArn))
	},
	sendPushNotification: (userId, message, android, ios) => {
		const APNS = {}
		APNS[process.env.STAGE === 'Production' || process.env.STAGE === 'Test' ? 'APNS' : 'APNS_SANDBOX'] = JSON.stringify(ios)
		const params = {
			TopicArn: resolveTopic(`${process.env.STAGE}${userId}`),
			Message: JSON.stringify({
				default: message,
				...APNS,
				GCM: JSON.stringify(android),
			}),
			MessageStructure: 'json',
		}
		return new Promise((resolve, reject) => {
			SNS.publish(params, (err, data) => {
				if (err) {
					reject(err)
				}
				resolve(data)
			})
		})
	},
	unsubscribe: (subscription) => {
		const params = {
			SubscriptionArn: subscription,
		}
		return new Promise((resolve, reject) => {
			SNS.unsubscribe(params, (err, data) => {
				if (err) {
					reject(err)
				}
				resolve(data)
			})
		})
	},
}
