import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const Registro = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('usuario');
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const irLogin = () => {
    navigation.navigate('login');
  };

  const registrarse = () => {
    if (!nombre || !cedula || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    if (tipoUsuario === 'cliente' && !nombreEmpresa) {
      Alert.alert('Error', 'Por favor ingrese el nombre de la empresa');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    Alert.alert('Éxito', `Registro exitoso como ${tipoUsuario}`, [
      { text: 'OK', onPress: irLogin }
    ]);
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Se necesitan permisos de cámara para tomar fotos',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Se necesitan permisos de galería para seleccionar fotos',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la foto');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Seleccionar foto de perfil',
      'Selecciona una opción',
      [
        {
          text: 'Cámara',
          onPress: takePhoto,
        },
        {
          text: 'Galería',
          onPress: pickFromGallery,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Officereserve</Text>
        <Text style={styles.subtitle}>Registrarse</Text>

        <TouchableOpacity onPress={showImageOptions} style={styles.photoContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera" size={40} color="#7f8c8d" />
              <Text style={styles.photoText}>Agregar foto</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.tipoUsuarioContainer}>
          <Text style={styles.label}>Registrarse como:</Text>
          <View style={styles.tipoUsuarioButtons}>
            <TouchableOpacity
              style={[
                styles.tipoUsuarioButton,
                tipoUsuario === 'usuario' && styles.tipoUsuarioButtonActive
              ]}
              onPress={() => setTipoUsuario('usuario')}
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
            >
              <Text style={[
                styles.tipoUsuarioButtonText,
                tipoUsuario === 'cliente' && styles.tipoUsuarioButtonTextActive
              ]}>
                Cliente/Empresa
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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

        {tipoUsuario === 'cliente' && (
          <>
            <Text style={styles.label}>Nombre de la empresa</Text>
            <TextInput
              style={styles.fullInput}
              placeholder="Nombre de tu empresa"
              placeholderTextColor="#999"
              value={nombreEmpresa}
              onChangeText={setNombreEmpresa}
            />
          </>
        )}

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
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
  photoContainer: {
    marginBottom: 20,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e1e5e9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderStyle: 'dashed',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
    fontFamily: 'System',
  },
  tipoUsuarioContainer: {
    width: '100%',
    marginBottom: 20,
  },
  tipoUsuarioButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
  },
  tipoUsuarioButton: {
    flex: 1,
    paddingVertical: 10,
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
  tipoUsuarioButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
    fontFamily: 'System',
  },
  tipoUsuarioButtonTextActive: {
    color: '#fff',
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