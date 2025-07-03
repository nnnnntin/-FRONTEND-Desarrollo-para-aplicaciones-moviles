import { NavigationContainer } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import Pantallas from './routes/Pantallas';

import { desloguear, loguear } from './store/slices/authSlice';
import { store } from './store/store';

const AppContent = () => {
  const [isLogged, setIsLogged] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const verificarTokenYRedirigir = useCallback(async () => {
    const { token, isLoggedIn } = auth;

    if (isLoggedIn && !token) {
      try {
        await SecureStore.deleteItemAsync('isLogged');
        await SecureStore.deleteItemAsync('usuario');
        await SecureStore.deleteItemAsync('tipoUsuario');
      } catch (error) {
        console.error(error);
      }

      dispatch(desloguear());
      setIsLogged(false);

      return false;
    }

    return true;
  }, [auth, dispatch]);

  const handleSetIsLogged = useCallback(async (newLoginState) => {
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
          }
        } catch (error) {
          console.error(error);
        }
      }

      if (userData) {
        setIsLogged(true);
      } else {
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
            } else {
              setIsLogged(false);
            }
          } catch (error) {
            console.error(error);
            setIsLogged(false);
          }
        }, 500);
      }
    } else {
      setIsLogged(false);
    }
  }, [auth, dispatch]);

  const resetSession = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync('isLogged');
      await SecureStore.deleteItemAsync('usuario');
      await SecureStore.deleteItemAsync('tipoUsuario');
      dispatch(desloguear());
      setIsLogged(false);
    } catch (error) {
      console.error(error);
      setIsLogged(false);
    }
  }, [dispatch]);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const isLoggedStorage = await SecureStore.getItemAsync("isLogged");
        const usuarioStorage = await SecureStore.getItemAsync("usuario");
        const tipoUsuarioStorage = await SecureStore.getItemAsync("tipoUsuario");

        if (isLoggedStorage === 'true' && usuarioStorage) {
          try {
            const parsedUser = JSON.parse(usuarioStorage);

            if (!parsedUser.token) {
              await resetSession();
              return;
            }

            dispatch(loguear({
              usuario: parsedUser.usuario || parsedUser,
              tipoUsuario: tipoUsuarioStorage || parsedUser.tipoUsuario || parsedUser.usuario?.tipoUsuario,
              token: parsedUser.token
            }));
            setIsLogged(true);

          } catch (error) {
            console.error(error);
            await resetSession();
          }
        } else {
          setIsLogged(false);
        }
      } catch (error) {
        console.error(error);
        setIsLogged(false);
      } finally {
        setIsCheckingSession(false);
      }
    }

    verificarSesion();
  }, [dispatch, resetSession]);

  useEffect(() => {
    if (!isCheckingSession && auth.isLoggedIn) {
      verificarTokenYRedirigir();
    }
  }, [auth.token, auth.isLoggedIn, isCheckingSession, verificarTokenYRedirigir]);

  if (isCheckingSession) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Verificando sesión...</Text>
      </View>
    );
  }
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