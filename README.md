
# 🚀 Aptix - SaaS Inteligente

## Sobre o Projeto

O **Aptix** é uma plataforma SaaS completa e moderna que utiliza Inteligência Artificial para aumentar a produtividade dos usuários. Com design profissional e funcionalidades avançadas, oferece desde geração de currículos até controle financeiro pessoal.

## ✨ Funcionalidades Principais

### 🤖 Geradores de IA
- **Currículos Profissionais**: Crie currículos impressionantes com IA
- **Cartas de Apresentação**: Cartas personalizadas e impactantes
- **Atendimento ao Cliente**: Respostas profissionais para seu negócio
- **Documentos Inteligentes**: Contratos, recibos e outros documentos
- **Bot IA Universal**: Assistente inteligente para qualquer tarefa

### 💰 Finanças Pessoais
- Controle de receitas e despesas
- Categorização automática
- Relatórios detalhados
- Gráficos e estatísticas

### 🔐 Autenticação e Segurança
- Login com Google (Firebase Auth)
- Dados protegidos e criptografados
- Controle de acesso baseado em planos

### 💳 Sistema de Pagamentos
- **Plano Gratuito**: 5 usos por dia
- **Plano Mensal**: Uso ilimitado por R$ 29,90/mês
- **Plano Anual**: Uso ilimitado por R$ 19,90/mês (33% desconto)
- Integração completa com Stripe
- Portal do cliente para gerenciar assinaturas

### 📱 PWA (Progressive Web App)
- Instalável em dispositivos móveis
- Funciona offline
- Notificações push
- Interface responsiva

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** com Vite
- **TailwindCSS** para estilização
- **Shadcn/UI** para componentes
- **Firebase** para autenticação
- **React Router** para navegação

### Backend
- **Node.js** com Express
- **Stripe** para pagamentos
- **Firebase Admin** para gerenciamento

### IA e APIs
- **Groq API** com modelo Mixtral-8x7b
- Geração de conteúdo inteligente
- Respostas contextuais

### Banco de Dados
- **Firebase Firestore** para dados em tempo real
- Coleções otimizadas para performance

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ instalado
- Conta no Firebase
- Conta no Stripe
- Chave da API Groq

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/aptix.git
cd aptix
```

### 2. Configure o Frontend
```bash
# Instalar dependências
npm install

# Configurar Firebase
# Edite src/services/firebase.js com suas credenciais

# Configurar Groq API
# Edite src/services/aiService.js com sua chave da API
```

### 3. Configure o Backend
```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

### 4. Executar o projeto
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

## 📋 Configurações Necessárias

### Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative Authentication com Google
3. Configure Firestore Database
4. Baixe as credenciais e configure no projeto

### Stripe
1. Crie uma conta no [Stripe](https://stripe.com)
2. Configure produtos e preços
3. Configure webhooks para: `/api/stripe/webhook`
4. Eventos necessários:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`

### Groq API
1. Cadastre-se em [Groq](https://groq.com)
2. Obtenha sua chave da API
3. Configure no arquivo de serviços

## 📱 PWA Setup

O aplicativo já está configurado como PWA com:
- `manifest.json` configurado
- Service Worker ativo
- Ícones em múltiplos tamanhos
- Modo standalone

Para instalar:
1. Acesse o app no navegador
2. Clique em "Instalar" quando aparecer a opção
3. O app será instalado como aplicativo nativo

## 🎨 Design System

### Cores Principais
- **Primary**: #6366f1 (Indigo)
- **Secondary**: #8b5cf6 (Purple)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Orange)
- **Error**: #ef4444 (Red)

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700

### Componentes
- Design system consistente
- Componentes reutilizáveis
- Tema claro/escuro
- Animações suaves

## 📊 Estrutura do Banco de Dados

### Coleção: users
```javascript
{
  uid: string,
  email: string,
  name: string,
  photoURL: string,
  plan: 'free' | 'monthly' | 'yearly',
  planExpiry: timestamp,
  dailyUsage: number,
  dailyUsageReset: string,
  stripeCustomerId: string,
  subscriptionId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Coleção: history
```javascript
{
  userId: string,
  type: 'curriculum' | 'cover-letter' | 'customer-service' | 'documents' | 'bot',
  input: object,
  output: string,
  createdAt: timestamp
}
```

### Coleção: transactions
```javascript
{
  userId: string,
  type: 'income' | 'expense',
  amount: number,
  description: string,
  category: string,
  date: string,
  createdAt: timestamp
}
```

## 🔧 Scripts Disponíveis

### Frontend
- `npm run dev`: Desenvolvimento
- `npm run build`: Build para produção
- `npm run preview`: Preview da build

### Backend
- `npm run dev`: Desenvolvimento com nodemon
- `npm start`: Produção

## 📈 Roadmap

### Próximas Funcionalidades
- [ ] Exportação PDF dos documentos gerados
- [ ] Integrações com mais APIs de IA
- [ ] Dashboard de analytics avançado
- [ ] Sistema de templates personalizados
- [ ] API pública para desenvolvedores
- [ ] Modo colaborativo
- [ ] Integração com Google Drive/Dropbox

### Melhorias Técnicas
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Monitoramento e logs
- [ ] Cache inteligente
- [ ] Otimizações de performance

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- 📧 Email: suporte@aptix.com
- 💬 Discord: [Comunidade Aptix](https://discord.gg/aptix)
- 📖 Documentação: [docs.aptix.com](https://docs.aptix.com)

---

**Desenvolvido com ❤️ pela equipe Aptix**
