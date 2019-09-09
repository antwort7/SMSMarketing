function CustomError(code, message) {
	this.code = code
	this.message = message
	this.stack = (new Error()).stack
}
CustomError.prototype = Object.create(Error.prototype)
CustomError.prototype.constructor = CustomError

module.exports = CustomError

module.exports.errors = {
	UNKNOWN: 'Unknown',
	NOT_FOUND: 'NotFound',
	VALIDATION_FAILED: 'ValidationFailed',
	INVALID_TOKEN: 'InvalidToken',
	DUPLICATE: 'Duplicate',
	ASSOCIATED_HOTELS: 'AssociatedHotels',
	ASSOCIATED_ROOMS: 'AssociatedRooms',
	INVALID_GUESTS: 'InvalidGuests',
	INVALID_HOLDER: 'InvalidHolder',
	INVALID_DATES: 'InvalidDates',
	UNAVAILABLE_ROOM: 'UnavailableRoom',
	INVALID_ROOM: 'InvalidRoom',
}
