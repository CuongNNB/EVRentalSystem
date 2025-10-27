import { useMemo } from 'react'
import { useAsync } from './useAsync'
import { getActivityFeed } from '../../../api/adminDashboard'
import { lastNDays } from '../../../utils/dateRange'

export default function useActivityFeed(limit = 10) {
  // NOTE: Sử dụng useMemo để tránh tạo object mới mỗi render
  const def = useMemo(() => lastNDays(7), [])
  return useAsync(() => getActivityFeed(limit, def), [limit, def.from, def.to])
}
