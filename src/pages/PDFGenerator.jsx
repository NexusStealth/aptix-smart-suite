// src/pages/PDFGenerator.jsx
import { useState } from "react";
import axios from "axios";

export default function PDFGenerator() {
  const [conteudo, setConteudo] = useState("");
  const [link, setLink] = useState("");

  const gerarPDF = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/gerar-pdf`,
        { texto: conteudo },
        { responseType: "blob" }
      );

      const url = URL.createObjectURL(new Blob([res.data]));
      setLink(url);
    } catch (error) {
      alert("Erro ao gerar PDF.");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gerador de PDF</h1>
      <textarea
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        rows={6}
        className="w-full p-3 border rounded mb-4"
        placeholder="Digite o conteúdo do PDF..."
      />
      <button
        onClick={gerarPDF}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Gerar PDF
      </button>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-4 text-blue-600 underline"
        >
          Baixar PDF
        </a>
      )}
    </div>
  );
}
