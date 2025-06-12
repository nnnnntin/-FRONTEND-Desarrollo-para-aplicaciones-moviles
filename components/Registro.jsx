import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const Registro = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const irLogin = () => {
    navigation.navigate('login');
  };

  const registrarse = () => {
    if (!nombre || !cedula || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    Alert.alert('Éxito', 'Registro exitoso', [
      { text: 'OK', onPress: irLogin }
    ]);
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>Officereserve</Text>
      <Text style={styles.subtitle}>Registrarse</Text>

      <View style={styles.rowContainer}>
        <View style={styles.halfInputContainer}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            placeholderTextColor="#999"
            value={nombre}
            onChangeText={setNombre}
          />
        </View>
        <View style={styles.halfInputContainer}>
          <Text style={styles.label}>Cédula</Text>
          <TextInput
            style={styles.input}
            placeholder="Cédula"
            placeholderTextColor="#999"
            value={cedula}
            onChangeText={setCedula}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={styles.fullInput}
        placeholder="Introduce tu correo electrónico"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.fullInput}
        placeholder="Introduce tu contraseña"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Confirmar contraseña</Text>
      <TextInput
        style={styles.fullInput}
        placeholder="Confirme su contraseña"
        placeholderTextColor="#999"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={registrarse}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={irLogin} style={styles.backContainer}>
        <Text style={styles.backLink}>Volver</Text>
      </TouchableOpacity>
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
    marginBottom: 30,
    fontFamily: 'System',
  },
  rowContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  halfInputContainer: {
    width: '48%',
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
  fullInput: {
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
  backContainer: {
    marginTop: 20,
  },
  backLink: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default Registro;