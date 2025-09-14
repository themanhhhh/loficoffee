'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from "./page.module.css"
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdLogin } from 'react-icons/md'
import { logo } from './image'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Xử lý đăng nhập ở đây
    console.log('Login attempt:', { email, password, rememberMe })
    // Redirect to staff page after login
    window.location.href = '/staff'
  }


  return (
    <div className={styles.loginPage}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <div className={styles.logoIcon}>
          <Image 
            src={logo} 
            alt="LOFI Coffee Logo" 
            width={160} 
            height={160}
            className={styles.logoImage}
          />
        </div>
        <h1 className={styles.logoTitle}>LOFI Coffee</h1>
        <p className={styles.logoSubtitle}>Đăng nhập vào hệ thống</p>
      </div>
      
      <div className={styles.loginContainer}>
        {/* Login Form */}
        <form className={styles.loginForm} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email đăng nhập</label>
            <div className={styles.inputWrapper}>
              <MdEmail className={styles.inputIcon} />
              <input
                type="email"
                id="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Mật khẩu</label>
            <div className={styles.inputWrapper}>
              <MdLock className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>

          <div className={styles.formOptions}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className={styles.checkmark}></span>
              Ghi nhớ đăng nhập
            </label>
            <Link href="/forgot-password" className={styles.forgotPassword}>
              Quên mật khẩu?
            </Link>
          </div>

          <button type="submit" className={styles.loginButton}>
            <MdLogin /> Đăng nhập
          </button>

          
        </form>

      
      </div>
    </div>
  )
}
