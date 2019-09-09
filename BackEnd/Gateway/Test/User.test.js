const chai = require('chai')

const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

const { expect } = chai

const sinon = require('sinon')

const { UserService, StorageService } = require('../Connectors')

const User = require('../GraphQL/Definitions/User/Resolver')

const DataLoaderMock = require('./Utils/DataLoaders')

const DataLoaders = require('../DataLoaders')

const CustomError = require('../CustomError')

const PermissionManager = require('../PermissionManager')

describe('Gateway', () => {
	describe('User', () => {
		const sandbox = sinon.createSandbox()
		beforeEach(() => {
			sandbox.restore()
		})
		describe('One', () => {
			afterEach(() => {
				sandbox.restore()
			})
			it('Should suceeed if the user belongs to the chain', () => {
				const { loadFake: userLoadFake, mockImplementation: userMockImplementation } = DataLoaderMock({ value: 'LOADEDUSER' })
				const { loadFake: accessLoadFake, mockImplementation: accessMockImplementation } = DataLoaderMock([{ chain: 'chain', hotel: 'hotel' }])
				sandbox.stub(DataLoaders, 'instance')
					.returns(({
						userLoader: () => userMockImplementation,
						accessLoader: () => accessMockImplementation,
					}))
				sandbox.stub(PermissionManager, 'verifyPermission')
					.resolves()
				return expect(User.Procedures.Query.one({}, { id: 'id', chain: 'chain', hotel: 'hotel' }, {})).to.be.fulfilled
					.then((result) => {
						expect(result).to.exist
						expect(result.value).to.equal('LOADEDUSER')
						expect(userLoadFake.calledOnce).to.be.true
						expect(accessLoadFake.calledOnce).to.be.true
					})
			})
			it('Should suceeed if the user belongs to the hotel', () => {
				const { loadFake: userLoadFake, mockImplementation: userMockImplementation } = DataLoaderMock({ value: 'LOADEDUSER' })
				const { loadFake: accessLoadFake, mockImplementation: accessMockImplementation } = DataLoaderMock([{ chain: 'chain1', hotel: 'hotel' }])
				sandbox.stub(DataLoaders, 'instance')
					.returns(({
						userLoader: () => userMockImplementation,
						accessLoader: () => accessMockImplementation,
					}))
				sandbox.stub(PermissionManager, 'verifyPermission')
					.resolves()
				return expect(User.Procedures.Query.one({}, { id: 'id', chain: 'chain', hotel: 'hotel' }, {})).to.be.fulfilled
					.then((result) => {
						expect(result).to.exist
						expect(result.value).to.equal('LOADEDUSER')
						expect(userLoadFake.calledOnce).to.be.true
						expect(accessLoadFake.calledOnce).to.be.true
					})
			})
			it('Should fail if the user does not belong to the chain or hotel', () => {
				const { loadFake: userLoadFake, mockImplementation: userMockImplementation } = DataLoaderMock({ value: 'LOADEDUSER' })
				const { loadFake: accessLoadFake, mockImplementation: accessMockImplementation } = DataLoaderMock([])
				sandbox.stub(DataLoaders, 'instance')
					.returns(({
						userLoader: () => userMockImplementation,
						accessLoader: () => accessMockImplementation,
					}))
				sandbox.stub(PermissionManager, 'verifyPermission')
					.resolves()
				return expect(User.Procedures.Query.one({}, { id: 'id', chain: 'chain', hotel: 'hotel' }, {})).to.be.rejectedWith(Error, 'Unauthorized')
					.then(() => {
						expect(userLoadFake.calledOnce).to.be.true
						expect(accessLoadFake.calledOnce).to.be.true
					})
			})
		})
		describe('All', () => {
			it('Should return the value provided by the service', () => {
				sandbox.stub(PermissionManager, 'verifyPermission')
					.resolves()
				const userServiceStub = sandbox.stub(UserService, 'getUsers').resolves([{ id: 1 }, { id: 2 }])
				return expect(User.Procedures.Query.all({}, { chain: 'chain', hotel: 'hotel' }, {})).to.be.fulfilled
					.then((result) => {
						expect(result).to.exist
						expect(result.length).to.equal(2)
						expect(userServiceStub.calledOnce).to.be.true
					})
			})
		})
		describe('Update', () => {
			afterEach(() => {
				sandbox.restore()
			})
			it('Should update the user if no profile picture is present', () => {
				const userServiceStub = sandbox.stub(UserService, 'updateUser').resolvesArg(1)
				return expect(User.Procedures.Mutation.updateUser({}, { user: { name: 'name', lastName: 'lastName' } }, { user: { id: 'id' } })).to.be.fulfilled
					.then((result) => {
						expect(result).to.exist
						expect(result.name).to.equal('name')
						expect(result.lastName).to.equal('lastName')
						expect(userServiceStub.calledOnce).to.be.true
					})
			})
			it('Should set the profile image url if a profile picture is provided', () => {
				const updateUserServiceStub = sandbox.stub(UserService, 'updateUser').resolvesArg(1)
				const isImageStub = sandbox.stub(StorageService, 'isImage')
					.returns(true)
				const uploadStub = sandbox.stub(StorageService, 'upload')
					.returns({ relativeUrl: 'relativeUrl' })
				return expect(User.Procedures.Mutation.updateUser({}, { user: { name: 'name', lastName: 'lastName', profilePicture: Promise.resolve('image') } }, { user: { id: 'id' } })).to.be.fulfilled
					.then((result) => {
						expect(result).to.exist
						expect(result.name).to.equal('name')
						expect(result.lastName).to.equal('lastName')
						expect(result.profilePicture).to.exist
						expect(result.profilePicture.url).to.equal('relativeUrl')
						expect(updateUserServiceStub.calledOnce).to.be.true
						expect(isImageStub.calledOnce).to.be.true
						expect(uploadStub.calledOnce).to.be.true
					})
			})
			it('Should throw an error if the provided image is not an image', () => {
				const updateUserServiceStub = sandbox.stub(UserService, 'updateUser').resolvesArg(1)
				const isImageStub = sandbox.stub(StorageService, 'isImage')
					.returns(false)
				const uploadStub = sandbox.stub(StorageService, 'upload')
					.returns({ relativeUrl: 'relativeUrl' })
				return expect(User.Procedures.Mutation.updateUser({}, { user: { name: 'name', lastName: 'lastName', profilePicture: Promise.resolve('image') } }, { user: { id: 'id' } })).to.be.rejectedWith(CustomError, 'The provided profile picture should be a supported image type')
					.then((result) => {
						expect(result).to.exist
						expect(result.code).to.exist
						expect(result.code).to.equal(CustomError.errors.VALIDATION_FAILED)
						expect(updateUserServiceStub.calledOnce).to.be.false
						expect(isImageStub.calledOnce).to.be.true
						expect(uploadStub.calledOnce).to.be.false
					})
			})
			it('Should remove the uploaded profile picture if an error ocurrs in the update operation', () => {
				const updateUserServiceStub = sandbox.stub(UserService, 'updateUser').rejects(new Error('Error'))
				const isImageStub = sandbox.stub(StorageService, 'isImage')
					.returns(true)
				const uploadStub = sandbox.stub(StorageService, 'upload')
					.returns({ relativeUrl: 'relativeUrl' })
				return expect(User.Procedures.Mutation.updateUser({}, { user: { name: 'name', lastName: 'lastName', profilePicture: Promise.resolve('image') } }, { user: { id: 'id' } })).to.be.rejectedWith(Error, 'Error')
					.then(() => {
						expect(updateUserServiceStub.calledOnce).to.be.true
						expect(isImageStub.calledOnce).to.be.true
						expect(uploadStub.calledOnce).to.be.true
					})
			})
		})
	})
})
