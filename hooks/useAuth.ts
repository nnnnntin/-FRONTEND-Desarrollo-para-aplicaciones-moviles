import { useState } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useDispatch } from 'react-redux';
import { loguear, desloguear } from '../store/slices/usuarioSlice';

interface AuthUser {
  email: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Custom hook para manejar autenticación de usuarios
 * Proporciona funciones para login, logout y estados de carga
 * 
 * @param setIsLogged - Función para actualizar el estado local de login
 * @returns Objeto con funciones de autenticación y estado de carga
 */
export function useAuth(setIsLogged: (isLogged: boolean) => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const dispatch = useDispatch();

  /**
   * Función para iniciar sesión
   * Valida credenciales y actualiza estados local y persistente
   * 
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña del usuario
   * @returns Promise con resultado de la operación
   */
  const login = async (email: string, password: string): Promise<AuthResult> => {
    if (isLoading) {
      return { success: false, error: 'Login ya en progreso' };
    }

    if (!email || !password) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return { success: false, error: 'Campos vacíos' };
    }

    try {
      setIsLoading(true);
      setHasError(false);

      if (email.length >= 1 && password.length >= 1) {
        dispatch(loguear());
        
        await SecureStore.setItemAsync('isLogged', 'true');
        await SecureStore.setItemAsync('usuario', JSON.stringify({ email } as AuthUser));
        
        setIsLogged(true);
        
        setTimeout(() => {
          Alert.alert('Éxito', 'Inicio de sesión exitoso');
        }, 300);
        
        return { success: true };
      } else {
        Alert.alert('Error', 'Credenciales inválidas');
        return { success: false, error: 'Credenciales inválidas' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error en login:', error);
      Alert.alert('Error', 'Error al iniciar sesión: ' + errorMessage);
      
      setHasError(true);
      dispatch(desloguear());
      setIsLogged(false);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Función para cerrar sesión
   * Limpia todos los estados y almacenamiento persistente
   * 
   * @returns Promise con resultado de la operación
   */
  const logout = async (): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      setHasError(false);
      dispatch(desloguear());
      
      try {
        await SecureStore.deleteItemAsync('isLogged');
        await SecureStore.deleteItemAsync('usuario');
      } catch (error) {
      }
      
      setIsLogged(false);
      
      Alert.alert('Sesión cerrada', 'Has cerrado sesión exitosamente');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      setHasError(true);
      dispatch(desloguear());
      setIsLogged(false);
      Alert.alert('Sesión cerrada', 'Sesión cerrada (con algunos errores menores)');
      return { success: true, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    logout,
    isLoading,
    hasError
  };
}