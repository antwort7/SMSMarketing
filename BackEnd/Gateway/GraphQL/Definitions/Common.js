const {
	GraphQLScalarType, GraphQLEnumType, GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLObjectType, GraphQLList, GraphQLFloat, GraphQLID,
} = require('graphql')

const {
	isISO8601, isEmail, isISO31661Alpha2, isCreditCard, isIn,
} = require('validator')

const DocumentEnum = new GraphQLEnumType({
	name: 'DocumentTypeEnum',
	values: {
		CC: { value: 'CC' },
		NIT: { value: 'NIT' },
	},
})

const OrderEnum = new GraphQLEnumType({
	name: 'OrderEnum',
	values: {
		Ascending: { value: 1 },
		Descending: { value: -1 },
	},
})

const PlatformEnum = new GraphQLEnumType({
	name: 'PlatformEnum',
	values: {
		ios: { value: 'ios' },
		android: { value: 'android' },
	},
})

const monthValues = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

const CountryCode = new GraphQLScalarType({
	name: 'CountryCode',
	description: 'An ISO31661Alpha2 country code string.',
	serialize: (value) => {
		if (isISO31661Alpha2(value)) {
			return value
		}
		throw new Error('Country code cannot represent an ISO31661Alpha2 country code string')
	},
	parseValue: (value) => {
		if (isISO31661Alpha2(value)) {
			return value
		}
		throw new Error('Country code cannot represent an ISO31661Alpha2 country code string')
	},
	parseLiteral: (value) => {
		if (isISO31661Alpha2(value.value)) {
			return value.value
		}
		throw new Error('Country code cannot represent an ISO31661Alpha2 country code string')
	},
})

const EmailType = new GraphQLScalarType({
	name: 'Email',
	description: 'A valid email address',
	serialize: (value) => {
		if (isEmail(value)) {
			return value
		}
		throw new Error('Invalid email value')
	},
	parseValue: (value) => {
		if (isEmail(value)) {
			return value
		}
		throw new Error('Invalid email value')
	},
	parseLiteral: (value) => {
		if (isEmail(value.value)) {
			return value.value
		}
		throw new Error('Invalid email value')
	},
})

