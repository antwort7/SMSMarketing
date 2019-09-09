const { RedisPubSub } = require('graphql-redis-subscriptions')

const Redis = require('ioredis')

const options = {
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT,
	retry_strategy: opts => Math.max(opts.attempt * 100, 3000),
}

const publisher = new Redis(options)
const subscriber = new Redis(options)
const pubsub = new RedisPubSub({ publisher, subscriber })

module.exports.PubSub = pubsub

module.exports.Topics = {
	RESERVATION_CREATED: 'RESERVATION_CREATED',
	RESERVATION_UPDATED: 'RESERVATION_UPDATED',
}
