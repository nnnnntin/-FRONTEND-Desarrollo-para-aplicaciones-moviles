import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { desloguear, loguear } from '../store/slices/usuarioSlice';
import Aplicacion from './Aplicacion';
import Pila from './Pila';

const Pantallas = ({ isLogged, setIsLogged, resetSession }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const isLoggedIn = useSelector(state => state.usuario.isLoggedIn);
  const tipoUsuario = useSelector(state => state.usuario.tipoUsuario);
  const datosUsuario = useSelector(state => state.usuario.datosUsuario);
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
            tipoUsuario: tipoGuardado,
            datosUsuario: datosUsuarioParseados,
            oficinasPropias: datosUsuarioParseados.oficinasPropias || [],
            serviciosOfrecidos: datosUsuarioParseados.serviciosOfrecidos || [],
            serviciosContratados: datosUsuarioParseados.serviciosContratados || [],
            membresia: datosUsuarioParseados.membresia || null
          }));
          
          setIsLogged(true);
        } else {
          setIsLogged(false);
        }
      } catch (error) {
        console.error('Error al verificar sesión guardada:', error);
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
    if (isLogged === false && isLoggedIn) {
      dispatch(desloguear());
    }
  }, [isLogged, isLoggedIn, dispatch]);

  const resetSessionComplete = async () => {
    try {
      await SecureStore.deleteItemAsync('isLogged');
      await SecureStore.deleteItemAsync('usuario');
      await SecureStore.deleteItemAsync('tipoUsuario');
      dispatch(desloguear());
      setIsLogged(false);
    } catch (error) {
      console.error('Error al resetear sesión completa:', error);
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
          </Text>
        )}
        {datosUsuario?.nombre && (
          <Text style={styles.loadingUser}>
            Bienvenido, {datosUsuario.nombre}
          </Text>
        )}
      </View>
    );
  }

  const shouldShowApp = isLogged && isLoggedIn;

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