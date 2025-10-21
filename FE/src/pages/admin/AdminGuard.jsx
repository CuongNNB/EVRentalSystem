import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

// Guard dành riêng cho khu vực Admin
const AdminGuard = () => {
  const rawUser = localStorage.getItem('ev_user')
  const token = localStorage.getItem('ev_token')
  if (!rawUser || !token) return <Navigate to="/login" replace />

  let user
  try { user = JSON.parse(rawUser) } catch (e) {
    console.error('Invalid ev_user in localStorage', e)
    return <Navigate to="/login" replace />
  }

  const roles = Array.isArray(user?.roles) ? user.roles : (user?.role ? [user.role] : [])
  const isAdmin = roles.includes('ADMIN')

  return isAdmin ? <Outlet /> : <Navigate to="/403" replace />
}

export default AdminGuard
