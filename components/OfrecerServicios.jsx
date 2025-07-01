import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import {
  crearSolicitudServicio,
  obtenerServiciosPorProveedor
} from '../store/slices/proveedoresSlice';


const propuestaSchema = Yup.object({
  mensaje: Yup.string()
    .trim()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(500, 'El mensaje no puede exceder 500 caracteres')
    .required('El mensaje es obligatorio'),
  
  precioEspecial: Yup.string()
    .matches(/^\d*\.?\d*$/, 'Ingrese un precio válido')
    .test('precio-valido', 'El precio debe ser mayor a 0', function(value) {
      if (!value || value === '') return true; 
      const precio = parseFloat(value);
      return !isNaN(precio) && precio > 0;
    })
    .test('precio-maximo', 'El precio no puede exceder $99,999', function(value) {
      if (!value || value === '') return true;
      const precio = parseFloat(value);
      return precio <= 99999;
    }),
  
  disponibilidad: Yup.string()
    .trim()
    .max(300, 'La disponibilidad no puede exceder 300 caracteres'),
  
  condicionesEspeciales: Yup.string()
    .trim()
    .max(500, 'Las condiciones especiales no pueden exceder 500 caracteres')
});

const OfrecerServicios = ({ navigation, route }) => {
  const { oficina } = route.params;
  const dispatch = useDispatch();
  const { datosUsuario } = useSelector(state => state.usuario);
  const { serviciosProveedor, loading } = useSelector(state => state.proveedores);

  const [modalVisible, setModalVisible] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [propuesta, setPropuesta] = useState({
    mensaje: '',
    precioEspecial: '',
    disponibilidad: '',
    condicionesEspeciales: ''
  });
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (datosUsuario?._id) {
      cargarMisServicios();
    }
  }, [datosUsuario]);

  const cargarMisServicios = async () => {
    try {
      await dispatch(obtenerServiciosPorProveedor(datosUsuario._id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleOfrecerServicio = (servicio) => {
    setServicioSeleccionado(servicio);
    setPropuesta({
      mensaje: `Hola, me gustaría ofrecer mi servicio de ${servicio.nombre.toLowerCase()} en tu espacio "${oficina.nombre}".`,
      precioEspecial: servicio.precio?.toString() || '',
      disponibilidad: 'Disponible de lunes a viernes, horarios flexibles',
      condicionesEspeciales: ''
    });
    setErrores({});
    setModalVisible(true);
  };

  const validarCampo = async (campo, valor) => {
    try {
      await propuestaSchema.validateAt(campo, { [campo]: valor });
      setErrores(prev => {
        const newErrors = { ...prev };
        delete newErrors[campo];
        return newErrors;
      });
    } catch (error) {
      setErrores(prev => ({
        ...prev,
        [campo]: error.message
      }));
    }
  };

  const handleInputChange = (campo, valor) => {
    setPropuesta(prev => ({ ...prev, [campo]: valor }));
    
    validarCampo(campo, valor);
  };

  const handleEnviarPropuesta = async () => {
    try {
      
      await propuestaSchema.validate(propuesta, { abortEarly: false });
      setErrores({});

      const solicitudData = {
        proveedorId: datosUsuario._id,
        espacioId: oficina.id,
        servicioId: servicioSeleccionado._id,
        propuesta: {
          mensaje: propuesta.mensaje.trim(),
          precioOfrecido: propuesta.precioEspecial ? 
            parseFloat(propuesta.precioEspecial) : 
            servicioSeleccionado.precio,
          disponibilidad: propuesta.disponibilidad.trim(),
          condicionesEspeciales: propuesta.condicionesEspeciales.trim()
        },
        estado: 'pendiente'
      };

      const result = await dispatch(crearSolicitudServicio(solicitudData));

      if (result.success) {
        setModalVisible(false);
        Alert.alert(
          'Propuesta enviada',
          'Tu propuesta ha sido enviada al propietario del espacio. Te notificaremos cuando recibas una respuesta.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', 'No se pudo enviar la propuesta. Inténtalo de nuevo.');
      }
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = {};
        error.inner.forEach(err => {
          validationErrors[err.path] = err.message;
        });
        setErrores(validationErrors);
        
        
        const primerError = error.inner[0]?.message || 'Por favor revisa los campos del formulario';
        Alert.alert('Error de validación', primerError);
      } else {
        console.error(error);
        Alert.alert('Error', 'Ocurrió un error al enviar la propuesta');
      }
    }
  };

  const renderServicio = ({ item: servicio }) => {
    const disponible = servicio.activo !== false;

    return (
      <View style={[styles.servicioCard, !disponible && styles.servicioNoDisponible]}>
        <View style={styles.servicioHeader}>
          <View style={styles.servicioInfo}>
            <Text style={styles.servicioNombre}>{servicio.nombre}</Text>
            <Text style={styles.servicioCategoria}>{servicio.tipo || 'General'}</Text>
          </View>
          <View style={styles.servicioStats}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#f39c12" />
              <Text style={styles.statText}>{servicio.calificacion || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-done" size={16} color="#27ae60" />
              <Text style={styles.statText}>{servicio.trabajosCompletados || 0}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.servicioDescripcion}>
          {servicio.descripcion || 'Servicio profesional de calidad'}
        </Text>

        <View style={styles.servicioDetalles}>
          <View style={styles.detalleItem}>
            <Ionicons name="pricetag" size={16} color="#4a90e2" />
            <Text style={styles.detalleText}>${servicio.precio || 0}</Text>
          </View>
          <View style={styles.detalleItem}>
            <Ionicons name="time" size={16} color="#7f8c8d" />
            <Text style={styles.detalleText}>{servicio.duracionEstimada || 'Por definir'}</Text>
          </View>
        </View>

        {disponible ? (
          <TouchableOpacity
            style={styles.ofrecerButton}
            onPress={() => handleOfrecerServicio(servicio)}
          >
            <Ionicons name="send" size={16} color="#fff" />
            <Text style={styles.ofrecerButtonText}>Ofrecer servicio</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.noDisponibleButton}>
            <Ionicons name="ban" size={16} color="#e74c3c" />
            <Text style={styles.noDisponibleText}>Servicio no disponible</Text>
          </View>
        )}
      </View>
    );
  };

  const misServicios = serviciosProveedor || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ofrecer servicios</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.espacioInfo}>
          <View style={styles.espacioHeader}>
            <View style={styles.espacioIcon}>
              <Ionicons name="business" size={24} color="#4a90e2" />
            </View>
            <View style={styles.espacioDetails}>
              <Text style={styles.espacioNombre}>{oficina.nombre}</Text>
              <Text style={styles.espacioDireccion}>{oficina.direccion || 'Montevideo, Uruguay'}</Text>
            </View>
          </View>
          <Text style={styles.espacioDescripcion}>
            Selecciona los servicios que te gustaría ofrecer en este espacio
          </Text>
        </View>

        <View style={styles.serviciosSection}>
          <Text style={styles.sectionTitle}>Mis servicios disponibles</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando servicios...</Text>
            </View>
          ) : misServicios.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="construct-outline" size={60} color="#bdc3c7" />
              <Text style={styles.emptyText}>No tienes servicios creados</Text>
              <Text style={styles.emptySubtext}>
                Crea tu primer servicio para poder ofrecerlo en espacios
              </Text>
              <TouchableOpacity
                style={styles.crearServicioButton}
                onPress={() => navigation.navigate('CrearServicio')}
              >
                <Text style={styles.crearServicioText}>Crear servicio</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={misServicios}
              keyExtractor={(item) => item._id?.toString()}
              renderItem={renderServicio}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              refreshing={loading}
              onRefresh={cargarMisServicios}
            />
          )}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enviar propuesta</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setErrores({});
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {servicioSeleccionado && (
                <>
                  <View style={styles.servicioResumen}>
                    <Text style={styles.servicioResumenNombre}>{servicioSeleccionado.nombre}</Text>
                    <Text style={styles.servicioResumenPrecio}>${servicioSeleccionado.precio || 0}</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Mensaje personalizado *</Text>
                    <TextInput
                      style={[styles.textArea, errores.mensaje && styles.inputError]}
                      value={propuesta.mensaje}
                      onChangeText={(text) => handleInputChange('mensaje', text)}
                      placeholder="Escribe un mensaje personalizado para el propietario del espacio"
                      multiline
                      numberOfLines={4}
                      maxLength={500}
                    />
                    {errores.mensaje && (
                      <Text style={styles.errorText}>{errores.mensaje}</Text>
                    )}
                    <Text style={styles.charCount}>
                      {propuesta.mensaje.length}/500
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Precio especial (opcional)</Text>
                    <TextInput
                      style={[styles.input, errores.precioEspecial && styles.inputError]}
                      value={propuesta.precioEspecial}
                      onChangeText={(text) => handleInputChange('precioEspecial', text)}
                      placeholder="Precio especial para este espacio"
                      keyboardType="numeric"
                    />
                    {errores.precioEspecial && (
                      <Text style={styles.errorText}>{errores.precioEspecial}</Text>
                    )}
                    <Text style={styles.helpText}>
                      Deja el precio original o ofrece un descuento especial
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Disponibilidad</Text>
                    <TextInput
                      style={[styles.textArea, errores.disponibilidad && styles.inputError]}
                      value={propuesta.disponibilidad}
                      onChangeText={(text) => handleInputChange('disponibilidad', text)}
                      placeholder="Describe tu disponibilidad para este servicio"
                      multiline
                      numberOfLines={3}
                      maxLength={300}
                    />
                    {errores.disponibilidad && (
                      <Text style={styles.errorText}>{errores.disponibilidad}</Text>
                    )}
                    <Text style={styles.charCount}>
                      {propuesta.disponibilidad.length}/300
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Condiciones especiales</Text>
                    <TextInput
                      style={[styles.textArea, errores.condicionesEspeciales && styles.inputError]}
                      value={propuesta.condicionesEspeciales}
                      onChangeText={(text) => handleInputChange('condicionesEspeciales', text)}
                      placeholder="Requisitos especiales, descuentos, paquetes, etc."
                      multiline
                      numberOfLines={3}
                      maxLength={500}
                    />
                    {errores.condicionesEspeciales && (
                      <Text style={styles.errorText}>{errores.condicionesEspeciales}</Text>
                    )}
                    <Text style={styles.charCount}>
                      {propuesta.condicionesEspeciales.length}/500
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => {
                  setModalVisible(false);
                  setErrores({});
                }}
              >
                <Text style={styles.cancelModalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.enviarButton, loading && styles.enviarButtonDisabled]}
                onPress={handleEnviarPropuesta}
                disabled={loading}
              >
                <Ionicons name="send" size={16} color="#fff" />
                <Text style={styles.enviarButtonText}>
                  {loading ? 'Enviando...' : 'Enviar propuesta'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
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
  espacioInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  espacioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  espacioIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  espacioDetails: {
    flex: 1,
  },
  espacioNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  espacioDireccion: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  espacioDescripcion: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  proveedorInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  proveedorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proveedorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  proveedorDetails: {
    flex: 1,
  },
  proveedorNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  proveedorTipo: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  serviciosSection: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  servicioCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  servicioNoDisponible: {
    opacity: 0.7,
  },
  servicioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  servicioInfo: {
    flex: 1,
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  servicioCategoria: {
    fontSize: 12,
    color: '#4a90e2',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  servicioStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  servicioDescripcion: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 16,
  },
  servicioDetalles: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  detalleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detalleText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  ofrecerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  ofrecerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noDisponibleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e74c3c',
    gap: 8,
  },
  noDisponibleText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  crearServicioButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  crearServicioText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  servicioResumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  servicioResumenNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  servicioResumenPrecio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    color: '#2c3e50',
  },
  textArea: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    color: '#2c3e50',
    height: 80,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
  },
  enviarButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#27ae60',
    gap: 8,
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  enviarButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  enviarButtonDisabled: {
    opacity: 0.6,
  },
});

export default OfrecerServicios;