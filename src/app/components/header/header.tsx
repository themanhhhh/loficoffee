import React from 'react'
import Style from './header.module.css'

import Link from 'next/link'

const Header = () => {
    return (
        <div className={Style.header}>
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
        </div>
    )
}

export default Header