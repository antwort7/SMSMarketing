const { AccessService } = require('./Connectors')

const DataLoaders = require('./DataLoaders')

const verifyPermissionInDomain = (access, domainId, permissionName) => {
	if (!access) {
		throw new Error('Unauthorized')
	}
	return AccessService.getPermissions({})
		.then(({ permissions }) => {
			if (!permissions.find(permission => permission.name === permissionName)) {
				throw new Error('Unauthorized')
			}
			const domainAccess = access.find(a => a.domain === domainId && a.subdomain === '*')
			if (!domainAccess) {
				throw new Error('Unauthorized')
			}
			if (!domainAccess.permissions.find(p => p === '*' || p.name === permissionName)) {
				throw new Error('Unauthorized')
			}
			return Promise.resolve()
		})
}

const verifyPermissionInSubdomain = (access, subdomainId, permissionName) => {
	if (!access) {
		throw new Error('Unauthorized')
	}
	return Promise.all([AccessService.getPermissions({}), DataLoaders.instance().subdomainLoader().load(subdomainId)])
		.then(([{ permissions }, subdomain]) => {
			if (!permissions.find(permission => permission.name === permissionName)) {
				throw new Error('Unauthorized')
			}
			const subdomainAccess = access.filter(a => a.subdomain === subdomainId || ((a.domain === subdomain.domain) && a.subdomain === '*'))
			if (subdomainAccess.length === 0) {
				throw new Error('Unauthorized')
			}
			if (!subdomainAccess.reduce((acc, i) => [...acc, ...i.permissions], []).find(p => p === '*' || p.name === permissionName)) {
				throw new Error('Unauthorized')
			}
			return Promise.resolve()
		})
}

const verifyPermissionInSubdomainAndDomain = (access, domainId, subdomainId, permissionName) => {
	if (!access) {
		throw new Error('Unauthorized')
	}
	return AccessService.getPermissions({})
		.then(({ permissions }) => {
			if (!permissions.find(permission => permission.name === permissionName)) {
				throw new Error('Unauthorized')
			}
			const domainSubdomainAccess = access.filter(a => a.domain === domainId && (a.subdomain === subdomainId || a.subdomain === '*'))
			if (domainSubdomainAccess.length === 0) {
				throw new Error('Unauthorized')
			}
			else if (!domainSubdomainAccess.reduce((acc, i) => [...acc, ...i.permissions], []).find(p => p === '*' || p.name === permissionName)) {
				throw new Error('Unauthorized')
			}
			return Promise.resolve()
		})
}

module.exports = {
	verifyPermission: (domain, subdomain, access, permissionName) => {
		if (domain && subdomain) {
			return verifyPermissionInSubdomainAndDomain(access, domain, subdomain, permissionName)
		}
		if (!domain && subdomain) {
			return verifyPermissionInSubdomain(access, subdomain, permissionName)
		}
		if (!subdomain && domain) {
			return verifyPermissionInDomain(access, domain, permissionName)
		}
		return Promise.reject(new Error('Unauthorized'))
	},

	verifyPermissionInAnyDomain: (pairs, access, permissionName) => Promise.all(pairs.map(({ domain, subdomain }) => new Promise((resolve, reject) => {
		if (domain && subdomain) {
			resolve(verifyPermissionInSubdomainAndDomain(access, domain, subdomain, permissionName))
		}
		else if (!domain && subdomain) {
			resolve(verifyPermissionInSubdomain(access, subdomain, permissionName))
		}
		else if (!subdomain && domain) {
			resolve(verifyPermissionInDomain(access, domain, permissionName))
		}
		reject(new Error('Unauthorized'))
	})
		.then(() => 'success')
		.catch(() => 'failed')))
		.then((results) => {
			if (results.includes('success')) {
				return Promise.resolve()
			}
			throw new Error('Unauthorized')
		}),

	getAllowedSubdomains: (domain, access, permissionName) => {
		const accesses = access.filter(a => a.domain === domain && a.permissions.find(p => p === '*' || p.name === permissionName))
		if (accesses.includes('*')) {
			return Promise.resolve(['*'])
		}
		return Promise.resolve(accesses.map(a => a.subdomain))
	},
}

module.exports.permissions = {
	USER_VIEW_ALL: 'user:viewAll',
	USER_VIEW: 'user:view',
	USER_UPDATE: 'user:update',
	USER_DELETE: 'user:delete',
	ACCESS_CREATE: 'access:create',
	RESEND_WELCOME_EMAIL: 'access:resendWelcomeEmail',
	USER_ENABLE_DISABLE: 'user:EnableDisable',
	DOMAIN_CREATE: type => `domain:create${type}`,
	DOMAIN_DELETE: type => `domain:delete${type}`,
	DOMAIN_READ_ALL: type => `domain:readAll${type}`,
	DOMAIN_READ: type => `domain:read${type}`,
	SUBDOMAIN_CREATE: type => `subdomain:create${type}`,
	VEHICLE_VIEW_ALL: 'vehicle:viewAll',
	VEHICLE_CREATE: 'vehicle:create',
	VEHICLE_UPDATE: 'vehicle:update',
	VEHICLE_DELETE: 'vehicle:delete',
	LABOR_VIEW_ALL: 'labor:viewAll',
	LABOR_CREATE: 'labor:create',
	COST_VIEW_ALL: 'cost:viewAll',
	COST_VIEW: 'cost:view',
	COST_UPDATE: 'cost:update',
	COST_DELETE: 'cost:delete',
}
