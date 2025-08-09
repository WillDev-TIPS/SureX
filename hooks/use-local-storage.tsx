'use client'

import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [loaded, setLoaded] = useState(false)

  // Inicializar o estado do localStorage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
      setLoaded(true)
    } catch (error) {
      console.log(error)
      setLoaded(true)
    }
  }, [key])

  // Função para atualizar o valor
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Permitir um valor ou uma função que atualiza o valor anterior
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
        
      // Salvar o estado
      setStoredValue(valueToStore)
      
      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.log(error)
    }
  }, [key, storedValue])

  return [storedValue, setValue, loaded] as const
}
