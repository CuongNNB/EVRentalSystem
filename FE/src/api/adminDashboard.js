import api from './client'

// helper chuẩn hoá: luôn trả về array
const asArray = (payload) => {
	if (!payload) return []
	if (Array.isArray(payload)) return payload
	if (Array.isArray(payload.items)) return payload.items
	if (Array.isArray(payload.rentals)) return payload.rentals
	if (Array.isArray(payload.activities)) return payload.activities // ✅ FIX: Add activities key
	if (Array.isArray(payload.data)) return payload.data
	if (Array.isArray(payload.content)) return payload.content
	if (Array.isArray(payload.results)) return payload.results
	return []
}

export const getOverviewMetrics = async (params = {}) => {
	const { data } = await api.get('/admin/overview/metrics', { params })
	return data
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

export const getTopStations = async (params = {}, config = {}) => {
	const { data } = await api.get('/admin/overview/top-stations', { params, ...config })
	return data
}

// --- Station helpers: total vehicles per station & options for dropdown ---
export const getStationTotalVehicles = (stationId, config = {}) => {
  const id = String(stationId).trim()
  return api.get(`/admin/station/${id}/vehicles/total`, config).then(r => r.data)
}

export const getStationOptions = async () => {
		// Try the top-stations endpoint first (less likely to 500 on some backends),
		// then fallback to other common endpoints. This avoids hammering endpoints that return 500.
		const tryUrls = ['/admin/overview/top-stations?limit=50', '/admin/stations', '/stations']
	for (const u of tryUrls) {
		try {
				const { data } = await api.get(u)

				// If we get a 500-like payload or empty, continue to next
				if (!data) continue

			if (Array.isArray(data)) {
				return data
					.map((x) => ({
						id: x.id ?? x.stationId ?? x.station_id,
						name: x.name ?? x.stationName ?? x.station_name ?? `Station ${x.id ?? ''}`,
					}))
					.filter((x) => x.id != null && x.name)
			}

			if (Array.isArray(data?.stations)) {
				return data.stations
					.map((x) => ({
						id: x.id ?? x.stationId ?? x.station_id,
						name: x.name ?? x.stationName ?? x.station_name ?? `Station ${x.id ?? ''}`,
					}))
					.filter((x) => x.id != null && x.name)
			}
		} catch (e) {
			// try next URL
		}
	}
	return []
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
