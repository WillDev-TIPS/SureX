'use client'

import { useState, useEffect, ReactNode } from 'react'
import { ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useMediaQuery } from '@/hooks/use-mobile'

interface MobileActionBarProps {
  children: ReactNode
  triggerText: string
  className?: string
}

export function MobileActionBar({ children, triggerText, className = '' }: MobileActionBarProps) {
  const [mounted, setMounted] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  // Impedir problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  // Em telas maiores, renderizar o conteúdo normalmente
  if (!isMobile) {
    return <>{children}</>
  }
  
  // Em dispositivos móveis, mostrar apenas o botão que aciona o sheet
  return (
    <div className={`fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-50 ${className}`}>
      <Sheet>
        <SheetTrigger asChild>
          <Button className="w-full" variant="outline" size="lg">
            {triggerText} <ChevronUp className="ml-2 h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          {children}
        </SheetContent>
      </Sheet>
    </div>
  )
}
