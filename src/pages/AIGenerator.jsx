
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileText, Mail, MessageSquare, Bot, Download, Copy, Wand2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import aiService from '../services/aiService';
import { doc, addDoc, collection } from 'firebase/firestore';
import { db } from '../services/firebase';

const AIGenerator = () => {
  const { type } = useParams();
  const { user, userPlan, canUseFeature, incrementDailyUsage } = useAuth();
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
    
    if (!canUseFeature()) {
      toast({
        title: "Limite atingido",
        description: "Você atingiu o limite diário do plano gratuito. Faça upgrade para uso ilimitado.",
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
      
      // Incrementar uso diário
      await incrementDailyUsage();
      
      // Salvar no histórico (apenas para planos pagos)
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
    
    // TODO: Implementar exportação PDF
    toast({
      title: "Em desenvolvimento",
      description: "Exportação PDF estará disponível em breve.",
    });
  };

  if (!currentGenerator) {
    return <div>Gerador não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${currentGenerator.color} flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{currentGenerator.title}</h1>
          <p className="text-muted-foreground">{currentGenerator.description}</p>
        </div>
      </div>

      {/* Usage Warning for Free Users */}
      {userPlan?.plan === 'free' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Usos restantes hoje: {5 - (userPlan?.dailyUsage || 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Faça upgrade para uso ilimitado
                </p>
              </div>
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Plano Gratuito
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
            <CardDescription>
              Preencha as informações para gerar seu conteúdo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {type === 'curriculum' && (
                <CurriculumForm formData={formData} setFormData={setFormData} />
              )}
              {type === 'cover-letter' && (
                <CoverLetterForm formData={formData} setFormData={setFormData} />
              )}
              {type === 'customer-service' && (
                <CustomerServiceForm formData={formData} setFormData={setFormData} />
              )}
              {type === 'documents' && (
                <DocumentsForm formData={formData} setFormData={setFormData} />
              )}
              {type === 'bot' && (
                <BotForm formData={formData} setFormData={setFormData} />
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !canUseFeature()}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Gerar com IA
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Resultado</CardTitle>
                <CardDescription>
                  Seu conteúdo gerado aparecerá aqui
                </CardDescription>
              </div>
              {result && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToPDF}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {result}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Preencha o formulário e clique em "Gerar com IA"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Forms Components
const CurriculumForm = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="João Silva"
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="joao@email.com"
        />
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          value={formData.phone || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="(11) 99999-9999"
        />
      </div>
      <div>
        <Label htmlFor="location">Localização</Label>
        <Input
          id="location"
          value={formData.location || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="São Paulo, SP"
        />
      </div>
    </div>

    <div>
      <Label htmlFor="objective">Objetivo Profissional</Label>
      <Textarea
        id="objective"
        value={formData.objective || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
        placeholder="Descreva seu objetivo profissional..."
        rows={3}
      />
    </div>

    <div>
      <Label htmlFor="experience">Experiência Profissional</Label>
      <Textarea
        id="experience"
        value={formData.experience || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
        placeholder="Liste suas experiências profissionais..."
        rows={4}
      />
    </div>

    <div>
      <Label htmlFor="education">Formação Acadêmica</Label>
      <Textarea
        id="education"
        value={formData.education || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
        placeholder="Liste sua formação acadêmica..."
        rows={3}
      />
    </div>

    <div>
      <Label htmlFor="skills">Habilidades</Label>
      <Textarea
        id="skills"
        value={formData.skills || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
        placeholder="Liste suas habilidades técnicas e interpessoais..."
        rows={3}
      />
    </div>
  </div>
);

const CoverLetterForm = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="name">Seu Nome</Label>
      <Input
        id="name"
        value={formData.name || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="João Silva"
      />
    </div>
    
    <div>
      <Label htmlFor="company">Empresa</Label>
      <Input
        id="company"
        value={formData.company || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
        placeholder="Nome da empresa"
      />
    </div>
    
    <div>
      <Label htmlFor="position">Cargo Pretendido</Label>
      <Input
        id="position"
        value={formData.position || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
        placeholder="Desenvolvedor Frontend"
      />
    </div>

    <div>
      <Label htmlFor="experience">Experiência Relevante</Label>
      <Textarea
        id="experience"
        value={formData.experience || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
        placeholder="Descreva sua experiência relevante para a vaga..."
        rows={4}
      />
    </div>

    <div>
      <Label htmlFor="motivation">Motivação</Label>
      <Textarea
        id="motivation"
        value={formData.motivation || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
        placeholder="Por que você quer trabalhar nesta empresa?"
        rows={3}
      />
    </div>
  </div>
);

const CustomerServiceForm = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="situation">Situação do Cliente</Label>
      <Textarea
        id="situation"
        value={formData.situation || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, situation: e.target.value }))}
        placeholder="Descreva a situação ou problema do cliente..."
        rows={4}
      />
    </div>

    <div>
      <Label htmlFor="context">Contexto Adicional</Label>
      <Textarea
        id="context"
        value={formData.context || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
        placeholder="Informações adicionais sobre o contexto..."
        rows={3}
      />
    </div>

    <div>
      <Label htmlFor="company">Nome da Empresa</Label>
      <Input
        id="company"
        value={formData.company || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
        placeholder="Sua empresa"
      />
    </div>

    <div>
      <Label htmlFor="tone">Tom da Resposta</Label>
      <select
        className="w-full p-2 border rounded-md"
        value={formData.tone || 'profissional'}
        onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
      >
        <option value="profissional">Profissional</option>
        <option value="empático">Empático</option>
        <option value="formal">Formal</option>
        <option value="casual">Casual</option>
      </select>
    </div>
  </div>
);

const DocumentsForm = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="type">Tipo de Documento</Label>
      <select
        className="w-full p-2 border rounded-md"
        value={formData.type || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
      >
        <option value="">Selecione o tipo</option>
        <option value="contrato">Contrato</option>
        <option value="recibo">Recibo</option>
        <option value="proposta">Proposta Comercial</option>
        <option value="ata">Ata de Reunião</option>
        <option value="termo">Termo de Uso</option>
      </select>
    </div>

    <div>
      <Label htmlFor="details">Detalhes do Documento</Label>
      <Textarea
        id="details"
        value={formData.details || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
        placeholder="Descreva os detalhes específicos do documento..."
        rows={5}
      />
    </div>

    <div>
      <Label htmlFor="parties">Partes Envolvidas</Label>
      <Input
        id="parties"
        value={formData.parties || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, parties: e.target.value }))}
        placeholder="Nome das partes envolvidas"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="amount">Valor/Quantidade</Label>
        <Input
          id="amount"
          value={formData.amount || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          placeholder="R$ 1.000,00"
        />
      </div>
      <div>
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          type="date"
          value={formData.date || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
        />
      </div>
    </div>
  </div>
);

const BotForm = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="message">Sua Pergunta ou Solicitação</Label>
      <Textarea
        id="message"
        value={formData.message || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
        placeholder="Faça qualquer pergunta ou solicitação..."
        rows={6}
      />
    </div>
    <p className="text-sm text-muted-foreground">
      💡 Dica: Seja específico para obter melhores resultados. 
      Você pode pedir ajuda com textos, ideias, traduções, códigos e muito mais!
    </p>
  </div>
);

export default AIGenerator;
