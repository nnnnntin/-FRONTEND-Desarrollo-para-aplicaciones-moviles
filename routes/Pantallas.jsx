import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { desloguear, loguear } from '../store/slices/authSlice';
import Aplicacion from './Aplicacion';
import Pila from './Pila';

const Pantallas = ({ isLogged, setIsLogged, resetSession }) => {
  const [isInitializing, setIsInitializing] = useState(true);


  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
  const tipoUsuario = useSelector(state => state.auth.tipoUsuario);
  const usuario = useSelector(state => state.auth.usuario);
  const esAdmin = useSelector(state => state.auth.esAdmin);

  const dispatch = useDispatch();

  useEffect(() => {
    const verificarSesionGuardada = async () => {
      try {
        const sesionGuardada = await SecureStore.getItemAsync('isLogged');
        const usuarioGuardado = await SecureStore.getItemAsync('usuario');
        const tipoGuardado = await SecureStore.getItemAsync('tipoUsuario');

        if (sesionGuardada === 'true' && usuarioGuardado && tipoGuardado) {
          const datosUsuarioParseados = JSON.parse(usuarioGuardado);


          dispatch(loguear({
            usuario: datosUsuarioParseados,
            tipoUsuario: tipoGuardado,
            token: datosUsuarioParseados.token || null,
          }));

          setIsLogged(true);
        } else {
          setIsLogged(false);
        }
      } catch (error) {
        console.error(error);
        setIsLogged(false);
      } finally {
        setIsInitializing(false);
      }
    };

    if (isLogged === null) {
      verificarSesionGuardada();
    } else {
      setIsInitializing(false);
    }
  }, [dispatch, setIsLogged, isLogged]);


  useEffect(() => {
    if (isLoggedIn && !isLogged) {
      setIsLogged(true);


      const guardarSesion = async () => {
        try {
          await SecureStore.setItemAsync('isLogged', 'true');
          await SecureStore.setItemAsync('usuario', JSON.stringify(usuario));
          await SecureStore.setItemAsync('tipoUsuario', tipoUsuario || '');
        } catch (error) {
          console.error(error);
        }
      };

      if (usuario && tipoUsuario) {
        guardarSesion();
      }
    }
  }, [isLoggedIn, isLogged, setIsLogged, usuario, tipoUsuario]);

  const resetSessionComplete = async () => {
    try {
      dispatch(desloguear());
      await SecureStore.deleteItemAsync('isLogged');
      await SecureStore.deleteItemAsync('usuario');
      await SecureStore.deleteItemAsync('tipoUsuario');
      setIsLogged(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (isInitializing || isLogged === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Verificando sesión...</Text>
        {tipoUsuario && (
          <Text style={styles.loadingSubtext}>
            Cargando perfil de {tipoUsuario}...
            {esAdmin && ' (Administrador)'}
          </Text>
        )}
        {usuario?.nombre && (
          <Text style={styles.loadingUser}>
            Bienvenido, {usuario.nombre}
          </Text>
        )}
      </View>
    );
  }

  const shouldShowApp = isLoggedIn && (isLogged || isLoggedIn);

  return (
    <View style={styles.container}>
      {shouldShowApp ? (
        <Aplicacion
          setIsLogged={setIsLogged}
          resetSession={resetSession || resetSessionComplete}
        />
      ) : (
        <Pila
          setIsLogged={setIsLogged}
          resetSession={resetSessionComplete}
        />
      )}
    </View>
  );
};

export default Pantallas;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingUser: {
    fontSize: 16,
    color: '#27ae60',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  }
});