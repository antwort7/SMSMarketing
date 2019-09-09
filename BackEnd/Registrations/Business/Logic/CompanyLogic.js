const DataLoaders = require('../DataLoaders')

module.exports = ({ CompanyValidator }, { CompanyPersistence }) => {
	return {
		createCompany: company => CompanyValidator.create.validate({ company })
			.then(() => {
				return CompanyPersistence.createCompany(company)
			}),

		getCompanies: ({ lastSeen, ...params }) => CompanyValidator.getAll.validate(params.filter)
			.then((transformedFilter) => {
				params.filter = transformedFilter
				params.lastSeen = lastSeen
				return CompanyPersistence.getCompanies(params)
			}),

		updateCompany: (id, company) => CompanyValidator.update.validate({ id, company })
			.then(() => CompanyPersistence.updateCompany(id, company)),

		deleteCompany: id => CompanyValidator.delete.validate({ id })
			.then(() => CompanyPersistence.updateCompany(id, { deleted: true })),

		getBatchCompanies: ids => DataLoaders.instance().companyLoader(false).loadMany(ids),

	}
}
