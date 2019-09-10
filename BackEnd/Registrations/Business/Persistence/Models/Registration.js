const mongoose = require('mongoose')

const RegistrationSchema = new mongoose.Schema({
	sender: {
		type: String
	},
	senderMessage: {
		type: String
	},
	recipientPhone: {
		type: String
	},
	recipientMessage: {
		type: String
	},
	deliveryDate: {
		type: Date
	},
	status: {
		type: String,
		default: 'Pending'
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
