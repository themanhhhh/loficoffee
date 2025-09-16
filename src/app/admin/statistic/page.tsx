import React from 'react'
import Style from './statistic.module.css'
import AdminHeader from '../../components/adminheader/adminheader'

const Statistic = () => {
    return (
        <>
            <AdminHeader />
            <div className={Style.statisticContainer}>
                <h1>Thống kê</h1>
                <p>Chức năng thống kê đang được phát triển...</p>
            </div>
        </>
    )
}

export default Statistic

