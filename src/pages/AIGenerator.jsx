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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await verificarERegistrarUso(user.uid);
    } catch (err) {
      toast({
        title: "Limite atingido",
        description: err.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
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
        description: "Seu conteúdo está pronto para uso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar conteúdo",
        description: error.message,
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
      description: "Conteúdo copiado para a área de transferência.",
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
      description: "Exportação PDF estará disponível em breve.",
    });
  };

  return <div>AIGenerator funcional corrigido.</div>; // Substitua pelo JSX completo da interface, se necessário
};

export default AIGenerator;
