import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { desloguear, loguear } from '../store/slices/usuarioSlice';

export type UserType = 'usuario' | 'cliente' | 'proveedor' | 'admin';

export interface AuthUser {
  id: number;
  email: string;
  nombre?: string;
  empresa?: string;
  servicio?: string;
  tipoUsuario: UserType;
}

export interface Membresia {
  id: string;
  nombre: string;
  activa: boolean;
  fechaInicio: string;
  fechaProximoPago: string;
}

export interface UserData {
  tipoUsuario: UserType;
  datosUsuario: AuthUser;
  oficinasPropias: number[];
  serviciosPropios: number[];
  membresia?: Membresia | null;
}

export interface AuthResult {
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
    tipoUsuario: UserType = 'usuario'
  ): Promise<AuthResult> => {
    if (isLoading) return { success: false, error: 'Login ya en progreso' };
    if (!email || !password) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return { success: false, error: 'Campos vacíos' };
    }

    setIsLoading(true);
    setHasError(false);
    try {
      await new Promise((r) => setTimeout(r, 1000));

      let datosUsuario: AuthUser;
      let oficinasPropias: number[] = [];
      let serviciosPropios: number[] = [];
      let membresia: Membresia | null = null;

      switch (tipoUsuario) {
        case 'usuario':
          datosUsuario = {
            id: 1,
            email,
            nombre: email.split('@')[0],
            tipoUsuario: 'usuario'
          };
          membresia = {
            id: 'basico',
            nombre: 'Básico',
            activa: true,
            fechaInicio: new Date().toISOString(),
            fechaProximoPago: new Date(Date.now() + 30*24*60*60*1000).toISOString()
          };
          break;

        case 'cliente':
          datosUsuario = {
            id: 2,
            email,
            nombre: email.split('@')[0],
            empresa: 'Mi Empresa',
            tipoUsuario: 'cliente'
          };
          oficinasPropias = [1,2];
          break;

        case 'proveedor':
          datosUsuario = {
            id: 3,
            email,
            nombre: email.split('@')[0],
            servicio: 'Servicios Profesionales',
            tipoUsuario: 'proveedor'
          };
          serviciosPropios = [1,2];
          break;

        case 'admin':
          datosUsuario = {
            id: 0,
            email,
            nombre: 'Administrador',
            tipoUsuario: 'admin'
          };
          break;

        default:
          throw new Error('Tipo de usuario no válido');
      }

      const userData: UserData = {
        tipoUsuario,
        datosUsuario,
        oficinasPropias,
        serviciosPropios,
        membresia
      };

      dispatch(loguear(userData));

      await SecureStore.setItemAsync('isLogged', 'true');
      await SecureStore.setItemAsync('usuario', JSON.stringify(userData));

      setIsLogged(true);
      Alert.alert('Éxito', `Inicio de sesión exitoso como ${tipoUsuario}`);
      return { success: true };

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error en login:', error);
      setHasError(true);
      dispatch(desloguear());
      setIsLogged(false);
      Alert.alert('Error', 'Error al iniciar sesión: ' + msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const autoLogin = async (tipoUsuario: UserType): Promise<AuthResult> => {
    if (isLoading) return { success: false, error: 'Login ya en progreso' };
    setIsLoading(true);
    setHasError(false);
    
    try {
      await new Promise((r) => setTimeout(r, 500));

      let datosUsuario: AuthUser;
      let oficinasPropias: number[] = [];
      let serviciosPropios: number[] = [];
      let membresia: Membresia | null = null;

      switch (tipoUsuario) {
        case 'usuario':
          datosUsuario = {
            id: 1,
            email: 'usuario@demo.com',
            nombre: 'Usuario Demo',
            tipoUsuario: 'usuario'
          };
          membresia = {
            id: 'premium',
            nombre: 'Premium',
            activa: true,
            fechaInicio: new Date().toISOString(),
            fechaProximoPago: new Date(Date.now() + 30*24*60*60*1000).toISOString()
          };
          break;

        case 'cliente':
          datosUsuario = {
            id: 2,
            email: 'cliente@demo.com',
            nombre: 'Cliente Demo',
            empresa: 'Demo Corp',
            tipoUsuario: 'cliente'
          };
          oficinasPropias = [1,2];
          break;

        case 'proveedor':
          datosUsuario = {
            id: 3,
            email: 'proveedor@demo.com',
            nombre: 'Proveedor Demo',
            servicio: 'Limpieza Profesional',
            tipoUsuario: 'proveedor'
          };
          serviciosPropios = [1,2];
          break;

        case 'admin':
          datosUsuario = {
            id: 0,
            email: 'admin@officereserve.com',
            nombre: 'Administrador Demo',
            tipoUsuario: 'admin'
          };
          break;
      }

      const userData: UserData = {
        tipoUsuario,
        datosUsuario,
        oficinasPropias,
        serviciosPropios,
        membresia
      };

      dispatch(loguear(userData));
      await SecureStore.setItemAsync('isLogged', 'true');
      await SecureStore.setItemAsync('usuario', JSON.stringify(userData));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setIsLogged(true);
      
      console.log(`✅ Auto login exitoso como ${tipoUsuario}`);
      return { success: true };

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error en autoLogin:', error);
      setHasError(true);
      dispatch(desloguear());
      setIsLogged(false);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<AuthResult> => {
    setIsLoading(true);
    setHasError(false);
    try {
      dispatch(desloguear());
      await SecureStore.deleteItemAsync('isLogged');
      await SecureStore.deleteItemAsync('usuario');
      setIsLogged(false);
      Alert.alert('Sesión cerrada', 'Has cerrado sesión exitosamente');
      return { success: true };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error en logout:', error);
      setHasError(true);
      setIsLogged(false);
      Alert.alert('Sesión cerrada', 'Sesión cerrada con errores: ' + msg);
      return { success: true, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const getUserData = async (): Promise<UserData | null> => {
    try {
      const raw = await SecureStore.getItemAsync('usuario');
      return raw ? (JSON.parse(raw) as UserData) : null;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  };

  return {
    login,
    autoLogin,
    logout,
    getUserData,
    isLoading,
    hasError
  };
}