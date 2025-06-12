import { NavigationContainer } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import Pantallas from './routes/Pantallas';
import { store } from './store/store';

export default function App() {
  const [isLogged, setIsLogged] = useState(null);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const isLoggedStorage = await SecureStore.getItemAsync("isLogged");
        console.log('🔍 App - Verificando sesión storage:', isLoggedStorage);
        
        if (isLoggedStorage === 'true') {
          setIsLogged(true);
          console.log('✅ App - Usuario logueado encontrado');
        } else {
          setIsLogged(false);
          console.log('❌ App - No hay sesión guardada');
        }
      } catch (error) { 
        console.error("❌ App - Error al verificar la sesión:", error);
        setIsLogged(false);
      }
    }
    
    verificarSesion();
  }, []);

  const resetSession = async () => {
    try {
      await SecureStore.deleteItemAsync('isLogged');
      await SecureStore.deleteItemAsync('usuario');
      setIsLogged(false);
      console.log('🔄 App - Sesión reseteada');
    } catch (error) {
      console.error('❌ App - Error al resetear sesión:', error);
    }
  };

  return (
    <Provider store={store}>
      <StatusBar barStyle="dark-content" backgroundColor="#77ccdd" />
      <NavigationContainer>
        <Pantallas 
          isLogged={isLogged} 
          setIsLogged={setIsLogged}
          resetSession={resetSession}
        />
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 60,
  },
});