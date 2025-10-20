'use client'

import React, { useEffect, useState } from 'react'
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaList
} from 'react-icons/fa'
import AdminLayout from '../../components/adminlayout/adminlayout'
import styles from './category.module.css'
import { apiFetch, ApiError } from '../../../lib/api'

interface Category {
  maLoaiMon: string
  tenLoaiMon: string
}

interface CategoryFormData {
  maLoaiMon: string
  tenLoaiMon: string
}

const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    maLoaiMon: '',
    tenLoaiMon: ''
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<Category[]>('/api/loaimon')
      setCategories(data)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Không thể tải danh sách danh mục. Vui lòng thử lại.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setFormData({
      maLoaiMon: '',
      tenLoaiMon: ''
    })
    setShowModal(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      maLoaiMon: category.maLoaiMon,
      tenLoaiMon: category.tenLoaiMon
    })
    setShowModal(true)
  }

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${category.tenLoaiMon}"?`)) {
      return
    }

    try {
      await apiFetch(`/api/loaimon/${category.maLoaiMon}`, {
        method: 'DELETE'
      })
      
      await loadCategories()
      alert('Xóa danh mục thành công!')
    } catch (err) {
      alert('Lỗi khi xóa danh mục: ' + (err instanceof ApiError ? err.message : 'Unknown error'))
    }
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingCategory) {
        // Update
        await apiFetch(`/api/loaimon/${editingCategory.maLoaiMon}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        })
        alert('Cập nhật danh mục thành công!')
      } else {
        // Create
        await apiFetch('/api/loaimon', {
          method: 'POST',
          body: JSON.stringify(formData)
        })
        alert('Thêm danh mục mới thành công!')
      }

      setShowModal(false)
      await loadCategories()
    } catch (err) {
      alert('Lỗi: ' + (err instanceof ApiError ? err.message : 'Unknown error'))
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCategory(null)
  }

  const filteredCategories = categories.filter((cat) =>
    cat.tenLoaiMon.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.maLoaiMon.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <h1>
              <FaList /> Quản lý Danh mục
            </h1>
            <p>Quản lý các loại món ăn, đồ uống</p>
          </div>
          <button className={styles.addButton} onClick={handleAddCategory}>
            <FaPlus /> Thêm danh mục mới
          </button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.stats}>
            <span>Tổng số: {filteredCategories.length} danh mục</span>
          </div>
        </div>

        <div className={styles.gridContainer}>
          {filteredCategories.map((category) => (
            <div key={category.maLoaiMon} className={styles.categoryCard}>
              <div className={styles.categoryHeader}>
                <h3>{category.tenLoaiMon}</h3>
                <span className={styles.categoryCode}>{category.maLoaiMon}</span>
              </div>
              <div className={styles.categoryActions}>
                <button
                  className={styles.editBtn}
                  onClick={() => handleEditCategory(category)}
                  title="Chỉnh sửa"
                >
                  <FaEdit /> Sửa
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteCategory(category)}
                  title="Xóa"
                >
                  <FaTrash /> Xóa
                </button>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className={styles.emptyState}>
              <FaList />
              <h3>Không tìm thấy danh mục</h3>
              <p>Không có danh mục phù hợp với từ khóa tìm kiếm.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit Category */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmitForm} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Mã danh mục *</label>
                <input
                  type="text"
                  value={formData.maLoaiMon}
                  onChange={(e) => setFormData({ ...formData, maLoaiMon: e.target.value })}
                  disabled={!!editingCategory}
                  required
                  placeholder="VD: LM01"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tên danh mục *</label>
                <input
                  type="text"
                  value={formData.tenLoaiMon}
                  onChange={(e) => setFormData({ ...formData, tenLoaiMon: e.target.value })}
                  required
                  placeholder="VD: Cà phê"
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default CategoryPage
