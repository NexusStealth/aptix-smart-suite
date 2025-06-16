
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Search, 
  FileText, 
  Mail, 
  MessageSquare, 
  Bot, 
  Calendar,
  Copy,
  Trash2,
  Crown
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../services/firebase';

const History = () => {
  const { user, userPlan } = useAuth();
  const { toast } = useToast();
  
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const typeIcons = {
    curriculum: FileText,
    'cover-letter': Mail,
    'customer-service': MessageSquare,
    documents: FileText,
    bot: Bot
  };

  const typeLabels = {
    curriculum: 'Currículo',
    'cover-letter': 'Carta de Apresentação',
    'customer-service': 'Atendimento',
    documents: 'Documento',
    bot: 'Bot IA'
  };

  // Carregar histórico
  const loadHistory = async () => {
    if (userPlan?.plan === 'free') {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'history'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const historyData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setHistory(historyData);
      setFilteredHistory(historyData);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, userPlan]);

  // Filtrar histórico
  useEffect(() => {
    let filtered = history;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.output.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(item.input).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    setFilteredHistory(filtered);
  }, [history, searchTerm, filterType]);

  // Copiar para área de transferência
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência.",
    });
  };

  // Remover item do histórico
  const removeItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'history', id));
      setHistory(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Item removido!",
        description: "O item foi excluído do histórico.",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Plano gratuito - não tem histórico
  if (userPlan?.plan === 'free') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Histórico</h1>
          <p className="text-muted-foreground">
            Acesse todo o seu histórico de gerações de IA
          </p>
        </div>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Crown className="h-12 w-12 mx-auto text-orange-600" />
              <div>
                <h3 className="font-semibold text-lg">Recurso Premium</h3>
                <p className="text-muted-foreground">
                  O histórico está disponível apenas nos planos pagos.
                </p>
              </div>
              <Button asChild>
                <a href="/pricing">Fazer Upgrade</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Histórico</h1>
        <p className="text-muted-foreground">
          Todo o seu histórico de gerações de IA em um só lugar
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar no histórico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <select
                className="w-full md:w-48 p-2 border rounded-md"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Todos os tipos</option>
                <option value="curriculum">Currículos</option>
                <option value="cover-letter">Cartas</option>
                <option value="customer-service">Atendimento</option>
                <option value="documents">Documentos</option>
                <option value="bot">Bot IA</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista do Histórico */}
      {filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum item encontrado no histórico</p>
              <p className="text-sm">
                {searchTerm || filterType !== 'all' 
                  ? 'Tente ajustar os filtros'
                  : 'Comece gerando conteúdo com IA'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => {
            const Icon = typeIcons[item.type];
            const typeLabel = typeLabels[item.type];
            
            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{typeLabel}</CardTitle>
                        <CardDescription>
                          {item.createdAt?.toDate().toLocaleString('pt-BR') || 'Data não disponível'}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(item.output)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Input Summary */}
                  {item.input && Object.keys(item.input).length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                        Dados de entrada:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(item.input).map(([key, value]) => {
                          if (!value || typeof value !== 'string') return null;
                          const truncatedValue = value.length > 50 ? `${value.substring(0, 50)}...` : value;
                          return (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {truncatedValue}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Output */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Resultado:</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm max-h-40 overflow-y-auto">
                        {item.output.length > 500 
                          ? `${item.output.substring(0, 500)}...` 
                          : item.output
                        }
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
