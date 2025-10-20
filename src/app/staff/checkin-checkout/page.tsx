'use client'
import React, { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FaArrowLeft,
  FaUserCheck,
  FaClock,
  FaUserTie,
  FaSignInAlt,
  FaSignOutAlt,
  FaClipboardCheck
} from 'react-icons/fa'
import styles from './checkinCheckout.module.css'
import { apiFetch, ApiError } from '../../../lib/api'

type ShiftStatus = 'pending' | 'working' | 'completed'

type HistoryAction = 'checkin' | 'checkout'

interface HistoryItem {
  action: HistoryAction
  time: string
  note?: string
}

interface StaffShift {
  id: string
  name: string
  role: string
  status: ShiftStatus
  checkIn?: string
  checkOut?: string
  note?: string
  history: HistoryItem[]
}

interface NhanVienDto {
  maNV: string
  tenNV: string
  chucVu: string
  caLam: string
}

const initialStaff: StaffShift[] = [
  {
    id: 'S001',
    name: 'Nguyễn Thảo',
    role: 'Thu ngân',
    status: 'working',
    checkIn: '07:45',
    history: [{ action: 'checkin', time: '07:45', note: 'Đến sớm chuẩn bị quầy' }]
  },
  {
    id: 'S002',
    name: 'Trần Hữu Minh',
    role: 'Pha chế',
    status: 'working',
    checkIn: '07:55',
    history: [{ action: 'checkin', time: '07:55' }]
  },
  {
    id: 'S003',
    name: 'Lê Mỹ An',
    role: 'Phục vụ',
    status: 'pending',
    history: []
  },
  {
    id: 'S004',
    name: 'Phạm Quốc Huy',
    role: 'Quản lý ca',
    status: 'completed',
    checkIn: '06:50',
    checkOut: '08:15',
    history: [
      { action: 'checkin', time: '06:50', note: 'Chuẩn bị bàn giao ca' },
      { action: 'checkout', time: '08:15', note: 'Bàn giao sổ quỹ' }
    ]
  }
]

