'use client'
import React from 'react'
import Image from 'next/image'
import { FaUser, FaArrowLeft } from 'react-icons/fa'
import { logo } from '../../image/index'
import Style from './adminheader.module.css'

const AdminHeader = () => {
    return (
        <header className={Style.header}>
            <div className={Style.headerLeft}>
                <div className={Style.logo}>
                    <div className={Style.logoIconContainer}>
                        <Image 
                            src={logo}
                            alt="Cafe POS Logo" 
                            width={32} 
                            height={32}
                            className={Style.logoImage}
                        />
                    </div>
                    <div className={Style.logoText}>
                        <h1>Admin Panel</h1>
                        <p>Quản lý hệ thống POS</p>
                    </div>
                </div>
            </div>
            <div className={Style.headerRight}>
                <button className={Style.backBtn}>
                    <FaArrowLeft /> Về POS
                </button>
                <div className={Style.userInfo}>
                    <span>Quản trị viên</span>
                    <span className={Style.userName}>Admin User</span>
                </div>
                <FaUser className={Style.userIcon} />
            </div>
        </header>
    )
}

export default AdminHeader