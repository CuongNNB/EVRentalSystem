import { useMemo } from 'react'
import { useAsync } from './useAsync'
import { getRevenueSeries } from '../../../api/adminDashboard'
import { lastNDays } from '../../../utils/dateRange'

export default function useRevenueSeries(params = {}) {
  // NOTE: Sử dụng useMemo để tránh tạo object mới mỗi render
  const p = useMemo(
    () => (params?.period ? params : lastNDays(7)),
    [params?.period, params?.from, params?.to]
  )
  return useAsync(() => getRevenueSeries(p), [p.period, p.from, p.to])
}