const CheckinCheckoutPage = () => {
  const [staffShifts, setStaffShifts] = useState<StaffShift[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const nhanVienData = await apiFetch<NhanVienDto[]>('/api/nhanvien')
        
        if (ignore) return

        // Transform data - giả định tất cả pending trừ khi đã check-in
        const mapped: StaffShift[] = nhanVienData.map((nv) => ({
          id: nv.maNV,
          name: nv.tenNV,
          role: nv.chucVu,
          status: 'pending' as ShiftStatus,
          history: []
        }))

        setStaffShifts(mapped)
        if (mapped.length > 0) {
          setSelectedStaffId(mapped[0].id)
        }
      } catch (err) {
        if (ignore) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Không thể tải danh sách nhân viên. Vui lòng thử lại.'
        )
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

  const selectedStaff = useMemo(
    () => staffShifts.find(staff => staff.id === selectedStaffId),
    [selectedStaffId, staffShifts]
  )

  const formatNow = () =>
    new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  const updateStaff = (id: string, updater: (staff: StaffShift) => StaffShift) => {
    setStaffShifts(prev => prev.map(staff => (staff.id === id ? updater(staff) : staff)))
  }

  const handleCheckIn = () => {
    if (!selectedStaff) return
    if (selectedStaff.status === 'working') {
      alert('Nhân viên đã check-in trong ca.')
      return
    }
    const time = formatNow()
    updateStaff(selectedStaff.id, staff => ({
      ...staff,
      status: 'working',
      checkIn: time,
      history: [{ action: 'checkin', time }, ...staff.history]
    }))
  }

  const handleCheckOut = () => {
    if (!selectedStaff) return
    if (selectedStaff.status === 'pending') {
      alert('Nhân viên chưa check-in.')
      return
    }
    if (selectedStaff.status === 'completed') {
      alert('Nhân viên đã kết ca.')
      return
    }
    const time = formatNow()
    updateStaff(selectedStaff.id, staff => ({
      ...staff,
      status: 'completed',
      checkOut: time,
      history: [{ action: 'checkout', time }, ...staff.history]
    }))
  }

  const statusLabel: Record<ShiftStatus, string> = {
    pending: 'Chưa vào ca',
    working: 'Đang làm việc',
    completed: 'Đã kết ca'
  }

  const statusClass: Record<ShiftStatus, string> = {
    pending: styles.statusPending,
    working: styles.statusWorking,
    completed: styles.statusCompleted
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <h1>Đang tải dữ liệu...</h1>
          </div>
        </header>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <h1 style={{ color: 'red' }}>{error}</h1>
            <Link href="/staff" className={styles.backLink}>
              <FaArrowLeft /> Quay lại
            </Link>
          </div>
        </header>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <Link href="/staff" className={styles.backLink}>
            <FaArrowLeft /> Quay về quầy bán hàng
          </Link>
          <h1>Điểm danh ca làm việc</h1>
          <p>Ghi nhận thời gian check-in / check-out của nhân viên trong ngày.</p>
        </div>
        <div className={styles.headerBadge}>
          <FaUserCheck />
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <h2><FaClipboardCheck /> Danh sách ca hôm nay</h2>
          <ul>
            {staffShifts.map(staff => (
              <li
                key={staff.id}
                className={`${styles.staffItem} ${
                  selectedStaffId === staff.id ? styles.staffItemActive : ''
                }`}
                onClick={() => setSelectedStaffId(staff.id)}
              >
                <div className={styles.staffInfo}>
                  <strong>{staff.name}</strong>
                  <span><FaUserTie /> {staff.role}</span>
                </div>
                <div className={`${styles.statusBadge} ${statusClass[staff.status]}`}>
                  {statusLabel[staff.status]}
                </div>
                <div className={styles.timeInfo}>
                  <span><FaSignInAlt /> {staff.checkIn || '—'}</span>
                  <span><FaSignOutAlt /> {staff.checkOut || '—'}</span>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <section className={styles.content}>
          {selectedStaff ? (
            <>
              <div className={styles.contentHeader}>
                <div>
                  <h2>{selectedStaff.name}</h2>
                  <span>{selectedStaff.role}</span>
                </div>
                <div className={`${styles.statusBadge} ${statusClass[selectedStaff.status]}`}>
                  {statusLabel[selectedStaff.status]}
                </div>
              </div>

              <div className={styles.currentState}>
                <div>
                  <span>Thời gian vào ca</span>
                  <strong>{selectedStaff.checkIn || 'Chưa điểm danh'}</strong>
                </div>
                <div>
                  <span>Thời gian kết ca</span>
                  <strong>{selectedStaff.checkOut || 'Chưa kết ca'}</strong>
                </div>
                <div>
                  <span>Ghi chú gần nhất</span>
                  <strong>
                    {selectedStaff.history[0]?.note
                      ? selectedStaff.history[0].note
                      : 'Không có'}
                  </strong>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.checkInBtn}
                  type="button"
                  onClick={handleCheckIn}
                >
                  <FaSignInAlt /> Check-in
                </button>
                <button
                  className={styles.checkOutBtn}
                  type="button"
                  onClick={handleCheckOut}
                >
                  <FaSignOutAlt /> Check-out
                </button>
              </div>

              <div className={styles.timeline}>
                <h3><FaClock /> Lịch sử thao tác</h3>
                {selectedStaff.history.length === 0 ? (
                  <p className={styles.emptyTimeline}>Chưa có lịch sử cho nhân viên này.</p>
                ) : (
                  <ul>
                    {selectedStaff.history.map((item, index) => (
                      <li key={`${item.action}-${item.time}-${index}`}>
                        <div className={styles.timelinePoint} />
                        <div className={styles.timelineContent}>
                          <span className={styles.timelineTime}>{item.time}</span>
                          <strong>
                            {item.action === 'checkin' ? 'Check-in' : 'Check-out'}
                          </strong>
                          {item.note && <p>{item.note}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <FaUserCheck />
              <p>Chọn một nhân viên ở danh sách bên trái để xem chi tiết ca làm việc.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default CheckinCheckoutPage
