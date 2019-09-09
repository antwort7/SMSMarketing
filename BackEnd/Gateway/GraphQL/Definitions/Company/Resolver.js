const Services = require('../../../Connectors')

const DataLoaders = require('../../../DataLoaders')

module.exports = {
	Model: {
		company: {
			logo: parent => (parent.logo ? `https://s3.amazonaws.com/${process.env.BUCKET_NAME}/${parent.logo}` : null),
		},
		location: {
		},
	},
	Procedures: {
		company: {
			Query: {
				one: (_, { id }) => DataLoaders.instance().companyLoader().load(id),
				all: (_, args) => Services.CompanyService.getCompanies(args),
			},
			Mutation: {
				createCompany: (_, args) => {
					const { logo, ...company } = args.company
					return Services.CompanyService.createCompany(company).then((created) => {
						let uploadPromise = Promise.resolve()
						if (logo) {
							uploadPromise = logo.then((img) => {
								if (!Services.StorageService.isImage(img)) {
									throw new Error('The provided logo should be a supported image type')
								}
								return Services.StorageService.upload(img, `companies/${created.id}`)
							})
						}
						return uploadPromise.then((data) => {
							if (data) {
								created.logo = data.relativeUrl
								return Services.CompanyService.updateCompany(created.id, created)
							}
							return created
						})
					})
				},
				updateCompany: (_, { id, company }) => {
					const { logo, ...companyFields } = company
					let uploadPromise = Promise.resolve()
					if (logo) {
						uploadPromise = logo.then((img) => {
							if (!Services.StorageService.isImage(img)) {
								throw new Error('The provided logo should be a supported image type')
							}
							return Services.StorageService.upload(img, `companies/${id}`)
						})
					}
					return uploadPromise
						.then((logoData) => {
							if (logoData) {
								companyFields.logo = logoData.relativeUrl
							}
							else if (Object.keys(company).includes('logo') && logo === null) {
								companyFields.logo = null
								return DataLoaders.instance().companyLoader().load(id)
									.then((loadedCompany) => {
										if (loadedCompany.logo && loadedCompany.logo.url) {
											return Services.StorageService.deleteRemote(loadedCompany.logo.url)
												.then(() => companyFields)
										}
										return Promise.resolve(companyFields)
									})
							}
							return Promise.resolve(companyFields)
						})
						.then(companyToCreate => Services.CompanyService.updateCompany(id, companyToCreate))
				},
				deleteCompany: (_, { id }) => Services.CompanyService.deleteCompany(id)
					.then(() => Services.KeyService.invalidateKeys(id))
					.then(() => true),
			},
		},
		location: {
			Query: {
				one: (_, args) => DataLoaders.instance().locationLoader().load(args.id),
				all: (_, { company, ...params }) => Services.CompanyService.getLocations({ ...params, filter: { ...params.filter, company } }),
			},
			Mutation: {
				createLocation: (_, { company, location }, context) => {
					return Services.CompanyService.createLocation(company, location)
				},
				updateLocation: (_, { id, location }, context) => {
					return Services.CompanyService.updateLocation(id, location)
				},
				deleteLocation: (_, { company, location }) => Services.CompanyService.deleteLocation(location).then(() => true),
			},
		},
	},
}
