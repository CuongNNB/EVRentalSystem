import { useAsync } from './useAsync'
import { getTopStations } from '../../../api/adminDashboard'
import { thisMonthRange } from '../../../utils/dateRange'

export default function useTopStations(params = {}) {
  const def = thisMonthRange()
  const p = { limit: 5, ...def, ...(params || {}) }
  return useAsync(() => getTopStations(p), [p.limit, p.from, p.to])
}
