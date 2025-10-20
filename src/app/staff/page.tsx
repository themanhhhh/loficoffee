'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Style from '../style/staff.module.css'
import {
  FaShoppingCart,
  FaUser,
  FaTimes,
  FaPlus,
  FaMinus,
  FaCheck,
  FaDoorOpen,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaIdBadge,
  FaThLarge,
  FaSignOutAlt
} from 'react-icons/fa'
import { MdLocalCafe, MdLocalBar, MdCake, MdFastfood } from 'react-icons/md'
import { GiTeapot } from 'react-icons/gi'
import { logo, coffeeBlack } from '../image/index'
import { apiFetch, ApiError } from '../../lib/api'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { useAuth } from '../../contexts/AuthContext'

type IconType = React.ComponentType<{ className?: string }>

interface LoaiMonDto {
  maLoaiMon: string
  tenLoaiMon: string
}

interface MonDto {
  maMon: string
  tenMon: string
  donGia: number
  donViTinh: string
  moTa?: string | null
  hinhAnh?: string | null
  loaiMon?: {
    maLoaiMon: string
    tenLoaiMon: string
  } | null
  nhomThucDon?: {
    maNhomThucDon: string
    tenNhomThucDon: string
  } | null
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: StaticImageData | string
  categoryId: string
  categoryName: string
}

interface Category {
  id: string
  name: string
  icon: IconType
}

interface CartItem extends Product {
  quantity: number
}

const CATEGORY_ICON_CYCLE: IconType[] = [MdLocalCafe, GiTeapot, MdLocalBar, MdCake, MdFastfood]

