import React from 'react'
import Style from './voucher.module.css'
import AdminHeader from '../../components/adminheader/adminheader'

const Voucher = () => {
    return (
        <>
            <AdminHeader />
            <div className={Style.voucherContainer}>
                <h1>Quản lý Voucher</h1>
                <p>Chức năng quản lý voucher đang được phát triển...</p>
            </div>
        </>
    )
}

export default Voucher
