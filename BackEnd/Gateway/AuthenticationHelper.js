const jwt = require('jsonwebtoken')
const request = require('request')
const jwkToPem = require('jwk-to-pem')

let loadedPems

const iss = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_COGNITO_POOLID}`

const acquirePoolPems = () => new Promise((resolve, reject) => {
	if (!loadedPems) {
		request({ url: `${iss}/.well-known/jwks.json`, json: true }, (error, response, body) => {
			if (!error && response.statusCode === 200) {
				const result = {}
				const { keys } = body
				for (let i = 0; i < keys.length; i += 1) {
					const keyId = keys[i].kid
					const modulus = keys[i].n
					const exponent = keys[i].e
					const keyType = keys[i].kty
					const jwk = { kty: keyType, n: modulus, e: exponent }
					const pem = jwkToPem(jwk)
					result[keyId] = pem
				}
				loadedPems = result
				resolve(result)
			}
			else {
				reject(error)
			}
		})
	}
	else {
		resolve(loadedPems)
	}
})

const validateToken = (pems, token) => new Promise((resolve, reject) => {
	const decodedJwt = jwt.decode(token, { complete: true })
	if (!decodedJwt) {
		reject(new Error('Invalid JWT Token'))
	}
	if (decodedJwt.payload.iss !== iss) {
		reject(new Error('Invalid Pool Issuer'))
	}
	if (decodedJwt.payload.token_use !== 'access') {
		reject(new Error('Invalid token_use'))
	}
	const { kid } = decodedJwt.header
	const pem = pems[kid]
	if (!pem) {
		reject(new Error('Invalid token pem'))
	}
	jwt.verify(token, pem, { issuer: iss }, (err, payload) => {
		if (err) {
			reject(err)
		}
		else {
			resolve(payload)
		}
	})
})

module.exports = {
	verify: token => acquirePoolPems().then((retrievedPems) => {
		const parsedToken = token.split('Bearer ')[1]
		return validateToken(retrievedPems, parsedToken)
	}),
	verifyTalentUser: ((context) => {
		if (!context.user || context.user.type !== 'Talent') {
			return Promise.reject(new Error('Unauthorized'))
		}
		return Promise.resolve()
	}),
}
