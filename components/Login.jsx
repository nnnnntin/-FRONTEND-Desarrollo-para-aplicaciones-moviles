import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { clearError, loginUsuario } from '../store/slices/authSlice';
import RestablecerContraseña from './RestablecerContraseña';
import RestablecerMail from './RestablecerMail';

const Login = ({ navigation, setIsLogged }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentView, setCurrentView] = useState('login');
  const [tipoUsuario, setTipoUsuario] = useState('usuario');

  const dispatch = useDispatch();

  const { loading, error, isLoggedIn } = useSelector(state => state.auth);


  useEffect(() => {
    if (isLoggedIn) {
      setIsLogged(true);
    }
  }, [isLoggedIn, setIsLogged]);


  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleLogin = async () => {
    console.log('🔴 HandleLogin iniciado');
    console.log('🔴 Email:', email);
    console.log('🔴 Password:', password);
    console.log('🔴 Loading state:', loading);

    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }


    const username = email;

    console.log('🔴 Despachando loginUsuario con:', { username, password });

    try {
      const result = await dispatch(loginUsuario({ username, password }));
      console.log('🔴 Resultado del dispatch:', result);


      if (loginUsuario.fulfilled.match(result)) {
        console.log('🟢 Login exitoso, navegando...');

      } else if (loginUsuario.rejected.match(result)) {
        console.log('🔴 Login falló:', result.payload);

      }
    } catch (error) {
      console.log('🔴 Error en dispatch:', error);
    }
  };

  const goToRegister = () => {
    if (loading) return;
    navigation.navigate('Registro');
  };

  const handleForgotPassword = () => {
    setCurrentView('forgotPassword');
  };

  const handleForgotEmail = () => {
    setCurrentView('forgotEmail');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
  };

  const handleRecoverySuccess = () => {
    setCurrentView('login');
    Alert.alert('Éxito', 'Proceso completado exitosamente');
  };

  if (currentView === 'forgotPassword') {
    return (
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Officereserve</Text>

            <RestablecerContraseña
              onBack={handleBackToLogin}
              onSuccess={handleRecoverySuccess}
              onForgotEmail={handleForgotEmail}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (currentView === 'forgotEmail') {
    return (
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Officereserve</Text>

            <RestablecerMail
              onBack={handleBackToLogin}
              onSuccess={handleRecoverySuccess}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Officereserve</Text>
          <Text style={styles.subtitle}>Iniciar sesión</Text>
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            style={[
              styles.input,
              loading && styles.inputDisabled
            ]}
            placeholder={tipoUsuario === 'administrador' ? "admin" : "Ingresa tu usuario"}
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="default"
            autoCapitalize="none"
            editable={!loading}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={[
              styles.input,
              loading && styles.inputDisabled
            ]}
            placeholder={tipoUsuario === 'administrador' ? "admin1212" : "Ingresa tu contraseña"}
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[
              styles.button,
              tipoUsuario === 'administrador' && styles.buttonAdmin,
              loading && styles.buttonDisabled
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'INGRESANDO...' : 'INGRESAR'}
            </Text>
          </TouchableOpacity>

          {tipoUsuario !== 'administrador' && (
            <View style={styles.registerContainer}>
              <TouchableOpacity
                onPress={handleForgotPassword}
                disabled={loading}
                style={styles.forgotButton}
              >
                <Text style={[
                  styles.forgotText,
                  loading && styles.linkDisabled
                ]}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>

              <Text style={styles.registerQuestion}>¿No tienes cuenta?</Text>
              <TouchableOpacity
                onPress={goToRegister}
                disabled={loading}
              >
                <Text style={[
                  styles.registerLink,
                  loading && styles.linkDisabled
                ]}>
                  Registrarse
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 20,
    fontFamily: 'System',
  },
  tipoUsuarioContainer: {
    width: '100%',
    marginBottom: 20,
  },
  tipoUsuarioLabel: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 10,
    fontWeight: '500',
    fontFamily: 'System',
  },
  tipoUsuarioButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  adminButtonContainer: {
    width: '100%',
  },
  tipoUsuarioButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    alignItems: 'center',
  },
  tipoUsuarioButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  adminButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    alignItems: 'center',
  },
  adminButtonActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  tipoUsuarioButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
    fontFamily: 'System',
  },
  tipoUsuarioButtonTextActive: {
    color: '#fff',
  },
  adminButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
    fontFamily: 'System',
  },
  adminButtonTextActive: {
    color: '#fff',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
    fontWeight: '500',
    fontFamily: 'System',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    fontSize: 16,
    fontFamily: 'System',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonAdmin: {
    backgroundColor: '#e74c3c',
    shadowColor: '#e74c3c',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'System',
  },
  forgotButton: {
    marginBottom: 10,
  },
  forgotText: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
  },
  registerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerQuestion: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
    fontFamily: 'System',
  },
  registerLink: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
    fontFamily: 'System',
  },
  linkDisabled: {
    color: '#9CA3AF',
  },
});

export default Login;