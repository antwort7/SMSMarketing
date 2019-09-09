const Controllers = require('./Controllers')
const Routes = require('./Routes')

module.exports = (logic) => {
	const controllers = Controllers(logic)
	return Routes(controllers)
}
