'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  title: string
  description?: string
  rightContent?: ReactNode
  backLink?: string
  backText?: string
  className?: string
  bgClassName?: string
}

export function PageContainer({
  children,
  title,
  description,
  rightContent,
  backLink = '/',
  backText = 'Voltar',
  className = '',
  bgClassName = 'min-h-screen bg-background p-2 sm:p-4',
}: PageContainerProps) {
  return (
    <div className={bgClassName}>
      <div className={`container mx-auto max-w-6xl ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            {backLink && (
              <Link href={backLink}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {backText}
                </Button>
              </Link>
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              {description && <p className="text-muted-foreground">{description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {rightContent}
          </div>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}
