import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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

const ReservarEspacio = ({ navigation, route }) => {
  const { espacio } = route.params;

  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  const hoyISO = new Date().toISOString().split('T')[0];
  const [fechaInput, setFechaInput] = useState(hoyISO);
  const [horaInicioInput, setHoraInicioInput] = useState('09:00');
  const [horaFinInput, setHoraFinInput] = useState('17:00');

  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [serviciosAdicionales, setServiciosAdicionales] = useState([]);

  const serviciosDisponibles = [
    { id: 1, nombre: 'Catering básico', precio: 15, unidad: 'persona' },
    { id: 2, nombre: 'Proyector y pantalla', precio: 50, unidad: 'día' },
    { id: 3, nombre: 'Servicio de café premium', precio: 5, unidad: 'persona' },
    { id: 4, nombre: 'Estacionamiento adicional', precio: 20, unidad: 'día' }
  ];

  const handleGoBack = () => navigation.goBack();

  const toggleServicio = servicio => {
    setServiciosAdicionales(prev => {
      const existe = prev.find(s => s.id === servicio.id);
      if (existe) return prev.filter(s => s.id !== servicio.id);
      return [...prev, servicio];
    });
  };

  const calcularPrecioTotal = () => {
    const precioBase = parseFloat(espacio.precio);
    const precioServicios = serviciosAdicionales.reduce((tot, s) => {
      return tot + (s.unidad === 'persona'
        ? s.precio * cantidadPersonas
        : s.precio);
    }, 0);
    return precioBase + precioServicios;
  };

  const handleReservar = () => {
    if (!mostrarDetalles) {
      setMostrarDetalles(true);
      return;
    }

    if (cantidadPersonas > espacio.capacidad) {
      Alert.alert('Error', `La capacidad máxima es de ${espacio.capacidad} personas`);
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: espacio.imagen || 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }}
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
                Lun - Dom
              </Text>
            </View>
          </View>

          <View style={styles.precioSection}>
            <Text style={styles.precioLabel}>Precio</Text>
            <Text style={styles.precioValue}>{espacio.precio}USD</Text>
          </View>
        </View>

        {mostrarDetalles && (
          <View style={styles.detallesReserva}>
            <Text style={styles.detallesTitle}>Completa tu reserva</Text>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Fecha (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={fechaInput}
                onChangeText={setFechaInput}
                placeholder="2025-06-20"
              />
            </View>

            <View style={styles.horasContainer}>
              <View style={styles.horaInput}>
                <Text style={styles.inputLabel}>Hora inicio</Text>
                <TextInput
                  style={styles.input}
                  value={horaInicioInput}
                  onChangeText={setHoraInicioInput}
                  placeholder="09:00"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.horaInput}>
                <Text style={styles.inputLabel}>Hora fin</Text>
                <TextInput
                  style={styles.input}
                  value={horaFinInput}
                  onChangeText={setHoraFinInput}
                  placeholder="17:00"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Cantidad de personas</Text>
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
                  onPress={() => setCantidadPersonas(Math.min(espacio.capacidad, cantidadPersonas + 1))}
                >
                  <Ionicons name="add" size={24} color="#4a90e2" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Servicios adicionales</Text>
              {serviciosDisponibles.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.servicioItem,
                    serviciosAdicionales.some(x => x.id === s.id) && styles.servicioItemActive
                  ]}
                  onPress={() => toggleServicio(s)}
                >
                  <View style={styles.servicioInfo}>
                    <Text style={styles.servicioNombre}>{s.nombre}</Text>
                    <Text style={styles.servicioPrecio}>
                      ${s.precio}/{s.unidad}
                    </Text>
                  </View>
                  <Ionicons
                    name={serviciosAdicionales.some(x => x.id === s.id) ? 'checkbox' : 'square-outline'}
                    size={24}
                    color="#4a90e2"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {serviciosAdicionales.length > 0 && (
              <View style={styles.resumenSection}>
                <Text style={styles.resumenTitle}>Resumen de costos</Text>
                <View style={styles.resumenItem}>
                  <Text style={styles.resumenLabel}>Precio base</Text>
                  <Text style={styles.resumenValue}>${espacio.precio}</Text>
                </View>
                {serviciosAdicionales.map(s => (
                  <View key={s.id} style={styles.resumenItem}>
                    <Text style={styles.resumenLabel}>
                      {s.nombre}{s.unidad === 'persona' && ` (x${cantidadPersonas})`}
                    </Text>
                    <Text style={styles.resumenValue}>
                      ${s.unidad === 'persona' ? s.precio * cantidadPersonas : s.precio}
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
  }
});

export default ReservarEspacio;