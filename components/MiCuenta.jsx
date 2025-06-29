import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { useDispatch, useSelector } from 'react-redux';

import { actualizarUsuario } from '../store/slices/usuarioSlice';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const MiCuenta = ({ navigation }) => {
  const dispatch = useDispatch();


  const { usuario, token, tipoUsuario } = useSelector(state => state.auth);

  const { loading: usuarioLoading } = useSelector(state => state.usuario);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    documentoIdentidad: '',
    calle: '',
    ciudad: '',
    codigoPostal: '',
    pais: '',
    imagen: '',
    password: '',
    confirmPassword: ''
  });

  const [editData, setEditData] = useState({ ...formData });

  useEffect(() => {
    if (usuario) {

      const data = {
        username: usuario.username || '',
        nombre: usuario.nombre || '',
        apellidos: usuario.apellidos || '',
        email: usuario.email || '',

        telefono: usuario.datosPersonales?.telefono || '',
        documentoIdentidad: usuario.datosPersonales?.documentoIdentidad || '',

        imagen: usuario.imagen || '',

        calle: usuario.direccion?.calle || '',
        ciudad: usuario.direccion?.ciudad || '',
        codigoPostal: usuario.direccion?.codigoPostal || '',
        pais: usuario.direccion?.pais || 'Uruguay',
        password: '',
        confirmPassword: ''
      };

      setFormData(data);
      setEditData(data);
    }
  }, [usuario]);

  const handleEdit = async () => {
    if (isEditing) {

      if (!editData.nombre.trim() || !editData.email.trim()) {
        Alert.alert('Error', 'El nombre y email son obligatorios');
        return;
      }

      if (editData.password && editData.password !== editData.confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
      }

      if (editData.password && editData.password.length < 8) {
        Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
        return;
      }

      try {
        setIsLoading(true);


        const updateData = {
          nombre: editData.nombre.trim(),
          apellidos: editData.apellidos.trim(),
        };


        if (editData.imagen) {
          updateData.imagen = editData.imagen;
        }


        const datosPersonales = {};
        if (editData.telefono.trim()) datosPersonales.telefono = editData.telefono.trim();
        if (editData.documentoIdentidad.trim()) datosPersonales.documentoIdentidad = editData.documentoIdentidad.trim();

        if (Object.keys(datosPersonales).length > 0) {
          updateData.datosPersonales = datosPersonales;
        }


        const direccion = {};
        if (editData.calle.trim()) direccion.calle = editData.calle.trim();
        if (editData.ciudad.trim()) direccion.ciudad = editData.ciudad.trim();
        if (editData.codigoPostal.trim()) direccion.codigoPostal = editData.codigoPostal.trim();
        if (editData.pais.trim()) direccion.pais = editData.pais.trim();

        if (Object.keys(direccion).length > 0) {
          updateData.direccion = direccion;
        }


        if (editData.password) {
          updateData.password = editData.password;
        }


        const result = await dispatch(actualizarUsuario({
          usuarioId: usuario.id || usuario._id,
          datosActualizacion: updateData
        }));

        if (actualizarUsuario.fulfilled.match(result)) {

          const updatedFormData = {
            ...editData,
            password: '',
            confirmPassword: ''
          };
          setFormData(updatedFormData);
          setEditData(updatedFormData);

          setIsEditing(false);
          Alert.alert('Éxito', 'Perfil actualizado correctamente');
        } else {
          throw new Error(result.payload || 'Error al actualizar el perfil');
        }

      } catch (error) {
        console.error(error);
        Alert.alert('Error', error.message || 'No se pudo actualizar el perfil');
      } finally {
        setIsLoading(false);
      }
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

  const uploadToCloudinary = async (imageUri) => {
    const formData = new FormData();

    formData.append('file', {
      uri: imageUri,
      name: 'profile_image.jpeg',
      type: 'image/jpeg'
    });

    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error('Error al subir imagen a Cloudinary');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      setUploadingImage(true);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const cloudinaryUrl = await uploadToCloudinary(result.assets[0].uri);


        await updateProfileImage(cloudinaryUrl);

        setEditData(prev => ({ ...prev, imagen: cloudinaryUrl }));
        setFormData(prev => ({ ...prev, imagen: cloudinaryUrl }));

        Alert.alert('Éxito', 'Foto actualizada correctamente');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar la foto');
    } finally {
      setUploadingImage(false);
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      setUploadingImage(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const cloudinaryUrl = await uploadToCloudinary(result.assets[0].uri);


        await updateProfileImage(cloudinaryUrl);

        setEditData(prev => ({ ...prev, imagen: cloudinaryUrl }));
        setFormData(prev => ({ ...prev, imagen: cloudinaryUrl }));

        Alert.alert('Éxito', 'Foto actualizada correctamente');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar la foto');
    } finally {
      setUploadingImage(false);
    }
  };

  const updateProfileImage = async (imageUrl) => {
    try {

      const result = await dispatch(actualizarUsuario({
        usuarioId: usuario.id || usuario._id,
        datosActualizacion: { imagen: imageUrl }
      }));

      if (!actualizarUsuario.fulfilled.match(result)) {
        throw new Error('Error al actualizar imagen');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const showImageOptions = () => {
    if (uploadingImage) return;

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

  const renderImageContainer = () => {
    const imageSource = editData.imagen
      ? { uri: editData.imagen }
      : require('../assets/images/logo.png');

    return (
      <View style={styles.profileImageContainer}>
        {uploadingImage ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color="#4a90e2" />
            <Text style={styles.uploadingText}>Subiendo...</Text>
          </View>
        ) : (
          <Image
            source={imageSource}
            style={styles.profileImage}
            onError={() => {
              setEditData(prev => ({ ...prev, imagen: '' }));
            }}
          />
        )}
        <TouchableOpacity
          style={styles.editPhotoButton}
          onPress={showImageOptions}
          disabled={uploadingImage}
        >
          <Ionicons name="camera" size={20} color="#4a90e2" />
        </TouchableOpacity>
      </View>
    );
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
            {renderImageContainer()}
            <Text style={styles.userTypeText}>
              {tipoUsuario?.charAt(0).toUpperCase() + tipoUsuario?.slice(1) || 'Usuario'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre de usuario</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.username}
                editable={false}
                placeholder="Nombre de usuario"
              />
              <Text style={styles.helpText}>El nombre de usuario no se puede cambiar</Text>
            </View>

            <Text style={styles.sectionTitle}>Información Personal</Text>

            <View style={styles.rowContainer}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={isEditing ? editData.nombre : formData.nombre}
                  onChangeText={(text) => isEditing && setEditData({ ...editData, nombre: text })}
                  editable={isEditing}
                  placeholder="Tu nombre"
                />
              </View>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Apellidos</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={isEditing ? editData.apellidos : formData.apellidos}
                  onChangeText={(text) => isEditing && setEditData({ ...editData, apellidos: text })}
                  editable={isEditing}
                  placeholder="Tus apellidos"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo electrónico *</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.email}
                editable={false}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.helpText}>El email no se puede cambiar desde aquí</Text>
            </View>

            <Text style={styles.sectionTitle}>Información de Contacto</Text>

            <View style={styles.rowContainer}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={isEditing ? editData.telefono : formData.telefono}
                  onChangeText={(text) => isEditing && setEditData({ ...editData, telefono: text })}
                  editable={isEditing}
                  placeholder="+598 9X XXX XXX"
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Documento</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={isEditing ? editData.documentoIdentidad : formData.documentoIdentidad}
                  onChangeText={(text) => isEditing && setEditData({ ...editData, documentoIdentidad: text })}
                  editable={isEditing}
                  placeholder="C.I. o Pasaporte"
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Dirección</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Calle y número</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={isEditing ? editData.calle : formData.calle}
                onChangeText={(text) => isEditing && setEditData({ ...editData, calle: text })}
                editable={isEditing}
                placeholder="Av. 18 de Julio 1234"
              />
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Ciudad</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={isEditing ? editData.ciudad : formData.ciudad}
                  onChangeText={(text) => isEditing && setEditData({ ...editData, ciudad: text })}
                  editable={isEditing}
                  placeholder="Montevideo"
                />
              </View>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Código Postal</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={isEditing ? editData.codigoPostal : formData.codigoPostal}
                  onChangeText={(text) => isEditing && setEditData({ ...editData, codigoPostal: text })}
                  editable={isEditing}
                  placeholder="11000"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>País</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={isEditing ? editData.pais : formData.pais}
                onChangeText={(text) => isEditing && setEditData({ ...editData, pais: text })}
                editable={isEditing}
                placeholder="Uruguay"
              />
            </View>

            {isEditing && (
              <>
                <Text style={styles.sectionTitle}>Cambiar Contraseña (opcional)</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nueva contraseña</Text>
                  <TextInput
                    style={styles.input}
                    value={editData.password}
                    onChangeText={(text) => setEditData({ ...editData, password: text })}
                    placeholder="Mínimo 8 caracteres"
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirmar nueva contraseña</Text>
                  <TextInput
                    style={styles.input}
                    value={editData.confirmPassword}
                    onChangeText={(text) => setEditData({ ...editData, confirmPassword: text })}
                    placeholder="Repite la nueva contraseña"
                    secureTextEntry
                  />
                </View>
              </>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                (isLoading || uploadingImage || usuarioLoading) && styles.buttonDisabled
              ]}
              onPress={handleEdit}
              disabled={isLoading || uploadingImage || usuarioLoading}
            >
              {(isLoading || usuarioLoading) ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isEditing ? 'Guardar cambios' : 'Editar perfil'}
                </Text>
              )}
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleCancel}
                disabled={isLoading || usuarioLoading}
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
  uploadingContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 12,
    color: '#4a90e2',
    marginTop: 5,
    fontFamily: 'System',
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
  userTypeText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 10,
    fontWeight: '600',
    fontFamily: 'System',
  },
  formContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 15,
    fontFamily: 'System',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfInputContainer: {
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
  helpText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    fontStyle: 'italic',
    fontFamily: 'System',
  },
  buttonContainer: {
    paddingVertical: 20,
    gap: 10,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default MiCuenta;