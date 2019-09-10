const {
	GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLList, GraphQLInputObjectType, GraphQLID, GraphQLInt, GraphQLBoolean, GraphQLEnumType
} = require('graphql')

const Common = require('../Common')

const StatusEnum = new GraphQLEnumType({
	name: 'StatusEnum',
	values: {
		Pending: { value: 'Pending' },
		Delivered: { value: 'Delivered' },
		Canceled: { value: 'Canceled' },
	},
})

module.exports.Models = ({ Common }, Model) => {
	return {
		Model: new GraphQLObjectType({
			name: 'Registration',
			fields: () => ({
				id: {
					type: GraphQLNonNull(GraphQLID),
				},
				sender: {
					type: GraphQLNonNull(GraphQLString),
				},
				senderMessage: {
					type: GraphQLString,
				},
				recipientPhone: {
					type: GraphQLNonNull(GraphQLString),
				},
				recipientMessage: {
					type: GraphQLNonNull(GraphQLString),
				},
				deiveryDate: {
					type: GraphQLNonNull(Common.DateTime),
				},
				status: {
					type: GraphQLNonNull(StatusEnum),
				}
			}),
		}),
		Input: new GraphQLInputObjectType({
			name: 'RegistrationInput',
			fields: () => ({
				sender: {
					type: GraphQLNonNull(GraphQLString),
				},
				senderMessage: {
					type: GraphQLString,
				},
				recipientPhone: {
					type: GraphQLList(GraphQLString),
				},
				recipientMessage: {
					type: GraphQLNonNull(GraphQLString),
				},
				deiveryDate: {
					type: GraphQLNonNull(Common.DateTime),
				}
			}),
		}),
		Filter: new GraphQLInputObjectType({
			name: 'RegistrationFilter',
			fields: () => ({
				search: {
					type: GraphQLString,
				},
			}),
		}),
	}
}

module.exports.Procedures = ({ Registration }, { Mutation, Query }) => ({
	Query: {
		type: new GraphQLObjectType({
			name: 'RegistrationQueries',
			fields: () => ({
				one: {
					type: Registration.Model,
					args: {
						id: {
							type: GraphQLNonNull(GraphQLID),
						},
					},
					resolve: Query.one,
				},
				all: {
					type: new GraphQLObjectType({
						name: 'RegistrationAllResult',
						fields: () => ({
							Registration: {
								type: GraphQLList(Registration.Model),
							},
							token: {
								type: GraphQLString,
							},
						}),
					}),
					args: {
						filter: {
							type: Registration.Filter,
						},
						token: {
							type: GraphQLString,
						},
						limit: {
							type: GraphQLInt,
						},
						sortBy: {
							type: GraphQLString,
						},
						order: {
							type: Common.OrderEnum,
						},
					},
					resolve: Query.all,
				},
			}),
		}),
		resolve(parent, args) {
			if (parent) {
				return parent
			}
			return args
		},
	},
	Mutation: {
		type: new GraphQLObjectType({
			name: 'RegistrationMutations',
			fields: () => ({
				createRegistration: {
					type: GraphQLNonNull(Registration.Model),
					args: {
						registration: {
							type: GraphQLNonNull(Registration.Input),
						},
					},
					resolve: Mutation.createRegistration,
				},
				deleteRegistration: {
					type: GraphQLBoolean,
					args: {
						id: {
							type: GraphQLNonNull(GraphQLID),
						},
					},
					resolve: Mutation.deleteRegistration,
				},
			}),
		}),
		resolve(parent, args) {
			if (parent) {
				return parent
			}
			return args
		},
	},
})
