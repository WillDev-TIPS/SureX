'use client'

import { useState } from 'react'
import { PageContainer } from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"
import { CryptoDialog } from "@/components/crypto-dialog"

export default function DonationPage() {
  const [usdtDialogOpen, setUsdtDialogOpen] = useState(false)
  const [ethDialogOpen, setEthDialogOpen] = useState(false)
  
  const usdtAddress = "0xf1aae086c94d90d8226ff94b0cc575aa887c7bc8"
  const ethAddress = "0xf1aae086c94d90d8226ff94b0cc575aa887c7bc8"
  
  return (
    <PageContainer
      title="Apoie o Projeto"
      backLink="/"
      backText="Voltar"
      description="Contribua para mantermos nossas ferramentas gratuitas"
    >
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-donation-100 dark:bg-donation-900/30 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-donation-600 dark:text-donation-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Ajude-nos a continuar</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            As ferramentas que disponibilizamos são gratuitas e sem anúncios.
            Sua contribuição ajuda a manter o projeto e desenvolver novas funcionalidades.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Por que apoiar?</CardTitle>
              <CardDescription>Sua contribuição é importante para nós</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-donation-500 mr-2">✓</span>
                  <span>Manter o projeto ativo e atualizado</span>
                </li>
                <li className="flex items-start">
                  <span className="text-donation-500 mr-2">✓</span>
                  <span>Desenvolvimento de novas calculadoras e ferramentas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-donation-500 mr-2">✓</span>
                  <span>Continuar oferecendo o serviço sem anúncios</span>
                </li>
                <li className="flex items-start">
                  <span className="text-donation-500 mr-2">✓</span>
                  <span>Melhorar a interface e experiência do usuário</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Formas de apoio</CardTitle>
              <CardDescription>Escolha a opção que preferir</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Endereço Lightning</h3>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-mono">rancidtoilet57@walletofsatoshi.com</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Para doações via Lightning Network, utilize o endereço acima.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Outras formas de apoio</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    className="border-donation-300 hover:bg-donation-50 dark:hover:bg-donation-900/20"
                    onClick={() => setUsdtDialogOpen(true)}
                  >
                    USDT
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-donation-300 hover:bg-donation-50 dark:hover:bg-donation-900/20"
                    onClick={() => setEthDialogOpen(true)}
                  >
                    ETH
                  </Button>
                </div>
              </div>

              <p className="text-sm text-center text-muted-foreground mt-4 pt-4 border-t">
                Entre em contato para outras formas de contribuição ou parceria.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Obrigado por considerar apoiar nosso projeto!
          </p>
        </div>
      </div>
      
      {/* Diálogos de criptomoedas */}
      <CryptoDialog
        open={usdtDialogOpen}
        onOpenChange={setUsdtDialogOpen}
        title="USDT"
        address={usdtAddress}
      />
      
      <CryptoDialog
        open={ethDialogOpen}
        onOpenChange={setEthDialogOpen}
        title="ETH"
        address={ethAddress}
      />
    </PageContainer>
  )
}
