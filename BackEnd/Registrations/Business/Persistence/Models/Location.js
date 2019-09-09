const mongoose = require('mongoose')

const LocationSchema = new mongoose.Schema({
	name: {
		type: String,
		required: 'location name is a required field',
	},
	company: {
		type: mongoose.Schema.Types.ObjectId,
		required: 'location company is a required field',
	},
	address: {
		type: {
			type: String,
			default: 'Point',
		},
		coordinates: {
			type: [Number],
			required: 'Coordinates is a required field',
		},
		address: {
			type: String,
			required: 'Address is a required field',
		},
		tags: {
			type: [String],
			lowercase: true,
		},
		city: {
			type: String,
		},
		country: {
			type: String,
		},
	},
	tags: [
		{
			type: String,
		},
	],
	deleted: {
		type: Boolean,
		default: false,
	},
},
{
	timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
	toJSON: {
		transform: (doc, ret) => {
			ret.id = doc._id
			delete ret._id
			delete ret.__v
		},
	},
	usePushEach: true,
})

LocationSchema.index({ address: '2dsphere' })

module.exports = mongoose.model('Location', LocationSchema)
