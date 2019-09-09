const mongoose = require('mongoose')

const RegistrationSchema = new mongoose.Schema({
	name: {
		type: String,
		required: 'chain name is a required field',
	},
	document: {
		type: Object,
	},
	contact: {
		type: Object,
	},
	logo: {
		type: String,
	},
	baseMeasurement: {
		type: Number,
		default: 10,
	},
	lineMeasurement: {
		type: Number,
		default: 0.5,
	},
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

module.exports = mongoose.model('Registration', RegistrationSchema)
