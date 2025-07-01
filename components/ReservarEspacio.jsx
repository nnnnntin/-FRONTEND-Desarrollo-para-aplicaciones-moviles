import { Ionicons } from '@expo/vector-icons';
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
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import { obtenerServiciosPorEspacio } from '../store/slices/proveedoresSlice';



const reservaSchema = yup.object({
  fecha: yup
    .string()
    .required('La fecha es obligatoria')
    .matches(
      /^\d{4}-\d{2}-\d{2}$/,
      'Formato de fecha inválido (debe ser YYYY-MM-DD)'
    )
    .test('fecha-futura', 'La fecha no puede ser en el pasado', function(value) {
      if (!value) return false;
      const fechaSeleccionada = new Date(value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      return fechaSeleccionada >= hoy;
    })
    .test('fecha-valida', 'Fecha inválida', function(value) {
      if (!value) return false;
      const fecha = new Date(value);
      return !isNaN(fecha.getTime());
    }),

  horaInicio: yup
    .string()
    .required('La hora de inicio es obligatoria')
    .matches(
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Formato de hora inválido (debe ser HH:MM en formato 24h)'
    )
    .test('hora-trabajo', 'Hora fuera del horario de trabajo (06:00 - 18:00)', function(value) {
      if (!value) return false;
      const [horas, minutos] = value.split(':').map(Number);
      const minutosTotal = horas * 60 + minutos;
      return minutosTotal >= 360 && minutosTotal <= 1080; 
    }),

  horaFin: yup
    .string()
    .required('La hora de fin es obligatoria')
    .matches(
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Formato de hora inválido (debe ser HH:MM en formato 24h)'
    )
    .test('hora-trabajo', 'Hora fuera del horario de trabajo (06:00 - 18:00)', function(value) {
      if (!value) return false;
      const [horas, minutos] = value.split(':').map(Number);
      const minutosTotal = horas * 60 + minutos;
      return minutosTotal >= 360 && minutosTotal <= 1080; 
    })
    .test('hora-posterior', 'La hora de fin debe ser posterior a la hora de inicio', function(value) {
      const horaInicio = this.parent.horaInicio;
      if (!value || !horaInicio) return false;
      
      const [hI, mI] = horaInicio.split(':').map(Number);
      const [hF, mF] = value.split(':').map(Number);
      
      const minutosInicio = hI * 60 + mI;
      const minutosFin = hF * 60 + mF;
      
      return minutosFin > minutosInicio;
    })
    .test('duracion-minima', 'La reserva debe ser de al menos 1 hora', function(value) {
      const horaInicio = this.parent.horaInicio;
      if (!value || !horaInicio) return false;
      
      const [hI, mI] = horaInicio.split(':').map(Number);
      const [hF, mF] = value.split(':').map(Number);
      
      const minutosInicio = hI * 60 + mI;
      const minutosFin = hF * 60 + mF;
      
      return (minutosFin - minutosInicio) >= 60; 
    }),

  cantidadPersonas: yup
    .number()
    .required('La cantidad de personas es obligatoria')
    .min(1, 'Debe haber al menos 1 persona')
    .integer('La cantidad debe ser un número entero')
    .test('capacidad-maxima', 'Excede la capacidad máxima del espacio', function(value) {
      const capacidad = this.options.context?.capacidad || 1;
      return value <= capacidad;
    }),
});


const servicioSchema = yup.object({
  id: yup
    .mixed()
    .required('ID del servicio es requerido')
    .test('id-valido', 'ID debe ser string o número', function(value) {
      return typeof value === 'string' || typeof value === 'number';
    }),
  
  nombre: yup
    .string()
    .required('Nombre del servicio es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  precio: yup
    .number()
    .required('El precio es requerido')
    .min(0, 'El precio no puede ser negativo'),
  
  unidadPrecio: yup
    .string()
    .test('unidad-precio-valida', 'Unidad de precio no válida', function(value) {
      if (!value) return true; 
      const unidadesValidas = ['fijo', 'persona', 'hora'];
      return unidadesValidas.includes(value);
    })
    .default('fijo'),
  
  disponible: yup
    .boolean()
    .default(true),
});


const espacioSchema = yup.object({
  id: yup
    .mixed()
    .required('ID del espacio es requerido')
    .test('id-valido', 'ID debe ser string o número', function(value) {
      return typeof value === 'string' || typeof value === 'number';
    }),
  
  nombre: yup
    .string()
    .required('Nombre del espacio es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  precio: yup
    .number()
    .required('El precio es requerido')
    .min(0, 'El precio no puede ser negativo'),
  
  capacidad: yup
    .number()
    .required('La capacidad es requerida')
    .min(1, 'La capacidad debe ser al menos 1')
    .max(1000, 'Capacidad excesiva'),
  
  descripcion: yup
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
  
  imagen: yup
    .string()
    .url('URL de imagen inválida')
    .nullable(),
});


const procesoReservaSchema = yup.object({
  espacio: espacioSchema,
  datosReserva: reservaSchema,
  serviciosSeleccionados: yup.array().of(servicioSchema),
  precioTotal: yup
    .number()
    .min(0, 'El precio total no puede ser negativo')
    .required('El precio total es requerido'),
});

const ReservarEspacio = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { espacio } = route.params;

  
  const { serviciosPorEspacio, loading } = useSelector(state => state.proveedores);
  const serviciosAdicionales = serviciosPorEspacio[espacio.id] || [];

  
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  
  const hoyISO = new Date().toISOString().split('T')[0];
  const [datosReserva, setDatosReserva] = useState({
    fecha: hoyISO,
    horaInicio: '09:00',
    horaFin: '17:00',
    cantidadPersonas: 1,
  });

  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);

  useEffect(() => {
    
    validarEspacio();
    
    if (espacio.id) {
      dispatch(obtenerServiciosPorEspacio(espacio.id));
    }
  }, [dispatch, espacio.id]);

  useEffect(() => {
    
    validarServicios();
  }, [serviciosAdicionales]);

  
  const validarEspacio = async () => {
    try {
      await espacioSchema.validate(espacio);
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.espacio;
        return newErrors;
      });
    } catch (error) {
      setValidationErrors(prev => ({
        ...prev,
        espacio: error.message
      }));
      Alert.alert('Error', 'Datos del espacio inválidos: ' + error.message);
    }
  };

  
  const validarServicios = async () => {
    if (serviciosAdicionales.length === 0) return;

    try {
      await yup.array().of(servicioSchema).validate(serviciosAdicionales);
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.servicios;
        return newErrors;
      });
    } catch (error) {
      setValidationErrors(prev => ({
        ...prev,
        servicios: error.message
      }));
      console.warn('Servicios inválidos encontrados:', error.message);
    }
  };

  
  const updateDatosReserva = (field, value) => {
    setDatosReserva(prev => ({ ...prev, [field]: value }));
    
    
    const timeoutId = setTimeout(() => {
      validateReservaField(field, value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  
  const validateReservaField = async (fieldName, value) => {
    try {
      const contexto = { capacidad: espacio.capacidad };
      await yup.reach(reservaSchema, fieldName).validate(value, { context: contexto });
      
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

  
  const validarReservaCompleta = async () => {
    try {
      const contexto = { capacidad: espacio.capacidad };
      await reservaSchema.validate(datosReserva, { 
        abortEarly: false,
        context: contexto 
      });
      
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        ['fecha', 'horaInicio', 'horaFin', 'cantidadPersonas'].forEach(field => {
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

    
    const esFinDeSemana = () => {
      const fecha = new Date(datosReserva.fecha);
      const diaSemana = fecha.getDay();
      return diaSemana === 0 || diaSemana === 6; 
    };

    if (esFinDeSemana()) {
      errores.fecha = 'Este espacio no está disponible los fines de semana';
    }

    
    const [hI] = datosReserva.horaInicio.split(':').map(Number);
    const [hF] = datosReserva.horaFin.split(':').map(Number);
    
    if (hI <= 12 && hF >= 13) {
      errores.horaFin = 'La reserva no puede incluir el horario de almuerzo (12:00 - 13:00)';
    }

    if (Object.keys(errores).length > 0) {
      setValidationErrors(prev => ({ ...prev, ...errores }));
      return false;
    }

    return true;
  };

  const handleGoBack = () => navigation.goBack();

  const toggleServicio = async (servicio) => {
    
    try {
      await servicioSchema.validate(servicio);
    } catch (error) {
      Alert.alert('Error', 'Servicio inválido: ' + error.message);
      return;
    }

    setServiciosSeleccionados(prev => {
      const existe = prev.find(s => s.id === servicio.id);
      if (existe) return prev.filter(s => s.id !== servicio.id);
      return [...prev, servicio];
    });
  };

  const calcularPrecioTotal = () => {
    try {
      const precioBase = parseFloat(espacio.precio);
      if (isNaN(precioBase) || precioBase < 0) {
        throw new Error('Precio base inválido');
      }

      const precioServicios = serviciosSeleccionados.reduce((total, servicio) => {
        const precio = parseFloat(servicio.precio);
        if (isNaN(precio) || precio < 0) {
          console.warn('Precio de servicio inválido:', servicio);
          return total;
        }

        return total + (servicio.unidadPrecio === 'persona'
          ? precio * datosReserva.cantidadPersonas
          : precio);
      }, 0);

      return precioBase + precioServicios;
    } catch (error) {
      console.error('Error calculando precio total:', error);
      return 0;
    }
  };

  const validarDisponibilidad = () => {
    
    
    
    const fecha = new Date(datosReserva.fecha);
    const diaSemana = fecha.getDay();
    
    
    if (diaSemana === 1) {
      return false;
    }
    
    return true;
  };

  const handleReservar = async () => {
    if (!mostrarDetalles) {
      
      const espacioValido = await validarEspacio();
      if (!espacioValido) {
        Alert.alert('Error', 'Los datos del espacio no son válidos');
        return;
      }
      
      setMostrarDetalles(true);
      return;
    }

    
    const reservaValida = await validarReservaCompleta();
    const validacionesExtra = validacionesAdicionales();
    
    if (!reservaValida || !validacionesExtra) {
      Alert.alert('Error de validación', 'Por favor corrige los errores en el formulario');
      return;
    }

    
    if (!validarDisponibilidad()) {
      Alert.alert('No disponible', 'Este espacio no está disponible en el horario seleccionado');
      return;
    }

    try {
      
      const precioTotal = calcularPrecioTotal();
      
      const procesoCompleto = {
        espacio,
        datosReserva,
        serviciosSeleccionados,
        precioTotal
      };

      await procesoReservaSchema.validate(procesoCompleto);

      Alert.alert(
        'Confirmar reserva',
        `¿Confirmar reserva por $${precioTotal.toFixed(2)}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: () => {
              navigation.navigate('MetodosPago', {
                modoSeleccion: true,
                oficina: espacio,
                precio: precioTotal.toFixed(2),
                datosReserva: {
                  ...datosReserva,
                  serviciosAdicionales: serviciosSeleccionados
                }
              });
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error en validación final:', error);
      Alert.alert('Error', 'Error en los datos de la reserva: ' + error.message);
    }
  };

  
  const obtenerServiciosValidos = () => {
    return serviciosAdicionales.filter(servicio => {
      try {
        servicioSchema.validateSync(servicio);
        return true;
      } catch (error) {
        console.warn('Servicio inválido filtrado:', servicio, error.message);
        return false;
      }
    });
  };

  
  const ErrorText = ({ error }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  const serviciosValidos = obtenerServiciosValidos();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{espacio.nombre}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Mostrar errores de validación del espacio */}
      {validationErrors.espacio && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={16} color="#e74c3c" />
          <Text style={styles.errorContainerText}>Espacio: {validationErrors.espacio}</Text>
        </View>
      )}

      {validationErrors.servicios && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={16} color="#e74c3c" />
          <Text style={styles.errorContainerText}>Servicios: {validationErrors.servicios}</Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: espacio.imagen || 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' 
            }}
            style={styles.espacioImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <Text style={styles.espacioNombreOverlay}>{espacio.nombre}</Text>
          </View>
        </View>

        <View style={styles.mainInfo}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.descripcion}>
            {espacio.descripcion || 'Reserva la mejor oficina panorámica de la ciudad. Moderno diseño minimalista, excepcional iluminación y servicios brindados.'}
          </Text>

          <View style={styles.caracteristicasSection}>
            <View style={styles.caracteristicasColumn}>
              <Text style={styles.caracteristicasTitulo}>Amenidades Destacadas</Text>
              <View style={styles.amenidad}>
                <Ionicons name="wifi" size={16} color="#4a90e2" />
                <Text style={styles.amenidadText}>WiFi premium gratis</Text>
              </View>
              <View style={styles.amenidad}>
                <Ionicons name="car" size={16} color="#4a90e2" />
                <Text style={styles.amenidadText}>Estacionamiento</Text>
              </View>
              <View style={styles.amenidad}>
                <Ionicons name="cafe" size={16} color="#4a90e2" />
                <Text style={styles.amenidadText}>Café incluido</Text>
              </View>
            </View>

            <View style={styles.caracteristicasColumn}>
              <Text style={styles.caracteristicasTitulo}>Equipamiento & Conectividad</Text>
              <View style={styles.amenidad}>
                <Ionicons name="desktop" size={16} color="#4a90e2" />
                <Text style={styles.amenidadText}>Computadoras e Impresoras</Text>
              </View>
              <View style={styles.amenidad}>
                <Ionicons name="videocam" size={16} color="#4a90e2" />
                <Text style={styles.amenidadText}>Videoconferencias</Text>
              </View>
            </View>
          </View>

          <View style={styles.detallesTecnicos}>
            <View style={styles.detalleItem}>
              <Text style={styles.detalleLabel}>Extras & Seguridad</Text>
              <Text style={styles.detalleValue}>Vigilancia 24 hrs acceso controlado con tarjeta de seguridad</Text>
            </View>

            <View style={styles.detalleItem}>
              <Text style={styles.detalleLabel}>Capacidad & Horario</Text>
              <Text style={styles.detalleValue}>
                Límite: máx {espacio.capacidad} pers{'\n'}
                Horario: 06:00 - 18:00{'\n'}
                Lun - Vie (fines de semana cerrado)
              </Text>
            </View>
          </View>

          <View style={styles.precioSection}>
            <Text style={styles.precioLabel}>Precio</Text>
            <Text style={styles.precioValue}>${espacio.precio} USD</Text>
          </View>
        </View>

        {mostrarDetalles && (
          <View style={styles.detallesReserva}>
            <Text style={styles.detallesTitle}>Completa tu reserva</Text>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Fecha (YYYY-MM-DD)</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.fecha && styles.inputError
                ]}
                value={datosReserva.fecha}
                onChangeText={(value) => updateDatosReserva('fecha', value)}
                placeholder="2025-06-20"
              />
              <ErrorText error={validationErrors.fecha} />
            </View>

            <View style={styles.horasContainer}>
              <View style={styles.horaInput}>
                <Text style={styles.inputLabel}>Hora inicio</Text>
                <TextInput
                  style={[
                    styles.input,
                    validationErrors.horaInicio && styles.inputError
                  ]}
                  value={datosReserva.horaInicio}
                  onChangeText={(value) => updateDatosReserva('horaInicio', value)}
                  placeholder="09:00"
                />
                <ErrorText error={validationErrors.horaInicio} />
              </View>
              <View style={styles.horaInput}>
                <Text style={styles.inputLabel}>Hora fin</Text>
                <TextInput
                  style={[
                    styles.input,
                    validationErrors.horaFin && styles.inputError
                  ]}
                  value={datosReserva.horaFin}
                  onChangeText={(value) => updateDatosReserva('horaFin', value)}
                  placeholder="17:00"
                />
                <ErrorText error={validationErrors.horaFin} />
              </View>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Cantidad de personas</Text>
              <View style={styles.cantidadContainer}>
                <TouchableOpacity
                  style={styles.cantidadButton}
                  onPress={() => updateDatosReserva('cantidadPersonas', Math.max(1, datosReserva.cantidadPersonas - 1))}
                >
                  <Ionicons name="remove" size={24} color="#4a90e2" />
                </TouchableOpacity>
                <Text style={styles.cantidadText}>{datosReserva.cantidadPersonas}</Text>
                <TouchableOpacity
                  style={styles.cantidadButton}
                  onPress={() => updateDatosReserva('cantidadPersonas', Math.min(espacio.capacidad, datosReserva.cantidadPersonas + 1))}
                >
                  <Ionicons name="add" size={24} color="#4a90e2" />
                </TouchableOpacity>
              </View>
              <ErrorText error={validationErrors.cantidadPersonas} />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Servicios adicionales</Text>
              {loading ? (
                <Text style={styles.loadingText}>Cargando servicios...</Text>
              ) : serviciosValidos.length === 0 ? (
                <Text style={styles.noServiciosText}>No hay servicios adicionales disponibles</Text>
              ) : (
                serviciosValidos.map(servicio => (
                  <TouchableOpacity
                    key={servicio.id}
                    style={[
                      styles.servicioItem,
                      serviciosSeleccionados.some(s => s.id === servicio.id) && styles.servicioItemActive
                    ]}
                    onPress={() => toggleServicio(servicio)}
                  >
                    <View style={styles.servicioInfo}>
                      <Text style={styles.servicioNombre}>{servicio.nombre}</Text>
                      <Text style={styles.servicioPrecio}>
                        ${servicio.precio}/{servicio.unidadPrecio}
                      </Text>
                    </View>
                    <Ionicons
                      name={serviciosSeleccionados.some(s => s.id === servicio.id) ? 'checkbox' : 'square-outline'}
                      size={24}
                      color="#4a90e2"
                    />
                  </TouchableOpacity>
                ))
              )}
            </View>

            {serviciosSeleccionados.length > 0 && (
              <View style={styles.resumenSection}>
                <Text style={styles.resumenTitle}>Resumen de costos</Text>
                <View style={styles.resumenItem}>
                  <Text style={styles.resumenLabel}>Precio base</Text>
                  <Text style={styles.resumenValue}>${espacio.precio}</Text>
                </View>
                {serviciosSeleccionados.map(servicio => (
                  <View key={servicio.id} style={styles.resumenItem}>
                    <Text style={styles.resumenLabel}>
                      {servicio.nombre}{servicio.unidadPrecio === 'persona' && ` (x${datosReserva.cantidadPersonas})`}
                    </Text>
                    <Text style={styles.resumenValue}>
                      ${servicio.unidadPrecio === 'persona' ? servicio.precio * datosReserva.cantidadPersonas : servicio.precio}
                    </Text>
                  </View>
                ))}
                <View style={[styles.resumenItem, styles.resumenTotal]}>
                  <Text style={styles.resumenTotalLabel}>Total</Text>
                  <Text style={styles.resumenTotalValue}>${calcularPrecioTotal().toFixed(2)}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.reservarButton} onPress={handleReservar}>
          <Text style={styles.reservarButtonText}>
            {mostrarDetalles ? 'CONTINUAR CON EL PAGO' : 'RESERVAR'}
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
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  espacioImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  espacioNombreOverlay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  mainInfo: {
    backgroundColor: '#fff',
    padding: 20,
  },
  espacioNombre: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 10,
  },
  descripcion: {
    fontSize: 14,
    color: '#5a6c7d',
    lineHeight: 20,
    marginBottom: 20,
  },
  caracteristicasSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  caracteristicasColumn: {
    flex: 1,
    marginRight: 10,
  },
  caracteristicasTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  amenidad: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  amenidadText: {
    fontSize: 12,
    color: '#5a6c7d',
    marginLeft: 8,
    flex: 1,
  },
  detallesTecnicos: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  detalleItem: {
    flex: 1,
    marginRight: 10,
  },
  detalleLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  detalleValue: {
    fontSize: 12,
    color: '#5a6c7d',
    lineHeight: 16,
  },
  precioSection: {
    marginTop: 10,
  },
  precioLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  precioValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  detallesReserva: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  detallesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputSection: {
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  horasContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  horaInput: {
    flex: 1,
  },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 10,
  },
  cantidadButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    elevation: 1,
  },
  cantidadText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    minWidth: 40,
    textAlign: 'center',
  },
  servicioItem: {
    backgroundColor: '#f8f9fa',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  servicioPrecio: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  noServiciosText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  resumenSection: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  resumenTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  resumenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resumenLabel: {
    fontSize: 12,
    color: '#5a6c7d',
  },
  resumenValue: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
  },
  resumenTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    paddingTop: 8,
    marginTop: 8,
  },
  resumenTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  resumenTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  reservarButton: {
    backgroundColor: '#4a90e2',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  reservarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 30,
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

export default ReservarEspacio;