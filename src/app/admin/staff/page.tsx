import React from 'react'
import Style from './staff.module.css'
import AdminHeader from '../../components/adminheader/adminheader'

const Staff = () => {
    return (
        <>
            <AdminHeader />
            <div className={Style.staffContainer}>
                <h1>Quản lý Nhân viên</h1>
                <p>Chức năng quản lý nhân viên đang được phát triển...</p>
            </div>
        </>
    )
}

export default Staff