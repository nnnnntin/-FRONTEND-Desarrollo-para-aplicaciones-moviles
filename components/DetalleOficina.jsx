import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
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
import { obtenerServiciosPorEspacio } from '../store/slices/proveedoresSlice';

const DetalleOficina = ({ navigation, route }) => {
  if (!route?.params?.oficina) {
    Alert.alert('Error', 'No se encontraron los datos de la oficina');
    navigation.goBack();
    return null;
  }

  const { oficina, esPropia } = route.params;
  const dispatch = useDispatch();
  const { tipoUsuario } = useSelector(state => state.usuario);
  const { serviciosPorEspacio, loading } = useSelector(state => state.proveedores);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const [modalVisible, setModalVisible] = useState(false);
  const hoyISO = new Date().toISOString().split('T')[0];
  const [fechaInput, setFechaInput] = useState(hoyISO);
  const [horaInicioInput, setHoraInicioInput] = useState('09:00');
  const [horaFinInput, setHoraFinInput] = useState('17:00');
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [serviciosAdicionales, setServiciosAdicionales] = useState([]);

  const detallesOficina = {
    1: {
      descripcion: "Reservar la mejor oficina panorámica de la ciudad. Moderno diseño minimalista, excepcional iluminación y servicios brindados.",
      amenidades: [
        "Café premium gratis",
        "Wi-Fi de alta velocidad",
        "Estacionamiento incluido"
      ],
      equipamiento: [
        "Computadoras e Impresoras",
        "Videoconferencias"
      ],
      extras: [
        "Vigilancia 24 hrs acceso",
        "controlado con tarjeta",
        "de seguridad"
      ],
      capacidad: [
        "Límite: máx 8 pers",
        "Horario: 06:00 - 18:00",
        "Lun - Dom"
      ],
      precio: "1200USD",
      imagen: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    2: {
      descripcion: "Oficina con vista privilegiada al horizonte. Espacio cómodo y funcional con todos los servicios necesarios para tu productividad.",
      amenidades: [
        "Café premium gratis",
        "Wi-Fi de alta velocidad",
        "Estacionamiento gratuito"
      ],
      equipamiento: [
        "Computadoras e Impresoras",
        "Sistema audiovisual"
      ],
      extras: [
        "Vigilancia 24 hrs",
        "Acceso con tarjeta",
        "Cámaras de seguridad"
      ],
      capacidad: [
        "Límite: máx 12 pers",
        "Horario: 07:00 - 19:00",
        "Lun - Vie"
      ],
      precio: "1500USD",
      imagen: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    3: {
      descripcion: "Ubicada en el corazón de la ciudad, perfecta para reuniones de negocios. Diseño elegante y profesional.",
      amenidades: [
        "Café premium gratis",
        "Wi-Fi de alta velocidad",
        "Recepcionista"
      ],
      equipamiento: [
        "Computadoras e Impresoras",
        "Mesa de conferencias"
      ],
      extras: [
        "Vigilancia 24 hrs",
        "Control de acceso",
        "Seguridad privada"
      ],
      capacidad: [
        "Límite: máx 6 pers",
        "Horario: 06:00 - 20:00",
        "Lun - Sáb"
      ],
      precio: "900USD",
      imagen: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  };

  const detalle = detallesOficina[oficina.id] || detallesOficina[1];

  useEffect(() => {
    if (oficina.id) {
      cargarServiciosEspacio();
    }
  }, [oficina.id]);

  const cargarServiciosEspacio = async () => {
    try {
      await dispatch(obtenerServiciosPorEspacio(oficina.id));
    } catch (error) {
      console.error('Error cargando servicios del espacio:', error);
    }
  };

  const getServiciosDisponibles = () => {
    const serviciosEspacio = serviciosPorEspacio[oficina.id] || [];
    
    
    if (serviciosEspacio.length === 0) {
      return [
        { _id: 1, nombre: 'Catering básico', precio: 15, unidadPrecio: 'persona' },
        { _id: 2, nombre: 'Proyector y pantalla', precio: 50, unidadPrecio: 'día' },
        { _id: 3, nombre: 'Servicio de café premium', precio: 5, unidadPrecio: 'persona' },
        { _id: 4, nombre: 'Estacionamiento adicional', precio: 20, unidadPrecio: 'día' }
      ];
    }
    
    return serviciosEspacio;
  };

  const handleReservar = () => {
    setModalVisible(true);
  };

  const handleOfrecerServicios = () => {
    navigation.navigate('OfrecerServicios', { oficina });
  };

  const toggleServicio = servicio => {
    setServiciosAdicionales(prev => {
      const existe = prev.find(s => s._id === servicio._id);
      if (existe) return prev.filter(s => s._id !== servicio._id);
      return [...prev, servicio];
    });
  };

  const calcularPrecioTotal = () => {
    const precioBase = parseFloat(detalle.precio.replace('USD', ''));
    const precioServicios = serviciosAdicionales.reduce((tot, s) => {
      return tot + (s.unidadPrecio === 'persona'
        ? s.precio * cantidadPersonas
        : s.precio);
    }, 0);
    return precioBase + precioServicios;
  };

  const handleConfirmarReserva = () => {
    const capacidadMaxima = parseInt(detalle.capacidad[0].split('máx ')[1].split(' pers')[0]);

    if (cantidadPersonas > capacidadMaxima) {
      Alert.alert('Error', `La capacidad máxima es de ${capacidadMaxima} personas`);
      return;
    }

    const parts = fechaInput.split('-').map(n => parseInt(n, 10));
    if (parts.length !== 3) {
      Alert.alert('Error', 'Formato de fecha inválido (debe ser YYYY-MM-DD)');
      return;
    }
    const [year, month, day] = parts;
    const [hI, mI] = horaInicioInput.split(':').map(n => parseInt(n, 10));
    const [hF, mF] = horaFinInput.split(':').map(n => parseInt(n, 10));

    const inicio = new Date(year, month - 1, day, hI, mI);
    const fin = new Date(year, month - 1, day, hF, mF);

    if (isNaN(inicio) || isNaN(fin)) {
      Alert.alert('Error', 'Hora inválida (debe ser HH:MM en 24h)');
      return;
    }
    if (fin <= inicio) {
      Alert.alert('Error', 'La hora de fin debe ser posterior a la hora de inicio');
      return;
    }

    const disponible = true;
    if (!disponible) {
      Alert.alert('No disponible', 'Este espacio no está disponible en el horario seleccionado');
      return;
    }

    const precioTotal = calcularPrecioTotal();
    Alert.alert(
      'Confirmar reserva',
      `¿Confirmar reserva por ${precioTotal.toFixed(2)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setModalVisible(false);
            navigation.navigate('MetodosPago', {
              modoSeleccion: true,
              oficina: oficina,
              precio: precioTotal.toFixed(2),
              datosReserva: {
                fecha: fechaInput,
                horaInicio: horaInicioInput,
                horaFin: horaFinInput,
                cantidadPersonas,
                serviciosAdicionales
              }
            });
          }
        }
      ]
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    setEditData({
      descripcion: detalle.descripcion,
      precio: detalle.precio,
      horario: detalle.capacidad[1],
      capacidadPersonas: detalle.capacidad[0].split('máx ')[1].split(' pers')[0]
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    Alert.alert(
      'Guardar cambios',
      '¿Estás seguro de que quieres guardar los cambios?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Guardar',
          onPress: () => {
            setIsEditing(false);
            Alert.alert('Éxito', 'Los cambios se han guardado correctamente');
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const InfoSection = ({ title, items, iconName }) => (
    <View style={styles.infoSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {items.map((item, index) => (
        <View key={index} style={styles.infoItemContainer}>
          <Ionicons name="checkmark-circle" size={12} color="#4a90e2" />
          <Text style={styles.infoItem}>{item}</Text>
        </View>
      ))}
    </View>
  );

  const serviciosDisponibles = getServiciosDisponibles();

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
        <Text style={styles.headerTitle} numberOfLines={1}>{oficina.nombre}</Text>
        {esPropia && tipoUsuario === 'cliente' && !isEditing && (
          <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color="#4a90e2" />
          </TouchableOpacity>
        )}
        {!esPropia && <View style={styles.placeholder} />}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: detalle.imagen }}
            style={styles.espacioImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <Text style={styles.espacioNombreOverlay}>{oficina.nombre}</Text>
            {esPropia && (
              <View style={styles.propiaIndicator}>
                <Text style={styles.propiaText}>Tu oficina</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.mainInfo}>
          <Text style={styles.sectionTitleMain}>Descripción</Text>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={editData.descripcion}
              onChangeText={(text) => setEditData({ ...editData, descripcion: text })}
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={styles.description}>{detalle.descripcion}</Text>
          )}

          {!isEditing ? (
            <>
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <InfoSection
                    title="Amenidades Destacadas"
                    items={detalle.amenidades}
                    iconName="star"
                  />
                  <InfoSection
                    title="Equipamiento & Conectividad"
                    items={detalle.equipamiento}
                    iconName="laptop"
                  />
                </View>

                <View style={styles.infoRow}>
                  <InfoSection
                    title="Extras & Seguridad"
                    items={detalle.extras}
                    iconName="shield-checkmark"
                  />
                  <InfoSection
                    title="Capacidad & Horario"
                    items={detalle.capacidad}
                    iconName="time"
                  />
                </View>
              </View>

              <View style={styles.priceSection}>
                <Text style={styles.priceLabel}>Precio</Text>
                <Text style={styles.price}>{detalle.precio}</Text>
              </View>

              {esPropia && tipoUsuario === 'cliente' && (
                <View style={styles.serviciosSection}>
                  <Text style={styles.sectionTitleMain}>Servicios de tu espacio</Text>
                  <View style={styles.serviciosContainer}>
                    <View style={styles.serviciosTabs}>
                      <TouchableOpacity
                        style={[styles.servicioTab, styles.servicioTabActive]}
                        onPress={() => navigation.navigate('ServiciosEspacio', { oficina })}
                      >
                        <Ionicons name="construct" size={20} color="#4a90e2" />
                        <Text style={styles.servicioTabText}>Servicios incluidos</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.servicioTab}
                        onPress={() => navigation.navigate('ServiciosOfrecidos', { oficina })}
                      >
                        <Ionicons name="people" size={20} color="#7f8c8d" />
                        <Text style={[styles.servicioTabText, { color: '#7f8c8d' }]}>Proveedores externos</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.serviciosDescripcion}>
                      Gestiona los servicios incluidos en tu espacio y los proveedores externos disponibles
                    </Text>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={styles.editSection}>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Precio</Text>
                <TextInput
                  style={styles.editInput}
                  value={editData.precio}
                  onChangeText={(text) => setEditData({ ...editData, precio: text })}
                  placeholder="Ej: 1200USD"
                />
              </View>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Horario</Text>
                <TextInput
                  style={styles.editInput}
                  value={editData.horario}
                  onChangeText={(text) => setEditData({ ...editData, horario: text })}
                  placeholder="Ej: 08:00-18:00"
                />
              </View>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Capacidad (personas)</Text>
                <TextInput
                  style={styles.editInput}
                  value={editData.capacidadPersonas}
                  onChangeText={(text) => setEditData({ ...editData, capacidadPersonas: text })}
                  placeholder="Ej: 8"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.editButtonStyle, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.editButtonStyle, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {!isEditing && (
          <>
            {tipoUsuario === 'usuario' && !esPropia && (
              <TouchableOpacity
                style={styles.reservarButton}
                onPress={handleReservar}
                activeOpacity={0.8}
              >
                <Text style={styles.reservarButtonText}>RESERVAR</Text>
              </TouchableOpacity>
            )}

            {tipoUsuario === 'proveedor' && !esPropia && (
              <TouchableOpacity
                style={styles.ofrecerServiciosButton}
                onPress={handleOfrecerServicios}
                activeOpacity={0.8}
              >
                <Ionicons name="construct" size={20} color="#fff" />
                <Text style={styles.ofrecerServiciosButtonText}>OFRECER SERVICIOS</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modal de reserva */}
      {tipoUsuario === 'usuario' && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Reservar espacio</Text>
              <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.espacioInfoModal}>
                <Text style={styles.espacioNombreModal}>{oficina.nombre}</Text>
                <Text style={styles.espacioDireccionModal}>{oficina.direccion || 'Montevideo, Ciudad Vieja'}</Text>
                <View style={styles.espacioDetallesModal}>
                  <View style={styles.detalleItemModal}>
                    <Ionicons name="people" size={16} color="#4a90e2" />
                    <Text style={styles.detalleTextModal}>
                      Hasta {parseInt(detalle.capacidad[0].split('máx ')[1].split(' pers')[0])} personas
                    </Text>
                  </View>
                  <View style={styles.detalleItemModal}>
                    <Ionicons name="pricetag" size={16} color="#27ae60" />
                    <Text style={styles.detalleTextModal}>${detalle.precio}/día</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Fecha (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  value={fechaInput}
                  onChangeText={setFechaInput}
                  placeholder="2025-06-20"
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hora inicio (HH:MM)</Text>
                <TextInput
                  style={styles.input}
                  value={horaInicioInput}
                  onChangeText={setHoraInicioInput}
                  placeholder="09:00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hora fin (HH:MM)</Text>
                <TextInput
                  style={styles.input}
                  value={horaFinInput}
                  onChangeText={setHoraFinInput}
                  placeholder="17:00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cantidad de personas</Text>
                <View style={styles.cantidadContainer}>
                  <TouchableOpacity
                    style={styles.cantidadButton}
                    onPress={() => setCantidadPersonas(Math.max(1, cantidadPersonas - 1))}
                  >
                    <Ionicons name="remove" size={24} color="#4a90e2" />
                  </TouchableOpacity>
                  <Text style={styles.cantidadText}>{cantidadPersonas}</Text>
                  <TouchableOpacity
                    style={styles.cantidadButton}
                    onPress={() => {
                      const capacidadMaxima = parseInt(detalle.capacidad[0].split('máx ')[1].split(' pers')[0]);
                      setCantidadPersonas(Math.min(capacidadMaxima, cantidadPersonas + 1));
                    }}
                  >
                    <Ionicons name="add" size={24} color="#4a90e2" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Servicios adicionales</Text>
                {loading ? (
                  <Text style={styles.loadingText}>Cargando servicios...</Text>
                ) : serviciosDisponibles.length === 0 ? (
                  <Text style={styles.noServiciosText}>No hay servicios adicionales disponibles</Text>
                ) : (
                  serviciosDisponibles.map(s => (
                    <TouchableOpacity
                      key={s._id}
                      style={[
                        styles.servicioItem,
                        serviciosAdicionales.some(x => x._id === s._id) && styles.servicioItemActive
                      ]}
                      onPress={() => toggleServicio(s)}
                    >
                      <View style={styles.servicioInfo}>
                        <Text style={styles.servicioNombre}>{s.nombre}</Text>
                        <Text style={styles.servicioPrecio}>
                          ${s.precio}/{s.unidadPrecio || 'servicio'}
                        </Text>
                      </View>
                      <Ionicons
                        name={serviciosAdicionales.some(x => x._id === s._id) ? 'checkbox' : 'square-outline'}
                        size={24}
                        color="#4a90e2"
                      />
                    </TouchableOpacity>
                  ))
                )}
              </View>

              <View style={styles.resumenSection}>
                <Text style={styles.resumenTitle}>Resumen de reserva</Text>
                <View style={styles.resumenItem}>
                  <Text style={styles.resumenLabel}>Precio base</Text>
                  <Text style={styles.resumenValue}>${detalle.precio.replace('USD', '')}</Text>
                </View>
                {serviciosAdicionales.map(s => (
                  <View key={s._id} style={styles.resumenItem}>
                    <Text style={styles.resumenLabel}>
                      {s.nombre}{s.unidadPrecio === 'persona' && ` (x${cantidadPersonas})`}
                    </Text>
                    <Text style={styles.resumenValue}>
                      ${s.unidadPrecio === 'persona' ? s.precio * cantidadPersonas : s.precio}
                    </Text>
                  </View>
                ))}
                <View style={[styles.resumenItem, styles.resumenTotal]}>
                  <Text style={styles.resumenTotalLabel}>Total</Text>
                  <Text style={styles.resumenTotalValue}>${calcularPrecioTotal().toFixed(2)}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.modalReservarButton} onPress={handleConfirmarReserva}>
                <Text style={styles.modalReservarButtonText}>Continuar con el pago</Text>
              </TouchableOpacity>
              <View style={styles.bottomSpacing} />
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
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
  editButton: {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  espacioNombreOverlay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  propiaIndicator: {
    backgroundColor: 'rgba(39, 174, 96, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  propiaText: {
    fontSize: 12,
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
  sectionTitleMain: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 5,
  },
  description: {
    fontSize: 14,
    color: '#5a6c7d',
    lineHeight: 20,
    marginBottom: 25,
  },
  infoGrid: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  infoSection: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  infoItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoItem: {
    fontSize: 12,
    color: '#5a6c7d',
    marginLeft: 6,
    flex: 1,
  },
  priceSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  serviciosSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  serviciosContainer: {
    marginTop: 10,
  },
  serviciosTabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  servicioTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    gap: 8,
  },
  servicioTabActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4a90e2',
  },
  servicioTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a90e2',
  },
  serviciosDescripcion: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  reservarButton: {
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
  reservarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ofrecerServiciosButton: {
    backgroundColor: '#27ae60',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  ofrecerServiciosButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editSection: {
    marginTop: 20,
  },
  editField: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    color: '#2c3e50',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 15,
  },
  editButtonStyle: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  saveButton: {
    backgroundColor: '#4a90e2',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 30,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
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
  modalCloseButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  modalContent: {
    flex: 1,
  },
  espacioInfoModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  espacioNombreModal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  espacioDireccionModal: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  espacioDetallesModal: {
    flexDirection: 'row',
    gap: 20,
  },
  detalleItemModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detalleTextModal: {
    fontSize: 14,
    color: '#5a6c7d',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    fontSize: 16,
  },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
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
  },
  cantidadText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    minWidth: 40,
    textAlign: 'center',
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
  },
  servicioPrecio: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  resumenSection: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  resumenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  resumenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resumenLabel: {
    fontSize: 14,
    color: '#5a6c7d',
  },
  resumenValue: {
    fontSize: 14,
    color: '#2c3e50',
  },
  resumenTotal: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 10,
    marginTop: 10,
  },
  resumenTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  resumenTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  modalReservarButton: {
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
  modalReservarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default DetalleOficina;