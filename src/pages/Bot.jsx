// src/pages/Bot.jsx
import { useState } from "react";
import axios from "axios";

export default function Bot() {
  const [mensagem, setMensagem] = useState("");
  const [resposta, setResposta] = useState("");
  const [carregando, setCarregando] = useState(false);

  const enviarPergunta = async () => {
    setCarregando(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/bot`, {
        prompt: mensagem,
      });
      setResposta(res.data.resposta);
    } catch (error) {
      setResposta("Erro ao buscar resposta.");
    }
    setCarregando(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chat com a IA</h1>
      <textarea
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        rows={5}
        className="w-full p-3 border rounded mb-4"
        placeholder="Digite sua pergunta..."
      />
      <button
        onClick={enviarPergunta}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Enviar
      </button>

      {carregando && <p className="mt-4">Carregando...</p>}
      {resposta && <p className="mt-4 bg-gray-100 p-3 rounded">{resposta}</p>}
    </div>
  );
        }
