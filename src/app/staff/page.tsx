'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Style from '../style/staff.module.css'
import { FaShoppingCart, FaUser, FaTimes, FaPlus, FaMinus, FaCheck } from 'react-icons/fa'
import { MdLocalCafe, MdLocalBar, MdCake, MdFastfood } from 'react-icons/md'
import { GiTeapot } from 'react-icons/gi'
import { logo, coffeeBlack } from '../image/index'

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
}

interface CartItem extends Product {
  quantity: number
}

const Staff = () => {
  const [activeCategory, setActiveCategory] = useState('coffee')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [tableNumber, setTableNumber] = useState('')

  // Dữ liệu sản phẩm mẫu
  const products: Product[] = [
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
    { id: 'coffee', name: 'Cà phê', icon: MdLocalCafe },
    { id: 'tea', name: 'Trà', icon: GiTeapot },
    { id: 'smoothie', name: 'Sinh tố', icon: MdLocalBar },
    { id: 'cake', name: 'Bánh ngọt', icon: MdCake },
    { id: 'snack', name: 'Đồ ăn nhẹ', icon: MdFastfood }
  ]

  const filteredProducts = products.filter(product => product.category === activeCategory)

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
    setCustomerName('')
    setTableNumber('')
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  }

  return (
    <div className={Style.staffContainer}>
      {/* Header */}
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
          <span>Ca làm việc</span>
          <span className={Style.workTime}>08:00 - 20:00</span>
          <FaUser className={Style.userIcon} />
        </div>
      </header>

      <div className={Style.mainContent}>
        {/* Left Panel - Menu */}
        <div className={Style.leftPanel}>
          {/* Category Tabs */}
          <div className={Style.categoryTabs}>
            {categories.map(category => {
              const IconComponent = category.icon
              return (
                <button
                  key={category.id}
                  className={`${Style.categoryTab} ${activeCategory === category.id ? Style.active : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <IconComponent className={Style.categoryIcon} />
                  {category.name}
                </button>
              )
            })}
          </div>

          {/* Product Grid */}
          <div className={Style.productGrid}>
            {filteredProducts.map(product => (
              <div key={product.id} className={Style.productCard}>
                <div className={Style.productImage}>
                  <Image 
                    src={coffeeBlack}
                    alt={product.name}
                    width={200}
                    height={150}
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
            ))}
          </div>
        </div>

        {/* Right Panel - Order */}
        <div className={Style.rightPanel}>
          <div className={Style.orderSection}>
            <h2>Đơn hàng hiện tại</h2>
            
            {/* Customer Info */}
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

            {/* Cart Items */}
            <div className={Style.cartItems}>
              {cart.length === 0 ? (
                <div className={Style.emptyCart}>
                  <FaShoppingCart className={Style.emptyCartIcon} />
                  <p>Chưa có món nào trong đơn hàng</p>
                </div>
              ) : (
                cart.map(item => (
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

            {/* Total */}
            <div className={Style.orderTotal}>
              <div className={Style.totalRow}>
                <span>Tổng cộng:</span>
                <span className={Style.totalPrice}>{formatPrice(getTotalPrice())}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={Style.actionButtons}>
              {cart.length > 0 && (
                <button 
                  className={Style.clearBtn}
                  onClick={clearCart}
                >
                  Xóa đơn
                </button>
              )}
              <button 
                className={Style.paymentBtn}
                disabled={cart.length === 0}
                onClick={() => {
                  alert(`Thanh toán thành công!\nTổng tiền: ${formatPrice(getTotalPrice())}\nKhách hàng: ${customerName || 'Khách vãng lai'}\nBàn: ${tableNumber || 'Mang về'}`)
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
  )
}

export default Staff