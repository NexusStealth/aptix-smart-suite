import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db, provider } from "../services/firebase"; // Ajuste o caminho se necessário
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// ...

const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Referência ao documento do usuário
  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);

  // Se não existir, criar
  if (!docSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      nome: user.displayName || "Usuário",
      email: user.email,
      plano: "free",
      assinaturaAtiva: false,
      criadoEm: serverTimestamp()
    });
    console.log("✅ Novo usuário salvo no Firestore");
  } else {
    console.log("ℹ️ Usuário já existe no Firestore");
  }
};
