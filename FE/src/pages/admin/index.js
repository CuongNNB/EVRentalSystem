/**
 * Admin Pages Index
 * 
 * NOTE: Export tất cả các trang admin
 * - AdminDashboard: Trang tổng quan
 * - VehicleManagement: Trang quản lý xe
 * - AdminGuard: Protected route cho admin
 */

import AdminDashboard from './AdminDashboard'
import AdminGuard from './AdminGuard'
import VehicleManagement from './VehicleManagement'

export { AdminDashboard, AdminGuard, VehicleManagement }
