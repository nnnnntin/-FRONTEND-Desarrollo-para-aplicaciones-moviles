import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { agregarOficinaPropia } from '../store/slices/usuarioSlice';
import { obtenerServiciosAdicionales } from '../store/slices/proveedoresSlice';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const CrearPublicacion = ({ navigation }) => {
  const dispatch = useDispatch();
  const { oficinasPropias } = useSelector(state => state.usuario);
  const { serviciosAdicionales, loading } = useSelector(state => state.proveedores);

  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'oficina',
    descripcion: '',
    direccion: '',
    capacidad: '',
    precio: '',
    horarioApertura: '',
    horarioCierre: '',
    diasDisponibles: {
      lunes: true,
      martes: true,
      miercoles: true,
      jueves: true,
      viernes: true,
      sabado: false,
      domingo: false
    }
  });

  const [imagenes, setImagenes] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const tipos = [
    { id: 'oficina', nombre: 'Oficina', icono: 'business' },
    { id: 'espacio', nombre: 'Espacio', icono: 'square' },
    { id: 'escritorio', nombre: 'Escritorio', icono: 'desktop' },
    { id: 'sala', nombre: 'Sala de reuniones', icono: 'people' }
  ];

  useEffect(() => {
    cargarServiciosDisponibles();
  }, []);

  const cargarServiciosDisponibles = async () => {
    try {
      await dispatch(obtenerServiciosAdicionales(0, 50));
    } catch (error) {
      console.error('Error cargando servicios:', error);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const toggleServicio = (servicio) => {
    setServiciosSeleccionados(prev => {
      const existe = prev.find(s => s._id === servicio._id);
      if (existe) {
        return prev.filter(s => s._id !== servicio._id);
      } else {
        return [...prev, servicio];
      }
    });
  };

  const toggleDia = (dia) => {
    setFormData(prev => ({
      ...prev,
      diasDisponibles: {
        ...prev.diasDisponibles,
        [dia]: !prev.diasDisponibles[dia]
      }
    }));
  };

  const uploadToCloudinary = async (imageUri) => {
    const formDataImage = new FormData();
    
    formDataImage.append('file', {
      uri: imageUri,
      name: `office_image_${Date.now()}.jpeg`,
      type: 'image/jpeg'
    });
    
    formDataImage.append('upload_preset', UPLOAD_PRESET);
    
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formDataImage
      });
      
      const data = await response.json();
      
      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error('Error al subir imagen a Cloudinary');
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets) {
        setUploadingImage(true);
        
        try {
          const uploadPromises = result.assets.map(asset => uploadToCloudinary(asset.uri));
          const cloudinaryUrls = await Promise.all(uploadPromises);
          
          setImagenes([...imagenes, ...cloudinaryUrls]);
          Alert.alert('Éxito', 'Imágenes subidas correctamente');
        } catch (error) {
          Alert.alert('Error', 'No se pudieron subir las imágenes');
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const removeImage = (index) => {
    setImagenes(imagenes.filter((_, i) => i !== index));
  };

  const handleGuardar = async () => {
    if (!formData.nombre || !formData.descripcion || !formData.direccion ||
      !formData.capacidad || !formData.precio) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (imagenes.length === 0) {
      Alert.alert('Error', 'Por favor agrega al menos una imagen');
      return;
    }

    try {
      const nuevaOficina = {
        id: Date.now(),
        ...formData,
        servicios: serviciosSeleccionados,
        imagenes,
        fechaCreacion: new Date().toISOString()
      };

      dispatch(agregarOficinaPropia(nuevaOficina.id));

      Alert.alert(
        'Publicación creada',
        'Tu publicación se ha creada exitosamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating publication:', error);
      Alert.alert('Error', 'No se pudo crear la publicación. Inténtalo de nuevo.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear publicación</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de espacio</Text>
          <View style={styles.tiposContainer}>
            {tipos.map(tipo => (
              <TouchableOpacity
                key={tipo.id}
                style={[
                  styles.tipoButton,
                  formData.tipo === tipo.id && styles.tipoButtonActive
                ]}
                onPress={() => setFormData({ ...formData, tipo: tipo.id })}
              >
                <Ionicons
                  name={tipo.icono}
                  size={24}
                  color={formData.tipo === tipo.id ? '#fff' : '#4a90e2'}
                />
                <Text style={[
                  styles.tipoText,
                  formData.tipo === tipo.id && styles.tipoTextActive
                ]}>
                  {tipo.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Nombre del espacio *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Oficina Ejecutiva Centro"
            value={formData.nombre}
            onChangeText={(text) => setFormData({ ...formData, nombre: text })}
          />

          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe tu espacio, características, ambiente..."
            value={formData.descripcion}
            onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Dirección *</Text>
          <TextInput
            style={styles.input}
            placeholder="Dirección completa"
            value={formData.direccion}
            onChangeText={(text) => setFormData({ ...formData, direccion: text })}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Capacidad *</Text>
              <TextInput
                style={styles.input}
                placeholder="Personas"
                value={formData.capacidad}
                onChangeText={(text) => setFormData({ ...formData, capacidad: text })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Precio por día *</Text>
              <TextInput
                style={styles.input}
                placeholder="USD"
                value={formData.precio}
                onChangeText={(text) => setFormData({ ...formData, precio: text })}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horario disponible</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Apertura</Text>
              <TextInput
                style={styles.input}
                placeholder="08:00"
                value={formData.horarioApertura}
                onChangeText={(text) => setFormData({ ...formData, horarioApertura: text })}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Cierre</Text>
              <TextInput
                style={styles.input}
                placeholder="18:00"
                value={formData.horarioCierre}
                onChangeText={(text) => setFormData({ ...formData, horarioCierre: text })}
              />
            </View>
          </View>

          <Text style={styles.label}>Días disponibles</Text>
          <View style={styles.diasContainer}>
            {Object.keys(formData.diasDisponibles).map(dia => (
              <TouchableOpacity
                key={dia}
                style={[
                  styles.diaButton,
                  formData.diasDisponibles[dia] && styles.diaButtonActive
                ]}
                onPress={() => toggleDia(dia)}
              >
                <Text style={[
                  styles.diaText,
                  formData.diasDisponibles[dia] && styles.diaTextActive
                ]}>
                  {dia.charAt(0).toUpperCase() + dia.slice(1, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Imágenes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.addImageButton, uploadingImage && styles.addImageButtonDisabled]} 
              onPress={selectImage}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <>
                  <Text style={styles.uploadingText}>Subiendo...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="camera" size={32} color="#4a90e2" />
                  <Text style={styles.addImageText}>Agregar</Text>
                </>
              )}
            </TouchableOpacity>
            {imagenes.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicios disponibles</Text>
          {loading ? (
            <Text style={styles.loadingText}>Cargando servicios...</Text>
          ) : (serviciosAdicionales || []).length === 0 ? (
            <Text style={styles.noServiciosText}>No hay servicios disponibles</Text>
          ) : (
            (serviciosAdicionales || []).map(servicio => (
              <TouchableOpacity
                key={servicio._id}
                style={[
                  styles.servicioItem,
                  serviciosSeleccionados.find(s => s._id === servicio._id) && styles.servicioItemActive
                ]}
                onPress={() => toggleServicio(servicio)}
              >
                <View style={styles.servicioInfo}>
                  <Text style={styles.servicioNombre}>{servicio.nombre}</Text>
                  <Text style={styles.servicioProveedor}>
                    {servicio.tipo ? `Categoría: ${servicio.tipo}` : 'Servicio general'}
                  </Text>
                </View>
                <View style={styles.servicioRight}>
                  <Text style={styles.servicioPrecio}>
                    ${servicio.precio || 0}/{servicio.unidadPrecio || 'servicio'}
                  </Text>
                  <Ionicons
                    name={serviciosSeleccionados.find(s => s._id === servicio._id) ? "checkbox" : "square-outline"}
                    size={24}
                    color="#4a90e2"
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <TouchableOpacity 
          style={[styles.guardarButton, loading && styles.guardarButtonDisabled]} 
          onPress={handleGuardar}
          disabled={loading}
        >
          <Text style={styles.guardarButtonText}>
            {loading ? 'Creando...' : 'Crear publicación'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  placeholder: {
    width: 30,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    fontFamily: 'System',
  },
  tiposContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tipoButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    alignItems: 'center',
    minWidth: 100,
  },
  tipoButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  tipoText: {
    fontSize: 12,
    color: '#2c3e50',
    marginTop: 4,
    fontFamily: 'System',
  },
  tipoTextActive: {
    color: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 15,
    fontFamily: 'System',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  halfInput: {
    flex: 1,
  },
  diasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  diaButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  diaButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  diaText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  diaTextActive: {
    color: '#fff',
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addImageButtonDisabled: {
    opacity: 0.6,
  },
  addImageText: {
    fontSize: 12,
    color: '#4a90e2',
    marginTop: 4,
    fontFamily: 'System',
  },
  uploadingText: {
    fontSize: 14,
    color: '#4a90e2',
    fontFamily: 'System',
  },
  imageContainer: {
    marginRight: 10,
    position: 'relative',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  servicioItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  servicioItemActive: {
    borderColor: '#4a90e2',
    backgroundColor: '#f0f8ff',
  },
  servicioInfo: {
    flex: 1,
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  servicioProveedor: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
    fontFamily: 'System',
  },
  servicioRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  servicioPrecio: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '600',
    fontFamily: 'System',
  },
  guardarButton: {
    backgroundColor: '#4a90e2',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  guardarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  bottomSpacing: {
    height: 30,
  },
    loadingText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingVertical: 20,
  },
  noServiciosText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingVertical: 20,
  },
  guardarButtonDisabled: {
    opacity: 0.6,
  },
});

export default CrearPublicacion;