module.exports = {
	GenderEnum: new GraphQLEnumType({
		name: 'Gender',
		values: {
			Male: { value: 'Male' },
			Female: { value: 'Female' },
			Transgender: { value: 'Transgender' },
			Other: { value: 'Other' },
		},
	}),

	Email: EmailType,

	DateTime: new GraphQLScalarType({
		name: 'DateTime',
		description: 'An ISO-8601 encoded UTC date string.',
		serialize: (value) => {
			if (value instanceof Date) {
				return value.toISOString()
			}
			if (isISO8601(value)) {
				return value
			}
			throw new Error('DateTime cannot represent an invalid ISO-8601 Date string')
		},
		parseValue: (value) => {
			if (isISO8601(value)) {
				return new Date(value)
			}
			throw new Error('DateTime cannot represent an invalid ISO-8601 Date string')
		},
		parseLiteral: (value) => {
			if (isISO8601(value.value)) {
				return new Date(value.value)
			}
			throw new Error('DateTime cannot represent an invalid ISO-8601 Date string')
		},
	}),
	CountryCode,
	CreditCard: new GraphQLScalarType({
		name: 'CreditCard',
		description: 'A credit card string',
		serialize: (value) => {
			if (isCreditCard(value)) {
				return value
			}
			throw new Error('Invalid credit card value')
		},
		parseValue: (value) => {
			if (isCreditCard(value)) {
				return value
			}
			throw new Error('Invalid credit card value')
		},
		parseLiteral: (value) => {
			if (isCreditCard(value.value)) {
				return value.value
			}
			throw new Error('Invalid credit card value')
		},
	}),

	Month: new GraphQLScalarType({
		name: 'Month',
		description: 'A month value',
		serialize: (value) => {
			if (isIn(value, monthValues)) {
				return value
			}
			throw new Error('Invalid month value')
		},
		parseValue: (value) => {
			if (isIn(value, monthValues)) {
				return value
			}
			throw new Error('Invalid month value')
		},
		parseLiteral: (value) => {
			if (isIn(value.value, monthValues)) {
				return value.value
			}
			throw new Error('Invalid month value')
		},
	}),

	DocType: new GraphQLObjectType({
		name: 'DocumentType',
		description: 'A Document Type',
		fields: () => ({
			type: {
				type: GraphQLNonNull(DocumentEnum),
			},
			number: {
				type: GraphQLNonNull(GraphQLString),
			},
		}),
	}),

	DocTypeInput: new GraphQLInputObjectType({
		name: 'DocumentTypeInput',
		description: 'A Zuiite reservation',
		fields: () => ({
			type: {
				type: GraphQLNonNull(DocumentEnum),
			},
			number: {
				type: GraphQLNonNull(GraphQLString),
			},
		}),
	}),

	ContactType: new GraphQLObjectType({
		name: 'ContactType',
		description: 'A Document Type',
		fields: () => ({
			firstname: {
				type: GraphQLNonNull(GraphQLString),
			},
			lastname: {
				type: GraphQLNonNull(GraphQLString),
			},
			position: {
				type: GraphQLNonNull(GraphQLString),
			},
			email: {
				type: GraphQLNonNull(EmailType),
			},
			phone: {
				type: GraphQLNonNull(GraphQLString),
			},
		}),
	}),

	ContactTypeInput: new GraphQLInputObjectType({
		name: 'ContactTypeInput',
		description: 'A Document Type',
		fields: () => ({
			firstname: {
				type: GraphQLNonNull(GraphQLString),
			},
			lastname: {
				type: GraphQLNonNull(GraphQLString),
			},
			position: {
				type: GraphQLNonNull(GraphQLString),
			},
			email: {
				type: GraphQLNonNull(EmailType),
			},
			phone: {
				type: GraphQLNonNull(GraphQLString),
			},
		}),
	}),

	ReferenceItem: new GraphQLObjectType({
		name: 'ReferenceItem',
		description: 'A generic reference item',
		fields: () => ({
			id: {
				type: GraphQLNonNull(GraphQLID),
			},
			name: {
				type: GraphQLNonNull(GraphQLString),
			},
		}),
	}),

	City: new GraphQLObjectType({
		name: 'City',
		description: 'A city',
		fields: () => ({
			country: {
				type: GraphQLNonNull(CountryCode),
			},
			name: {
				type: GraphQLNonNull(GraphQLString),
			},
			coordinates: {
				type: new GraphQLObjectType({
					name: 'CityCoordinates',
					fields: () => ({
						latitude: {
							type: GraphQLNonNull(GraphQLFloat),
							resolve: parent => parent.coordinates[1],
						},
						longitude: {
							type: GraphQLNonNull(GraphQLFloat),
							resolve: parent => parent.coordinates[0],
						},
					}),
				}),
			},
		}),
	}),

	CityInput: new GraphQLInputObjectType({
		name: 'CityInput',
		description: 'A city',
		fields: () => ({
			country: {
				type: GraphQLNonNull(CountryCode),
			},
			name: {
				type: GraphQLNonNull(GraphQLString),
			},
			coordinates: {
				type: GraphQLList(GraphQLFloat),
			},
		}),
	}),

	Address: new GraphQLObjectType({
		name: 'Address',
		fields: () => ({
			country: {
				type: GraphQLNonNull(CountryCode),
			},
			city: {
				type: GraphQLNonNull(GraphQLString),
			},
			address: {
				type: GraphQLNonNull(GraphQLString),
			},
			tags: {
				type: GraphQLList(GraphQLString),
			},
			coordinates: {
				type: new GraphQLObjectType({
					name: 'CityCoordinates',
					fields: () => ({
						latitude: {
							type: GraphQLNonNull(GraphQLFloat),
							resolve: parent => parent[1],
						},
						longitude: {
							type: GraphQLNonNull(GraphQLFloat),
							resolve: parent => parent[0],
						},
					}),
				}),
			},
		}),
	}),

	AddressInput: new GraphQLInputObjectType({
		name: 'AddressInput',
		fields: () => ({
			country: {
				type: GraphQLNonNull(CountryCode),
			},
			city: {
				type: GraphQLNonNull(GraphQLString),
			},
			address: {
				type: GraphQLNonNull(GraphQLString),
			},
			tags: {
				type: GraphQLList(GraphQLString),
			},
			coordinates: {
				type: GraphQLList(GraphQLFloat),
			},
		}),
	}),

	OrderEnum,

	PlatformEnum,
}
