const chai = require('chai')

const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

const { expect } = chai

const sinon = require('sinon')

const { UserService, HotelService } = require('../Connectors')

const Registration = require('../GraphQL/Definitions/Registration/Resolver')

describe('Gateway', () => {
	describe('Registration', () => {
		const sandbox = sinon.createSandbox()
		beforeEach(() => {
			sandbox.restore()
		})
		describe('createUserHotel', () => {
			let UserServiceStub
			let HotelServiceStub
			afterEach(() => {
				sandbox.restore()
			})
			it('Should return true if the chain and user are successfully created', () => {
				HotelServiceStub = sandbox.stub(HotelService, 'createChain')
					.resolves({ id: 'id' })
				UserServiceStub = sandbox.stub(UserService, 'preCreateUser')
					.resolves({})
				return expect(Registration.Procedures.Mutation.createUserHotel({}, { email: 'email', chain: 'id' }, {})).to.be.fulfilled
					.then((result) => {
						expect(result).to.be.true
						expect(HotelServiceStub.calledOnce).to.be.true
						expect(UserServiceStub.calledOnce).to.be.true
					})
			})
			it('Should delete the created chain if user creation fails', () => {
				HotelServiceStub = sandbox.stub(HotelService, 'createChain')
					.resolves({ id: 'id' })
				UserServiceStub = sandbox.stub(UserService, 'preCreateUser')
					.rejects(new Error('Error'))
				const HotelDeleteStub = sandbox.stub(HotelService, 'deleteChain')
					.resolves({ id: 'id' })
				return expect(Registration.Procedures.Mutation.createUserHotel({}, { email: 'email', chain: 'id' }, {})).to.be.rejected
					.then((e) => {
						expect(e.message).to.equal('Error')
						expect(HotelServiceStub.calledOnce).to.be.true
						expect(UserServiceStub.calledOnce).to.be.true
						expect(HotelDeleteStub.calledOnce).to.be.true
					})
			})
		})
		describe('createUser', () => {
			let UserServiceStub
			afterEach(() => {
				sandbox.restore()
			})
			it('Should return true if the user is successfully created', () => {
				UserServiceStub = sandbox.stub(UserService, 'preCreateUser')
					.resolves({})
				return expect(Registration.Procedures.Mutation.createUser({}, { email: 'email' }, {})).to.be.fulfilled
					.then((result) => {
						expect(result).to.be.true
						expect(UserServiceStub.calledOnce).to.be.true
					})
			})
		})
	})
})
