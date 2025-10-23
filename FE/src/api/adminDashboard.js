import api from './client'

// helper chuẩn hoá: luôn trả về array
const asArray = (payload) => {
	if (!payload) return []
	if (Array.isArray(payload)) return payload
	if (Array.isArray(payload.items)) return payload.items
	if (Array.isArray(payload.data)) return payload.data
	if (Array.isArray(payload.content)) return payload.content
	if (Array.isArray(payload.results)) return payload.results
	return []
}

export const getOverviewMetrics = async (params = {}) => {
	const { data } = await api.get('/admin/overview/metrics', { params })
	return {
		revenueMonth: data.revenueMonth ?? data.totalRevenueMonth ?? data.revenue ?? 0,
		deltaRevenueMoM: data.deltaRevenueMoM ?? data.revenueMoM ?? null,

		rentalsToday: data.rentalsToday ?? data.todayRentals ?? 0,
		deltaRentalsDoD: data.deltaRentalsDoD ?? data.rentalsDoD ?? null,

		vehiclesTotal: data.vehiclesTotal ?? data.totalVehicles ?? 0,
		vehiclesActive: data.vehiclesActive ?? data.activeVehicles ?? 0,
		vehiclesMaint: data.vehiclesMaint ?? data.maintenanceVehicles ?? 0,

		customersTotal: data.customersTotal ?? data.totalCustomers ?? 0,
		deltaCustomersMoM: data.deltaCustomersMoM ?? data.customersMoM ?? null,

		utilizationRate: data.utilizationRate ?? data.utilization ?? 0,
		deltaUtilizationWoW: data.deltaUtilizationWoW ?? data.utilizationWoW ?? null,
	}
}

export const getRevenueSeries = async (params = {}) => {
	const { data } = await api.get('/admin/overview/revenue-series', { params })

	// If backend returns points: [{date, revenue}]
	if (Array.isArray(data?.points)) {
		const labels = data.points.map(p => p.date)
		const values = data.points.map(p => Number(p.revenue ?? 0))
		return {
			granularity: data.granularity ?? data.scale ?? 'DAY',
			labels,
			values,
			total: Number(data.total ?? values.reduce((s, v) => s + (Number(v) || 0), 0)),
			previousValues: data.previousValues ?? null,
		}
	}

	// If backend returns labels / values arrays
	if (Array.isArray(data?.labels) && Array.isArray(data?.values)) {
		return {
			granularity: data.granularity ?? data.scale ?? 'DAY',
			labels: data.labels,
			values: data.values.map(v => Number(v ?? 0)),
			total: Number(data.total ?? 0),
			previousValues: data.previousValues ?? null,
		}
	}

	// fallback
	return { granularity: 'DAY', labels: [], values: [], total: 0 }
}

export const getTopStations = async (params = {}) => {
	const { data } = await api.get('/admin/overview/top-stations', { params })
	return asArray(data)
}

export const getRecentRentals = async (limit = 10, range) => {
	const { data } = await api.get('/admin/overview/recent-rentals', { params: { limit, ...(range || {}) } })
	return asArray(data)
}

export const getActivityFeed = async (limit = 10, range) => {
	const { data } = await api.get('/admin/overview/activity', { params: { limit, ...(range || {}) } })
	return asArray(data)
}

export const exportOverview = (params = { format: 'csv' }) =>
	api.get('/admin/overview/export', { params, responseType: 'blob' }).then(r => r.data)