const resolveProductImage = (source?: string | null): StaticImageData | string => {
  if (!source) {
    return coffeeBlack
  }
  if (/^https?:\/\//i.test(source)) {
    return source
  }
  if (source.startsWith('/')) {
    return source
  }
  return `/${source}`
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(price) + ' đ'

const quickActions = [
  {
    href: '/staff/open-shift',
    icon: FaDoorOpen,
    title: 'Mở phiên làm việc',
    description: 'Thiết lập ca mới và phân công nhân sự'
  },
  {
    href: '/staff/open-shift',
    icon: FaMoneyBillWave,
    title: 'Nhập tiền đầu phiên',
    description: 'Ghi nhận tiền mặt tại quầy trước khi bán'
  },
  {
    href: '/staff/cashflow',
    icon: FaExchangeAlt,
    title: 'Thu chi trong ngày',
    description: 'Theo dõi phiếu thu, chi và tổng kết ca'
  },
  {
    href: '/staff/checkin-checkout',
    icon: FaIdBadge,
    title: 'Checkin / Checkout',
    description: 'Điểm danh thời gian vào ca và kết ca'
  }
]

const Staff = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([
    { id: 'all', name: 'Tất cả', icon: FaThLarge }
  ])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [monData, categoryData] = await Promise.all([
          apiFetch<MonDto[]>('/api/mon'),
          apiFetch<LoaiMonDto[]>('/api/loaimon')
        ])

        if (ignore) return

        const baseCategories: Category[] = [
          { id: 'all', name: 'Tất cả', icon: FaThLarge },
          ...categoryData.map((item, index) => ({
            id: item.maLoaiMon,
            name: item.tenLoaiMon,
            icon: CATEGORY_ICON_CYCLE[index % CATEGORY_ICON_CYCLE.length]
          }))
        ]

        const mappedProducts: Product[] = monData.map((item) => ({
          id: item.maMon,
          name: item.tenMon,
          description:
            item.moTa ??
            item.nhomThucDon?.tenNhomThucDon ??
            item.loaiMon?.tenLoaiMon ??
            'Đang cập nhật',
          price: item.donGia ?? 0,
          image: resolveProductImage(item.hinhAnh),
          categoryId: item.loaiMon?.maLoaiMon ?? 'other',
          categoryName: item.loaiMon?.tenLoaiMon ?? 'Khác'
        }))

        const hasOtherCategory = mappedProducts.some(
          (product) => product.categoryId === 'other'
        )

        const mappedCategories = hasOtherCategory
          ? [...baseCategories, { id: 'other', name: 'Khác', icon: MdFastfood }]
          : baseCategories

        setCategories(mappedCategories)
        setProducts(mappedProducts)

        if (mappedProducts.length === 0) {
          setActiveCategory('all')
        } else {
          const firstCategoryFromData = mappedProducts[0].categoryId
          const hasCategory = mappedCategories.some((cat) => cat.id === firstCategoryFromData)
          setActiveCategory(hasCategory ? firstCategoryFromData : 'all')
        }
      } catch (err) {
        if (ignore) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Không thể tải dữ liệu món. Vui lòng thử lại.'
        )
        setProducts([])
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

  const visibleProducts = useMemo(() => {
    if (activeCategory === 'all') {
      return products
    }
    return products.filter((product) => product.categoryId === activeCategory)
  }, [activeCategory, products])

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
    setCustomerName('')
    setTableNumber('')
  }

  const getTotalPrice = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <ProtectedRoute>
      <div className={Style.staffContainer}>
        <header className={Style.header}>
          <div className={Style.headerLeft}>
            <div className={Style.logo}>
              <div className={Style.logoIconContainer}>
                <Image
                  src={logo}
                  alt="Cafe POS Logo"
                  width={40}
                  height={40}
                  className={Style.logoImage}
                />
              </div>
              <div>
                <h1>LOFI Coffee</h1>
                <p>Hệ thống bán hàng</p>
              </div>
            </div>
          </div>
          <div className={Style.headerRight}>
            <div className={Style.workTime}>Ca hiện tại: 07:00 - 12:00</div>
            <div className={Style.userIcon}>
              <FaUser />
            </div>
            <div>
              <strong>{user?.tenNV || 'Người dùng'}</strong>
              <p>Chức vụ: {user?.chucVu || 'Nhân viên'}</p>
            </div>
            <button 
              className={Style.logoutBtn}
              onClick={handleLogout}
              title="Đăng xuất"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </header>

      <div className={Style.quickActions}>
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.title} href={action.href} className={Style.quickActionCard}>
              <div className={Style.quickActionIcon}>
                <Icon />
              </div>
              <div className={Style.quickActionInfo}>
                <h3 className={Style.quickActionTitle}>{action.title}</h3>
                <p className={Style.quickActionDescription}>{action.description}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <div className={Style.mainContent}>
        <div className={Style.leftPanel}>
          <div className={Style.categoryTabs}>
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = activeCategory === category.id
              return (
                <button
                  key={category.id}
                  type="button"
                  className={`${Style.categoryTab} ${isActive ? Style.active : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <Icon className={Style.categoryIcon} />
                  <span>{category.name}</span>
                </button>
              )
            })}
          </div>

          <div className={Style.productGrid}>
            {loading ? (
              <div className={`${Style.productState} ${Style.productStateLoading}`}>
                Đang tải dữ liệu món...
              </div>
            ) : error ? (
              <div className={`${Style.productState} ${Style.productStateError}`}>
                {error}
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className={Style.productState}>
                Không có món trong danh mục này.
              </div>
            ) : (
              visibleProducts.map((product) => (
                <div key={product.id} className={Style.productCard}>
                  <div className={Style.productImage}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={280}
                      height={200}
                      className={Style.productImg}
                    />
                    <div className={Style.productPrice}>{formatPrice(product.price)}</div>
                  </div>
                  <div className={Style.productInfo}>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <button
                      className={Style.addToCartBtn}
                      onClick={() => addToCart(product)}
                    >
                      <FaPlus /> Thêm vào đơn
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={Style.rightPanel}>
          <div className={Style.orderSection}>
            <h2>Đơn hàng hiện tại</h2>

            <div className={Style.customerInfo}>
              <div className={Style.inputGroup}>
                <label>Tên khách hàng</label>
                <input
                  type="text"
                  placeholder="Nhập tên khách hàng"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className={Style.inputGroup}>
                <label>Số bàn</label>
                <input
                  type="text"
                  placeholder="Nhập số bàn hoặc 'Mang về'"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                />
              </div>
            </div>

            <div className={Style.cartItems}>
              {cart.length === 0 ? (
                <div className={Style.emptyCart}>
                  <FaShoppingCart className={Style.emptyCartIcon} />
                  <p>Chưa có món nào trong đơn hàng</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className={Style.cartItem}>
                    <div className={Style.cartItemInfo}>
                      <h4>{item.name}</h4>
                      <p>{formatPrice(item.price)}</p>
                      <div className={Style.quantityControls}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className={Style.quantityBtn}
                        >
                          <FaMinus />
                        </button>
                        <span className={Style.quantity}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className={Style.quantityBtn}
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                    <div className={Style.cartItemActions}>
                      <div className={Style.cartItemTotal}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className={Style.removeBtn}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={Style.orderTotal}>
              <div className={Style.totalRow}>
                <span>Tổng cộng:</span>
                <span className={Style.totalPrice}>{formatPrice(getTotalPrice())}</span>
              </div>
            </div>

            <div className={Style.actionButtons}>
              {cart.length > 0 && (
                <button className={Style.clearBtn} onClick={clearCart}>
                  Xóa đơn
                </button>
              )}
              <button
                className={Style.paymentBtn}
                disabled={cart.length === 0}
                onClick={() => {
                  alert(
                    `Thanh toán thành công!\nTổng tiền: ${formatPrice(
                      getTotalPrice()
                    )}\nKhách hàng: ${customerName || 'Khách vãng lai'}\nBàn: ${
                      tableNumber || 'Mang về'
                    }`
                  )
                  clearCart()
                }}
              >
                <FaCheck /> Thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}

export default Staff
