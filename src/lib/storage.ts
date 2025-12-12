import { useEffect, useRef, useState } from 'react'

export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initial
    } catch {
      return initial
    }
  })

  const keyRef = useRef(key)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (keyRef.current !== key) {
      window.localStorage.removeItem(keyRef.current)
      keyRef.current = key
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore persistence errors
    }
  }, [key, value])

  return [value, setValue] as const
}


