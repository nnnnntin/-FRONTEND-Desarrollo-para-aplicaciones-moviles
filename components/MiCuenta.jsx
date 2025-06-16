import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
    Alert,
    Image,
    Keyboard,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const MiCuenta = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1749222013825-fe2025dcf0cf?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
  const [formData, setFormData] = useState({
    nombre: 'Juan',
    cedula: '12345678',
    email: 'Juan@juan.com',
    password: '••••',
    confirmPassword: '••••••',
  });

  const [editData, setEditData] = useState({ ...formData });

  const handleEdit = () => {
    if (isEditing) {
      if (editData.password !== editData.confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
      }
      
      if (!editData.nombre.trim() || !editData.email.trim()) {
        Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
        return;
      }

      setFormData({ ...editData });
      setIsEditing(false);
      Alert.alert('Éxito', 'Datos actualizados correctamente');
    } else {
      setEditData({ ...formData });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setEditData({ ...formData });
    setIsEditing(false);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
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
        Alert.alert('Éxito', 'Foto actualizada correctamente');
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
        Alert.alert('Éxito', 'Foto actualizada correctamente');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la foto');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Cambiar foto de perfil',
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

  const handleBackPress = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('Inicio');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.menuButton}>
          <Ionicons name="arrow-back" size={24} color="#4a90e2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi cuenta</Text>
        <View style={styles.placeholder} />
      </View>

      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.profileContainer}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
              <TouchableOpacity 
                style={styles.editPhotoButton}
                onPress={showImageOptions}
              >
                <Ionicons name="camera" size={20} color="#4a90e2" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={isEditing ? editData.nombre : formData.nombre}
                onChangeText={(text) => isEditing && setEditData({ ...editData, nombre: text })}
                editable={isEditing}
                placeholder="Ingresa tu nombre"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cédula</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={isEditing ? editData.cedula : formData.cedula}
                onChangeText={(text) => isEditing && setEditData({ ...editData, cedula: text })}
                editable={isEditing}
                placeholder="Ingresa tu cédula"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={isEditing ? editData.email : formData.email}
                onChangeText={(text) => isEditing && setEditData({ ...editData, email: text })}
                editable={isEditing}
                placeholder="Ingresa tu email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={isEditing ? editData.password : formData.password}
                onChangeText={(text) => isEditing && setEditData({ ...editData, password: text })}
                editable={isEditing}
                placeholder="Ingresa tu contraseña"
                secureTextEntry={!isEditing}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={isEditing ? editData.confirmPassword : formData.confirmPassword}
                onChangeText={(text) => isEditing && setEditData({ ...editData, confirmPassword: text })}
                editable={isEditing}
                placeholder="Confirma tu contraseña"
                secureTextEntry={!isEditing}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleEdit}
            >
              <Text style={styles.primaryButtonText}>
                {isEditing ? 'Guardar' : 'Editar'}
              </Text>
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleCancel}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e9ecef',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: 'System',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  inputDisabled: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
  },
  buttonContainer: {
    paddingVertical: 20,
    gap: 10,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4a90e2',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  secondaryButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default MiCuenta;