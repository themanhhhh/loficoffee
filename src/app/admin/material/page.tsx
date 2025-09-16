import React from 'react'
import Style from './material.module.css'
import AdminHeader from '../../components/adminheader/adminheader'

const Material = () => {
    return (
        <>
            <AdminHeader />
            <div className={Style.materialContainer}>
                <h1>Quản lý Nguyên liệu</h1>
                <p>Chức năng quản lý nguyên liệu đang được phát triển...</p>
            </div>
        </>
    )
}

export default Material