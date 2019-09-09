const {
	GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLList, GraphQLInputObjectType, GraphQLID, GraphQLInt, GraphQLBoolean, GraphQLFloat,
} = require('graphql')

module.exports.Models = ({ Common }, Model) => {
	const Location = new GraphQLObjectType({
		name: 'Location',
		fields: () => ({
			id: {
				type: GraphQLNonNull(GraphQLID),
			},
			name: {
				type: GraphQLNonNull(GraphQLString),
			},
			address: {
				type: GraphQLNonNull(Common.Address),
			},
			tags: {
				type: GraphQLList(GraphQLString),
			},
		}),
	})

	return {
		Location: {
			Model: Location,
			Input: new GraphQLInputObjectType({
				name: 'LocationInput',
				fields: () => ({
					name: {
						type: GraphQLNonNull(GraphQLString),
					},
					address: {
						type: GraphQLNonNull(Common.AddressInput),
					},
					tags: {
						type: GraphQLList(GraphQLString),
					},
				}),
			}),
			Update: new GraphQLInputObjectType({
				name: 'LocationUpdate',
				fields: () => ({
					name: {
						type: GraphQLString,
					},
					address: {
						type: Common.AddressInput,
					},
					tags: {
						type: GraphQLList(GraphQLString),
					},
				}),
			}),
		},
		Filter: new GraphQLInputObjectType({
			name: 'LocationFilter',
			fields: () => ({
				search: {
					type: GraphQLList(GraphQLString),
				},
			}),
		}),
	}
}

module.exports.Procedures = ({ Location, Common }, { Query, Mutation }) => {
	const all = {
		type: new GraphQLObjectType({
			name: 'LocationAllResult',
			fields: () => ({
				locations: {
					type: GraphQLList(Location.Location.Model),
				},
				token: {
					type: GraphQLString,
				},
			}),
		}),
		args: {
			company: {
				type: GraphQLNonNull(GraphQLID),
			},
			filter: {
				type: Location.Filter,
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
	}
	return {
		All: all,
		Query: {
			type: new GraphQLObjectType({
				name: 'LocationQueries',
				fields: () => ({
					one: {
						type: Location.Location.Model,
						args: {
							id: {
								type: GraphQLNonNull(GraphQLID),
							},
						},
						resolve: Query.one,
					},
					all,
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
				name: 'LocationMutations',
				fields: () => ({
					createLocation: {
						type: GraphQLNonNull(Location.Location.Model),
						args: {
							company: {
								type: GraphQLNonNull(GraphQLID),
							},
							location: {
								type: GraphQLNonNull(Location.Location.Input),
							},
						},
						resolve: Mutation.createLocation,
					},
					updateLocation: {
						type: GraphQLNonNull(Location.Location.Model),
						args: {
							id: {
								type: GraphQLNonNull(GraphQLID),
							},
							location: {
								type: GraphQLNonNull(Location.Location.Update),
							},
						},
						resolve: Mutation.updateLocation,
					},
					deleteLocation: {
						type: GraphQLNonNull(GraphQLBoolean),
						args: {
							company: {
								type: GraphQLNonNull(GraphQLID),
							},
							location: {
								type: GraphQLNonNull(GraphQLID),
							},
						},
						resolve: Mutation.deleteLocation,
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
	}
}
