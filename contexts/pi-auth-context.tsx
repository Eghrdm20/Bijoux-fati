'use client'

import { createContext, useContext, useState } from 'react'

const PiAuthContext = createContext<any>(null)

export function PiAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null)

  async function login() {
    if (typeof window === 'undefined' || !(window as any).Pi) {
      alert('افتح التطبيق داخل Pi Browser')
      return
    }

    const Pi = (window as any).Pi

    Pi.init({
      version: '2.0',
      sandbox: true
    })

    const auth = await Pi.authenticate(['username', 'payments'], function () {})
    setUser(auth.user)
  }

  return (
    <PiAuthContext.Provider value={{ user, login }}>
      {children}
    </PiAuthContext.Provider>
  )
}

export function usePiAuth() {
  return useContext(PiAuthContext)
}
