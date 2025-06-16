import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import RestablecerContraseña from './RestablecerContraseña';
import RestablecerMail from './RestablecerMail';

const Login = ({ navigation, setIsLogged }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentView, setCurrentView] = useState('login');
  const [tipoUsuario, setTipoUsuario] = useState('usuario');
  const { login, autoLogin, isLoading } = useAuth(setIsLogged);

  const handleLogin = async () => {
    const result = await login(email, password, tipoUsuario);
  };

  const handleAutoLogin = async () => {
    const result = await autoLogin(tipoUsuario === 'cliente');
    if (result.success) {
      setTimeout(() => {
        Alert.alert('Éxito', `Auto login exitoso como ${tipoUsuario}`);
      }, 300);
    }
  };

  const goToRegister = () => {
    if (isLoading) return;
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
    );
  }

  if (currentView === 'forgotEmail') {
    return (
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
    );
  }

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>Officereserve</Text>
      <Text style={styles.subtitle}>Iniciar sesión</Text>

      {__DEV__ && (
        <TouchableOpacity 
          style={[
            styles.autoLoginButton,
            isLoading && styles.buttonDisabled
          ]} 
          onPress={handleAutoLogin}
          disabled={isLoading}
        >
          <Text style={styles.autoLoginText}>
            {isLoading ? '🔄 CARGANDO...' : `AUTO LOGIN ${tipoUsuario.toUpperCase()} (DEV)`}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.tipoUsuarioContainer}>
        <Text style={styles.tipoUsuarioLabel}>Ingresar como:</Text>
        <View style={styles.tipoUsuarioButtons}>
          <TouchableOpacity
            style={[
              styles.tipoUsuarioButton,
              tipoUsuario === 'usuario' && styles.tipoUsuarioButtonActive
            ]}
            onPress={() => setTipoUsuario('usuario')}
            disabled={isLoading}
          >
            <Text style={[
              styles.tipoUsuarioButtonText,
              tipoUsuario === 'usuario' && styles.tipoUsuarioButtonTextActive
            ]}>
              Usuario
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tipoUsuarioButton,
              tipoUsuario === 'cliente' && styles.tipoUsuarioButtonActive
            ]}
            onPress={() => setTipoUsuario('cliente')}
            disabled={isLoading}
          >
            <Text style={[
              styles.tipoUsuarioButtonText,
              tipoUsuario === 'cliente' && styles.tipoUsuarioButtonTextActive
            ]}>
              Cliente
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={[
          styles.input,
          isLoading && styles.inputDisabled
        ]}
        placeholder="Cualquier texto (ej: 11)"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={[
          styles.input,
          isLoading && styles.inputDisabled
        ]}
        placeholder="Cualquier texto (ej: 1)"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <TouchableOpacity 
        style={[
          styles.button,
          isLoading && styles.buttonDisabled
        ]} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'INGRESANDO...' : 'INGRESAR'}
        </Text>
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <TouchableOpacity 
          onPress={handleForgotPassword}
          disabled={isLoading}
          style={styles.forgotButton}
        >
          <Text style={[
            styles.forgotText,
            isLoading && styles.linkDisabled
          ]}>
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>

        <Text style={styles.registerQuestion}>¿No tienes cuenta?</Text>
        <TouchableOpacity 
          onPress={goToRegister}
          disabled={isLoading}
        >
          <Text style={[
            styles.registerLink,
            isLoading && styles.linkDisabled
          ]}>
            Registrarse
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  autoLoginButton: {
    backgroundColor: '#f39c12',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  autoLoginText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
    gap: 10,
  },
  tipoUsuarioButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
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
  tipoUsuarioButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
    fontFamily: 'System',
  },
  tipoUsuarioButtonTextActive: {
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