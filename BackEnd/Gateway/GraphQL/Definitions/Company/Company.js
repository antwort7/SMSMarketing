const {
	GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLList, GraphQLInputObjectType, GraphQLID, GraphQLInt, GraphQLBoolean, GraphQLFloat,
} = require('graphql')

const { GraphQLUpload } = require('apollo-upload-server')

const Common = require('../Common')

module.exports.Models = ({ Location }, Model) => {
	const { company, ...locationArgs } = Location.Procedures.All.args
	return {
		Model: new GraphQLObjectType({
			name: 'Company',
			fields: () => ({
				id: {
					type: GraphQLNonNull(GraphQLID),
				},
				name: {
					type: GraphQLNonNull(GraphQLString),
				},
				document: {
					type: Common.DocType,
				},
				contact: {
					type: Common.ContactType,
				},
				logo: {
					type: GraphQLString,
					resolve: Model.logo,
				},
				baseMeasurement: {
					type: GraphQLNonNull(GraphQLFloat),
				},
				lineMeasurement: {
					type: GraphQLNonNull(GraphQLFloat),
				},
				locations: {
					type: Location.Procedures.All.type,
					args: locationArgs,
					resolve: (parent, args, context) => Location.Procedures.All.resolve(parent, { ...args, company: parent.id }, context),
				},
			}),
		}),
		List: new GraphQLObjectType({
			name: 'CompanyList',
			fields: () => ({
				id: {
					type: GraphQLNonNull(GraphQLID),
				},
				name: {
					type: GraphQLNonNull(GraphQLString),
				},
				logo: {
					type: GraphQLString,
					resolve: Model.logo,
				},
			}),
		}),
		Input: new GraphQLInputObjectType({
			name: 'CompanyInput',
			fields: () => ({
				name: {
					type: GraphQLNonNull(GraphQLString),
				},
				document: {
					type: GraphQLNonNull(Common.DocTypeInput),
				},
				contact: {
					type: GraphQLNonNull(Common.ContactTypeInput),
				},
				logo: {
					type: GraphQLUpload,
				},
				baseMeasurement: {
					type: GraphQLNonNull(GraphQLFloat),
				},
				lineMeasurement: {
					type: GraphQLNonNull(GraphQLFloat),
				},
			}),
		}),
		Update: new GraphQLInputObjectType({
			name: 'CompanyUpdate',
			fields: () => ({
				name: {
					type: GraphQLString,
				},
				document: {
					type: Common.DocTypeInput,
				},
				contact: {
					type: Common.ContactTypeInput,
				},
				logo: {
					type: GraphQLUpload,
				},
				baseMeasurement: {
					type: GraphQLFloat,
				},
				lineMeasurement: {
					type: GraphQLFloat,
				},
			}),
		}),
		Filter: new GraphQLInputObjectType({
			name: 'CompanyFilter',
			fields: () => ({
				search: {
					type: GraphQLString,
				},
			}),
		}),
	}
}

module.exports.Procedures = ({ Company }, { Mutation, Query }) => ({
	Query: {
		type: new GraphQLObjectType({
			name: 'CompanyQueries',
			fields: () => ({
				one: {
					type: Company.Model,
					args: {
						id: {
							type: GraphQLNonNull(GraphQLID),
						},
					},
					resolve: Query.one,
				},
				all: {
					type: new GraphQLObjectType({
						name: 'CompanyAllResult',
						fields: () => ({
							companies: {
								type: GraphQLList(Company.Model),
							},
							token: {
								type: GraphQLString,
							},
						}),
					}),
					args: {
						filter: {
							type: Company.Filter,
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
			name: 'CompanyMutations',
			fields: () => ({
				createCompany: {
					type: GraphQLNonNull(Company.Model),
					args: {
						company: {
							type: GraphQLNonNull(Company.Input),
						},
					},
					resolve: Mutation.createCompany,
				},
				updateCompany: {
					type: GraphQLNonNull(Company.Model),
					args: {
						id: {
							type: GraphQLNonNull(GraphQLID),
						},
						company: {
							type: GraphQLNonNull(Company.Update),
						},
					},
					resolve: Mutation.updateCompany,
				},
				deleteCompany: {
					type: GraphQLBoolean,
					args: {
						id: {
							type: GraphQLNonNull(GraphQLID),
						},
					},
					resolve: Mutation.deleteCompany,
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
