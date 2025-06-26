import { NavigationContainer } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import Pantallas from './routes/Pantallas';

import { loguear } from './store/slices/authSlice';
import { store } from './store/store';

const AppContent = () => {
  const [isLogged, setIsLogged] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleSetIsLogged = useCallback(async (newLoginState) => {
    console.log(`🔄 Cambiando estado de login a: ${newLoginState}`);

    if (newLoginState) {

      let userData = auth?.usuario;

      if (!userData) {
        try {
          const storedUser = await SecureStore.getItemAsync('usuario');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);

            dispatch(loguear({
              usuario: parsedUser.usuario || parsedUser,
              tipoUsuario: parsedUser.tipoUsuario || parsedUser.usuario?.tipoUsuario,
              token: parsedUser.token
            }));
            userData = parsedUser.usuario || parsedUser;
            console.log(`🔄 Datos de usuario cargados desde storage`);
          }
        } catch (error) {
          console.error('Error cargando datos de usuario:', error);
        }
      }

      if (userData) {
        setIsLogged(true);
        console.log(`✅ Login confirmado para: ${userData.tipoUsuario}`);
      } else {
        console.log(`⏳ Esperando datos de usuario...`);
        setTimeout(async () => {
          try {
            const storedUser = await SecureStore.getItemAsync('usuario');
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);

              dispatch(loguear({
                usuario: parsedUser.usuario || parsedUser,
                tipoUsuario: parsedUser.tipoUsuario || parsedUser.usuario?.tipoUsuario,
                token: parsedUser.token
              }));
              setIsLogged(true);
              console.log(`✅ Login confirmado después de espera`);
            } else {
              console.log(`❌ No se encontraron datos de usuario válidos`);
              setIsLogged(false);
            }
          } catch (error) {
            console.error('Error en verificación tardía:', error);
            setIsLogged(false);
          }
        }, 500);
      }
    } else {
      setIsLogged(false);
      console.log(`✅ Logout confirmado`);
    }
  }, [auth, dispatch]);

  const resetSession = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync('isLogged');
      await SecureStore.deleteItemAsync('usuario');
      await SecureStore.deleteItemAsync('tipoUsuario');
      setIsLogged(false);
      console.log(`🔄 Sesión reseteada completamente`);
    } catch (error) {
      console.error('Error reseteando sesión:', error);
      setIsLogged(false);
    }
  }, []);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        console.log('🔍 Verificando sesión existente...');
        const isLoggedStorage = await SecureStore.getItemAsync("isLogged");
        const usuarioStorage = await SecureStore.getItemAsync("usuario");
        const tipoUsuarioStorage = await SecureStore.getItemAsync("tipoUsuario");

        if (isLoggedStorage === 'true' && usuarioStorage) {
          try {
            const parsedUser = JSON.parse(usuarioStorage);

            dispatch(loguear({
              usuario: parsedUser.usuario || parsedUser,
              tipoUsuario: tipoUsuarioStorage || parsedUser.tipoUsuario || parsedUser.usuario?.tipoUsuario,
              token: parsedUser.token
            }));
            setIsLogged(true);

            console.log(`✅ Sesión existente encontrada: ${tipoUsuarioStorage || parsedUser.usuario?.tipoUsuario}`);
          } catch (parseError) {
            console.error('Error parseando datos de usuario:', parseError);
            setIsLogged(false);
          }
        } else {
          console.log('ℹ️ No hay sesión activa');
          setIsLogged(false);
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
        setIsLogged(false);
      } finally {
        setIsCheckingSession(false);
      }
    }

    verificarSesion();
  }, [dispatch]);

  if (isCheckingSession) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Verificando sesión...</Text>
      </View>
    );
  }

  console.log('🔍 Estado actual:', {
    isLogged,

    hasUserData: !!auth?.usuario,
    userType: auth?.usuario?.tipoUsuario || auth?.tipoUsuario
  });

  return (
    <NavigationContainer>
      <Pantallas
        isLogged={isLogged}
        setIsLogged={handleSetIsLogged}
        resetSession={resetSession}
      />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <StatusBar barStyle="dark-content" backgroundColor="#77ccdd" />
      <AppContent />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});