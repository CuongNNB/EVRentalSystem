import { useAsync } from './useAsync'
import { getRecentRentals } from '../../../api/adminDashboard'
import { lastNDays } from '../../../utils/dateRange'

export default function useRecentRentals(limit = 10) {
  const def = lastNDays(7)
  return useAsync(() => getRecentRentals(limit, def), [limit, def.from, def.to])
}
