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
        
        if (isLoggedStorage === 'true') {
          setIsLogged(true);
        } else {
          setIsLogged(false);
        }
      } catch (error) { 
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
    } catch (error) {
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