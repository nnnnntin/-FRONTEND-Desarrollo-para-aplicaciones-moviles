import { useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const RestablecerContraseña = ({ onBack, onSuccess, onForgotEmail }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleStep1 = () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingrese su correo electrónico');
      return;
    }
    
    Alert.alert('Código enviado', `Se envió un código de seguridad a tu correo:\n${email.substring(0, 2)}****@${email.split('@')[1] || 'gmail.com'}`);
    setCurrentStep(2);
  };

  const handleStep2 = () => {
    if (!securityCode) {
      Alert.alert('Error', 'Por favor ingrese el código de verificación');
      return;
    }
    setCurrentStep(3);
  };

  const handleStep3 = () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    Alert.alert('Éxito', 'Contraseña restablecida correctamente', [
      { text: 'OK', onPress: onSuccess }
    ]);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text style={styles.subtitle}>Recuperación de cuenta</Text>
            <Text style={styles.description}>Correo electrónico</Text>
            
            <Text style={styles.label}>Introduce tu correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="Introduce tu correo electrónico"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={handleStep1}>
              <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onForgotEmail} style={styles.forgotEmailButton}>
              <Text style={styles.forgotEmailText}>¿Olvidaste tu correo?</Text>
            </TouchableOpacity>
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.subtitle}>Recuperación de cuenta</Text>
            <Text style={styles.description}>
              Se envió un código de seguridad a tu correo:
            </Text>
            <Text style={styles.emailDisplay}>
              {email.substring(0, 2)}****@{email.split('@')[1] || 'gmail.com'}
            </Text>
            
            <Text style={styles.label}>Código de seguridad</Text>
            <TextInput
              style={styles.input}
              placeholder="Introduce el código de seguridad"
              placeholderTextColor="#999"
              value={securityCode}
              onChangeText={setSecurityCode}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.button} onPress={handleStep2}>
              <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.subtitle}>Recuperación de cuenta</Text>
            <Text style={styles.description}>Contraseña nueva</Text>
            
            <Text style={styles.label}>Introduce tu contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Introduce tu contraseña"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <Text style={styles.label}>Confirmar contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirma tu contraseña"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleStep3}>
              <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        {renderStep()}
        
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  description: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'System',
  },
  emailDisplay: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'System',
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
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'System',
  },
  backButton: {
    marginTop: 30,
  },
  backText: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
    fontFamily: 'System',
  },
  forgotEmailButton: {
    marginTop: 20,
  },
  forgotEmailText: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
  },
});

export default RestablecerContraseña;