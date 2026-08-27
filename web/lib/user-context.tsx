'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface UserSession {
  id: string
  name: string
  email: string
  role: 'ORGANIZER' | 'CUSTOMER' | 'DOORMAN'
}

export interface PresetUser {
  name: string
  email: string
  role: 'ORGANIZER' | 'CUSTOMER' | 'DOORMAN'
  label: string
  password: string
}

export const PRESET_USERS: PresetUser[] = [
  {
    name: 'Carlos Cliente',
    email: 'cliente1@eventos.com',
    role: 'CUSTOMER',
    label: 'Cliente 1 (Carlos)',
    password: '123456',
  },
  {
    name: 'Bia Cliente',
    email: 'cliente2@eventos.com',
    role: 'CUSTOMER',
    label: 'Cliente 2 (Bia)',
    password: '123456',
  },
  {
    name: 'Ana Organizadora',
    email: 'organizador@eventos.com',
    role: 'ORGANIZER',
    label: 'Organizador (Ana)',
    password: '123456',
  },
  {
    name: 'Pedro Portaria',
    email: 'portaria@eventos.com',
    role: 'DOORMAN',
    label: 'Portaria (Pedro)',
    password: '123456',
  },
]

interface UserContextType {
  currentUser: UserSession | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  loginAsPreset: (email: string) => Promise<{ success: boolean; message?: string }>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Verifica se existe uma sessão ativa ao carregar a aplicação
  useEffect(() => {
    async function checkSession() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3334/api/v1'
        const res = await fetch(`${API_URL}/sessions/me`, {
          credentials: 'include',
        })

        if (res.ok) {
          const json = await res.json()
          if (json.user) {
            setCurrentUser(json.user)
            localStorage.setItem('verzel_current_user', json.user.email)
            setIsLoading(false)
            return
          }
        }
      } catch (err) {
        console.warn('Sessão não autenticada no backend:', err)
      }

      // Se não houver cookie ativo, zera o estado de usuário logado
      setCurrentUser(null)
      localStorage.removeItem('verzel_current_user')
      setIsLoading(false)
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3334/api/v1'
      const res = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        setIsLoading(false)
        return { success: false, message: data.message || 'E-mail ou senha inválidos' }
      }

      setCurrentUser(data.user)
      localStorage.setItem('verzel_current_user', data.user.email)
      setIsLoading(false)
      return { success: true }
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      return { success: false, message: 'Erro ao comunicar com a API do servidor' }
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3334/api/v1'
      await fetch(`${API_URL}/sessions`, {
        method: 'DELETE',
        credentials: 'include',
      })
    } catch (err) {
      console.warn('Erro ao realizar logout no servidor:', err)
    } finally {
      setCurrentUser(null)
      localStorage.removeItem('verzel_current_user')
      setIsLoading(false)
    }
  }

  const loginAsPreset = async (email: string) => {
    const found = PRESET_USERS.find((u) => u.email === email)
    if (!found) return { success: false, message: 'Usuário preset não encontrado' }
    return await login(found.email, found.password)
  }

  return (
    <UserContext.Provider value={{ currentUser, isLoading, login, logout, loginAsPreset }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser deve ser usado dentro de UserProvider')
  }
  return context
}
