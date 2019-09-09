const CustomError = require('../../../CustomError')

module.exports = ({ Mail }) => ({
	getMails: ({ filter = {}, limit = 50, sortBy = '_id' }) => Mail.find({ ...filter, deleted: false }).sort(sortBy).limit(limit),

	createMail: (mail) => {
		const newDocument = new Mail(mail)
		return new Promise((resolve, reject) => {
			newDocument.validate((err) => {
				if (err) {
					reject(new CustomError(CustomError.errors.VALIDATION_FAILED, err.message))
				}
				resolve()
			})
		})
			.then(() => newDocument.save())
	},

	updateMail: (id, updatedFields) => Mail.findByIdAndUpdate(id, updatedFields, { new: true }),
})
