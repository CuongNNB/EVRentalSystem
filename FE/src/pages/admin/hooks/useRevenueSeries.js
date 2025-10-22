import { useAsync } from './useAsync'
import { getRevenueSeries } from '../../../api/adminDashboard'
import { lastNDays } from '../../../utils/dateRange'

export default function useRevenueSeries(params = {}) {
  const p = params?.period ? params : lastNDays(7)
  return useAsync(() => getRevenueSeries(p), [p.period, p.from, p.to])
}
