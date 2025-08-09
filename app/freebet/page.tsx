'use client'

import { useState, useCallback, useEffect } from 'react'
import { ArrowLeft, Gift, Calculator, AlertTriangle, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"

import Link from "next/link"
//import { ThemeToggle } from '@/components/theme-toggle'


interface FreebetResult {
  freebetValue: number
  layStake: number
  layResponsibility: number
  profitIfFreebetWins: number
  profitIfLayWins: number
  extractionRate: number
  freebetOdd: number
  layOdd: number
  commission: number
}

interface FreebetFormData {
  freebetValue: string
  freebetOdd: string
  layOdd: string
  commission: string
}

export default function FreebetPage() {
  // Removida a flag de cálculo para agilizar o processo

  const [alert, setAlert] = useState<{show: boolean, message: string, type: 'success' | 'warning' | 'error'}>({show: false, message: '', type: 'warning'})
  
  // Estado para a forma básica
  const [formData, setFormData] = useState<FreebetFormData>({
    freebetValue: '',
    freebetOdd: '',
    layOdd: '',
    commission: '2'
  })
  
  // Estado para erros de validação
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  
  // Removidos históricos de cálculos para otimizar a interface
  // const [savedCalculations, setSavedCalculations] = useState<FreebetResult[]>([])
  // const [showHistory, setShowHistory] = useState(false)
  
  // Estado para resultados
  const [results, setResults] = useState<FreebetResult | null>(null)

  const validateInputs = (): boolean => {
    const newErrors: {[key: string]: string} = {}
    
    // Validar valor da freebet
    const freebetValue = parseFloat(formData.freebetValue)
    if (!formData.freebetValue || isNaN(freebetValue) || freebetValue <= 0) {
      newErrors.freebetValue = 'Informe um valor válido'
    }
    
    // Validar odd da freebet
    const freebetOdd = parseFloat(formData.freebetOdd)
    if (!formData.freebetOdd || isNaN(freebetOdd) || freebetOdd <= 1) {
      newErrors.freebetOdd = 'Odd deve ser maior que 1'
    }
    
    // Validar odd do lay
    const layOdd = parseFloat(formData.layOdd)
    if (!formData.layOdd || isNaN(layOdd) || layOdd <= 1) {
      newErrors.layOdd = 'Odd deve ser maior que 1'
    }
    
    // Validar comissão
    const commission = parseFloat(formData.commission)
    if (!formData.commission || isNaN(commission) || commission < 0 || commission > 100) {
      newErrors.commission = 'Comissão deve estar entre 0 e 100%'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Atualizar valores do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
    
    // Limpar erro quando o usuário digitar
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[id]
        return newErrors
      })
    }
  }

  const calculateFreebet = useCallback(() => {
    if (!validateInputs()) {
      return
    }
    
    setAlert({show: false, message: '', type: 'warning'})
    
    // Processamento dos dados do formulário
    const freebetValue = parseFloat(formData.freebetValue)
    const freebetOdd = parseFloat(formData.freebetOdd)
    const layOdd = parseFloat(formData.layOdd)
    const commission = parseFloat(formData.commission) / 100

    // Lógica de cálculo para Lay Stake e Responsabilidade
    const layStake = (freebetValue * (freebetOdd - 1)) / (layOdd - commission)
    const layResponsibility = layStake * (layOdd - 1)

    // Lucro se a lay ganhar (na exchange)
    const profitIfLayWins = layStake * (1 - commission)
    
    // Lucro se a freebet ganhar (na casa de apostas)
    // Cálculo correto: (freebet value * (odds - 1)) - lay responsibility
    const profitIfFreebetWins = (freebetValue * (freebetOdd - 1)) - layResponsibility
    
    // Taxa de extração baseada na média dos lucros
    const averageProfit = (profitIfFreebetWins + profitIfLayWins) / 2
    const extractionRate = (averageProfit / freebetValue) * 100

    const result = {
      freebetValue: freebetValue,
      freebetOdd: freebetOdd,
      layOdd: layOdd,
      commission: commission * 100,
      layStake: Math.round(layStake * 100) / 100,
      layResponsibility: Math.round(layResponsibility * 100) / 100,
      profitIfFreebetWins: Math.round(profitIfFreebetWins * 100) / 100,
      profitIfLayWins: Math.round(profitIfLayWins * 100) / 100,
      extractionRate: Math.round(extractionRate * 100) / 100
    }
    
    setResults(result)
    
    // Mostrar alerta se a taxa de extração for boa
    if (extractionRate > 70) {
      setAlert({
        show: true,
        message: 'Excelente taxa de extração! Acima de 70%',
        type: 'success'
      })
    } else if (extractionRate > 50) {
      setAlert({
        show: true,
        message: 'Boa taxa de extração',
        type: 'success'
      })
    }

    // Cálculo realizado instantaneamente
  }, [formData, validateInputs])
  
  // Funções de histórico removidas para otimizar a interface
  /*
  const saveCalculation = () => {
    if (results) {
      setSavedCalculations(prev => [results, ...prev])
      setAlert({
        show: true,
        message: 'Cálculo salvo no histórico!',
        type: 'success'
      })
      setTimeout(() => setAlert({show: false, message: '', type: 'warning'}), 3000)
    }
  }
  
  const loadCalculation = (calc: FreebetResult) => {
    setFormData({
      freebetValue: calc.freebetValue.toString(),
      freebetOdd: calc.freebetOdd.toString(),
      layOdd: calc.layOdd.toString(),
      commission: calc.commission.toString()
    })
    setResults(calc)
    setShowHistory(false)
    setAlert({
      show: true,
      message: 'Cálculo carregado do histórico!',
      type: 'success'
    })
    setTimeout(() => setAlert({show: false, message: '', type: 'warning'}), 3000)
  }
  */

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-2 sm:p-4">
      <div className="container mx-auto max-w-full sm:max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="sm:inline">Voltar</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Extração de Freebets
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Maximize o valor das suas apostas grátis
              </p>
            </div>
          </div>
        </div>

        {/* Alertas e notificações */}
        {alert.show && (
          <Alert 
            className={`mb-6 ${alert.type === 'success' ? 'bg-freebet-50 dark:bg-freebet-900/30 border-freebet-500' : 
              alert.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-500' : 
              'bg-red-100 dark:bg-red-900/30 border-red-500'}`}
          >
            <div className="flex items-center gap-2">
              {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
              <AlertDescription className={`${alert.type === 'success' ? 'text-freebet-700 dark:text-freebet-300' : 
                alert.type === 'warning' ? 'text-amber-700 dark:text-amber-300' : 
                'text-red-700 dark:text-red-300'}`}>
                {alert.message}
              </AlertDescription>
            </div>
          </Alert>
        )}
        
        
            <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {/* Card 1: Dados da Freebet */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Gift className="w-5 h-5" />
                    Dados da Freebet
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Insira os dados da sua aposta grátis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="freebetValue" className="text-card-foreground text-xs sm:text-sm">Valor da Freebet (R$)</Label>
                      <Input
                        id="freebetValue"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 50"
                        value={formData.freebetValue}
                        onChange={handleInputChange}
                        className={`mt-1 bg-background border-border text-foreground text-xs sm:text-sm ${errors.freebetValue ? 'border-red-500' : ''}`}
                      />
                      {errors.freebetValue && <p className="text-red-500 text-xs mt-1">{errors.freebetValue}</p>}
                    </div>
                    <div>
                      <Label htmlFor="freebetOdd" className="text-card-foreground text-xs sm:text-sm">Odd da Freebet</Label>
                      <Input
                        id="freebetOdd"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 3.50"
                        value={formData.freebetOdd}
                        onChange={handleInputChange}
                        className={`mt-1 bg-background border-border text-foreground text-xs sm:text-sm ${errors.freebetOdd ? 'border-red-500' : ''}`}
                      />
                      {errors.freebetOdd && <p className="text-red-500 text-xs mt-1">{errors.freebetOdd}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Dados da Cobertura (Lay) */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Calculator className="w-5 h-5" />
                    Dados da Cobertura (Lay)
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Insira os dados da aposta de cobertura
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="layOdd" className="text-card-foreground text-xs sm:text-sm">Odd de Cobertura</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-4 w-4 sm:h-5 sm:w-5">
                                <Info className="h-2 w-2 sm:h-3 sm:w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Odd da aposta de cobertura na exchange.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="layOdd"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 3.60"
                        value={formData.layOdd}
                        onChange={handleInputChange}
                        className={`mt-1 bg-background border-border text-foreground text-xs sm:text-sm ${errors.layOdd ? 'border-red-500' : ''}`}
                      />
                      {errors.layOdd && <p className="text-red-500 text-xs mt-1">{errors.layOdd}</p>}
                    </div>
                    <div>
                      <Label htmlFor="commission" className="text-card-foreground text-xs sm:text-sm">Comissão da Exchange (%)</Label>
                      <Input
                        id="commission"
                        type="number"
                        step="0.1"
                        placeholder="Ex: 2"
                        value={formData.commission}
                        onChange={handleInputChange}
                        className={`mt-1 bg-background border-border text-foreground text-xs sm:text-sm ${errors.commission ? 'border-red-500' : ''}`}
                      />
                      {errors.commission && <p className="text-red-500 text-xs mt-1">{errors.commission}</p>}
                    </div>
                  </div>
                  {results ? (
                    <div className="space-y-3 mt-4">
                      <div className="flex justify-between items-center p-3 bg-freebet-50 dark:bg-freebet-900/20 rounded-lg border border-freebet-200 dark:border-freebet-800">
                        <span className="text-sm font-medium text-card-foreground">Apostar Cobertura:</span>
                        <span className="font-semibold text-freebet-600 dark:text-freebet-400">
                          R$ {results.layStake.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-freebet-50 dark:bg-freebet-900/20 rounded-lg border border-freebet-200 dark:border-freebet-800">
                        <span className="text-sm font-medium text-card-foreground">Responsabilidade:</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          R$ {results.layResponsibility.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 mt-4">
                      <div className="flex justify-between items-center p-3 bg-freebet-50 dark:bg-freebet-900/20 rounded-lg border border-freebet-200 dark:border-freebet-800">
                        <span className="text-sm font-medium text-card-foreground">Apostar Cobertura:</span>
                        <span className="font-semibold text-freebet-600 dark:text-freebet-400">R$ --</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-freebet-50 dark:bg-freebet-900/20 rounded-lg border border-freebet-200 dark:border-freebet-800">
                        <span className="text-sm font-medium text-card-foreground">Responsabilidade:</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">R$ --</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card 3: Resultados */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-freebet-600 dark:text-freebet-400">Resultados</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Estratégia otimizada para extração de valor
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Histórico de cálculos removido */}
                  
                  <div className="bg-muted p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Valor Extraído</p>
                    {results ? (
                      <p className="text-lg font-semibold text-freebet-600 dark:text-freebet-400">
                        {results.extractionRate.toFixed(1)}% do valor da freebet
                      </p>
                    ) : (
                      <p className="text-lg font-semibold text-muted-foreground">
                        Aguardando cálculo...
                      </p>
                    )}
                  </div>
                  
                  {results ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-freebet-50 dark:bg-freebet-900/20 rounded-lg border border-freebet-200 dark:border-freebet-800">
                        <span className="text-sm font-medium text-card-foreground">Lucro (se Freebet Ganha):</span>
                        <span className="font-bold text-freebet-700 dark:text-freebet-300">
                          R$ {results.profitIfFreebetWins.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-freebet-50 dark:bg-freebet-900/20 rounded-lg border border-freebet-200 dark:border-freebet-800">
                        <span className="text-sm font-medium text-card-foreground">Lucro (se Lay Ganha):</span>
                        <span className="font-bold text-freebet-700 dark:text-freebet-300">
                          R$ {results.profitIfLayWins.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-freebet-100 dark:bg-freebet-900/30 rounded-lg border border-freebet-200 dark:border-freebet-800">
                        <span className="text-sm font-medium text-card-foreground">% Extraído:</span>
                        <span className="font-semibold text-freebet-600 dark:text-freebet-400">
                          {results.extractionRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-freebet-50 dark:bg-freebet-900/20 rounded-lg border border-freebet-200 dark:border-freebet-800">
                        <span className="text-sm font-medium text-card-foreground">Lucro (se Freebet Ganha):</span>
                        <span className="font-bold text-freebet-700 dark:text-freebet-300">R$ --</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-freebet-50 dark:bg-freebet-900/20 rounded-lg border border-freebet-200 dark:border-freebet-800">
                        <span className="text-sm font-medium text-card-foreground">Lucro (se Lay Ganha):</span>
                        <span className="font-bold text-freebet-700 dark:text-freebet-300">R$ --</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-freebet-100 dark:bg-freebet-900/30 rounded-lg border border-freebet-200 dark:border-freebet-800">
                        <span className="text-sm font-medium text-card-foreground">% Extraído:</span>
                        <span className="font-semibold text-freebet-600 dark:text-freebet-400">--%</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      <strong>Lembre-se:</strong> Freebets SNR (Stake Not Returned) não retornam o valor da aposta, apenas os ganhos líquidos.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>


        <div className="flex justify-center mt-6 sm:mt-8">
          <Button 
            className="w-full max-w-xs sm:max-w-md bg-freebet-600 hover:bg-freebet-700 text-white"
            onClick={calculateFreebet}
          >
            Calcular Extração
          </Button>
        </div>
      </div>
    </div>
  )
}