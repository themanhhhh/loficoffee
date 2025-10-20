'use client'
import React, { FormEvent, useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FaArrowLeft,
  FaExchangeAlt,
  FaArrowCircleDown,
  FaArrowCircleUp,
  FaCalculator,
  FaFileInvoice
} from 'react-icons/fa'
import styles from './cashflow.module.css'
import { apiFetch, ApiError } from '../../../lib/api'

type TransactionType = 'in' | 'out'

interface Transaction {
  id: number
  type: TransactionType
  amount: number
  reason: string
  performedBy: string
  time: string
  reference?: string
}

interface CashFormState {
  amount: string
  reason: string
  performedBy: string
  reference: string
}

interface PhieuThuDto {
  maPT: string
  ngay: string
  nhanVien?: { tenNV: string }
  chiTietPhieuThus?: Array<{ soTien: number; tenKhoanThu?: string }>
}

interface PhieuChiDto {
  maPC: string
  ngay: string
  nhanVien?: { tenNV: string }
  chiTietPhieuChis?: Array<{ soTien: number; tenKhoanChi?: string; loaiChiPhi?: string }>
}

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

const initialTransactions: Transaction[] = [
  {
    id: 1,
    type: 'in',
    amount: 1500000,
    reason: 'Thu tiền khách bàn B12',
    performedBy: 'Nguyễn Thảo',
    time: '09:20',
    reference: 'POS-INV-1204'
  },
  {
    id: 2,
    type: 'out',
    amount: 300000,
    reason: 'Chi tiền mua đá viên',
    performedBy: 'Trần Hữu Minh',
    time: '10:05',
    reference: 'EXP-2025-09'
  },
  {
    id: 3,
    type: 'in',
    amount: 2200000,
    reason: 'Thu tiền take-away',
    performedBy: 'Nguyễn Thảo',
    time: '11:40',
    reference: 'POS-INV-1207'
  }
]

const buildInitialFormState = (): CashFormState => ({
  amount: '',
  reason: '',
  performedBy: '',
  reference: ''
})

const CashflowPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [cashInForm, setCashInForm] = useState<CashFormState>(() => buildInitialFormState())
  const [cashOutForm, setCashOutForm] = useState<CashFormState>(() => buildInitialFormState())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const today = new Date().toISOString().split('T')[0]
        const [phieuThuData, phieuChiData] = await Promise.all([
          apiFetch<PhieuThuDto[]>(`/api/phieuthu?startDate=${today}&endDate=${today}`),
          apiFetch<PhieuChiDto[]>(`/api/phieuchi?startDate=${today}&endDate=${today}`)
        ])

        if (ignore) return

        const allTransactions: Transaction[] = []
        let id = 1

        // Transform phieu thu
        phieuThuData.forEach((pt) => {
          pt.chiTietPhieuThus?.forEach((ct) => {
            const date = new Date(pt.ngay)
            allTransactions.push({
              id: id++,
              type: 'in',
              amount: ct.soTien,
              reason: ct.tenKhoanThu || 'Thu tiền',
              performedBy: pt.nhanVien?.tenNV || 'N/A',
              time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
              reference: pt.maPT
            })
          })
        })

        // Transform phieu chi
        phieuChiData.forEach((pc) => {
          pc.chiTietPhieuChis?.forEach((ct) => {
            const date = new Date(pc.ngay)
            allTransactions.push({
              id: id++,
              type: 'out',
              amount: ct.soTien,
              reason: ct.loaiChiPhi || ct.tenKhoanChi || 'Chi tiền',
              performedBy: pc.nhanVien?.tenNV || 'N/A',
              time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
              reference: pc.maPC
            })
          })
        })

        // Sắp xếp theo thời gian
        allTransactions.sort((a, b) => {
          const [aH, aM] = a.time.split(':').map(Number)
          const [bH, bM] = b.time.split(':').map(Number)
          return (bH * 60 + bM) - (aH * 60 + aM)
        })

        setTransactions(allTransactions)
      } catch (err) {
        if (ignore) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Không thể tải dữ liệu giao dịch. Vui lòng thử lại.'
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

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'in') {
          acc.in += transaction.amount
        } else {
          acc.out += transaction.amount
        }
        return acc
      },
      { in: 0, out: 0 }
    )
  }, [transactions])

  const netCash = totals.in - totals.out

  const handleFormChange = (
    type: TransactionType,
    key: keyof CashFormState,
    value: string
  ) => {
    if (type === 'in') {
      setCashInForm(prev => ({ ...prev, [key]: value }))
    } else {
      setCashOutForm(prev => ({ ...prev, [key]: value }))
    }
  }

  const handleSubmit = (type: TransactionType) => async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = type === 'in' ? cashInForm : cashOutForm
    const amount = Number(form.amount.replace(/\D/g, '')) || Number(form.amount)

    if (!form.reason || !form.performedBy || !amount) {
      alert('Vui lòng nhập đầy đủ thông tin và số tiền hợp lệ.')
      return
    }

    try {
      const endpoint = type === 'in' ? '/api/phieuthu' : '/api/phieuchi'
      const payload = type === 'in' 
        ? {
            maNV: 'NV001', // TODO: Get from logged in user
            soTien: amount,
            lyDoThu: form.reason
          }
        : {
            maNV: 'NV001', // TODO: Get from logged in user
            soTien: amount,
            loaiChiPhi: form.reason,
            tenKhoanChi: form.reason,
            hinhThuc: 'Tiền mặt'
          }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Lỗi khi tạo giao dịch')
      }

      const timeStamp = new Date()
      const time = timeStamp
        .toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        .toString()

      const nextId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1

      setTransactions(prev => [
        {
          id: nextId,
          type,
          amount,
          reason: form.reason,
          performedBy: form.performedBy,
          time,
          reference: form.reference || undefined
        },
        ...prev
      ])

      if (type === 'in') {
        setCashInForm(buildInitialFormState())
      } else {
        setCashOutForm(buildInitialFormState())
      }

      alert('Ghi nhận giao dịch thành công!')
    } catch (err) {
      alert('Lỗi khi ghi nhận giao dịch: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
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
          <h1>Quản lý thu chi trong ca</h1>
          <p>Theo dõi dòng tiền mặt, phiếu thu và chi tạm ứng trong ngày làm việc.</p>
        </div>
        <div className={styles.headerBadge}>
          <FaExchangeAlt />
        </div>
      </header>

      <section className={styles.summary}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon + ' ' + styles.summaryIconIn}>
            <FaArrowCircleDown />
          </div>
          <div>
            <span>Tiền thu trong ngày</span>
            <strong>{currencyFormatter.format(totals.in)}</strong>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon + ' ' + styles.summaryIconOut}>
            <FaArrowCircleUp />
          </div>
          <div>
            <span>Tiền chi trong ngày</span>
            <strong>{currencyFormatter.format(totals.out)}</strong>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon + ' ' + styles.summaryIconNet}>
            <FaCalculator />
          </div>
          <div>
            <span>Tăng/giảm quỹ</span>
            <strong>{currencyFormatter.format(netCash)}</strong>
          </div>
        </div>
      </section>

      <div className={styles.forms}>
        <form className={styles.formCard} onSubmit={handleSubmit('in')}>
          <div className={styles.formHeader}>
            <h2><FaArrowCircleDown /> Phiếu thu</h2>
            <span>Ghi nhận tiền vào quỹ (khách thanh toán, thu tạm ứng...)</span>
          </div>
          <label className={styles.field}>
            <span>Số tiền</span>
            <input
              type="number"
              min={0}
              placeholder="Ví dụ: 1500000"
              value={cashInForm.amount}
              onChange={event => handleFormChange('in', 'amount', event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Nội dung thu</span>
            <input
              type="text"
              placeholder="Lý do thu tiền"
              value={cashInForm.reason}
              onChange={event => handleFormChange('in', 'reason', event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Người thực hiện</span>
            <input
              type="text"
              placeholder="Tên nhân viên phụ trách"
              value={cashInForm.performedBy}
              onChange={event => handleFormChange('in', 'performedBy', event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Số chứng từ (nếu có)</span>
            <input
              type="text"
              placeholder="Mã hóa đơn, POS..."
              value={cashInForm.reference}
              onChange={event => handleFormChange('in', 'reference', event.target.value)}
            />
          </label>
          <button type="submit" className={styles.submitIn}>
            Lưu phiếu thu
          </button>
        </form>

        <form className={styles.formCard} onSubmit={handleSubmit('out')}>
          <div className={styles.formHeader}>
            <h2><FaArrowCircleUp /> Phiếu chi</h2>
            <span>Ghi nhận chi phí phát sinh, tạm ứng, hoàn tiền...</span>
          </div>
          <label className={styles.field}>
            <span>Số tiền</span>
            <input
              type="number"
              min={0}
              placeholder="Ví dụ: 300000"
              value={cashOutForm.amount}
              onChange={event => handleFormChange('out', 'amount', event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Nội dung chi</span>
            <input
              type="text"
              placeholder="Lý do chi tiền"
              value={cashOutForm.reason}
              onChange={event => handleFormChange('out', 'reason', event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Người thực hiện</span>
            <input
              type="text"
              placeholder="Tên nhân viên phụ trách"
              value={cashOutForm.performedBy}
              onChange={event => handleFormChange('out', 'performedBy', event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Số chứng từ (nếu có)</span>
            <input
              type="text"
              placeholder="Mã phiếu chi, yêu cầu tạm ứng..."
              value={cashOutForm.reference}
              onChange={event => handleFormChange('out', 'reference', event.target.value)}
            />
          </label>
          <button type="submit" className={styles.submitOut}>
            Lưu phiếu chi
          </button>
        </form>
      </div>

      <section className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h2><FaFileInvoice /> Lịch sử thu chi</h2>
          <span>Ghi nhận {transactions.length} giao dịch trong ca hiện tại</span>
        </div>
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Loại</th>
                <th>Số tiền</th>
                <th>Nội dung</th>
                <th>Nhân viên</th>
                <th>Chứng từ</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.time}</td>
                  <td>
                    <span
                      className={
                        transaction.type === 'in' ? styles.badgeIn : styles.badgeOut
                      }
                    >
                      {transaction.type === 'in' ? 'Thu' : 'Chi'}
                    </span>
                  </td>
                  <td>{currencyFormatter.format(transaction.amount)}</td>
                  <td>{transaction.reason}</td>
                  <td>{transaction.performedBy}</td>
                  <td>{transaction.reference || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default CashflowPage
