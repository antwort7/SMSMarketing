const sinon = require('sinon')

module.exports = (model, error = false) => {
	let loadFake = sinon.fake.resolves(model)
	let loadManyFake = sinon.fake.resolves(Array(Math.ceil(Math.random() * 100)).fill(model))
	if (error) {
		loadFake = sinon.fake.rejects(new Error('Load Error'))
		loadManyFake = sinon.fake.rejects(new Error('Load many Error'))
	}
	return {
		loadFake,
		loadManyFake,
		mockImplementation: {
			load: loadFake,
			loadMany: loadManyFake,
		},
	}
}

