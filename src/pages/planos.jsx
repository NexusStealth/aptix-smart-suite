import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function Planos() {
  const planos = [
    {
      nome: "Free",
      preco: "R$ 0",
      beneficios: [
        "Até 5 respostas por dia",
        "Acesso limitado à IA",
        "Suporte básico via e-mail",
      ],
      destaque: false,
      cor: "border-gray-400",
      link: null,
    },
    {
      nome: "Premium Mensal",
      preco: "R$ 10/mês",
      beneficios: [
        "Respostas ilimitadas",
        "IA com prioridade e mais recursos",
        "Suporte prioritário",
        "Atualizações exclusivas",
      ],
      destaque: true,
      cor: "border-yellow-500",
      link: "https://buy.stripe.com/7sYaEWb9a9RD45sfSBd7q00",
    },
    {
      nome: "Premium Anual",
      preco: "R$ 100/ano",
      beneficios: [
        "Respostas ilimitadas",
        "Acesso total por 12 meses",
        "Suporte prioritário",
        "Todas as atualizações inclusas",
      ],
      destaque: true,
      cor: "border-yellow-500",
      link: "https://buy.stripe.com/14AaEW7WY8NzeK6cGpd7q01",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Escolha seu plano
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {planos.map((plano) => (
          <Card
            key={plano.nome}
            className={`rounded-2xl p-4 border-2 ${plano.cor} shadow-lg`}
          >
            <CardContent>
              <h2 className="text-2xl font-semibold mb-2">
                {plano.nome}
                {plano.destaque && (
                  <span className="ml-2 inline-block text-yellow-500 font-bold">
                    ★
                  </span>
                )}
              </h2>
              <p className="text-xl mb-4">{plano.preco}</p>
              <ul className="space-y-2 mb-4">
                {plano.beneficios.map((beneficio, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    {beneficio}
                  </li>
                ))}
              </ul>
              {plano.link ? (
                <a
                  href={plano.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block"
                >
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                    Assinar agora
                  </Button>
                </a>
              ) : (
                <Button variant="outline" disabled className="w-full">
                  Plano Atual
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
              }
