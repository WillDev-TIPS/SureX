import { Calculator, Heart, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ThemeToggle } from '@/components/theme-toggle'
import { PageContainer } from '@/components/layout/page-container'
import { Logo } from '@/components/logo'
import { PWAInstaller } from '@/components/pwa-installer'

export default function HomePage() {
  return (
    <PageContainer
      title=""
      backLink=""
      className="max-w-4xl"
    >
        <div className="text-center pt-3 sm:pt-5 pb-4 sm:pb-6">
          <Logo width={300} height={150} className="mx-auto mb-2 sm:mb-3 w-[250px] sm:w-[300px]" />
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Ferramentas profissionais para maximizar seus lucros em apostas esportivas
          </p>
        </div>

        {/* Calculator Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto px-4 md:px-0">
          {/* Surebet Calculator Card */}
          <Link href="/surebet" className="group transition-transform hover:scale-[1.02]">
            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer border-2 hover:border-surebet-500">
              <CardHeader className="text-center py-3">
                <div className="mx-auto w-14 h-14 bg-surebet-100 dark:bg-surebet-900/30 rounded-full flex items-center justify-center mb-2 group-hover:bg-surebet-200 dark:group-hover:bg-surebet-800/50 transition-colors">
                  <TrendingUp className="w-7 h-7 text-surebet-600 dark:text-surebet-400" />
                </div>
                <CardTitle className="text-xl">
                  Calculadora Surebet
                </CardTitle>
                <CardDescription>
                  Calcule apostas seguras com lucro garantido
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0 pb-3">
                <div className="bg-surebet-50 dark:bg-surebet-900/20 p-2 rounded-lg border border-surebet-200 dark:border-surebet-800">
                  <p className="text-surebet-700 dark:text-surebet-300 font-medium text-sm">
                    ✓ Lucro garantido
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Freebet Extraction Calculator Card */}
          <Link href="/freebet" className="group transition-transform hover:scale-[1.02]">
            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer border-2 hover:border-freebet-500">
              <CardHeader className="text-center py-3">
                <div className="mx-auto w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                  <Calculator className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl">
                  Extração de Freebets
                </CardTitle>
                <CardDescription>
                  Maximize o valor das suas apostas grátis
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0 pb-3">
                <div className="bg-freebet-50 dark:bg-freebet-900/20 p-2 rounded-lg border border-freebet-200 dark:border-freebet-800">
                  <p className="text-freebet-700 dark:text-freebet-300 font-medium text-sm">
                    ✓ Estratégia otimizada
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card de doação */}
          <Link href="/donation" className="group transition-transform hover:scale-[1.02] md:col-span-2 lg:col-span-1">
            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer border-2 hover:border-donation-500">
              <CardHeader className="text-center py-3">
                <div className="mx-auto w-14 h-14 bg-donation-100 dark:bg-donation-900/30 rounded-full flex items-center justify-center mb-2 group-hover:bg-donation-200 dark:group-hover:bg-donation-800/50 transition-colors">
                  <Heart className="w-7 h-7 text-donation-600 dark:text-donation-400" />
                </div>
                <CardTitle className="text-xl">
                  Apoie o Projeto
                </CardTitle>
                <CardDescription>
                  Contribua para manter as ferramentas gratuitas
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0 pb-3">
                <div className="bg-donation-50 dark:bg-donation-900/20 p-2 rounded-lg border border-donation-200 dark:border-donation-800">
                  <p className="text-donation-700 dark:text-donation-300 font-medium text-sm">
                    ✓ Sem anúncios
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Instagram Card */}
        <div className="mt-6 mb-6 max-w-sm mx-auto px-4 md:px-0">
          <a 
            href="https://www.instagram.com/x.sures?igsh=MXM1bnIxMXcyNXhmdg%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer" 
            className="group flex items-center justify-center transition-transform hover:scale-105 block"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex-shrink-0 w-8 h-8">
                <img 
                  src="/instagram-1-svgrepo-com.svg" 
                  alt="Instagram" 
                  className="w-full h-full"
                />
              </div>
              <p className="font-medium text-sm">
                Conheça mais do nosso projeto
              </p>
              <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
            </div>
          </a>
        </div>

        {/* Theme Toggle */}
        <div className="flex justify-center mt-6 sm:mt-8 mb-4">
          <ThemeToggle />
        </div>

        {/* Footer */}
        <div className="text-center mt-4 pb-8">
          <p className="text-muted-foreground text-xs sm:text-sm">
            Desenvolvido para apostadores profissionais
          </p>
        </div>
        
        {/* PWA Installer */}
        <PWAInstaller />
    </PageContainer>
  )
}
