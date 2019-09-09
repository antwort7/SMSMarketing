const mongoose = require('mongoose')

const MailSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			required: 'type is a required field',
		},
		to: {
			type: String,
			required: 'to is a required field',
		},
		status: {
			type: String,
			required: 'status is a required field',
		},
		data: {
			type: {
				iv: {
					type: String,
				},
				payload: {
					type: String,
				},
				opened: [Date],
				resent: [Date],
				confirmationDate: {
					type: Date,
				},
			},
		},
		sentAt: {
			type: Date,
			default: Date.now(),
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
	},
)

module.exports = mongoose.model('Mail', MailSchema)
