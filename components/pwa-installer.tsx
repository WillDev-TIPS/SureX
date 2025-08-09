'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, CheckCircle2 } from 'lucide-react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'

// Interface para BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
  }
}

export function PWAInstaller() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showInstaller, setShowInstaller] = useState(false);

  useEffect(() => {
    // Verificar se está rodando como PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setInstalled(true);
      return;
    }

    // Capturar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstaller(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar quando o app é instalado
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowInstaller(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    await installPrompt.prompt();
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('Usuário aceitou a instalação do PWA');
    } else {
      console.log('Usuário recusou a instalação do PWA');
    }
    
    setInstallPrompt(null);
  };

  if (!showInstaller) return null;
  
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <Card className="shadow-lg border-2 border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Download className="w-5 h-5 mr-2 text-primary" />
            Instale nossa calculadora
          </CardTitle>
          <CardDescription className="text-xs">
            Use offline e acesse mais rapidamente
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2 text-sm">
          <p>Instale esta aplicação para acessá-la mesmo sem internet e obter uma experiência melhor.</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" size="sm" onClick={() => setShowInstaller(false)}>
            Agora não
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleInstallClick} 
            className="bg-surebet-600 hover:bg-surebet-700 text-white"
          >
            Instalar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
