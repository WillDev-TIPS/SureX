'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ArrowLeft, Settings, Info, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
//import { ThemeToggle } from '@/components/theme-toggle'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ResultSkeleton } from '@/components/skeleton-loader'

interface BetOutcome {
  id: number
  odd: string
  stake: string
  label: string
  commission: string
  isExchange: boolean
}

interface SurebetConfig {
  totalStake: number
  currency: string
  roundTo: number
  showCommissions: boolean
  autoCalculate: boolean
  decimalPlaces: number
}

interface SurebetResults {
  isArbitrage: boolean
  totalImpliedProb: number
  profit: number
  roi: number
  stakes: number[]
  calculatedTotalStake: number
  outcomesWithEffectiveOdds?: Array<Omit<BetOutcome, 'odd' | 'stake' | 'commission'> & { odd: number; stake: number; commission: number; effectiveOdd: number; impliedProb: number }>
}

export default function SurebetPage() {
  const [isCalculating, setIsCalculating] = useState(false)
  const [numEntries, setNumEntries] = useState(2)
  const [fixedOutcomeId, setFixedOutcomeId] = useState<number | null>(null)
  const [config, setConfig] = useState<SurebetConfig>({
    totalStake: 1000,
    currency: 'BRL',
    roundTo: 0.01,
    showCommissions: false,
    autoCalculate: true,
    decimalPlaces: 2
  })
  
  const [outcomes, setOutcomes] = useState<BetOutcome[]>([
    { id: 1, odd: '2.10', stake: '0', label: 'Entrada 1', commission: '0', isExchange: false },
    { id: 2, odd: '1.95', stake: '0', label: 'Entrada 2', commission: '0', isExchange: false }
  ])
  
  // Removidos históricos de cálculos para otimizar a interface
  // const [savedCalculations, setSavedCalculations] = useState<{config: SurebetConfig, outcomes: BetOutcome[], results: SurebetResults}[]>([])
  // const [showHistory, setShowHistory] = useState(false)

  const [results, setResults] = useState<SurebetResults>({
    isArbitrage: false,
    totalImpliedProb: 0,
    profit: 0,
    roi: 0,
    stakes: [],
    calculatedTotalStake: 0,
    outcomesWithEffectiveOdds: []
  })

  // Estado para erros de validação de input
  const [inputErrors, setInputErrors] = useState<Record<number, { odd?: string; stake?: string; commission?: string }>>({});
  
  // Estado para alertas e notificações
  const [alert, setAlert] = useState<{show: boolean, message: string, type: 'success' | 'warning' | 'error'}>({show: false, message: '', type: 'warning'});

  const updateEntries = (newNum: number) => {
    setNumEntries(newNum)
    const newOutcomes = [...outcomes]
    
    if (newNum > outcomes.length) {
      for (let i = outcomes.length; i < newNum; i++) {
        newOutcomes.push({
          id: i + 1,
          odd: '2.00',
          stake: '0',
          label: `Entrada ${i + 1}`,
          commission: '0',
          isExchange: false
        })
      }
    } else {
      newOutcomes.splice(newNum)
      if (fixedOutcomeId && fixedOutcomeId > newNum) {
        setFixedOutcomeId(null)
      }
      // Limpar erros de entradas removidas
      setInputErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        for (let i = newNum + 1; i <= outcomes.length; i++) {
          delete newErrors[i];
        }
        return newErrors;
      });
    }
    
    setOutcomes(newOutcomes)
  }

  const updateOutcome = (id: number, field: keyof BetOutcome, value: any) => {
    setOutcomes(prev => prev.map(outcome => 
      outcome.id === id ? { ...outcome, [field]: value } : outcome
    ));

    // Validação de input
    setInputErrors(prevErrors => {
      const newErrorsForOutcome = { ...prevErrors[id] };
      let hasError = false;

      if (field === 'odd') {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 1) {
          newErrorsForOutcome.odd = 'Odd deve ser > 1';
          hasError = true;
        } else {
          delete newErrorsForOutcome.odd;
        }
      } else if (field === 'stake') {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
          newErrorsForOutcome.stake = 'Valor deve ser >= 0';
          hasError = true;
        } else {
          delete newErrorsForOutcome.stake;
        }
      } else if (field === 'commission') {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
          newErrorsForOutcome.commission = 'Comissão entre 0-100%';
          hasError = true;
        } else {
          delete newErrorsForOutcome.commission;
        }
      }

      const updatedErrors = { ...prevErrors };
      if (hasError || Object.keys(newErrorsForOutcome).length > 0) {
        updatedErrors[id] = newErrorsForOutcome;
      } else {
        delete updatedErrors[id];
      }
      return updatedErrors;
    });
  };

  // Verifica se há algum erro de input em qualquer campo
  const hasAnyInputErrors = Object.values(inputErrors).some(
    outcomeErrors => Object.keys(outcomeErrors).length > 0
  );

  const calculateSurebet = useCallback(async () => {
    // Se houver erros de input, não calcula e zera os resultados
    if (hasAnyInputErrors) {
      setIsCalculating(false);
      setResults({
        isArbitrage: false,
        totalImpliedProb: 0,
        profit: 0,
        roi: 0,
        stakes: [],
        calculatedTotalStake: 0,
        outcomesWithEffectiveOdds: []
      });
      return;
    }

    setIsCalculating(true)
    
    // Removemos o delay artificial, já que não é necessário
    
    const parsedOutcomes = outcomes.map(o => ({
      ...o,
      odd: parseFloat(o.odd) || 0,
      stake: parseFloat(o.stake) || 0,
      commission: parseFloat(o.commission) || 0
    }));

    const activeOutcomesFiltered = parsedOutcomes.filter(o => o.odd > 0);
    
    if (activeOutcomesFiltered.length < 2) {
      setResults({
        isArbitrage: false,
        totalImpliedProb: 0,
        profit: 0,
        roi: 0,
        stakes: [],
        calculatedTotalStake: 0,
        outcomesWithEffectiveOdds: []
      })
      setIsCalculating(false)
      return
    }

    const outcomesWithEffectiveOdds = activeOutcomesFiltered.map(outcome => {
      const commissionRate = outcome.commission / 100;
      let effectiveOdd = outcome.odd;

      if (outcome.isExchange) {
        effectiveOdd = outcome.odd / (1 - commissionRate);
      } else if (config.showCommissions && commissionRate > 0) {
        effectiveOdd = 1 + (outcome.odd - 1) * (1 - commissionRate);
      }
      
      return { ...outcome, effectiveOdd, impliedProb: 1 / effectiveOdd };
    });
    
    const totalImpliedProbForArbitrageCheck = outcomesWithEffectiveOdds.reduce((sum, o) => sum + o.impliedProb, 0);
    
    const sumOfInvestmentRatios = outcomesWithEffectiveOdds.reduce((sum, o) => {
      if (o.isExchange) {
        return sum + (o.odd - 1) / o.effectiveOdd;
      } else {
        return sum + (1 / o.effectiveOdd);
      }
    }, 0);

    let calculatedStakes: number[] = [];
    let finalTotalInvestment: number = 0;
    let finalGuaranteedReturn: number = 0;

    // Sempre calcula os stakes e o lucro, independentemente de ser uma arbitragem "positiva"
    if (fixedOutcomeId !== null) {
      const fixedOutcome = outcomesWithEffectiveOdds.find(o => o.id === fixedOutcomeId);
      if (fixedOutcome && fixedOutcome.stake > 0 && fixedOutcome.effectiveOdd > 0) {
        finalGuaranteedReturn = fixedOutcome.stake * fixedOutcome.effectiveOdd;

        calculatedStakes = outcomesWithEffectiveOdds.map(outcome => {
          return finalGuaranteedReturn / outcome.effectiveOdd;
        });

        finalTotalInvestment = calculatedStakes.reduce((sum, s, i) => {
          const outcome = outcomesWithEffectiveOdds[i];
          if (outcome.isExchange) {
            return sum + (s * (outcome.odd - 1));
          } else {
            return sum + s;
          }
        }, 0);

      } else {
        // Se a entrada fixada for inválida, volta para a distribuição normal
        setFixedOutcomeId(null);
        finalTotalInvestment = config.totalStake;
        finalGuaranteedReturn = finalTotalInvestment / sumOfInvestmentRatios;
        calculatedStakes = outcomesWithEffectiveOdds.map(outcome =>
          finalGuaranteedReturn / outcome.effectiveOdd
        );
      }
    } else {
      // Caso: Nenhuma entrada fixada, distribui com base no config.totalStake
      finalTotalInvestment = config.totalStake;
      finalGuaranteedReturn = finalTotalInvestment / sumOfInvestmentRatios;
      calculatedStakes = outcomesWithEffectiveOdds.map(outcome =>
        finalGuaranteedReturn / outcome.effectiveOdd
      );
    }

    const roundedStakes = calculatedStakes.map(stake =>
      Math.round(stake / config.roundTo) * config.roundTo
    );

    const actualTotalInvestment = roundedStakes.reduce((sum, s, i) => {
      const outcome = outcomesWithEffectiveOdds[i];
      if (outcome.isExchange) {
        return sum + (s * (outcome.odd - 1));
      } else {
        return sum + s;
      }
    }, 0);

    const actualGuaranteedReturn = Math.min(...roundedStakes.map((s, i) => {
      const outcome = outcomesWithEffectiveOdds[i];
      return s * outcome.effectiveOdd;
    }));

    const profit = actualGuaranteedReturn - actualTotalInvestment;
    const roi = (profit / actualTotalInvestment) * 100;

    // A surebet é encontrada se a probabilidade total for < 1 ou lucro > 0
    const isArbitrage = totalImpliedProbForArbitrageCheck < 1 && profit > 0;
    
    // Mostrar alerta se estivermos muito próximos de uma surebet
    if (totalImpliedProbForArbitrageCheck < 1.01 && totalImpliedProbForArbitrageCheck >= 1 && !hasAnyInputErrors) {
      setAlert({
        show: true,
        message: 'Quase uma Surebet! Ajuste as odds um pouco para obter lucro garantido.',
        type: 'warning'
      });
    } else if (isArbitrage && profit > 10) {
      setAlert({
        show: true,
        message: 'Surebet com bom lucro encontrada!',
        type: 'success'
      });
    } else {
      setAlert({show: false, message: '', type: 'warning'});
    }

    // Precisão decimal baseada na configuração do usuário
    const factor = Math.pow(10, config.decimalPlaces);
    
    const newResults = {
      isArbitrage,
      totalImpliedProb: totalImpliedProbForArbitrageCheck,
      profit: Math.round(profit * factor) / factor,
      roi: Math.round(roi * factor) / factor,
      stakes: roundedStakes,
      calculatedTotalStake: Math.round(actualTotalInvestment * factor) / factor,
      outcomesWithEffectiveOdds: outcomesWithEffectiveOdds
    };
    
    setResults(newResults);

    setIsCalculating(false);
  }, [outcomes, config, fixedOutcomeId, hasAnyInputErrors]);

  // Cálculo automático com debounce
  useEffect(() => {
    if (!config.autoCalculate) return;
    
    const handler = setTimeout(() => {
      calculateSurebet();
    }, 500);
    
    return () => clearTimeout(handler);
  }, [outcomes, config, numEntries, fixedOutcomeId, calculateSurebet, hasAnyInputErrors, config.autoCalculate]);
  
  // Funções de histórico removidas para otimizar a interface
  /*
  const saveCalculation = () => {
    setSavedCalculations(prev => [
      ...prev,
      {
        config: {...config},
        outcomes: [...outcomes],
        results: {...results}
      }
    ]);
    setAlert({
      show: true, 
      message: 'Cálculo salvo no histórico!', 
      type: 'success'
    });
    setTimeout(() => setAlert({show: false, message: '', type: 'warning'}), 3000);
  };
  
  const loadCalculation = (index: number) => {
    const saved = savedCalculations[index];
    if (saved) {
      setConfig(saved.config);
      setOutcomes(saved.outcomes);
      setResults(saved.results);
      setNumEntries(saved.outcomes.length);
      setShowHistory(false);
      setAlert({
        show: true, 
        message: 'Cálculo carregado do histórico!', 
        type: 'success'
      });
      setTimeout(() => setAlert({show: false, message: '', type: 'warning'}), 3000);
    }
  };
  */
  
  // Calculamos algumas estatísticas úteis
  const statistics = useMemo(() => {
    if (results.outcomesWithEffectiveOdds && results.outcomesWithEffectiveOdds.length > 1) {
      // Odd média
      const avgOdd = results.outcomesWithEffectiveOdds.reduce((sum, o) => sum + o.odd, 0) / results.outcomesWithEffectiveOdds.length;
      // Diferença entre a maior e menor odd
      const odds = results.outcomesWithEffectiveOdds.map(o => o.odd);
      const oddDifference = Math.max(...odds) - Math.min(...odds);
      
      return {
        avgOdd: Math.round(avgOdd * 100) / 100,
        oddDifference: Math.round(oddDifference * 100) / 100,
      };
    }
    return null;
  }, [results.outcomesWithEffectiveOdds]);

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
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
                Calculadora Surebet
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Apostas seguras com lucro garantido
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Configurações */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Número de Entradas</Label>
                <Select value={numEntries.toString()} onValueChange={(value) => updateEntries(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Entradas</SelectItem>
                    <SelectItem value="3">3 Entradas</SelectItem>
                    <SelectItem value="4">4 Entradas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  {fixedOutcomeId !== null ? 'Valor Total Calculado' : `Valor Total (${config.currency})`}
                </Label>
                <Input
                  type="number"
                  value={fixedOutcomeId !== null && results ? results.calculatedTotalStake : config.totalStake}
                  onChange={(e) => setConfig(prev => ({ ...prev, totalStake: parseFloat(e.target.value) || 0 }))}
                  step="0.01"
                  readOnly={fixedOutcomeId !== null}
                  className={fixedOutcomeId !== null ? "bg-muted" : ""}
                />
              </div>

              <div>
                <Label>Moeda</Label>
                <Select value={config.currency} onValueChange={(value) => setConfig(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL (Real)</SelectItem>
                    <SelectItem value="USD">USD (Dólar)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    <SelectItem value="GBP">GBP (Libra)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label>Arredondar até</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <Info className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Define o valor de arredondamento para apostas.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select value={config.roundTo.toString()} onValueChange={(value) => setConfig(prev => ({ ...prev, roundTo: parseFloat(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.01">0,01</SelectItem>
                    <SelectItem value="0.1">0,10</SelectItem>
                    <SelectItem value="1">1,00</SelectItem>
                    <SelectItem value="5">5,00</SelectItem>
                    <SelectItem value="10">10,00</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showCommissions"
                    checked={config.showCommissions}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showCommissions: !!checked }))}
                  />
                  <Label htmlFor="showCommissions" className="text-sm">Mostrar comissões</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoCalculate"
                    checked={config.autoCalculate}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoCalculate: !!checked }))}
                  />
                  <Label htmlFor="autoCalculate" className="text-sm">Cálculo automático</Label>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label>Casas decimais</Label>
                <Select value={config.decimalPlaces.toString()} onValueChange={(value) => setConfig(prev => ({ ...prev, decimalPlaces: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 (sem decimais)</SelectItem>
                    <SelectItem value="1">1 casa decimal</SelectItem>
                    <SelectItem value="2">2 casas decimais</SelectItem>
                    <SelectItem value="3">3 casas decimais</SelectItem>
                    <SelectItem value="4">4 casas decimais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                {!config.autoCalculate && (
                  <Button 
                    onClick={calculateSurebet} 
                    variant="default" 
                    className="w-full"
                  >
                    Calcular
                  </Button>
                )}
                
                {fixedOutcomeId !== null && (
                  <Button 
                    variant="outline" 
                    onClick={() => setFixedOutcomeId(null)}
                    className="w-full"
                  >
                    Limpar Fixação
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Apostas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Dados das Apostas</CardTitle>
              <CardDescription>
                Configure as odds e valores para cada entrada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <RadioGroup value={fixedOutcomeId?.toString() || ''} onValueChange={(value) => setFixedOutcomeId(parseInt(value))}>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-1 sm:p-2 text-xs sm:text-sm">Entrada</th>
                        <th className="text-left p-1 sm:p-2 text-xs sm:text-sm">Odd</th>
                        <th className="text-left p-1 sm:p-2 text-xs sm:text-sm">Valor</th>
                        {config.showCommissions && <th className="text-left p-1 sm:p-2 text-xs sm:text-sm">%</th>}
                        <th className="text-left p-1 sm:p-2 text-xs sm:text-sm">Exch.</th>
                        <th className="text-left p-1 sm:p-2 text-xs sm:text-sm">Fixar</th>
                        <th className="text-left p-1 sm:p-2 text-xs sm:text-sm">Lucro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outcomes.map((outcome) => {
                        const activeOutcome = results.outcomesWithEffectiveOdds?.find(ao => ao.id === outcome.id);
                        // calculatedStake agora sempre será definido se houver outcomes ativos
                        const calculatedStake = activeOutcome 
                          ? results.stakes[results.outcomesWithEffectiveOdds!.indexOf(activeOutcome)]
                          : undefined;
                        
                        const liability = (calculatedStake !== undefined && activeOutcome && outcome.isExchange)
                          ? calculatedStake * (activeOutcome.odd - 1)
                          : 0;

                        return (
                          <tr key={outcome.id} className="border-b">
                            <td className="p-1 sm:p-2">
                              <span className="font-medium text-xs sm:text-sm">{outcome.label}</span>
                            </td>
                            <td className="p-1 sm:p-2">
                              <Input
                                type="text"
                                step="0.01"
                                value={outcome.odd}
                                onChange={(e) => updateOutcome(outcome.id, 'odd', e.target.value)}
                                className={`w-16 sm:w-20 text-xs sm:text-sm ${inputErrors[outcome.id]?.odd ? 'border-red-500 dark:border-red-400' : ''}`}
                              />
                              {inputErrors[outcome.id]?.odd && (
                                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{inputErrors[outcome.id].odd}</p>
                              )}
                            </td>
                            <td className="p-1 sm:p-2">
                              <Input
                                type="text"
                                step="0.01"
                                // Sempre exibe o stake calculado se disponível, senão o valor do estado
                                value={fixedOutcomeId === outcome.id ? outcome.stake : (calculatedStake !== undefined ? calculatedStake.toFixed(2) : outcome.stake)}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  updateOutcome(outcome.id, 'stake', newValue);
                                  setFixedOutcomeId(outcome.id);
                                }}
                                className={`w-16 sm:w-20 text-xs sm:text-sm ${inputErrors[outcome.id]?.stake ? 'border-red-500 dark:border-red-400' : ''}`}
                              />
                              {inputErrors[outcome.id]?.stake && (
                                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{inputErrors[outcome.id].stake}</p>
                              )}
                              {/* Responsabilidade exibida abaixo do valor apostado, se for Exchange */}
                              {outcome.isExchange && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                  {liability.toFixed(2)}
                                </p>
                              )}
                            </td>
                            {config.showCommissions && (
                              <td className="p-1 sm:p-2">
                                <Input
                                  type="text"
                                  step="0.1"
                                  value={outcome.commission}
                                  onChange={(e) => updateOutcome(outcome.id, 'commission', e.target.value)}
                                  className={`w-12 sm:w-16 text-xs sm:text-sm ${inputErrors[outcome.id]?.commission ? 'border-red-500 dark:border-red-400' : ''}`}
                                />
                                {inputErrors[outcome.id]?.commission && (
                                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{inputErrors[outcome.id].commission}</p>
                                )}
                              </td>
                            )}
                            <td className="p-1 sm:p-2">
                              <Checkbox
                                checked={outcome.isExchange}
                                onCheckedChange={(checked) => updateOutcome(outcome.id, 'isExchange', !!checked)}
                                className="h-3 w-3 sm:h-4 sm:w-4"
                              />
                            </td>
                            <td className="p-1 sm:p-2">
                              <RadioGroupItem value={outcome.id.toString()} id={`fix-${outcome.id}`} className="h-3 w-3 sm:h-4 sm:w-4" />
                            </td>
                            <td className="p-1 sm:p-2">
                              <span className={`font-semibold text-xs sm:text-sm ${
                                results.profit > 0
                                  ? 'text-surebet-600 dark:text-surebet-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {results.profit.toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </RadioGroup>
              </div>

              {/* Alertas e notificações */}
              {alert.show && (
                <Alert 
                  className={`mt-4 ${alert.type === 'success' ? 'bg-surebet-100 dark:bg-surebet-900/30 border-surebet-500' : 
                    alert.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-500' : 
                    'bg-red-100 dark:bg-red-900/30 border-red-500'}`}
                >
                  <div className="flex items-center gap-2">
                    {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    <AlertDescription className={`${alert.type === 'success' ? 'text-surebet-700 dark:text-surebet-300' : 
                      alert.type === 'warning' ? 'text-amber-700 dark:text-amber-300' : 
                      'text-red-700 dark:text-red-300'}`}>
                      {alert.message}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
              
              {/* Histórico de cálculos removido */}
              
              {/* Resumo */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                {isCalculating ? (
                  <ResultSkeleton />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className={`font-semibold ${
                        results.isArbitrage 
                          ? 'text-surebet-600 dark:text-surebet-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {results.isArbitrage ? 'Surebet encontrada' : 'Surebet não encontrada'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lucro</p>
                      <p className={`font-semibold ${
                        results.profit > 0 
                          ? 'text-surebet-600 dark:text-surebet-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {config.currency} {results.profit.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className={`font-semibold ${
                        results.roi > 0 
                          ? 'text-surebet-600 dark:text-surebet-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {results.roi.toFixed(config.decimalPlaces)}%
                      </p>
                    </div>
                    
                    {/* Estatísticas adicionais */}
                    {statistics && (
                      <div>
                        <p className="text-sm text-muted-foreground">Prob. Total</p>
                        <p className={`font-semibold ${results.totalImpliedProb < 1 ? 'text-surebet-600 dark:text-surebet-400' : 'text-red-600 dark:text-red-400'}`}>
                          {(results.totalImpliedProb * 100).toFixed(config.decimalPlaces)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">Odd média: {statistics.avgOdd}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

