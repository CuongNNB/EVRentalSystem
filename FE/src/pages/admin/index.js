/**
 * Admin Pages Index
 * 
 * NOTE: Export tất cả các trang admin
 * - AdminDashboard: Layout component với sidebar
 * - AdminOverview: Trang tổng quan (dashboard)
 * - VehicleManagement: Trang quản lý xe
 * - AdminGuard: Protected route cho admin
 */

import AdminDashboard, { AdminOverview } from './AdminDashboard'
import AdminGuard from './AdminGuard'
import VehicleManagement from './VehicleManagement'
import AdminVehicleDetail from './AdminVehicleDetail'
import AdminVehicleEdit from './AdminVehicleEdit'

export { AdminDashboard, AdminOverview, AdminGuard, VehicleManagement, AdminVehicleDetail, AdminVehicleEdit }
