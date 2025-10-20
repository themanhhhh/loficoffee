'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaBox, FaChartBar, FaList, FaTicketAlt, FaUsers, FaUtensils } from 'react-icons/fa'
import { IconType } from 'react-icons'

import AdminHeader from '../adminheader/adminheader'
import Style from '../../style/admin.module.css'

interface SidebarItem {
  id: string
  href: string
  label: string
  icon: IconType
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'stats', href: '/admin/statistic', label: 'Thống kê', icon: FaChartBar },
  { id: 'menu', href: '/admin', label: 'Quản lý Menu', icon: FaUtensils },
  { id: 'categories', href: '/admin/category', label: 'Danh mục', icon: FaList },
  { id: 'materials', href: '/admin/material', label: 'Nguyên liệu', icon: FaBox },
  { id: 'staff', href: '/admin/staff', label: 'Nhân viên', icon: FaUsers },
  { id: 'vouchers', href: '/admin/voucher', label: 'Voucher', icon: FaTicketAlt }
]

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname()

  return (
    <div className={Style.adminContainer}>
      <AdminHeader />
      <div className={Style.mainLayout}>
        <nav className={Style.sidebar}>
          {SIDEBAR_ITEMS.map(item => {
            const IconComponent = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`${Style.sidebarItem} ${isActive ? Style.active : ''}`}
              >
                <IconComponent className={Style.sidebarIcon} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className={Style.content}>{children}</div>
      </div>
    </div>
  )
}

export default AdminLayout

