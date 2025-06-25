// src/utils/usoDiario.js

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export async function verificarERegistrarUso(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    throw new Error("Usuário não encontrado.");
  }

  const data = snap.data();
  const plano = data.plano || "free";
  const hoje = new Date().toISOString().split("T")[0];

  // inicializa usoDiario se não existir
  const uso = data.usoDiario || { data: hoje, contador: 0 };

  // se mudou de dia, reseta contador
  if (uso.data !== hoje) {
    await updateDoc(userRef, {
      "usoDiario.data": hoje,
      "usoDiario.contador": 1
    });
    return true;
  }

  // se free e já usou 5x, bloqueia  
  if (plano === "free" && uso.contador >= 5) {
    throw new Error("Limite diário de 5 usos atingido no plano gratuito.");
  }

  // senão, incrementa contador
  await updateDoc(userRef, {
    "usoDiario.contador": uso.contador + 1
  });
  return true;
    }
