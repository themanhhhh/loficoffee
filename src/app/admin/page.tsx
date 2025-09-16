'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Style from '../style/admin.module.css'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaChartBar, FaUtensils, FaList, FaBox, FaUsers, FaTicketAlt } from 'react-icons/fa'
import { coffeeBlack } from '../image/index'
import AdminHeader from '../components/adminheader/adminheader'

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
}

const Admin = () => {
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  // Dữ liệu thực đơn
  const menuItems: Product[] = [
    // Cà phê
    {
      id: 1,
      name: 'Cà phê đen',
      description: 'Cà phê đen truyền thống, đậm đà',
      price: 25000,
      image: '/coffee-black.jpg',
      category: 'coffee'
    },
    {
      id: 2,
      name: 'Cà phê sữa',
      description: 'Cà phê sữa đá thơm ngon',
      price: 30000,
      image: '/coffee-milk.jpg',
      category: 'coffee'
    },
    {
      id: 3,
      name: 'Cappuccino',
      description: 'Cappuccino với lớp bọt sữa mịn',
      price: 45000,
      image: '/cappuccino.jpg',
      category: 'coffee'
    },
    {
      id: 4,
      name: 'Latte',
      description: 'Latte với nghệ thuật latte art',
      price: 50000,
      image: '/latte.jpg',
      category: 'coffee'
    },
    // Trà
    {
      id: 5,
      name: 'Trà đào cam sả',
      description: 'Trà thảo mộc với đào cam sả thơm mát',
      price: 35000,
      image: '/tea-peach.jpg',
      category: 'tea'
    },
    {
      id: 6,
      name: 'Trà sữa trân châu',
      description: 'Trà sữa truyền thống với trân châu đen',
      price: 40000,
      image: '/milk-tea.jpg',
      category: 'tea'
    },
    // Sinh tố
    {
      id: 7,
      name: 'Sinh tố bơ',
      description: 'Sinh tố bơ béo ngậy, bổ dưỡng',
      price: 45000,
      image: '/smoothie-avocado.jpg',
      category: 'smoothie'
    },
    {
      id: 8,
      name: 'Sinh tố dâu',
      description: 'Sinh tố dâu tươi ngọt mát',
      price: 42000,
      image: '/smoothie-strawberry.jpg',
      category: 'smoothie'
    },
    // Bánh ngọt
    {
      id: 9,
      name: 'Bánh croissant',
      description: 'Bánh croissant bơ thơm giòn',
      price: 35000,
      image: '/croissant.jpg',
      category: 'cake'
    },
    {
      id: 10,
      name: 'Bánh muffin',
      description: 'Bánh muffin chocolate chip',
      price: 30000,
      image: '/muffin.jpg',
      category: 'cake'
    },
    // Đồ ăn nhẹ
    {
      id: 11,
      name: 'Sandwich gà',
      description: 'Sandwich gà nướng với rau xanh',
      price: 55000,
      image: '/sandwich.jpg',
      category: 'snack'
    },
    {
      id: 12,
      name: 'Salad trộn',
      description: 'Salad rau củ tươi ngon, healthy',
      price: 48000,
      image: '/salad.jpg',
      category: 'snack'
    }
  ]

  const categories = [
    { id: 'coffee', name: 'Cà phê' },
    { id: 'tea', name: 'Trà' },
    { id: 'smoothie', name: 'Sinh tố' },
    { id: 'cake', name: 'Bánh ngọt' },
    { id: 'snack', name: 'Đồ ăn nhẹ' }
  ]

  const sidebarItems = [
    { id: 'stats', name: 'Thống kê', icon: FaChartBar, path: '/admin/statistic' },
    { id: 'menu', name: 'Quản lý Menu', icon: FaUtensils, path: '/admin' },
    { id: 'categories', name: 'Danh mục', icon: FaList, path: '/admin/category' },
    { id: 'materials', name: 'Nguyên liệu', icon: FaBox, path: '/admin/material' },
    { id: 'staff', name: 'Nhân viên', icon: FaUsers, path: '/admin/staff' },
    { id: 'vouchers', name: 'Voucher', icon: FaTicketAlt, path: '/admin/voucher' }
  ]

  // Filter items based on search and category
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredItems.slice(startIndex, endIndex)

  // Reset to first page when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCategory])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  }

  const handleAddItem = () => {
    alert('Chức năng thêm món mới')
  }

  const handleEditItem = (item: Product) => {
    alert(`Chỉnh sửa: ${item.name}`)
  }

  const handleDeleteItem = (item: Product) => {
    if (confirm(`Bạn có chắc muốn xóa "${item.name}"?`)) {
      alert(`Đã xóa: ${item.name}`)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, start + maxVisible - 1)
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className={Style.adminContainer}>
      {/* Header */}
      <AdminHeader />

      <div className={Style.mainLayout}>
        {/* Sidebar */}
        <div className={Style.sidebar}>
          {sidebarItems.map(item => {
            const IconComponent = item.icon
            const isActive = pathname === item.path
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`${Style.sidebarItem} ${isActive ? Style.active : ''}`}
              >
                <IconComponent className={Style.sidebarIcon} />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Main Content */}
        <div className={Style.content}>
          {/* Menu Management Header */}
          <div className={Style.contentHeader}>
            <div className={Style.pageTitle}>
              <h2>Quản lý Menu</h2>
              <p>Tổng số món: {filteredItems.length} | Hiển thị: {startIndex + 1}-{Math.min(endIndex, filteredItems.length)}</p>
            </div>
            <button className={Style.addBtn} onClick={handleAddItem}>
              <FaPlus /> Thêm món mới
            </button>
          </div>

          {/* Search and Filter */}
          <div className={Style.filterSection}>
            <div className={Style.searchBox}>
              <FaSearch className={Style.searchIcon} />
              <input
                type="text"
                placeholder="Tìm kiếm món ăn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={Style.searchInput}
              />
            </div>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className={Style.filterSelect}
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Menu Table */}
          <div className={Style.tableContainer}>
            <table className={Style.menuTable}>
              <thead>
                <tr>
                  <th>Món</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className={Style.menuItemCell}>
                        <Image 
                          src={coffeeBlack}
                          alt={item.name}
                          width={60}
                          height={60}
                          className={Style.menuTableImg}
                        />
                        <div className={Style.menuItemInfo}>
                          <h4>{item.name}</h4>
                          <span className={Style.itemId}>ID: {item.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={Style.categoryTag}>
                        {categories.find(cat => cat.id === item.category)?.name}
                      </span>
                    </td>
                    <td className={Style.priceCell}>{formatPrice(item.price)}</td>
                    <td className={Style.descCell}>{item.description}</td>
                    <td>
                      <div className={Style.actionButtons}>
                        <button 
                          className={Style.editBtn}
                          onClick={() => handleEditItem(item)}
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className={Style.deleteBtn}
                          onClick={() => handleDeleteItem(item)}
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={Style.paginationContainer}>
              <div className={Style.paginationInfo}>
                Trang {currentPage} / {totalPages}
              </div>
              <div className={Style.pagination}>
                <button 
                  className={`${Style.pageBtn} ${currentPage === 1 ? Style.disabled : ''}`}
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>
                
                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    className={`${Style.pageBtn} ${currentPage === page ? Style.active : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  className={`${Style.pageBtn} ${currentPage === totalPages ? Style.disabled : ''}`}
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Admin