
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para salvar/atualizar usuário no Firestore
  const saveUserToFirestore = async (firebaseUser) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Novo usuário - criar com plano gratuito
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email,
        photoURL: firebaseUser.photoURL || null,
        plan: 'free',
        planExpiry: null,
        dailyUsage: 0,
        dailyUsageReset: new Date().toDateString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(userRef, userData);
      setUserPlan(userData);
    } else {
      // Usuário existente - carregar dados
      const userData = userDoc.data();
      
      // Reset daily usage se for um novo dia
      const today = new Date().toDateString();
      if (userData.dailyUsageReset !== today) {
        userData.dailyUsage = 0;
        userData.dailyUsageReset = today;
        await setDoc(userRef, userData, { merge: true });
      }
      
      setUserPlan(userData);
    }
  };

  // Login com Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  // Logout
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserPlan(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  // Incrementar uso diário
  const incrementDailyUsage = async () => {
    if (!user || !userPlan) return false;
    
    const today = new Date().toDateString();
    let currentUsage = userPlan.dailyUsage || 0;
    
    // Reset se for um novo dia
    if (userPlan.dailyUsageReset !== today) {
      currentUsage = 0;
    }
    
    // Verificar limite do plano gratuito
    if (userPlan.plan === 'free' && currentUsage >= 5) {
      return false; // Limite atingido
    }
    
    // Incrementar uso
    const newUsage = currentUsage + 1;
    const userRef = doc(db, 'users', user.uid);
    const updatedData = {
      dailyUsage: newUsage,
      dailyUsageReset: today,
      updatedAt: new Date()
    };
    
    await setDoc(userRef, updatedData, { merge: true });
    setUserPlan(prev => ({ ...prev, ...updatedData }));
    
    return true;
  };

  // Verificar se pode usar recurso
  const canUseFeature = () => {
    if (!userPlan) return false;
    
    // Planos pagos têm uso ilimitado
    if (userPlan.plan === 'monthly' || userPlan.plan === 'yearly') {
      return true;
    }
    
    // Plano gratuito - verificar limite diário
    const today = new Date().toDateString();
    const usage = userPlan.dailyUsageReset === today ? userPlan.dailyUsage : 0;
    
    return usage < 5;
  };

  // Recarregar dados do usuário
  const refreshUserData = async () => {
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      setUserPlan(userDoc.data());
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await saveUserToFirestore(firebaseUser);
      } else {
        setUser(null);
        setUserPlan(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userPlan,
    loading,
    signInWithGoogle,
    signOut,
    incrementDailyUsage,
    canUseFeature,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
