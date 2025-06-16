import { useState } from 'react';
import { Alert } from 'react-native';

interface RecoveryResult {
  success: boolean;
  maskedEmail?: string;
  error?: string;
}

interface RecoveryFlowState {
  currentStep: number;
  isLoading: boolean;
  hasError: boolean;
}

export function useRecoveryFlow() {
  const [state, setState] = useState<RecoveryFlowState>({
    currentStep: 1,
    isLoading: false,
    hasError: false
  });

  const nextStep = (): void => {
    setState(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1,
      hasError: false
    }));
  };

  const resetFlow = (): void => {
    setState({
      currentStep: 1,
      isLoading: false,
      hasError: false
    });
  };

  const setStep = (step: number): void => {
    setState(prev => ({
      ...prev,
      currentStep: step,
      hasError: false
    }));
  };

  const sendVerificationCode = async (email: string): Promise<RecoveryResult> => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingrese un email válido');
      return { success: false, error: 'Email vacío' };
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, hasError: false }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const emailParts = email.split('@');
      const maskedEmail = emailParts.length === 2 
        ? `${email.substring(0, 2)}****@${emailParts[1]}` 
        : `${email.substring(0, 2)}****@gmail.com`;
      
      Alert.alert('Código enviado', `Se envió un código de seguridad a: ${maskedEmail}`);
      
      return { success: true, maskedEmail };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar código';
      console.error('❌ Error enviando código:', error);
      Alert.alert('Error', 'No se pudo enviar el código. Intente nuevamente.');
      
      setState(prev => ({ ...prev, hasError: true }));
      return { success: false, error: errorMessage };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const verifyCode = async (code: string): Promise<RecoveryResult> => {
    if (!code || code.length < 4) {
      Alert.alert('Error', 'Por favor ingrese un código válido');
      return { success: false, error: 'Código inválido' };
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, hasError: false }));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (code.length >= 4) {
        return { success: true };
      } else {
        Alert.alert('Error', 'Código inválido o expirado');
        setState(prev => ({ ...prev, hasError: true }));
        return { success: false, error: 'Código inválido' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al verificar código';
      console.error('❌ Error verificando código:', error);
      Alert.alert('Error', 'No se pudo verificar el código. Intente nuevamente.');
      
      setState(prev => ({ ...prev, hasError: true }));
      return { success: false, error: errorMessage };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updatePassword = async (newPassword: string, confirmPassword: string): Promise<RecoveryResult> => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return { success: false, error: 'Campos vacíos' };
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return { success: false, error: 'Contraseñas no coinciden' };
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return { success: false, error: 'Contraseña muy corta' };
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, hasError: false }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar contraseña';
      console.error('❌ Error actualizando contraseña:', error);
      Alert.alert('Error', 'No se pudo actualizar la contraseña. Intente nuevamente.');
      
      setState(prev => ({ ...prev, hasError: true }));
      return { success: false, error: errorMessage };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    currentStep: state.currentStep,
    isLoading: state.isLoading,
    hasError: state.hasError,
    nextStep,
    resetFlow,
    setStep,
    sendVerificationCode,
    verifyCode,
    updatePassword
  };
}