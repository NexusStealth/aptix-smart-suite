
// Serviço para integração com Groq API
// TODO: Configurar sua API key do Groq
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY'; // Substitua pela sua chave
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

class AIService {
  async generateContent(prompt, type = 'general') {
    try {
      const systemPrompts = {
        curriculum: `Você é um especialista em criação de currículos profissionais. 
                    Crie um currículo completo, bem estruturado e profissional baseado nas informações fornecidas.
                    Use formatação markdown para melhor apresentação.`,
        
        cover_letter: `Você é um especialista em cartas de apresentação. 
                      Crie uma carta profissional, persuasiva e personalizada baseada nas informações fornecidas.`,
        
        customer_service: `Você é um especialista em atendimento ao cliente. 
                          Crie respostas profissionais, empáticas e eficazes para situações de atendimento.`,
        
        documents: `Você é um especialista em documentos legais e comerciais. 
                   Crie documentos profissionais, claros e bem estruturados baseados no tipo solicitado.`,
        
        bot: `Você é um assistente IA inteligente e prestativo. 
              Responda de forma clara, precisa e útil a qualquer pergunta ou solicitação.`
      };

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: systemPrompts[type] || systemPrompts.bot
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      throw new Error('Falha ao gerar conteúdo. Tente novamente.');
    }
  }

  // Métodos específicos para cada tipo de geração
  async generateCurriculum(data) {
    const prompt = `
      Crie um currículo profissional com as seguintes informações:
      
      Nome: ${data.name}
      Email: ${data.email}
      Telefone: ${data.phone}
      Localização: ${data.location}
      
      Objetivo Profissional: ${data.objective}
      
      Experiências Profissionais: ${data.experience}
      
      Formação Acadêmica: ${data.education}
      
      Habilidades: ${data.skills}
      
      Idiomas: ${data.languages}
      
      Informações Adicionais: ${data.additional}
    `;
    
    return this.generateContent(prompt, 'curriculum');
  }

  async generateCoverLetter(data) {
    const prompt = `
      Crie uma carta de apresentação para:
      
      Nome: ${data.name}
      Empresa de destino: ${data.company}
      Cargo pretendido: ${data.position}
      
      Experiência relevante: ${data.experience}
      Motivação: ${data.motivation}
      
      Tom da carta: ${data.tone || 'profissional'}
    `;
    
    return this.generateContent(prompt, 'cover_letter');
  }

  async generateCustomerResponse(data) {
    const prompt = `
      Crie uma resposta profissional para atendimento ao cliente:
      
      Situação: ${data.situation}
      Contexto: ${data.context}
      Tom desejado: ${data.tone || 'profissional e empático'}
      
      Empresa: ${data.company || 'nossa empresa'}
    `;
    
    return this.generateContent(prompt, 'customer_service');
  }

  async generateDocument(data) {
    const prompt = `
      Crie um documento do tipo: ${data.type}
      
      Detalhes:
      ${data.details}
      
      Partes envolvidas: ${data.parties}
      Valor/Quantidade: ${data.amount}
      Data: ${data.date}
      
      Informações adicionais: ${data.additional}
    `;
    
    return this.generateContent(prompt, 'documents');
  }

  async chatBot(message) {
    return this.generateContent(message, 'bot');
  }
}

export default new AIService();
