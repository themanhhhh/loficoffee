'use client'
import React, { useState, useMemo, useEffect } from 'react'
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaCopy,
  FaCalendarAlt,
  FaTag,
  FaPercentage,
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTimes
} from 'react-icons/fa'
import AdminLayout from '../../components/adminlayout/adminlayout'
import styles from './voucher.module.css'
import { apiFetch, ApiError } from '../../../lib/api'

type VoucherType = 'percentage' | 'fixed' | 'free_item'
type VoucherStatus = 'active' | 'inactive' | 'expired'

interface Voucher {
  id: string
  code: string
  name: string
  type: VoucherType
  value: number
  minOrderAmount?: number
  maxDiscount?: number
  usageLimit: number
  usedCount: number
  startDate: string
  endDate: string
  status: VoucherStatus
  description: string
  applicableItems?: string[]
}

interface KhuyenMaiDto {
  maKM: string
  tenKM: string
  loaiKM?: string
  giaTriGiam?: number
  soTienToiThieu?: number
  giamToiDa?: number
  soLuongSuDung?: number
  moTa?: string
  ngayBatDau: string
  ngayKetThuc: string
  hoaDons?: any[]
}

interface VoucherFormData {
  maKM: string
  tenKM: string
  loaiKM: string
  giaTriGiam: number
  soTienToiThieu: number
  giamToiDa: number
  soLuongSuDung: number
  moTa: string
  ngayBatDau: string
  ngayKetThuc: string
}

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả loại' },
  { value: 'percentage', label: 'Phần trăm' },
  { value: 'fixed', label: 'Giá trị cố định' },
  { value: 'free_item', label: 'Tặng sản phẩm' }
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Tạm dừng' },
  { value: 'expired', label: 'Hết hạn' }
]

const VoucherPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [formData, setFormData] = useState<VoucherFormData>({
    maKM: '',
    tenKM: '',
    loaiKM: 'percentage',
    giaTriGiam: 0,
    soTienToiThieu: 0,
    giamToiDa: 0,
    soLuongSuDung: 100,
    moTa: '',
    ngayBatDau: new Date().toISOString().split('T')[0],
    ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  useEffect(() => {
    let ignore = false
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await apiFetch<KhuyenMaiDto[]>('/api/khuyenmai')
        if (ignore) return

        // Transform data
        const mapped: Voucher[] = data.map((km) => {
          const startDate = new Date(km.ngayBatDau)
          const endDate = new Date(km.ngayKetThuc)
          const now = new Date()
          
          let status: VoucherStatus = 'active'
          if (now < startDate) {
            status = 'inactive'
          } else if (now > endDate) {
            status = 'expired'
          }

          return {
            id: km.maKM,
            code: km.maKM,
            name: km.tenKM,
            type: (km.loaiKM || 'percentage') as VoucherType,
            value: km.giaTriGiam || 0,
            minOrderAmount: km.soTienToiThieu,
            maxDiscount: km.giamToiDa,
            usageLimit: km.soLuongSuDung || 0,
            usedCount: km.hoaDons?.length || 0,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            status,
            description: km.moTa || '',
            applicableItems: []
          }
        })

        setVouchers(mapped)
      } catch (err) {
        if (ignore) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Không thể tải danh sách khuyến mãi. Vui lòng thử lại.'
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

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(voucher => {
      const matchSearch = 
        voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchType = typeFilter === 'all' || voucher.type === typeFilter
      const matchStatus = statusFilter === 'all' || voucher.status === statusFilter
      return matchSearch && matchType && matchStatus
    })
  }, [searchTerm, typeFilter, statusFilter, vouchers])

  const stats = useMemo(() => {
    return vouchers.reduce(
      (acc, voucher) => {
        acc.total += 1
        if (voucher.status === 'active') acc.active += 1
        if (voucher.status === 'inactive') acc.inactive += 1
        if (voucher.status === 'expired') acc.expired += 1
        acc.totalUsed += voucher.usedCount
        acc.totalLimit += voucher.usageLimit
        return acc
      },
      { total: 0, active: 0, inactive: 0, expired: 0, totalUsed: 0, totalLimit: 0 }
    )
  }, [vouchers])

  const getTypeIcon = (type: VoucherType) => {
    switch (type) {
      case 'percentage': return <FaPercentage />
      case 'fixed': return <FaTag />
      case 'free_item': return <FaGift />
      default: return <FaTag />
    }
  }

  const getTypeLabel = (type: VoucherType) => {
    switch (type) {
      case 'percentage': return 'Phần trăm'
      case 'fixed': return 'Giá trị cố định'
      case 'free_item': return 'Tặng sản phẩm'
      default: return 'Không xác định'
    }
  }

  const getStatusIcon = (status: VoucherStatus) => {
    switch (status) {
      case 'active': return <FaCheckCircle />
      case 'inactive': return <FaTimesCircle />
      case 'expired': return <FaClock />
      default: return <FaTimesCircle />
    }
  }

  const getStatusLabel = (status: VoucherStatus) => {
    switch (status) {
      case 'active': return 'Đang hoạt động'
      case 'inactive': return 'Tạm dừng'
      case 'expired': return 'Hết hạn'
      default: return 'Không xác định'
    }
  }

  const getStatusClass = (status: VoucherStatus) => {
    switch (status) {
      case 'active': return styles.statusActive
      case 'inactive': return styles.statusInactive
      case 'expired': return styles.statusExpired
      default: return styles.statusInactive
    }
  }

  const formatValue = (voucher: Voucher) => {
    switch (voucher.type) {
      case 'percentage':
        return `${voucher.value}%`
      case 'fixed':
        return `${voucher.value.toLocaleString('vi-VN')}đ`
      case 'free_item':
        return 'Tặng sản phẩm'
      default:
        return 'N/A'
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    alert(`Đã sao chép mã: ${code}`)
  }

  const loadVouchersData = async () => {
    try {
      const data = await apiFetch<KhuyenMaiDto[]>('/api/khuyenmai')

      const mapped: Voucher[] = data.map((km) => {
        const startDate = new Date(km.ngayBatDau)
        const endDate = new Date(km.ngayKetThuc)
        const now = new Date()
        
        let status: VoucherStatus = 'active'
        if (now < startDate) {
          status = 'inactive'
        } else if (now > endDate) {
          status = 'expired'
        }

        return {
          id: km.maKM,
          code: km.maKM,
          name: km.tenKM,
          type: (km.loaiKM || 'percentage') as VoucherType,
          value: km.giaTriGiam || 0,
          minOrderAmount: km.soTienToiThieu,
          maxDiscount: km.giamToiDa,
          usageLimit: km.soLuongSuDung || 0,
          usedCount: km.hoaDons?.length || 0,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          status,
          description: km.moTa || '',
          applicableItems: []
        }
      })

      setVouchers(mapped)
    } catch (err) {
      throw err
    }
  }

  const handleAddVoucher = () => {
    setEditingVoucher(null)
    setFormData({
      maKM: '',
      tenKM: '',
      loaiKM: 'percentage',
      giaTriGiam: 0,
      soTienToiThieu: 0,
      giamToiDa: 0,
      soLuongSuDung: 100,
      moTa: '',
      ngayBatDau: new Date().toISOString().split('T')[0],
      ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })
    setShowModal(true)
  }

  const handleEditVoucher = (voucher: Voucher) => {
    setEditingVoucher(voucher)
    setFormData({
      maKM: voucher.id,
      tenKM: voucher.name,
      loaiKM: voucher.type,
      giaTriGiam: voucher.value,
      soTienToiThieu: voucher.minOrderAmount || 0,
      giamToiDa: voucher.maxDiscount || 0,
      soLuongSuDung: voucher.usageLimit,
      moTa: voucher.description,
      ngayBatDau: voucher.startDate,
      ngayKetThuc: voucher.endDate
    })
    setShowModal(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingVoucher) {
        // Update
        await apiFetch(`/api/khuyenmai/${editingVoucher.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        })
        alert('Cập nhật voucher thành công!')
      } else {
        // Create
        await apiFetch('/api/khuyenmai', {
          method: 'POST',
          body: JSON.stringify(formData)
        })
        alert('Thêm voucher mới thành công!')
      }

      setShowModal(false)
      await loadVouchersData()
    } catch (err) {
      alert('Lỗi: ' + (err instanceof ApiError ? err.message : 'Unknown error'))
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingVoucher(null)
  }

  const handleDeleteVoucher = async (voucherId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
      return
    }

    try {
      await apiFetch(`/api/khuyenmai/${voucherId}`, {
        method: 'DELETE'
      })

      await loadVouchersData()
      if (selectedVoucher?.id === voucherId) {
        setSelectedVoucher(null)
      }
      alert('Xóa voucher thành công!')
    } catch (err) {
      alert('Lỗi khi xóa voucher: ' + (err instanceof ApiError ? err.message : 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className={styles.container}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu...</div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className={styles.container}>
          <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>
        </div>
      </AdminLayout>
    )
  }

  return (
        <AdminLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <h1>Quản lý Voucher</h1>
            <p>Quản lý và theo dõi các mã giảm giá, khuyến mãi</p>
          </div>
          <button 
            className={styles.createButton}
            onClick={handleAddVoucher}
          >
            <FaPlus /> Tạo voucher mới
          </button>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaTag />
            </div>
            <div className={styles.statContent}>
              <span>Tổng voucher</span>
              <strong>{stats.total}</strong>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconActive}`}>
              <FaCheckCircle />
            </div>
            <div className={styles.statContent}>
              <span>Đang hoạt động</span>
              <strong>{stats.active}</strong>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconInactive}`}>
              <FaTimesCircle />
            </div>
            <div className={styles.statContent}>
              <span>Tạm dừng</span>
              <strong>{stats.inactive}</strong>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconExpired}`}>
              <FaClock />
            </div>
            <div className={styles.statContent}>
              <span>Hết hạn</span>
              <strong>{stats.expired}</strong>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm theo mã voucher, tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Voucher List */}
          <div className={styles.voucherList}>
            <div className={styles.listHeader}>
              <h2>Danh sách Voucher ({filteredVouchers.length})</h2>
            </div>
            <div className={styles.voucherGrid}>
              {filteredVouchers.map(voucher => (
                <div 
                  key={voucher.id} 
                  className={`${styles.voucherCard} ${selectedVoucher?.id === voucher.id ? styles.selected : ''}`}
                  onClick={() => setSelectedVoucher(voucher)}
                >
                  <div className={styles.voucherHeader}>
                    <div className={styles.voucherCode}>
                      <span className={styles.code}>{voucher.code}</span>
                      <button 
                        className={styles.copyBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(voucher.code)
                        }}
                      >
                        <FaCopy />
                      </button>
                    </div>
                    <div className={`${styles.statusTag} ${getStatusClass(voucher.status)}`}>
                      {getStatusIcon(voucher.status)}
                      {getStatusLabel(voucher.status)}
                    </div>
                  </div>
                  
                  <div className={styles.voucherBody}>
                    <h3>{voucher.name}</h3>
                    <p>{voucher.description}</p>
                    
                    <div className={styles.voucherDetails}>
                      <div className={styles.detailRow}>
                        <span>Loại:</span>
                        <span className={styles.detailValue}>
                          {getTypeIcon(voucher.type)}
                          {getTypeLabel(voucher.type)}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span>Giá trị:</span>
                        <span className={styles.detailValue}>{formatValue(voucher)}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span>Sử dụng:</span>
                        <span className={styles.detailValue}>
                          {voucher.usedCount}/{voucher.usageLimit}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span>Hạn sử dụng:</span>
                        <span className={styles.detailValue}>
                          <FaCalendarAlt />
                          {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.voucherActions}>
                    <button 
                      className={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditVoucher(voucher)
                      }}
                      title="Chỉnh sửa"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteVoucher(voucher.id)
                      }}
                      title="Xóa"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Voucher Details */}
          <div className={styles.voucherDetails}>
            {selectedVoucher ? (
              <div className={styles.detailsPanel}>
                <div className={styles.detailsHeader}>
                  <h2>{selectedVoucher.name}</h2>
                  <div className={`${styles.statusTag} ${getStatusClass(selectedVoucher.status)}`}>
                    {getStatusIcon(selectedVoucher.status)}
                    {getStatusLabel(selectedVoucher.status)}
                  </div>
                </div>

                <div className={styles.detailsContent}>
                  <div className={styles.detailSection}>
                    <h3>Thông tin cơ bản</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <span>Mã voucher:</span>
                        <span className={styles.codeValue}>{selectedVoucher.code}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span>Loại:</span>
                        <span>{getTypeLabel(selectedVoucher.type)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span>Giá trị:</span>
                        <span className={styles.valueHighlight}>{formatValue(selectedVoucher)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span>Mô tả:</span>
                        <span>{selectedVoucher.description}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h3>Điều kiện sử dụng</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <span>Đơn hàng tối thiểu:</span>
                        <span>{selectedVoucher.minOrderAmount?.toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span>Giảm giá tối đa:</span>
                        <span>{selectedVoucher.maxDiscount?.toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span>Sản phẩm áp dụng:</span>
                        <span>{selectedVoucher.applicableItems?.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h3>Thống kê sử dụng</h3>
                    <div className={styles.usageStats}>
                      <div className={styles.usageBar}>
                        <div 
                          className={styles.usageFill}
                          style={{ 
                            width: `${(selectedVoucher.usedCount / selectedVoucher.usageLimit) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div className={styles.usageText}>
                        {selectedVoucher.usedCount} / {selectedVoucher.usageLimit} lượt sử dụng
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h3>Thời gian</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <span>Ngày bắt đầu:</span>
                        <span>{new Date(selectedVoucher.startDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span>Ngày kết thúc:</span>
                        <span>{new Date(selectedVoucher.endDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.detailsActions}>
                  <button className={styles.primaryBtn}>
                    <FaEdit /> Chỉnh sửa
                  </button>
                  <button className={styles.secondaryBtn}>
                    <FaCopy /> Sao chép mã
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <FaTag />
                <h3>Chọn một voucher</h3>
                <p>Chọn voucher từ danh sách bên trái để xem thông tin chi tiết</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal for Add/Edit Voucher */}
        {showModal && (
          <div className={styles.modalOverlay} onClick={handleCloseModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{editingVoucher ? 'Chỉnh sửa voucher' : 'Tạo voucher mới'}</h2>
                <button className={styles.closeBtn} onClick={handleCloseModal}>
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSubmitForm} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>Mã voucher *</label>
                  <input
                    type="text"
                    value={formData.maKM}
                    onChange={(e) => setFormData({ ...formData, maKM: e.target.value })}
                    disabled={!!editingVoucher}
                    required
                    placeholder="VD: KM001, SUMMER2025"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Tên voucher *</label>
                  <input
                    type="text"
                    value={formData.tenKM}
                    onChange={(e) => setFormData({ ...formData, tenKM: e.target.value })}
                    required
                    placeholder="VD: Giảm giá mùa hè"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Loại voucher *</label>
                  <select
                    value={formData.loaiKM}
                    onChange={(e) => setFormData({ ...formData, loaiKM: e.target.value })}
                    required
                  >
                    <option value="percentage">Phần trăm</option>
                    <option value="fixed">Giá trị cố định</option>
                    <option value="free_item">Tặng sản phẩm</option>
                  </select>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Giá trị giảm *</label>
                    <input
                      type="number"
                      value={formData.giaTriGiam}
                      onChange={(e) => setFormData({ ...formData, giaTriGiam: Number(e.target.value) })}
                      required
                      min="0"
                      placeholder={formData.loaiKM === 'percentage' ? '10' : '50000'}
                    />
                    <small>{formData.loaiKM === 'percentage' ? '(%)' : '(VNĐ)'}</small>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Số lần sử dụng *</label>
                    <input
                      type="number"
                      value={formData.soLuongSuDung}
                      onChange={(e) => setFormData({ ...formData, soLuongSuDung: Number(e.target.value) })}
                      required
                      min="1"
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Đơn hàng tối thiểu</label>
                    <input
                      type="number"
                      value={formData.soTienToiThieu}
                      onChange={(e) => setFormData({ ...formData, soTienToiThieu: Number(e.target.value) })}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Giảm tối đa</label>
                    <input
                      type="number"
                      value={formData.giamToiDa}
                      onChange={(e) => setFormData({ ...formData, giamToiDa: Number(e.target.value) })}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Ngày bắt đầu *</label>
                    <input
                      type="date"
                      value={formData.ngayBatDau}
                      onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ngày kết thúc *</label>
                    <input
                      type="date"
                      value={formData.ngayKetThuc}
                      onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Mô tả</label>
                  <textarea
                    value={formData.moTa}
                    onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                    rows={3}
                    placeholder="Mô tả chi tiết về voucher..."
                  />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
                    Hủy
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    {editingVoucher ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
    )
}

export default VoucherPage
