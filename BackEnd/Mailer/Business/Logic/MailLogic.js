const nodemailer = require('nodemailer')
const crypto = require('crypto')

const Templates = require('../Templates')
const { encrypt, decrypt } = require('../Encrypter')
const CustomError = require('../../CustomError')

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: 465,
	secure: true,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD,
	},
})

module.exports = (_, { MailPersistence }) => ({
	sendWelcomeEmail: ({
		email, username, password, name = '', lastName = '', position = '', type,
	}) => {
		const payload = {
			username,
			type,
			temporalPassword: password,
		}
		const iv = crypto.randomBytes(16)
		const encrypted = encrypt(JSON.stringify(payload), iv)
		return MailPersistence.createMail({
			type: 'Welcome', status: 'Sending', to: email, data: { iv: iv.toString('hex'), payload: encrypted },
		})
			.then(createdMail => Promise.resolve()
				.then(() => {
					const toSend = {
						email,
						reference: encrypted,
					}
					const base64 = Buffer.from(JSON.stringify(toSend)).toString('base64')
					const mailOptions = {
						from: 'Test <sergio@cannedhead.com>',
						to: email,
						subject: 'Bienvenido a Trazabilidad',
						html: Templates.Welcome({
							reference: base64, name, lastName, position,
						}),
					}
					return new Promise((resolve) => {
						transporter.sendMail(mailOptions, (error) => {
							if (!error) {
								MailPersistence.updateMail(createdMail._id.toString(), { status: 'Sent' })
									.then(updated => resolve(updated))
							}
							else {
								MailPersistence.updateMail(createdMail._id.toString(), { status: 'Failed' })
									.then(updated => resolve(updated))
							}
						})
					})
				}))
	},
	validateWelcomeToken: (ref) => {
		const { email, reference } = JSON.parse(Buffer.from(ref, 'base64').toString('utf-8'))
		return MailPersistence.getMails({
			filter: {
				type: 'Welcome', to: email, $or: [{ status: 'Sent' }, { status: 'Verified' }], 'data.payload': reference,
			},
		})
			.then((results) => {
				try {
					if (results.length === 1) {
						const mail = results[0]
						const credentials = JSON.parse(decrypt(reference, mail.data.iv))
						return MailPersistence.updateMail(mail._id.toString(), { status: 'Verified', $push: { 'data.opened': Date.now() } })
							.then(() => ({ ...credentials, email }))
					}
					throw new CustomError(CustomError.errors.VALIDATION_FAILED, 'An error has ocurred')
				}
				catch (err) {
					throw new CustomError(CustomError.errors.INVALID_TOKEN, 'Invalid token')
				}
			})
	},
	welcomeUser: (ref) => {
		const { email, reference } = JSON.parse(Buffer.from(ref, 'base64').toString('utf-8'))
		return MailPersistence.getMails({
			filter: {
				type: 'Welcome', to: email, status: 'Verified', 'data.payload': reference,
			},
		})
			.then((results) => {
				try {
					if (results.length === 1) {
						const mail = results[0]
						return MailPersistence.updateMail(mail._id.toString(), {
							status: 'Welcomed', 'data.iv': '', 'data.payload': '', 'data.confirmationDate': Date.now(),
						})
							.then(() => true)
					}
					throw new CustomError(CustomError.errors.VALIDATION_FAILED, 'An error has ocurred')
				}
				catch (err) {
					throw new CustomError(CustomError.errors.INVALID_TOKEN, 'Invalid reference token')
				}
			})
	},

	resendWelcomeMail: ({
		email, name = '', lastName = '', position = '', type,
	}) => MailPersistence.getMails({
		filter: {
			type: 'Welcome', to: email, $or: [{ status: 'Sent' }, { status: 'Verified' }],
		},
	})
		.then((results) => {
			if (results.length === 1) {
				const mail = results[0]
				const credentials = JSON.parse(decrypt(mail.data.payload, mail.data.iv))
				const newIv = crypto.randomBytes(16)
				const newEncrypted = encrypt(JSON.stringify(credentials), newIv)
				const toSend = {
					email,
					reference: newEncrypted,
				}
				const base64 = Buffer.from(JSON.stringify(toSend)).toString('base64')
				const mailOptions = {
					from: 'Test <sergio@cannedhead.com>',
					to: email,
					subject: 'Bienvenido a Trazabilidad',
					html: Templates.Welcome({
						reference: base64, name, lastName, position, type,
					}),
				}
				return new Promise((resolve, reject) => {
					transporter.sendMail(mailOptions, (error) => {
						if (!error) {
							MailPersistence.updateMail(mail._id.toString(), { 'data.iv': newIv.toString('hex'), 'data.payload': newEncrypted, $push: { 'data.resent': Date.now() } })
								.then(updated => resolve(updated))
						}
						else {
							reject(new Error('Error resending confirmation email'))
						}
					})
				})
			}
			throw new Error('Invalid token')
		})
		.catch((err) => {
			throw new CustomError(CustomError.errors.VALIDATION_FAILED, err.message)
		}),
})
