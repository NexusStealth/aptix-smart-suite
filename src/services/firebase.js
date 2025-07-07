
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBXOkx58VX_reKBdUAVQ8xTtJoNr0TPVsM",
  authDomain: "aptix-80019.firebaseapp.com",
  projectId: "aptix-80019",
  storageBucket: "aptix-80019.appspot.com",
  messagingSenderId: "1013152306674",
  appId: "1:1013152306674:web:34a6506d662baf68ec476b",
  measurementId: "G-SXWSL2SBTT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Configurar o provider do Google
provider.setCustomParameters({
  prompt: 'select_account'
});
