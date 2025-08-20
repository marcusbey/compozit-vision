import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { useUserStore } from './src/stores/userStore';

export default function App() {
  const { initializeAuth } = useUserStore();

  useEffect(() => {
    // Initialiser l'authentification au démarrage de l'app
    const unsubscribe = initializeAuth();
    
    // Nettoyer le listener lors du démontage du composant
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}
