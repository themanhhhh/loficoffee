'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  FaUserPlus,
  FaSearch,
  FaUserTie,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStar
} from 'react-icons/fa'
import { MdOutlineSchedule, MdOutlineAccessTime } from 'react-icons/md'
import AdminLayout from '../../components/adminlayout/adminlayout'
import styles from './staff.module.css'
import { apiFetch, ApiError } from '../../../lib/api'

type StaffStatus = 'active' | 'probation' | 'leave'

interface StaffMember {
  id: string
  name: string
  role: string
  department: string
  status: StaffStatus
  shift: string
  phone: string
  email: string
  joinDate: string
  lastShift: string
  totalShifts: number
  rating: number
  address: string
  username: string
  gender: string
  birthDate: string
}

interface NhanVienDto {
  maNV: string
  tenNV: string
  chucVu: string
  gioiTinh: string
  ngaySinh: string
  caLam: string
  taiKhoan: string
  soDienThoai?: string | null
  email?: string | null
  diaChi?: string | null
  trangThai?: string | null
}

interface HoaDonDto {
  maHD: string
  ngay: string
  nhanVien?: {
    maNV: string
  } | null
}

const STATUS_OPTIONS: { value: 'all' | StaffStatus; label: string }[] = [
  { value: 'all', label: 'Trạng thái' },
  { value: 'active', label: 'Đang làm việc' },
  { value: 'probation', label: 'Thử việc' },
  { value: 'leave', label: 'Tạm nghỉ' }
]

const statusClassName: Record<StaffStatus, string> = {
  active: styles.statusActive,
  probation: styles.statusProbation,
  leave: styles.statusLeave
}

const statusLabel: Record<StaffStatus, string> = {
  active: 'Đang làm việc',
  probation: 'Thử việc',
  leave: 'Tạm nghỉ'
}

const formatDate = (value?: string | null) => {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'
  return date.toLocaleDateString('vi-VN')
}

const daysBetween = (value?: string | null) => {
  if (!value) return Number.POSITIVE_INFINITY
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY
  const diff = Date.now() - date.getTime()
  return diff / (1000 * 60 * 60 * 24)
}

