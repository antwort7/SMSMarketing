const { GraphQLObjectType, GraphQLSchema } = require('graphql')

const Definitions = require('./Definitions')

const Queries = Object.keys(Definitions.Procedures).map((k) => {
	const obj = {
		name: k,
		query: Definitions.Procedures[k].Query,
	}
	return obj
}).reduce((acc, item) => {
	if (item.query) {
		acc[item.name] = item.query
	}
	return acc
}, {})

const Mutations = Object.keys(Definitions.Procedures).map((k) => {
	const obj = {
		name: k,
		mutation: Definitions.Procedures[k].Mutation,
	}
	return obj
}).reduce((acc, item) => {
	if (item.mutation) {
		acc[item.name] = item.mutation
	}
	return acc
}, {})

// const Subscriptions = Object.keys(Definitions.Procedures).map(k => ({ ...Definitions.Procedures[k].Subscription }))
// 	.reduce((acc, item) => ({ ...acc, ...item }), {})

const Schema = new GraphQLSchema({
	// types: Object.keys(Definitions.Types).map(k => Definitions.Types[k]),
	query: new GraphQLObjectType({
		name: 'Queries',
		description: 'The queries provided by the service',
		fields: Queries,
	}),
	mutation: new GraphQLObjectType({
		name: 'Mutations',
		description: 'The queries provided by the service',
		fields: Mutations,
	}),
	// subscription: new GraphQLObjectType({
	// 	name: 'Subscriptions',
	// 	description: 'The subscriptions provided by the service',
	// 	fields: Subscriptions,
	// }),
})
module.exports = Schema
