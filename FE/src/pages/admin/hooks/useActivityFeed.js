import { useAsync } from './useAsync'
import { getActivityFeed } from '../../../api/adminDashboard'
import { lastNDays } from '../../../utils/dateRange'

export default function useActivityFeed(limit = 10) {
  const def = lastNDays(7)
  return useAsync(() => getActivityFeed(limit, def), [limit, def.from, def.to])
}
