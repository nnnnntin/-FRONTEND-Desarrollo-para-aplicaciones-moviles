import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { desloguear, loguear } from '../store/slices/usuarioSlice';

interface AuthUser {
  email: string;
  nombre?: string;
  empresa?: string;
}

interface UserData {
  tipoUsuario: 'usuario' | 'cliente';
  datosUsuario: AuthUser;
  oficinasPropias: number[];
}

interface AuthResult {
  success: boolean;
  error?: string;
}

export function useAuth(setIsLogged: (isLogged: boolean) => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const dispatch = useDispatch();

  const login = async (
    email: string, 
    password: string, 
    tipoUsuario: string = 'usuario'
  ): Promise<AuthResult> => {
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
        let oficinasPropias: number[] = [];
        if (tipoUsuario === 'cliente') {
          oficinasPropias = [1, 2];
        }

        const userData: UserData = {
          tipoUsuario: tipoUsuario as 'usuario' | 'cliente',
          datosUsuario: { 
            email, 
            nombre: email.split('@')[0],
            empresa: tipoUsuario === 'cliente' ? 'Mi Empresa' : undefined
          },
          oficinasPropias
        };

        dispatch(loguear(userData));
        
        await SecureStore.setItemAsync('isLogged', 'true');
        await SecureStore.setItemAsync('usuario', JSON.stringify(userData));
        
        setIsLogged(true);
        
        setTimeout(() => {
          Alert.alert('Éxito', `Inicio de sesión exitoso como ${tipoUsuario}`);
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

  const autoLogin = async (asClient: boolean = false): Promise<AuthResult> => {
    if (isLoading) {
      return { success: false, error: 'Login ya en progreso' };
    }
    
    try {
      setIsLoading(true);
      setHasError(false);
      
      const userData: UserData = {
        tipoUsuario: asClient ? 'cliente' : 'usuario',
        datosUsuario: { 
          email: asClient ? 'cliente@test.com' : 'dev@test.com',
          nombre: asClient ? 'Cliente Demo' : 'Usuario Demo',
          empresa: asClient ? 'Empresa Demo' : undefined
        },
        oficinasPropias: asClient ? [1, 2] : []
      };

      dispatch(loguear(userData));
      
      await SecureStore.setItemAsync('isLogged', 'true');
      await SecureStore.setItemAsync('usuario', JSON.stringify(userData));
      setIsLogged(true);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setHasError(true);
      dispatch(desloguear());
      setIsLogged(false);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      setHasError(false);
      dispatch(desloguear());
      
      await SecureStore.deleteItemAsync('isLogged');
      await SecureStore.deleteItemAsync('usuario');
      
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

  const getUserData = async (): Promise<UserData | null> => {
    try {
      const userData = await SecureStore.getItemAsync('usuario');
      if (userData) {
        return JSON.parse(userData) as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  };

  return {
    login,
    logout,
    autoLogin,
    getUserData,
    isLoading,
    hasError
  };
}