const StaffPage = () => {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | StaffStatus>('all')
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [nhanVienList, hoaDonList] = await Promise.all([
          apiFetch<NhanVienDto[]>('/api/nhanvien'),
          apiFetch<HoaDonDto[]>('/api/hoadon')
        ])

        if (ignore) return

        const invoiceStats = new Map<
          string,
          { total: number; earliest?: string; latest?: string }
        >()

        hoaDonList.forEach((invoice) => {
          const staffId = invoice.nhanVien?.maNV
          if (!staffId) return
          if (!invoiceStats.has(staffId)) {
            invoiceStats.set(staffId, { total: 0 })
          }
          const entry = invoiceStats.get(staffId)!
          entry.total += 1
          if (!entry.earliest || invoice.ngay < entry.earliest) {
            entry.earliest = invoice.ngay
          }
          if (!entry.latest || invoice.ngay > entry.latest) {
            entry.latest = invoice.ngay
          }
        })

        const mappedStaff: StaffMember[] = nhanVienList.map((employee) => {
          const stat = invoiceStats.get(employee.maNV) ?? { total: 0 }
          const joinDate = formatDate(stat.earliest)
          const lastShift = formatDate(stat.latest)
          const inactivityDays = daysBetween(stat.latest)

          let status: StaffStatus = 'active'
          if (stat.total === 0) {
            status = 'probation'
          } else if (inactivityDays > 30) {
            status = 'leave'
          }
          if (employee.trangThai === 'leave') {
            status = 'leave'
          } else if (employee.trangThai === 'probation') {
            status = 'probation'
          }

          const rating = stat.total === 0 ? 3 : Math.min(5, 3 + stat.total / 50)

          return {
            id: employee.maNV,
            name: employee.tenNV,
            role: employee.chucVu,
            department: employee.chucVu,
            status,
            shift: employee.caLam,
            phone: employee.soDienThoai ?? 'Chưa cập nhật',
            email: employee.email ?? employee.taiKhoan,
            joinDate,
            lastShift,
            totalShifts: stat.total,
            rating: Number(rating.toFixed(1)),
            address: employee.diaChi ?? 'Chưa cập nhật',
            username: employee.taiKhoan,
            gender: employee.gioiTinh,
            birthDate: formatDate(employee.ngaySinh)
          }
        })

        setStaff(mappedStaff)
        setSelectedStaffId(mappedStaff[0]?.id ?? null)
      } catch (err) {
        if (ignore) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Không thể tải dữ liệu nhân viên. Vui lòng thử lại.'
        )
        setStaff([])
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadData()
    return () => {
      ignore = true
    }
  }, [])

  const departmentOptions = useMemo(() => {
    const unique = Array.from(new Set(staff.map((member) => member.department).filter(Boolean)))
    return ['Tất cả bộ phận', ...unique]
  }, [staff])

  const filteredStaff = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    return staff.filter((member) => {
      const matchesKeyword =
        keyword.length === 0 ||
        member.name.toLowerCase().includes(keyword) ||
        member.role.toLowerCase().includes(keyword) ||
        member.id.toLowerCase().includes(keyword)

      const matchesDepartment =
        departmentFilter === 'all' || member.department === departmentFilter

      const matchesStatus =
        statusFilter === 'all' || member.status === statusFilter

      return matchesKeyword && matchesDepartment && matchesStatus
    })
  }, [staff, searchTerm, departmentFilter, statusFilter])

  const selectedStaff = useMemo(
    () => filteredStaff.find((member) => member.id === selectedStaffId) ?? null,
    [filteredStaff, selectedStaffId]
  )

  useEffect(() => {
    if (!selectedStaff && filteredStaff.length > 0) {
      setSelectedStaffId(filteredStaff[0].id)
    }
  }, [filteredStaff, selectedStaff])

  return (
    <AdminLayout>
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <h1>Quản lý nhân sự</h1>
            <p>Theo dõi thông tin nhân viên và ca làm việc tại quán</p>
          </div>
          <button className={styles.addButton}>
            <FaUserPlus /> Thêm nhân viên
          </button>
        </header>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className={styles.filterSelects}>
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
            >
              <option value="all">Tất cả bộ phận</option>
              {departmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | StaffStatus)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Mã NV</th>
                  <th>Nhân viên</th>
                  <th>Bộ phận</th>
                  <th>Ca làm</th>
                  <th>Trạng thái</th>
                  <th>Ca gần nhất</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className={styles.tableState}>
                      Đang tải dữ liệu nhân viên...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className={`${styles.tableState} ${styles.tableStateError}`}>
                      {error}
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.tableState}>
                      Không tìm thấy nhân viên phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => (
                    <tr
                      key={member.id}
                      className={member.id === selectedStaffId ? styles.selectedRow : undefined}
                      onClick={() => setSelectedStaffId(member.id)}
                    >
                      <td>{member.id}</td>
                      <td>
                        <div className={styles.staffCell}>
                          <FaUserTie />
                          <div>
                            <strong>{member.name}</strong>
                            <span>{member.role}</span>
                          </div>
                        </div>
                      </td>
                      <td>{member.department}</td>
                      <td>{member.shift}</td>
                      <td>
                        <span className={`${styles.statusTag} ${statusClassName[member.status]}`}>
                          {statusLabel[member.status]}
                        </span>
                      </td>
                      <td>{member.lastShift}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <aside className={styles.detailPanel}>
            {selectedStaff ? (
              <>
                <div className={styles.detailHeader}>
                  <h3>{selectedStaff.name}</h3>
                  <span>{selectedStaff.role}</span>
                  <div className={`${styles.statusTag} ${statusClassName[selectedStaff.status]}`}>
                    {statusLabel[selectedStaff.status]}
                  </div>
                </div>

                <div className={styles.detailStats}>
                  <div>
                    <span>Tổng hóa đơn</span>
                    <strong>{selectedStaff.totalShifts}</strong>
                  </div>
                  <div>
                    <span>Xếp hạng nội bộ</span>
                    <strong>
                      <FaStar /> {selectedStaff.rating.toFixed(1)}
                    </strong>
                  </div>
                  <div>
                    <span>Trạng thái</span>
                    <strong>{statusLabel[selectedStaff.status]}</strong>
                  </div>
                </div>

                <div className={styles.detailList}>
                  <div>
                    <FaPhoneAlt /> <span>{selectedStaff.phone}</span>
                  </div>
                  <div>
                    <FaEnvelope /> <span>{selectedStaff.email}</span>
                  </div>
                  <div>
                    <FaMapMarkerAlt /> <span>{selectedStaff.address}</span>
                  </div>
                  <div>
                    <FaCalendarAlt /> <span>Ngày sinh: {selectedStaff.birthDate}</span>
                  </div>
                  <div>
                    <MdOutlineSchedule /> <span>Ca chính: {selectedStaff.shift}</span>
                  </div>
                  <div>
                    <MdOutlineAccessTime /> <span>Ca gần nhất: {selectedStaff.lastShift}</span>
                  </div>
                  <div>
                    <MdOutlineAccessTime /> <span>Ngày vào làm: {selectedStaff.joinDate}</span>
                  </div>
                </div>

                <button className={styles.primaryAction}>Cập nhật thông tin nhân viên</button>
              </>
            ) : (
              <div className={styles.detailPlaceholder}>
                Chọn một nhân viên ở bảng bên trái để xem chi tiết.
              </div>
            )}
          </aside>
        </div>
      </div>
    </AdminLayout>
  )
}

export default StaffPage
