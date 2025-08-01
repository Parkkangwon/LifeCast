'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
  birth_date?: string
  gender?: string
  location?: string
  is_public?: boolean
  created_at: string
}

interface UserContextType {
  user: User | null
  loading: boolean
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
})

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 임시 사용자 데이터 사용
    console.log('Using temporary user context')
    
    // 로컬 스토리지에서 사용자 정보 확인
    const savedUser = localStorage.getItem('tempUser')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        console.log('User loaded from storage:', userData.name)
      } catch (error) {
        console.error('Error parsing saved user:', error)
      }
    }
    
    setLoading(false)
  }, [])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext) 