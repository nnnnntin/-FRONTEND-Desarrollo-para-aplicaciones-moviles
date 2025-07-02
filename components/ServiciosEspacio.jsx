import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import {
  actualizarServicioAdicional,
  asignarEspacioAServicio,
  crearServicioAdicional,
  eliminarServicioAdicional,
  obtenerServiciosPorEspacio,
  toggleServicioAdicional
} from '../store/slices/proveedoresSlice';

const oficinaSchema = yup.object({
  id: yup
    .mixed()
    .required('ID de oficina es requerido')
    .test('id-valido', 'ID debe ser string o número', function(value) {
      return typeof value === 'string' || typeof value === 'number';
    }),
  
  nombre: yup
    .string()
    .required('Nombre de oficina es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
});


const servicioAdicionalSchema = yup.object({
  id: yup
    .mixed()
    .nullable()
    .test('id-valido', 'ID debe ser string o número', function(value) {
      if (value === null || value === undefined) return true;
      return typeof value === 'string' || typeof value === 'number';
    }),
  
  nombre: yup
    .string()
    .required('El nombre del servicio es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-_.]+$/, 'El nombre contiene caracteres no válidos')
    .trim(),
  
  descripcion: yup
    .string()
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .trim()
    .nullable(),
  
  precio: yup
    .number()
    .min(0, 'El precio no puede ser negativo')
    .max(10000, 'El precio no puede exceder $10,000')
    .test('decimal-places', 'Máximo 2 decimales', function(value) {
      if (value === undefined || value === null) return true;
      return /^\d+(\.\d{1,2})?$/.test(value.toString());
    }),
  
  tipo: yup
    .string()
    .test('tipo-servicio-valido', 'Tipo de servicio no válido', function(value) {
      const tiposValidos = [
        'general', 'tecnologia', 'limpieza', 'catering', 
        'seguridad', 'transporte', 'entretenimiento'
      ];
      return tiposValidos.includes(value);
    })
    .required('El tipo de servicio es requerido'),
  
  unidadPrecio: yup
    .string()
    .test('unidad-precio-valida', 'Unidad de precio no válida', function(value) {
      const unidadesValidas = ['persona', 'dia', 'hora', 'servicio', 'mes'];
      return unidadesValidas.includes(value);
    })
    .required('La unidad de precio es requerida'),
  
  activo: yup
    .boolean()
    .default(true),
});


const servicioFormSchema = yup.object({
  nombre: yup
    .string()
    .required('El nombre del servicio es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-_.]+$/, 'El nombre contiene caracteres no válidos')
    .trim(),
  
  descripcion: yup
    .string()
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .trim()
    .nullable(),
  
  precio: yup
    .string()
    .required('El precio es requerido')
    .matches(/^\d+(\.\d{1,2})?$/, 'Formato de precio inválido (ej: 10.50)')
    .test('max-value', 'El precio no puede exceder $10,000', function(value) {
      return parseFloat(value) <= 10000;
    }),
  
  tipo: yup
    .string()
    .test('tipo-servicio-valido', 'Tipo de servicio no válido', function(value) {
      const tiposValidos = [
        'general', 'tecnologia', 'limpieza', 'catering', 
        'seguridad', 'transporte', 'entretenimiento'
      ];
      return tiposValidos.includes(value);
    })
    .required('El tipo de servicio es requerido'),
  
  unidadPrecio: yup
    .string()
    .test('unidad-precio-valida', 'Unidad de precio no válida', function(value) {
      const unidadesValidas = ['persona', 'dia', 'hora', 'servicio', 'mes'];
      return unidadesValidas.includes(value);
    })
    .required('La unidad de precio es requerida'),
});


const serviciosListSchema = yup.array().of(servicioAdicionalSchema);

const ServiciosEspacio = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { oficina } = route.params;

  
  const { serviciosPorEspacio, loading, error } = useSelector(state => state.proveedores);
  const serviciosIncluidos = serviciosPorEspacio[oficina.id] || [];

  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '0',
    tipo: 'general',
    unidadPrecio: 'persona'
  });

  
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    
    validarOficina();
    
    if (oficina.id) {
      dispatch(obtenerServiciosPorEspacio(oficina.id));
    }
  }, [dispatch, oficina.id]);

  useEffect(() => {
    
    validarServiciosIncluidos();
  }, [serviciosIncluidos]);

  
  const validarOficina = async () => {
    try {
      await oficinaSchema.validate(oficina);
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.oficina;
        return newErrors;
      });
    } catch (error) {
      setValidationErrors(prev => ({
        ...prev,
        oficina: error.message
      }));
      Alert.alert('Error', 'Datos de oficina inválidos: ' + error.message);
    }
  };

  
  const validarServiciosIncluidos = async () => {
    if (serviciosIncluidos.length === 0) return;

    try {
      await serviciosListSchema.validate(serviciosIncluidos);
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.serviciosLista;
        return newErrors;
      });
    } catch (error) {
      setValidationErrors(prev => ({
        ...prev,
        serviciosLista: error.message
      }));
      console.warn('Servicios inválidos encontrados:', error.message);
    }
  };

  
  const validarServicio = async (servicio) => {
    try {
      await servicioAdicionalSchema.validate(servicio);
      return { valido: true, errores: null };
    } catch (error) {
      console.warn('Servicio inválido:', servicio, error.message);
      return { valido: false, errores: error.message };
    }
  };

  
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    
    const timeoutId = setTimeout(() => {
      validateFormField(field, value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  
  const validateFormField = async (fieldName, value) => {
    try {
      await yup.reach(servicioFormSchema, fieldName).validate(value);
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    } catch (error) {
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: error.message
      }));
      return false;
    }
  };

  
  const validarFormulario = async () => {
    try {
      await servicioFormSchema.validate(formData, { abortEarly: false });
      
      
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        ['nombre', 'descripcion', 'precio', 'tipo', 'unidadPrecio'].forEach(field => {
          delete newErrors[field];
        });
        return newErrors;
      });
      
      return true;
    } catch (error) {
      const errors = {};
      error.inner.forEach(err => {
        errors[err.path] = err.message;
      });
      setValidationErrors(prev => ({ ...prev, ...errors }));
      return false;
    }
  };

  
  const validacionesAdicionales = () => {
    const errores = {};

    
    const nombreExistente = serviciosIncluidos.find(s => 
      s.nombre.toLowerCase() === formData.nombre.toLowerCase().trim() &&
      (!editingService || s.id !== editingService.id)
    );
    
    if (nombreExistente) {
      errores.nombre = 'Ya existe un servicio con este nombre';
    }

    
    const precio = parseFloat(formData.precio);
    if (precio === 0 && formData.unidadPrecio !== 'servicio') {
      errores.precio = 'Si el servicio es gratuito, la unidad debe ser "servicio"';
    }

    
    if (formData.tipo === 'catering' && precio > 500) {
      errores.precio = 'El precio para catering no puede exceder $500';
    }

    if (formData.tipo === 'seguridad' && formData.unidadPrecio === 'persona') {
      errores.unidadPrecio = 'Seguridad no se cobra por persona';
    }

    
    if (['tecnologia', 'seguridad'].includes(formData.tipo) && !formData.descripcion.trim()) {
      errores.descripcion = 'Este tipo de servicio requiere descripción detallada';
    }

    if (Object.keys(errores).length > 0) {
      setValidationErrors(prev => ({ ...prev, ...errores }));
      return false;
    }

    return true;
  };

  const toggleServicio = async (servicioId) => {
    try {
      
      const servicio = serviciosIncluidos.find(s => s.id === servicioId);
      if (!servicio) {
        Alert.alert('Error', 'Servicio no encontrado');
        return;
      }

      const validacion = await validarServicio(servicio);
      if (!validacion.valido) {
        Alert.alert('Error', 'No se puede modificar un servicio inválido');
        return;
      }

      const result = await dispatch(toggleServicioAdicional(servicioId, !servicio.activo));

      if (result.success) {
        dispatch(obtenerServiciosPorEspacio(oficina.id));
      } else {
        Alert.alert('Error', result.error || 'Error al cambiar estado del servicio');
      }
    } catch (error) {
      console.error('Error en toggleServicio:', error);
      Alert.alert('Error', 'Error al cambiar estado del servicio');
    }
  };

  const handleEditServicio = async (servicio) => {
    
    const validacion = await validarServicio(servicio);
    if (!validacion.valido) {
      Alert.alert('Error', 'No se puede editar este servicio: ' + validacion.errores);
      return;
    }

    setEditingService(servicio);
    setFormData({
      nombre: servicio.nombre || '',
      descripcion: servicio.descripcion || '',
      precio: (servicio.precio || 0).toString(),
      tipo: servicio.tipo || 'general',
      unidadPrecio: servicio.unidadPrecio || 'persona'
    });
    setValidationErrors({});
    setModalVisible(true);
  };

  const handleAddServicio = () => {
    setEditingService(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '0',
      tipo: 'general',
      unidadPrecio: 'persona'
    });
    setValidationErrors({});
    setModalVisible(true);
  };

  const handleSaveServicio = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      
      const formularioValido = await validarFormulario();
      const validacionesExtra = validacionesAdicionales();
      
      if (!formularioValido || !validacionesExtra) {
        Alert.alert('Error de validación', 'Por favor corrige los errores en el formulario');
        return;
      }

      const servicioData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio) || 0,
        tipo: formData.tipo,
        unidadPrecio: formData.unidadPrecio,
        activo: true
      };

      
      await servicioAdicionalSchema.validate(servicioData);

      let result;

      if (editingService) {
        result = await dispatch(actualizarServicioAdicional(editingService.id, servicioData));
      } else {
        result = await dispatch(crearServicioAdicional(servicioData));

        if (result.success) {
          await dispatch(asignarEspacioAServicio(result.data.id, { espacioId: oficina.id }));
        }
      }

      if (result.success) {
        setModalVisible(false);
        setEditingService(null);
        setValidationErrors({});

        dispatch(obtenerServiciosPorEspacio(oficina.id));
        Alert.alert(
          'Éxito', 
          editingService ? 'Servicio actualizado correctamente' : 'Servicio creado correctamente'
        );
      } else {
        Alert.alert('Error', result.error || 'Error al guardar el servicio');
      }
    } catch (error) {
      console.error('Error en handleSaveServicio:', error);
      Alert.alert('Error', 'Error al guardar el servicio: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteServicio = (servicioId) => {
    
    const servicio = serviciosIncluidos.find(s => s.id === servicioId);
    if (!servicio) {
      Alert.alert('Error', 'Servicio no encontrado');
      return;
    }

    Alert.alert(
      'Eliminar servicio',
      `¿Estás seguro de que quieres eliminar "${servicio.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await dispatch(eliminarServicioAdicional(servicioId));

              if (result.success) {
                dispatch(obtenerServiciosPorEspacio(oficina.id));
                Alert.alert('Éxito', 'Servicio eliminado correctamente');
              } else {
                Alert.alert('Error', result.error || 'Error al eliminar el servicio');
              }
            } catch (error) {
              console.error('Error eliminando servicio:', error);
              Alert.alert('Error', 'Error al eliminar el servicio');
            }
          }
        }
      ]
    );
  };

  
  const obtenerServiciosValidos = () => {
    return serviciosIncluidos.filter(async (servicio, index) => {
      const validacion = await validarServicio(servicio);
      if (!validacion.valido) {
        console.warn(`Servicio inválido en posición ${index}:`, validacion.errores);
        return false;
      }
      return true;
    });
  };

  
  const ErrorText = ({ error }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  const renderServicio = ({ item: servicio, index }) => {
    
    const validacion = validarServicio(servicio);
    
    return (
      <View style={[
        styles.servicioItem, 
        !servicio.activo && styles.servicioInactivo,
        !validacion.valido && styles.servicioInvalido
      ]}>
        <View style={styles.servicioInfo}>
          <Text style={[styles.servicioNombre, !servicio.activo && styles.textoInactivo]}>
            {servicio.nombre}
            {!validacion.valido && ' ⚠️'}
          </Text>
          <Text style={[styles.servicioDescripcion, !servicio.activo && styles.textoInactivo]}>
            {servicio.descripcion || 'Sin descripción'}
          </Text>
          <View style={styles.servicioMeta}>
            <Text style={styles.servicioTipo}>
              {servicio.tipo?.charAt(0).toUpperCase() + servicio.tipo?.slice(1)}
            </Text>
            {servicio.precio > 0 && (
              <Text style={styles.servicioPrecio}>
                +${servicio.precio.toFixed(2)}/{servicio.unidadPrecio || 'día'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.servicioActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditServicio(servicio)}
            disabled={loading}
          >
            <Ionicons name="create-outline" size={20} color="#4a90e2" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteServicio(servicio.id)}
            disabled={loading}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, servicio.activo && styles.toggleButtonActive]}
            onPress={() => toggleServicio(servicio.id)}
            disabled={loading}
          >
            <Ionicons
              name={servicio.activo ? 'checkmark' : 'close'}
              size={20}
              color={servicio.activo ? '#fff' : '#7f8c8d'}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const serviciosActivos = serviciosIncluidos.filter(s => s.activo);
  const serviciosInactivos = serviciosIncluidos.filter(s => !s.activo);
  const serviciosConCosto = serviciosIncluidos.filter(s => s.precio > 0);

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
        <Text style={styles.headerTitle}>Servicios incluidos</Text>
        <TouchableOpacity
          onPress={handleAddServicio}
          style={styles.addButton}
          disabled={loading}
        >
          <Ionicons name="add" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      {/* Mostrar errores de validación */}
      {validationErrors.oficina && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={16} color="#e74c3c" />
          <Text style={styles.errorContainerText}>Oficina: {validationErrors.oficina}</Text>
        </View>
      )}

      {validationErrors.serviciosLista && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={16} color="#e74c3c" />
          <Text style={styles.errorContainerText}>Lista: {validationErrors.serviciosLista}</Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.espacioNombre}>{oficina.nombre}</Text>
        <Text style={styles.infoText}>
          Gestiona los servicios que están incluidos en el precio base de tu espacio
        </Text>
        {error && (
          <Text style={styles.errorText}>Error: {error}</Text>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{serviciosActivos.length}</Text>
          <Text style={styles.statLabel}>Servicios activos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{serviciosInactivos.length}</Text>
          <Text style={styles.statLabel}>Servicios inactivos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{serviciosConCosto.length}</Text>
          <Text style={styles.statLabel}>Con costo adicional</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando servicios...</Text>
        </View>
      ) : serviciosIncluidos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="construct-outline" size={48} color="#bdc3c7" />
          <Text style={styles.emptyText}>No hay servicios configurados</Text>
          <Text style={styles.emptySubtext}>
            Agrega servicios para mejorar la experiencia de tus huéspedes
          </Text>
        </View>
      ) : (
        <FlatList
          data={serviciosIncluidos}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderServicio}
          style={styles.lista}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingService ? 'Editar servicio' : 'Agregar servicio'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre del servicio *</Text>
                <TextInput
                  style={[
                    styles.input,
                    validationErrors.nombre && styles.inputError
                  ]}
                  value={formData.nombre}
                  onChangeText={(text) => updateFormData('nombre', text)}
                  placeholder="Ej: Wi-Fi Premium"
                  maxLength={50}
                  editable={!isSubmitting}
                />
                <ErrorText error={validationErrors.nombre} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[
                    styles.input, 
                    styles.textArea,
                    validationErrors.descripcion && styles.inputError
                  ]}
                  value={formData.descripcion}
                  onChangeText={(text) => updateFormData('descripcion', text)}
                  placeholder="Describe brevemente el servicio"
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                  editable={!isSubmitting}
                />
                <Text style={styles.characterCount}>
                  {formData.descripcion.length}/200 caracteres
                </Text>
                <ErrorText error={validationErrors.descripcion} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipo de servicio *</Text>
                <View style={styles.radioGroup}>
                  {['general', 'tecnologia', 'limpieza', 'catering', 'seguridad'].map(tipo => (
                    <TouchableOpacity
                      key={tipo}
                      style={styles.radioOption}
                      onPress={() => updateFormData('tipo', tipo)}
                      disabled={isSubmitting}
                    >
                      <Ionicons
                        name={formData.tipo === tipo ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color="#4a90e2"
                      />
                      <Text style={styles.radioLabel}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <ErrorText error={validationErrors.tipo} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Precio adicional (USD) *</Text>
                <TextInput
                  style={[
                    styles.input,
                    validationErrors.precio && styles.inputError
                  ]}
                  value={formData.precio}
                  onChangeText={(text) => updateFormData('precio', text)}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  editable={!isSubmitting}
                />
                <ErrorText error={validationErrors.precio} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Unidad de precio *</Text>
                <View style={styles.radioGroup}>
                  {['persona', 'dia', 'hora', 'servicio'].map(unidad => (
                    <TouchableOpacity
                      key={unidad}
                      style={styles.radioOption}
                      onPress={() => updateFormData('unidadPrecio', unidad)}
                      disabled={isSubmitting}
                    >
                      <Ionicons
                        name={formData.unidadPrecio === unidad ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color="#4a90e2"
                      />
                      <Text style={styles.radioLabel}>{unidad.charAt(0).toUpperCase() + unidad.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <ErrorText error={validationErrors.unidadPrecio} />
              </View>

              <Text style={styles.helpText}>
                * Campos obligatorios. Deja en 0 si está incluido en el precio base
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  isSubmitting && styles.saveButtonDisabled
                ]}
                onPress={handleSaveServicio}
                disabled={isSubmitting}
              >
                <Text style={styles.saveButtonText}>
                  {isSubmitting ? 'Guardando...' : editingService ? 'Guardar' : 'Agregar'}
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
  addButton: {
    padding: 5,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  espacioNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
  lista: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  servicioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  servicioInactivo: {
    opacity: 0.6,
  },
  servicioInvalido: {
    borderWidth: 2,
    borderColor: '#e74c3c',
    backgroundColor: '#ffeaa7',
  },
  servicioInfo: {
    flex: 1,
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  servicioDescripcion: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  servicioMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicioTipo: {
    fontSize: 11,
    color: '#95a5a6',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  servicioPrecio: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e74c3c',
  },
  textoInactivo: {
    color: '#bdc3c7',
  },
  servicioActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  toggleButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 20,
    textAlign: 'center',
    fontFamily: 'System',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
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
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'right',
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
  
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffeaa7',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 8,
  },
  errorContainerText: {
    fontSize: 14,
    color: '#e74c3c',
    marginLeft: 8,
    flex: 1,
    fontFamily: 'System',
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 4,
    fontFamily: 'System',
  },
});

export default ServiciosEspacio;