'use client'
import React, { useMemo, useState, useEffect } from 'react'
import {
  FaBoxOpen,
  FaPlus,
  FaTruckLoading,
  FaClipboardList,
  FaSearch,
  FaWarehouse,
  FaChartPie,
  FaArrowDown,
  FaArrowUp,
  FaTimes,
  FaEdit,
  FaTrash
} from 'react-icons/fa'
import AdminLayout from '../../components/adminlayout/adminlayout'
import styles from './material.module.css'
import { apiFetch, ApiError } from '../../../lib/api'

type ReceiptStatus = 'completed' | 'pending' | 'scheduled'

interface ReceiptItem {
  name: string
  unit: string
  quantity: number
  note?: string
}

interface Receipt {
  id: string
  supplier: string
  createdAt: string
  handledBy: string
  status: ReceiptStatus
  totalCost: number
  items: ReceiptItem[]
}

interface Ingredient {
  id: string
  name: string
  unit: string
  stock: number
  minimum: number
  usagePerDay: number
}

interface PhieuNhapDto {
  maPN: string
  ngayNhapKho: string
  nguoiGiao: string
  tenNCC: string
  nhanVien?: { tenNV: string }
  chiTietPhieuNhaps?: Array<{
    soLuong: number
    donGia: number
    nguyenLieu?: { tenNL: string; donViTinh: string }
  }>
}

interface NguyenLieuDto {
  maNL: string
  tenNL: string
  donViTinh: string
}

interface NguyenLieuFormData {
  maNL: string
  tenNL: string
  donViTinh: string
}

const statusLabel: Record<ReceiptStatus, string> = {
  completed: 'Đã nhập kho',
  pending: 'Chờ duyệt',
  scheduled: 'Đặt lịch giao'
}

const MaterialPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReceiptId, setSelectedReceiptId] = useState<string>('')
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [formData, setFormData] = useState<NguyenLieuFormData>({
    maNL: '',
    tenNL: '',
    donViTinh: ''
  })

  useEffect(() => {
    let ignore = false
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [phieuNhapData, nguyenLieuData] = await Promise.all([
          apiFetch<PhieuNhapDto[]>('/api/phieunhap'),
          apiFetch<NguyenLieuDto[]>('/api/nguyenlieu')
        ])

        if (ignore) return

        // Transform phieu nhap
        const mappedReceipts: Receipt[] = phieuNhapData.map((pn) => {
          const date = new Date(pn.ngayNhapKho)
          const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} · ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
          
          const totalCost = pn.chiTietPhieuNhaps?.reduce((sum, ct) => sum + (ct.soLuong * ct.donGia), 0) || 0
          
          const items: ReceiptItem[] = pn.chiTietPhieuNhaps?.map(ct => ({
            name: ct.nguyenLieu?.tenNL || 'N/A',
            unit: ct.nguyenLieu?.donViTinh || '',
            quantity: ct.soLuong
          })) || []

          // Giả định status dựa trên ngày
          let status: ReceiptStatus = 'completed'
          if (date > new Date()) {
            status = 'scheduled'
          }

          return {
            id: pn.maPN,
            supplier: pn.tenNCC,
            createdAt: formattedDate,
            handledBy: pn.nhanVien?.tenNV || pn.nguoiGiao,
            status,
            totalCost,
            items
          }
        })

        // Transform nguyen lieu
        // TODO: Backend cần thêm các field: stock (tồn kho), minimum (định mức tối thiểu), usagePerDay (tiêu thụ/ngày)
        const mappedIngredients: Ingredient[] = nguyenLieuData.map((nl) => ({
          id: nl.maNL,
          name: nl.tenNL,
          unit: nl.donViTinh,
          stock: 0, // Backend chưa có field stock
          minimum: 0, // Backend chưa có field minimum
          usagePerDay: 0 // Backend chưa có field usagePerDay
        }))

        setReceipts(mappedReceipts)
        setIngredients(mappedIngredients)
        if (mappedReceipts.length > 0) {
          setSelectedReceiptId(mappedReceipts[0].id)
        }
      } catch (err) {
        if (ignore) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Không thể tải dữ liệu nguyên liệu. Vui lòng thử lại.'
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

  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      if (!searchTerm) return true
      const lower = searchTerm.toLowerCase()
      return (
        receipt.id.toLowerCase().includes(lower) ||
        receipt.supplier.toLowerCase().includes(lower) ||
        receipt.items.some(item => item.name.toLowerCase().includes(lower))
      )
    })
  }, [searchTerm, receipts])

  const selectedReceipt =
    receipts.find(receipt => receipt.id === selectedReceiptId) ?? filteredReceipts[0]

  const inventorySummary = useMemo(() => {
    // TODO: Backend cần API cho tồn kho để tính lowStock chính xác
    const lowStock = 0 // Chưa có dữ liệu tồn kho
    const totalSku = ingredients.length
    const inboundToday = receipts.filter(receipt => receipt.status === 'completed').length
    const pending = receipts.filter(receipt => receipt.status !== 'completed').length
    return { lowStock, totalSku, inboundToday, pending }
  }, [ingredients, receipts])

  const loadIngredientsData = async () => {
    try {
      const nguyenLieuData = await apiFetch<NguyenLieuDto[]>('/api/nguyenlieu')
      
      // TODO: Backend cần thêm các field: stock (tồn kho), minimum (định mức tối thiểu), usagePerDay (tiêu thụ/ngày)
      const mappedIngredients: Ingredient[] = nguyenLieuData.map((nl) => ({
        id: nl.maNL,
        name: nl.tenNL,
        unit: nl.donViTinh,
        stock: 0, // Backend chưa có field stock
        minimum: 0, // Backend chưa có field minimum
        usagePerDay: 0 // Backend chưa có field usagePerDay
      }))

      setIngredients(mappedIngredients)
    } catch (err) {
      throw err
    }
  }

  const handleAddIngredient = () => {
    setEditingIngredient(null)
    setFormData({
      maNL: '',
      tenNL: '',
      donViTinh: ''
    })
    setShowModal(true)
  }

  const handleEditIngredient = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient)
    setFormData({
      maNL: ingredient.id,
      tenNL: ingredient.name,
      donViTinh: ingredient.unit
    })
    setShowModal(true)
  }

  const handleDeleteIngredient = async (ingredient: Ingredient) => {
    if (!confirm(`Bạn có chắc muốn xóa nguyên liệu "${ingredient.name}"?`)) {
      return
    }

    try {
      await apiFetch(`/api/nguyenlieu/${ingredient.id}`, {
        method: 'DELETE'
      })
      
      await loadIngredientsData()
      alert('Xóa nguyên liệu thành công!')
    } catch (err) {
      alert('Lỗi khi xóa nguyên liệu: ' + (err instanceof ApiError ? err.message : 'Unknown error'))
    }
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingIngredient) {
        // Update
        await apiFetch(`/api/nguyenlieu/${editingIngredient.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        })
        alert('Cập nhật nguyên liệu thành công!')
      } else {
        // Create
        await apiFetch('/api/nguyenlieu', {
          method: 'POST',
          body: JSON.stringify(formData)
        })
        alert('Thêm nguyên liệu mới thành công!')
      }

      setShowModal(false)
      await loadIngredientsData()
    } catch (err) {
      alert('Lỗi: ' + (err instanceof ApiError ? err.message : 'Unknown error'))
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingIngredient(null)
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
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <FaBoxOpen />
            </div>
            <div>
              <span>Tổng mặt hàng</span>
              <strong>{inventorySummary.totalSku}</strong>
              <p>Danh mục nguyên liệu đang quản lý</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={`${styles.summaryIcon} ${styles.iconWarning}`}>
              <FaArrowDown />
            </div>
            <div>
              <span>Sắp hết hàng</span>
              <strong>{inventorySummary.lowStock}</strong>
              <p>Ưu tiên nhập trong 2 ngày tới</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={`${styles.summaryIcon} ${styles.iconSuccess}`}>
              <FaTruckLoading />
            </div>
            <div>
              <span>Phiếu nhập hoàn tất</span>
              <strong>{inventorySummary.inboundToday}</strong>
              <p>Trong 48 giờ gần nhất</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={`${styles.summaryIcon} ${styles.iconInfo}`}>
              <FaClipboardList />
            </div>
            <div>
              <span>Đơn đang chờ</span>
              <strong>{inventorySummary.pending}</strong>
              <p>Chờ duyệt / chờ giao</p>
            </div>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <FaSearch />
            <input
              type='text'
              placeholder='Tìm phiếu nhập hoặc nhà cung cấp...'
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
            />
          </div>
          <button className={styles.addButton} onClick={handleAddIngredient}>
            <FaPlus /> Thêm nguyên liệu mới
          </button>
        </div>

        <div className={styles.layout}>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Nhà cung cấp</th>
                  <th>Thời gian</th>
                  <th>Phụ trách</th>
                  <th>Trạng thái</th>
                  <th>Giá trị</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map(receipt => (
                  <tr
                    key={receipt.id}
                    className={receipt.id === selectedReceiptId ? styles.selectedRow : undefined}
                    onClick={() => setSelectedReceiptId(receipt.id)}
                  >
                    <td>{receipt.id}</td>
                    <td>{receipt.supplier}</td>
                    <td>{receipt.createdAt}</td>
                    <td>{receipt.handledBy}</td>
                    <td>
                      <span className={`${styles.statusTag} ${styles[receipt.status]}`}>
                        {statusLabel[receipt.status]}
                      </span>
                    </td>
                    <td>{receipt.totalCost.toLocaleString('vi-VN')} ₫</td>
                  </tr>
                ))}
                {filteredReceipts.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.emptyState}>
                      Không tìm thấy phiếu nhập phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <aside className={styles.detailPanel}>
            {selectedReceipt ? (
              <>
                <div className={styles.detailHeader}>
                  <h3>{selectedReceipt.id}</h3>
                  <span>{selectedReceipt.supplier}</span>
                  <div className={`${styles.statusTag} ${styles[selectedReceipt.status]}`}>
                    {statusLabel[selectedReceipt.status]}
                  </div>
                </div>

                <div className={styles.detailSummary}>
                  <div>
                    <FaWarehouse /> <span>Ngày nhập: {selectedReceipt.createdAt}</span>
                  </div>
                  <div>
                    <FaChartPie /> <span>Phụ trách: {selectedReceipt.handledBy}</span>
                  </div>
                  <div>
                    <FaArrowUp />{' '}
                    <span>Giá trị: {selectedReceipt.totalCost.toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>

                <div className={styles.itemsList}>
                  <h4>Chi tiết nguyên liệu</h4>
                  <ul>
                    {selectedReceipt.items.map(item => (
                      <li key={`${selectedReceipt.id}-${item.name}`}>
                        <div>
                          <strong>{item.name}</strong>
                          <span>{item.unit}</span>
                        </div>
                        <div className={styles.itemQty}>
                          <span>{item.quantity}</span>
                          {item.note && <small>{item.note}</small>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <button className={styles.primaryAction}>In phiếu / xuất file</button>
              </>
            ) : (
              <div className={styles.detailPlaceholder}>
                Chọn một phiếu nhập để xem chi tiết nguyên liệu.
              </div>
            )}
          </aside>
        </div>

        <section className={styles.stockSection}>
          <div className={styles.sectionHeader}>
            <h2>Tình trạng tồn kho</h2>
            <span>Cập nhật theo báo cáo gần nhất</span>
          </div>
          <div className={styles.stockGrid}>
            {ingredients.length > 0 ? (
              ingredients.map(ingredient => {
                return (
                  <div key={ingredient.id} className={styles.stockCard}>
                    <div className={styles.stockHeader}>
                      <h3>{ingredient.name}</h3>
                      <span>{ingredient.unit}</span>
                    </div>
                    <div className={styles.stockInfo}>
                      <div>
                        <span>Mã nguyên liệu</span>
                        <strong>{ingredient.id}</strong>
                      </div>
                      <div>
                        <span>Đơn vị tính</span>
                        <strong>{ingredient.unit}</strong>
                      </div>
                      <div>
                        <span>Trạng thái</span>
                        <strong style={{ color: '#999' }}>Chưa có dữ liệu tồn kho</strong>
                      </div>
                    </div>
                    <div style={{ 
                      padding: '1rem', 
                      background: '#f9f9f9', 
                      borderRadius: '6px', 
                      textAlign: 'center',
                      color: '#999',
                      fontSize: '0.9rem'
                    }}>
                      <small>Chức năng quản lý tồn kho đang được phát triển</small>
                    </div>
                    <div className={styles.stockActions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEditIngredient(ingredient)}
                        title="Chỉnh sửa"
                      >
                        <FaEdit /> Sửa
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteIngredient(ingredient)}
                        title="Xóa"
                      >
                        <FaTrash /> Xóa
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div style={{ 
                gridColumn: '1 / -1', 
                padding: '3rem 2rem', 
                textAlign: 'center', 
                color: '#999' 
              }}>
                <FaBoxOpen style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                <p>Chưa có nguyên liệu nào</p>
                <small>Nhấn nút &ldquo;Thêm nguyên liệu mới&rdquo; để bắt đầu</small>
              </div>
            )}
          </div>
        </section>

        {/* Modal for Add/Edit Ingredient */}
        {showModal && (
          <div className={styles.modalOverlay} onClick={handleCloseModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{editingIngredient ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}</h2>
                <button className={styles.closeBtn} onClick={handleCloseModal}>
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSubmitForm} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>Mã nguyên liệu *</label>
                  <input
                    type="text"
                    value={formData.maNL}
                    onChange={(e) => setFormData({ ...formData, maNL: e.target.value })}
                    disabled={!!editingIngredient}
                    required
                    placeholder="VD: NL001"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Tên nguyên liệu *</label>
                  <input
                    type="text"
                    value={formData.tenNL}
                    onChange={(e) => setFormData({ ...formData, tenNL: e.target.value })}
                    required
                    placeholder="VD: Hạt cà phê Arabica"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Đơn vị tính *</label>
                  <input
                    type="text"
                    value={formData.donViTinh}
                    onChange={(e) => setFormData({ ...formData, donViTinh: e.target.value })}
                    required
                    placeholder="VD: kg, thùng, chai..."
                  />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
                    Hủy
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    {editingIngredient ? 'Cập nhật' : 'Thêm mới'}
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

export default MaterialPage
