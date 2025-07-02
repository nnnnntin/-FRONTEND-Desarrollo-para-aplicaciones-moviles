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
import * as yup from 'yup';

import { clearError, loginUsuario } from '../store/slices/authSlice';
import RestablecerContraseña from './RestablecerContraseña';

const loginSchema = yup.object({
  email: yup
    .string()
    .required('El usuario es obligatorio')
    .test('email-or-username', 'Usuario inválido', function(value) {
      if (!value) return false;
      
      if (value.includes('@')) {
        return yup.string().email('Email inválido').isValidSync(value);
      }
      
      return yup.string()
        .min(3, 'El usuario debe tener al menos 3 caracteres')
        .max(50, 'El usuario no puede exceder los 50 caracteres')
        .matches(/^[a-zA-Z0-9_.-]+$/, 'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos')
        .isValidSync(value);
    })
    .trim(),

  password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder los 100 caracteres'),

  tipoUsuario: yup
    .string()
    .required('El tipo de usuario es obligatorio')
    .test('tipo-usuario-valido', 'Tipo de usuario inválido', function(value) {
      const tiposValidos = ['usuario', 'cliente', 'proveedor', 'administrador'];
      return tiposValidos.includes(value);
    })
});

const adminLoginSchema = yup.object({
  email: yup
    .string()
    .required('El usuario administrador es obligatorio')
    .test('admin-user-valido', 'Usuario de administrador inválido', function(value) {
      return value === 'admin';
    }),

  password: yup
    .string()
    .required('La contraseña de administrador es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),

  tipoUsuario: yup
    .string()
    .test('tipo-admin-valido', 'Debe ser tipo administrador', function(value) {
      return value === 'administrador';
    })
});

const Login = ({ navigation, setIsLogged }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentView, setCurrentView] = useState('login');
  const [tipoUsuario, setTipoUsuario] = useState('usuario');
  const [errores, setErrores] = useState({});
  const [validacionEnCurso, setValidacionEnCurso] = useState(false);

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

  const validarCampo = async (campo, valor) => {
    try {
      const schema = tipoUsuario === 'administrador' ? adminLoginSchema : loginSchema;
      const datosCompletos = {
        email: campo === 'email' ? valor : email,
        password: campo === 'password' ? valor : password,
        tipoUsuario: tipoUsuario
      };

      await schema.validateAt(campo, datosCompletos);
      
      setErrores(prev => ({
        ...prev,
        [campo]: null
      }));
      
      return true;
    } catch (error) {
      setErrores(prev => ({
        ...prev,
        [campo]: error.message
      }));
      
      return false;
    }
  };

  const validarFormulario = async () => {
    setValidacionEnCurso(true);
    
    try {
      const schema = tipoUsuario === 'administrador' ? adminLoginSchema : loginSchema;
      const datosValidacion = {
        email: email.trim(),
        password: password,
        tipoUsuario: tipoUsuario
      };

      await schema.validate(datosValidacion, { abortEarly: false });
      
      setErrores({});
      setValidacionEnCurso(false);
      return true;
      
    } catch (error) {
      const nuevosErrores = {};
      
      if (error.inner) {
        error.inner.forEach(err => {
          nuevosErrores[err.path] = err.message;
        });
      } else {
        nuevosErrores.general = error.message;
      }
      
      setErrores(nuevosErrores);
      setValidacionEnCurso(false);
      return false;
    }
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    
    setTimeout(() => {
      validarCampo('email', text);
    }, 500);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    
    setTimeout(() => {
      validarCampo('password', text);
    }, 500);
  };

  const handleLogin = async () => {
    const esValido = await validarFormulario();
    
    if (!esValido) {
      const erroresTexto = Object.values(errores)
        .filter(error => error)
        .join('\n');
      
      Alert.alert('Datos incorrectos', erroresTexto || 'Por favor corrige los errores antes de continuar');
      return;
    }

    const username = email.trim();

    try {
      const result = await dispatch(loginUsuario({ username, password }));

      if (loginUsuario.fulfilled.match(result)) {
        setErrores({});
      } else if (loginUsuario.rejected.match(result)) {
      }
    } catch (error) {
      console.error('Error en login:', error);
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

  const getError = (campo) => {
    return errores[campo];
  };

  const tieneErrores = Object.values(errores).some(error => error);
  const formularioValido = !tieneErrores && email && password;

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
            
            <View style={styles.forgotEmailContainer}>
              <Text style={styles.forgotEmailTitle}>¿Olvidaste tu email?</Text>
              <Text style={styles.forgotEmailText}>
                Contacta a nuestro soporte para recuperar tu cuenta:
              </Text>
              <Text style={styles.forgotEmailContact}>soporte@officereserve.com</Text>
              
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackToLogin}
              >
                <Text style={styles.backButtonText}>Volver al login</Text>
              </TouchableOpacity>
            </View>
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

          {/* Mostrar errores generales */}
          {errores.general && (
            <View style={styles.errorAlert}>
              <Text style={styles.errorAlertText}>{errores.general}</Text>
            </View>
          )}

          <Text style={styles.label}>Usuario</Text>
          <TextInput
            style={[
              styles.input,
              loading && styles.inputDisabled,
              getError('email') && styles.inputError
            ]}
            placeholder={tipoUsuario === 'administrador' ? "admin" : "Ingresa tu usuario o email"}
            placeholderTextColor="#999"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="default"
            autoCapitalize="none"
            editable={!loading}
            maxLength={50}
          />
          {getError('email') && <Text style={styles.errorText}>{getError('email')}</Text>}

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={[
              styles.input,
              loading && styles.inputDisabled,
              getError('password') && styles.inputError
            ]}
            placeholder={tipoUsuario === 'administrador' ? "admin1212" : "Ingresa tu contraseña"}
            placeholderTextColor="#999"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            editable={!loading}
            maxLength={100}
          />
          {getError('password') && <Text style={styles.errorText}>{getError('password')}</Text>}

          <TouchableOpacity
            style={[
              styles.button,
              tipoUsuario === 'administrador' && styles.buttonAdmin,
              (loading || validacionEnCurso) && styles.buttonDisabled
            ]}
            onPress={handleLogin}
            disabled={loading || validacionEnCurso}
          >
            <Text style={styles.buttonText}>
              {loading ? 'INGRESANDO...' : 
               validacionEnCurso ? 'VALIDANDO...' : 
               'INGRESAR'}
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

  errorAlert: {
    backgroundColor: '#ffeaea',
    borderColor: '#e74c3c',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  errorAlertText: {
    fontSize: 14,
    color: '#e74c3c',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 4,
    alignSelf: 'flex-start',
    lineHeight: 16,
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
    backgroundColor: '#fef8f8',
  },
  validacionExitosa: {
    backgroundColor: '#f0f9f4',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  validacionExitosaText: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '500',
    textAlign: 'center',
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

  forgotEmailContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
  },
  forgotEmailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  forgotEmailText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  forgotEmailContact: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  ayudaContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  ayudaTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: 'System',
  },
  ayudaTexto: {
    fontSize: 12,
    color: '#5a6c7d',
    lineHeight: 16,
    fontFamily: 'System',
  },
});

export default Login;