'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CryptoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  address: string
}

export function CryptoDialog({ open, onOpenChange, title, address }: CryptoDialogProps) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Falha ao copiar: ', err)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Endereço {title}</DialogTitle>
          <DialogDescription>
            Copie o endereço abaixo para fazer sua doação.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <div className="grid flex-1 gap-2">
            <div className="bg-muted p-3 rounded-md font-mono text-sm break-all">
              {address}
            </div>
          </div>
          <Button 
            size="icon" 
            variant={copied ? "default" : "outline"} 
            className={copied ? "bg-green-600 hover:bg-green-700" : ""} 
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
