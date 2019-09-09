const {
	GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLList, GraphQLInputObjectType, GraphQLID, GraphQLInt, GraphQLBoolean,
} = require('graphql')

const { GraphQLUpload } = require('apollo-upload-server')

module.exports.Models = ({ Common, Invoice }, Model) => ({
	Model: new GraphQLObjectType({
		name: 'User',
		description: 'A user',
		fields: () => ({
			id: {
				type: GraphQLNonNull(GraphQLID),
				resolve: Model.id,
			},
			email: {
				type: GraphQLNonNull(Common.Email),
				resolve: Model.email,
			},
			name: {
				type: GraphQLString,
			},
			lastName: {
				type: GraphQLString,
				resolve: Model.lastName,
			},
			enabled: {
				type: GraphQLNonNull(GraphQLBoolean),
			},
			report: {
				type: Invoice.Invoice.Report,
				resolve: Model.report,
			},
		}),
	}),
	Filter: new GraphQLInputObjectType({
		name: 'UserFilter',
		fields: () => ({
			search: {
				type: GraphQLList(GraphQLString),
			},
			type: {
				type: GraphQLList(Common.DomainTypeEnum),
			},
		}),
	}),
})

module.exports.Procedures = ({ User, Common }, { Query, Mutation }) => ({
	Query: {
		type: new GraphQLObjectType({
			name: 'UserQueries',
			fields: () => ({
				all: {
					type: new GraphQLObjectType({
						name: 'UserAllResult',
						fields: () => ({
							users: {
								type: GraphQLList(User.Model),
							},
							token: {
								type: GraphQLString,
							},
						}),
					}),
					args: {
						token: {
							type: GraphQLString,
						},
						limit: {
							type: GraphQLInt,
						},
					},
					resolve: Query.all,
				},
				me: {
					type: GraphQLNonNull(User.Model),
					resolve: Query.me,
				},
				validateDocumentNumber: {
					type: GraphQLNonNull(GraphQLBoolean),
					args: {
						number: {
							type: GraphQLNonNull(GraphQLID),
						},
					},
					resolve: Query.validateDocumentNumber,
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
			name: 'UserMutations',
			fields: () => ({
				uploadImage: {
					type: GraphQLNonNull(GraphQLString),
					args: {
						file: {
							type: GraphQLNonNull(GraphQLUpload),
						},
					},
					resolve: Mutation.uploadImage,
				},
				uploadMobileCredentials: {
					type: GraphQLNonNull(GraphQLBoolean),
					args: {
						platform: {
							type: GraphQLNonNull(Common.PlatformEnum),
						},
						token: {
							type: GraphQLNonNull(GraphQLString),
						},
						deviceId: {
							type: GraphQLNonNull(GraphQLString),
						},
					},
					resolve: Mutation.uploadMobileCredentials,
				},
				unsubscribeDevice: {
					type: GraphQLNonNull(GraphQLBoolean),
					args: {
						platform: {
							type: GraphQLNonNull(Common.PlatformEnum),
						},
						deviceId: {
							type: GraphQLNonNull(GraphQLString),
						},
					},
					resolve: Mutation.unsubscribeDevice,
				},
				enableUser: {
					type: GraphQLNonNull(GraphQLBoolean),
					args: {
						id: {
							type: GraphQLNonNull(GraphQLID),
						},
					},
					resolve: Mutation.enableUser,
				},
				disableUser: {
					type: GraphQLNonNull(GraphQLBoolean),
					args: {
						id: {
							type: GraphQLNonNull(GraphQLID),
						},
					},
					resolve: Mutation.disableUser,
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
