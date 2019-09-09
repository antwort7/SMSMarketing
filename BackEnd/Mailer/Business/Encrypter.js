const crypto = require('crypto')

module.exports = ({
	encrypt: (text, iv) => {
		const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY), iv)
		let crypted = cipher.update(text)
		crypted = Buffer.concat([crypted, cipher.final()])
		return crypted.toString('hex')
	},
	decrypt: (text, iv) => {
		const ivBuffer = Buffer.from(iv, 'hex')
		const encryptedText = Buffer.from(text, 'hex')
		const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY), ivBuffer)
		let decrypted = decipher.update(encryptedText)
		decrypted = Buffer.concat([decrypted, decipher.final()])
		return decrypted.toString()
	},
})
