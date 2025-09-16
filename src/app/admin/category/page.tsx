'use client'
import React, { useState } from 'react'
import Style from './category.module.css'
import { FaPlus, FaEdit, FaTrash, FaCoffee, FaLeaf, FaBlender, FaCookie, FaUtensils } from 'react-icons/fa'
import AdminHeader from '../../components/adminheader/adminheader'

interface Category {
  id: string
  name: string
  itemCount: number
  icon: React.ComponentType
  color: string
}

const Category = () => {
  const [categories] = useState<Category[]>([
    {
      id: 'coffee',
      name: 'Cà phê',
      itemCount: 4,
      icon: FaCoffee,
      color: '#D4A574'
    },
    {
      id: 'tea',
      name: 'Trà',
      itemCount: 2,
      icon: FaLeaf,
      color: '#E6C068'
    },
    {
      id: 'smoothie',
      name: 'Sinh tố',
      itemCount: 2,
      icon: FaBlender,
      color: '#C8B566'
    },
    {
      id: 'dessert',
      name: 'Bánh ngọt',
      itemCount: 2,
      icon: FaCookie,
      color: '#D4A574'
    },
    {
      id: 'snack',
      name: 'Đồ ăn nhẹ',
      itemCount: 2,
      icon: FaUtensils,
      color: '#C8B566'
    }
  ])

  const handleAddCategory = () => {
    alert('Chức năng thêm danh mục mới')
  }

  const handleEditCategory = (category: Category) => {
    alert(`Chỉnh sửa danh mục: ${category.name}`)
  }

  const handleDeleteCategory = (category: Category) => {
    if (confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      alert(`Đã xóa danh mục: ${category.name}`)
    }
  }

  return (
    <div className={Style.categoryContainer}>
      <AdminHeader />
      <div className={Style.categoryContainer}>
        {/* Header */}
        <div className={Style.categoryHeader}>
        <div className={Style.headerInfo}>
          <h1 className={Style.pageTitle}>Quản lý Danh mục</h1>
          <p className={Style.pageSubtitle}>Tổng số danh mục: {categories.length}</p>
        </div>
        <button className={Style.addBtn} onClick={handleAddCategory}>
          <FaPlus /> Thêm danh mục
        </button>
      </div>

      {/* Categories Grid */}
      <div className={Style.categoriesGrid}>
        {categories.map((category) => {
          const IconComponent = category.icon
          return (
            <div key={category.id} className={Style.categoryCard}>
              <div className={Style.categoryIcon} style={{ backgroundColor: category.color }}>
                <IconComponent />
              </div>
              <div className={Style.categoryInfo}>
                <h3 className={Style.categoryName}>{category.name}</h3>
                <p className={Style.categoryCount}>{category.itemCount} món</p>
                <span className={Style.categoryId}>ID: {category.id}</span>
              </div>
              <div className={Style.categoryActions}>
                <button 
                  className={Style.editBtn}
                  onClick={() => handleEditCategory(category)}
                  title="Chỉnh sửa"
                >
                  <FaEdit />
                </button>
                <button 
                  className={Style.deleteBtn}
                  onClick={() => handleDeleteCategory(category)}
                  title="Xóa"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          )
        })}
      </div>
      </div>
    </div>
  )
}

export default Category

        