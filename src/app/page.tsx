'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styles from "./page.module.css"
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdLogin, MdError } from 'react-icons/md'
import { logo } from './image'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { login, isAuthenticated, isLoading, error } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/staff')
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !password) {
      return
    }

    try {
      setIsSubmitting(true)
      await login(username, password)
      // Redirect will happen automatically via useEffect
    } catch (error) {
      // Error is handled by AuthContext
      console.error('Login failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    )
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
        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <MdError className={styles.errorIcon} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className={styles.loginForm} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Tài khoản đăng nhập</label>
            <div className={styles.inputWrapper}>
              <MdEmail className={styles.inputIcon} />
              <input
                type="text"
                id="username"
                placeholder="Nhập tài khoản đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className={styles.spinner}></div>
                Đang đăng nhập...
              </>
            ) : (
              <>
                <MdLogin /> Đăng nhập
              </>
            )}
          </button>

          
        </form>

      
      </div>
    </div>
  )
}
