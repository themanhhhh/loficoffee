'use client'
import React, { useEffect, useState } from 'react'
import {
  FaChartLine,
  FaStore,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa'
import { MdOutlineAnalytics, MdOutlineInventory2 } from 'react-icons/md'
import AdminLayout from '../../components/adminlayout/adminlayout'
import styles from './statistic.module.css'
import { apiFetch, ApiError } from '../../../lib/api'

interface ThongKeOverview {
  totalRevenue: number
  totalExpense: number
  grossProfit: number
  invoiceCount: number
}

interface TopProduct {
  tenMon: string
  doanhThu: number
  soLuong: number
}

interface RevenueChannel {
  label: string
  value: number
}

interface MonthlyRevenue {
  month: number
  revenue: number
  cost: number
}

const StatisticPage = () => {
  const [overview, setOverview] = useState<ThongKeOverview | null>(null)
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [revenueChannels, setRevenueChannels] = useState<RevenueChannel[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const currentYear = new Date().getFullYear()
        const [overviewData, productsData, channelsData, monthlyData] = await Promise.all([
          apiFetch<ThongKeOverview>('/api/thongke/overview'),
          apiFetch<TopProduct[]>('/api/thongke/top-products?limit=4'),
          apiFetch<RevenueChannel[]>('/api/thongke/revenue-by-channel'),
          apiFetch<{ month: string; revenue: string }[]>(`/api/thongke/revenue-by-month?year=${currentYear}`)
        ])

        if (ignore) return

        setOverview(overviewData)
        setTopProducts(productsData)
        setRevenueChannels(channelsData)
        
        // Transform monthly data
        const transformedMonthly = monthlyData.map(item => ({
          month: parseInt(item.month),
          revenue: parseFloat(item.revenue) || 0,
          cost: parseFloat(item.revenue) * 0.4 || 0 // Giả định cost = 40% revenue (tạm thời)
        }))
        setMonthlyRevenue(transformedMonthly)
      } catch (err) {
        if (ignore) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Không thể tải dữ liệu thống kê. Vui lòng thử lại.'
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

  if (loading) {
    return (
      <AdminLayout>
        <div className={styles.container}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu thống kê...</div>
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

  // Tính toán summary từ dữ liệu thực
  const revenueSummary = overview
    ? [
        {
          title: 'Doanh thu tuần này',
          value: overview.totalRevenue,
          change: 12.5, // TODO: Tính từ dữ liệu tuần trước
          positive: true,
          description: 'So với tuần trước'
        },
        {
          title: 'Lợi nhuận gộp',
          value: overview.grossProfit,
          change: 4.1, // TODO: Tính từ dữ liệu tuần trước
          positive: true,
          description: `Biên lợi nhuận ${overview.totalRevenue > 0 ? ((overview.grossProfit / overview.totalRevenue) * 100).toFixed(1) : 0}%`
        },
        {
          title: 'Chi phí nguyên liệu',
          value: overview.totalExpense,
          change: 6.8, // TODO: Tính từ dữ liệu tuần trước
          positive: false,
          description: 'So với tuần trước'
        },
        {
          title: 'Số hóa đơn',
          value: overview.invoiceCount,
          change: 8.3, // TODO: Tính từ dữ liệu tuần trước
          positive: true,
          description: `${overview.invoiceCount} hóa đơn`
        }
      ]
    : []

  // Demo data cho top products khi không có dữ liệu thực
  const demoTopProducts = [
    { name: 'Cà phê sữa đá', revenue: 0, orders: 0 },
    { name: 'Trà đào cam sả', revenue: 0, orders: 0 },
    { name: 'Bạc xỉu đá', revenue: 0, orders: 0 },
    { name: 'Matcha latte', revenue: 0, orders: 0 }
  ]

  const transformedTopProducts = topProducts.length > 0
    ? topProducts.map(p => ({
        name: p.tenMon,
        revenue: Number(p.doanhThu),
        orders: Number(p.soLuong)
      }))
    : demoTopProducts

  // Demo data cho revenue channels khi không có dữ liệu thực
  const demoRevenueChannels = [
    { label: 'Tại quán', value: 0 },
    { label: 'Mang đi', value: 0 },
    { label: 'Giao hàng', value: 0 }
  ]

  const displayRevenueChannels = revenueChannels.length > 0 ? revenueChannels : demoRevenueChannels
  const totalRevenue = displayRevenueChannels.reduce((sum, item) => sum + item.value, 0)

  // Lấy 3 tháng gần nhất
  const currentMonth = new Date().getMonth() + 1
  const last3Months = monthlyRevenue
    .filter(m => m.month <= currentMonth && m.month >= currentMonth - 2)
    .sort((a, b) => a.month - b.month)
  
  // Demo data cho 3 tháng nếu không có dữ liệu
  const demoLast3Months = [
    { month: currentMonth - 2, revenue: 0, cost: 0 },
    { month: currentMonth - 1, revenue: 0, cost: 0 },
    { month: currentMonth, revenue: 0, cost: 0 }
  ].filter(m => m.month > 0 && m.month <= 12)

  const displayLast3Months = last3Months.length > 0 ? last3Months : demoLast3Months

  return (
    <AdminLayout>
      <div className={styles.container}>
        <section className={styles.summaryGrid}>
          {revenueSummary.map(item => (
            <div key={item.title} className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <FaChartLine />
              </div>
              <div className={styles.summaryContent}>
                <span>{item.title}</span>
                <strong>{item.value.toLocaleString('vi-VN')} ₫</strong>
                <div className={styles.summaryChange}>
                  {item.positive ? (
                    <FaArrowUp className={styles.positive} />
                  ) : (
                    <FaArrowDown className={styles.negative} />
                  )}
                  <span className={item.positive ? styles.positive : styles.negative}>
                    {item.positive ? '+' : '-'}
                    {item.change}%
                  </span>
                  <small>{item.description}</small>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className={styles.gridTwo}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>
                <FaStore /> Cơ cấu doanh thu
              </h2>
              <span>Tổng cộng: {totalRevenue.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className={styles.channelList}>
              {displayRevenueChannels.map(channel => {
                const width = totalRevenue > 0 ? Math.round((channel.value / totalRevenue) * 100) : 0
                const isDemo = channel.value === 0
                return (
                  <div key={channel.label} className={styles.channelRow}>
                    <div className={styles.channelLabel}>
                      <MdOutlineAnalytics /> {channel.label}
                      {isDemo && <small style={{ color: '#999', marginLeft: '0.5rem' }}>(Demo)</small>}
                    </div>
                    <div className={styles.channelProgress}>
                      <div style={{ width: `${width}%` }} />
                    </div>
                    <div className={styles.channelValue}>
                      {channel.value.toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>
                <FaClipboardCheck /> Top món bán chạy
              </h2>
              <span>Doanh thu theo sản phẩm</span>
            </div>
            <div className={styles.productList}>
              {transformedTopProducts.map(product => (
                <div key={product.name} className={styles.productRow}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>
                      {product.orders} đơn hàng
                      {product.orders === 0 && <small style={{ color: '#999', marginLeft: '0.5rem' }}>(Demo)</small>}
                    </span>
                  </div>
                  <span className={styles.productRevenue}>
                    {product.revenue.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.gridTwo}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>
                <FaMoneyBillWave /> Biểu đồ kết quả kinh doanh
              </h2>
              <span>3 tháng gần nhất / {new Date().getFullYear()}</span>
            </div>
            <div className={styles.barChart}>
              {displayLast3Months.map((data) => {
                const monthNames = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
                const maxValue = Math.max(...displayLast3Months.map(m => m.revenue), 1) // Min 1 để tránh divide by 0
                const scale = maxValue > 0 ? 150 / maxValue : 0
                
                const revenueHeight = data.revenue > 0 ? Math.max(Math.round(data.revenue * scale), 30) : 30
                const costHeight = data.cost > 0 ? Math.max(Math.round(data.cost * scale), 20) : 20
                const profitHeight = (data.revenue - data.cost) > 0 ? Math.max(Math.round((data.revenue - data.cost) * scale), 15) : 15
                
                const isDemo = data.revenue === 0
                
                return (
                  <div key={data.month} className={styles.barColumn}>
                    <span>
                      {monthNames[data.month]}
                      {isDemo && <small style={{ display: 'block', color: '#999', fontSize: '0.7rem' }}>(Demo)</small>}
                    </span>
                    <div className={styles.barWrapper}>
                      <div className={`${styles.bar} ${styles.barRevenue}`} style={{ height: `${revenueHeight}px`, opacity: isDemo ? 0.3 : 1 }}>
                        <small>Doanh thu</small>
                      </div>
                      <div className={`${styles.bar} ${styles.barCost}`} style={{ height: `${costHeight}px`, opacity: isDemo ? 0.3 : 1 }}>
                        <small>Chi phí</small>
                      </div>
                      <div className={`${styles.bar} ${styles.barProfit}`} style={{ height: `${profitHeight}px`, opacity: isDemo ? 0.3 : 1 }}>
                        <small>Lợi nhuận</small>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>
                <MdOutlineInventory2 /> Thống kê nguyên liệu
              </h2>
              <span>Sử dụng so với dự báo</span>
            </div>
            <div className={styles.ingredientList}>
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#999' }}>
                <MdOutlineInventory2 style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                <p>Chức năng thống kê nguyên liệu đang được phát triển</p>
                <small>Vui lòng quay lại sau</small>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

export default StatisticPage
