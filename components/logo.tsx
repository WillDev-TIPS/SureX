'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export function Logo({ width = 200, height = 80, className = '' }: LogoProps) {
  const [mounted, setMounted] = useState(false)
  
  // Evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return (
      <div 
        className={`bg-muted animate-pulse rounded-md ${className}`}
        style={{ width, height }}
      />
    )
  }
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative" style={{ width, height }}>
        <Image 
          src="/logotiposurexsv.svg"
          alt="SureX - Calculadoras de Apostas"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  )
}
