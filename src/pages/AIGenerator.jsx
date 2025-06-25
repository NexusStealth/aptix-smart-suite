import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { FileText, Mail, MessageSquare, Bot, Download, Copy, Wand2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import aiService from '../services/aiService';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../services/firebase';
import { verificarERegistrarUso } from "../utils/usoDiario";

const AIGenerator = () => {
  const { user, userPlan, canUseFeature, incrementDailyUsage } = useAuth();
  const { type } = useParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [formData, setFormData] = useState({});

  const generators = {
    curriculum: {
      title: 'Gerador de Currículos',
      icon: FileText,
      description: 'Crie currículos profissionais com IA',
      color: 'from-blue-500 to-cyan-500'
    },
    'cover-letter': {
      title: 'Cartas de Apresentação',
      icon: Mail,
      description: 'Cartas personalizadas e impactantes',
      color: 'from-green-500 to-emerald-500'
    },
    'customer-service': {
      title: 'Atendimento ao Cliente',
      icon: MessageSquare,
      description: 'Respostas profissionais para seu negócio',
      color: 'from-purple-500 to-violet-500'
    },
    documents: {
      title: 'Documentos Inteligentes',
      icon: FileText,
      description: 'Contratos, recibos e outros documentos',
      color: 'from-orange-500 to-red-500'
    },
    bot: {
      title: 'Bot IA Universal',
      icon: Bot,
      description: 'Assistente inteligente para tudo',
      color: 'from-pink-500 to-purple-500'
    }
  };

  const currentGenerator = generators[type];
  const Icon = currentGenerator?.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await verificarERegistrarUso(user.uid);
      setLoading(true);

      let generatedContent;

      switch (type) {
        case 'curriculum':
          generatedContent = await aiService.generateCurriculum(formData);
          break;
        case 'cover-letter':
          generatedContent = await aiService.generateCoverLetter(formData);
          break;
        case 'customer-service':
          generatedContent = await aiService.generateCustomerResponse(formData);
          break;
        case 'documents':
          generatedContent = await aiService.generateDocument(formData);
          break;
        case 'bot':
          generatedContent = await aiService.chatBot(formData.message);
          break;
        default:
          throw new Error('Tipo de geração não suportado');
      }

      setResult(generatedContent);
      await incrementDailyUsage();

      if (userPlan?.plan !== 'free') {
        await addDoc(collection(db, 'history'), {
          userId: user.uid,
          type,
          input: formData,
          output: generatedContent,
          createdAt: new Date(),
        });
      }

      toast({
        title: "Conteúdo gerado com sucesso!",
        description: "Seu conteúdo está pronto para uso."
      });

    } catch (err) {
      toast({
        title: "Erro ao gerar conteúdo",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência."
    });
  };

  const exportToPDF = () => {
    if (userPlan?.plan === 'free') {
      toast({
        title: "Recurso Premium",
        description: "Exportação em PDF disponível apenas nos planos pagos.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Em desenvolvimento",
      description: "Exportação PDF estará disponível em breve."
    });
  };

  if (!currentGenerator) return <div>Gerador não encontrado</div>;

  return (
    <div className="space-y-6">
      {/* O restante da interface permanece igual, sem alterar componentes visuais */}
      {/* A parte de renderização do formulario e resultado você já tem e está correta */}
    </div>
  );
};

export default AIGenerator;
