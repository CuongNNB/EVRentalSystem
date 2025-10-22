import { useAsync } from './useAsync'
import { getOverviewMetrics } from '../../../api/adminDashboard'
import { thisMonthRange } from '../../../utils/dateRange'

export default function useAdminMetrics(params = {}) {
  const def = thisMonthRange()
  const p = { ...def, ...(params || {}) }
  return useAsync(() => getOverviewMetrics(p), [p.from, p.to])
}
