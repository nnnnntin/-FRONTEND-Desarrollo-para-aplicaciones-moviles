import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
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
import { obtenerReservas } from '../store/slices/reservasSlice';

const GestionGanancias = ({ navigation }) => {
  const dispatch = useDispatch();
  
  // ⭐ CORREGIDO: Usar el slice de auth donde está el usuario logueado ⭐
  const { usuario: datosUsuario } = useSelector(state => state.auth);
  const { reservas, loading } = useSelector(state => state.reservas);
  
  // ⭐ DEBUG: Verificar que el componente se monte ⭐
  console.log('🚀 GestionGanancias se está montando');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [cuentaBancaria, setCuentaBancaria] = useState({
    banco: '',
    tipoCuenta: 'ahorro',
    numeroCuenta: '',
    titular: ''
  });
  const [cuentaGuardada, setCuentaGuardada] = useState(null);

  // ⭐ DEBUG: Verificar datos del usuario y estado ⭐
  console.log('👤 Datos del usuario (auth.usuario):', datosUsuario);
  console.log('📊 Estado de reservas:', { reservas, loading });
  console.log('🔍 Estado completo auth:', useSelector(state => state.auth));

  // ⭐ MOVER EL SELECTOR FUERA DEL useEffect ⭐
  const authToken = useSelector(state => state.auth.token);

  // ⭐ NUEVA FUNCIÓN: Obtener reservas específicamente para ganancias ⭐
  const obtenerReservasParaGanancias = async () => {
    console.log('💰 Obteniendo reservas específicamente para ganancias...');
    
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/reservas?limit=100&populate=true`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.log('❌ Error en response de reservas para ganancias:', response.status);
        return [];
      }

      const data = await response.json();
      console.log('📥 Datos crudos del servidor:', data);
      
      return Array.isArray(data) ? data : (data.reservas || data.data || []);
    } catch (error) {
      console.log('❌ Error al obtener reservas para ganancias:', error);
      return [];
    }
  };

  // Obtener reservas al cargar el componente
  useEffect(() => {
    console.log('📡 Ejecutando dispatch de obtenerReservas');
    console.log('🔑 Token disponible:', !!authToken);
    console.log('🌐 API URL:', process.env.EXPO_PUBLIC_API_URL);
    
    // ⭐ USAR AMBOS MÉTODOS PARA COMPARAR ⭐
    dispatch(obtenerReservas({ skip: 0, limit: 100 }))
      .then((result) => {
        console.log('📥 Resultado del dispatch obtenerReservas:', result);
      })
      .catch((error) => {
        console.log('❌ Error en dispatch obtenerReservas:', error);
      });

    // ⭐ TAMBIÉN PROBAR LA NUEVA FUNCIÓN ⭐
    obtenerReservasParaGanancias().then((reservasDirectas) => {
      console.log('💰 Reservas obtenidas directamente:', reservasDirectas);
      if (reservasDirectas.length > 0) {
        console.log('🎯 Primera reserva directa:', reservasDirectas[0]);
        
        // Verificar si tienen entidad reservada
        reservasDirectas.forEach((reserva, index) => {
          console.log(`--- Reserva directa ${index + 1} ---`);
          console.log('ID:', reserva._id);
          console.log('Estado:', reserva.estado);
          console.log('Precio:', reserva.precioTotal);
          console.log('Entidad reservada completa:', reserva.entidadReservada);
          
          if (reserva.entidadReservada && reserva.entidadReservada.usuarioId) {
            console.log('✅ Tiene entidad con usuarioId:', reserva.entidadReservada.usuarioId);
          } else {
            console.log('❌ No tiene entidad reservada o usuarioId');
          }
        });
      }
    });
  }, [dispatch, authToken]);

  // ⭐ DEBUG: Monitorear cambios en reservas ⭐
  useEffect(() => {
    console.log('🔄 UseEffect de reservas ejecutándose');
    console.log('📈 Reservas actuales:', reservas);
    console.log('📈 Cantidad de reservas:', reservas?.length || 0);
    console.log('⏳ Loading:', loading);
    
    if (reservas && Array.isArray(reservas)) {
      console.log('✅ Reservas es un array válido');
      if (reservas.length > 0) {
        console.log('🎯 Tenemos reservas, procesando...');
        
        reservas.forEach((reserva, index) => {
          console.log(`--- Reserva ${index + 1} ---`);
          console.log('ID:', reserva._id);
          console.log('Estado:', reserva.estado);
          console.log('Precio total:', reserva.precioTotal);
          console.log('Estructura completa:', reserva);
          
          // Verificar entidad reservada
          const entidad = reserva.entidadReservada || reserva.oficina || reserva.espacio || reserva.escritorio || reserva.sala;
          if (entidad) {
            console.log('🏢 Entidad encontrada:', entidad);
          } else {
            console.log('❌ No se encontró entidad en esta reserva');
          }
        });
      } else {
        console.log('📭 El array de reservas está vacío');
      }
    } else {
      console.log('❌ Reservas no es un array válido:', typeof reservas);
    }
  }, [reservas, loading]);

  // Calcular ganancias basadas en las reservas de las entidades del usuario
  const calcularGanancias = () => {
    console.log('💰 Calculando ganancias...');
    console.log('📊 Datos para cálculo:', { reservas, datosUsuario });
    
    // ⭐ CORREGIDO: Verificar tanto _id como id ⭐
    const usuarioId = datosUsuario?._id || datosUsuario?.id;
    
    if (!reservas || !usuarioId) {
      console.log('❌ Faltan datos para calcular ganancias');
      console.log('  - reservas:', !!reservas);
      console.log('  - datosUsuario:', !!datosUsuario);
      console.log('  - datosUsuario._id:', !!datosUsuario?._id);
      console.log('  - datosUsuario.id:', !!datosUsuario?.id);
      console.log('  - usuarioId final:', usuarioId);
      return {
        disponible: 0,
        pendiente: 0,
        total: 0,
        proximoPago: 'N/A'
      };
    }

    console.log('=== DEBUG CALCULAR GANANCIAS ===');
    console.log('Usuario logueado ID:', usuarioId);
    console.log('Total reservas:', reservas.length);

    // Filtrar reservas donde la entidad pertenece al usuario logueado
    const reservasDelUsuario = reservas.filter(reserva => {
      console.log('\n--- Procesando reserva ---');
      console.log('Reserva ID:', reserva._id);
      console.log('Precio total:', reserva.precioTotal);
      console.log('Estado:', reserva.estado);
      
      // La entidad puede estar en entidadReservada o directamente en otros campos
      const entidad = reserva.entidadReservada || reserva.oficina || reserva.espacio || reserva.escritorio || reserva.sala;
      
      if (!entidad) {
        console.log('❌ No se encontró entidad en la reserva');
        return false;
      }
      
      console.log('Entidad encontrada:', {
        id: entidad._id || entidad.id,
        nombre: entidad.nombre,
        tipo: entidad.tipo,
        usuarioId: entidad.usuarioId
      });
      
      // Buscar el propietario en diferentes posibles campos
      const propietarioId = entidad.usuarioId || 
                           entidad.propietarioId || 
                           entidad.ownerId ||
                           entidad.creadorId;
      
      if (!propietarioId) {
        console.log('❌ No se encontró propietarioId en la entidad');
        return false;
      }
      
      // Obtener el ID del propietario (puede ser objeto o string)
      let entidadUserId;
      if (typeof propietarioId === 'string') {
        entidadUserId = propietarioId;
      } else if (propietarioId._id) {
        entidadUserId = propietarioId._id;
      } else if (propietarioId.id) {
        entidadUserId = propietarioId.id;
      } else {
        entidadUserId = propietarioId.toString();
      }
      
      // ID del usuario logueado
      let usuarioLogueadoId;
      if (typeof usuarioId === 'string') {
        usuarioLogueadoId = usuarioId;
      } else if (usuarioId) {
        usuarioLogueadoId = usuarioId.toString();
      }
      
      console.log('Comparando IDs:');
      console.log('  Entidad User ID:', entidadUserId);
      console.log('  Usuario Logueado ID:', usuarioLogueadoId);
      
      if (!entidadUserId || !usuarioLogueadoId) {
        console.log('❌ Falta algún ID para comparar');
        return false;
      }
      
      // Convertir ambos a string para comparación segura
      const esDelUsuario = entidadUserId.toString() === usuarioLogueadoId.toString();
      console.log('¿Es del usuario?:', esDelUsuario);
      
      return esDelUsuario;
    });

    console.log('\n=== RESULTADO FILTRADO ===');
    console.log('Reservas del usuario:', reservasDelUsuario.length);
    reservasDelUsuario.forEach(r => {
      console.log(`- Reserva ${r._id}: $${r.precioTotal} (${r.estado})`);
    });

    let disponible = 0;
    let pendiente = 0;
    let total = 0;

    const ahora = new Date();
    const hace30Dias = new Date(ahora.getTime() - (30 * 24 * 60 * 60 * 1000));

    reservasDelUsuario.forEach(reserva => {
      const precioTotal = Number(reserva.precioTotal) || 0;
      const fechaReserva = new Date(reserva.fechaInicio || reserva.fecha || reserva.createdAt);
      
      total += precioTotal;

      // Si la reserva fue completada hace más de 30 días, está disponible para transferir
      if (reserva.estado === 'completada' && fechaReserva < hace30Dias) {
        disponible += precioTotal;
      }
      // Si está confirmada pero no completada o es reciente, está pendiente
      else if (reserva.estado === 'confirmada' || reserva.estado === 'completada') {
        pendiente += precioTotal;
      }
    });

    console.log('\n=== TOTALES CALCULADOS ===');
    console.log('Disponible:', disponible);
    console.log('Pendiente:', pendiente);
    console.log('Total:', total);

    // Calcular próximo pago (primer día del próximo mes)
    const proximoPago = new Date();
    proximoPago.setMonth(proximoPago.getMonth() + 1);
    proximoPago.setDate(1);

    return {
      disponible,
      pendiente,
      total,
      proximoPago: proximoPago.toLocaleDateString('es-UY')
    };
  };
  
  // Generar historial de reservas para mostrar
  const generarHistorialReservas = () => {
    const usuarioId = datosUsuario?._id || datosUsuario?.id;
    if (!reservas || !usuarioId) return [];

    const reservasDelUsuario = reservas
      .filter(reserva => {
        // La entidad puede estar en entidadReservada o directamente en otros campos
        const entidad = reserva.entidadReservada || reserva.oficina || reserva.espacio || reserva.escritorio || reserva.sala;
        
        if (!entidad) return false;
        
        // Buscar el propietario en diferentes posibles campos
        const propietarioId = entidad.usuarioId || 
                             entidad.propietarioId || 
                             entidad.ownerId ||
                             entidad.creadorId;
        
        // Obtener el ID del propietario (puede ser objeto o string)
        const entidadUserId = propietarioId?._id || 
                             propietarioId?.id || 
                             propietarioId;
        
        // ID del usuario logueado
        const usuarioLogueadoId = usuarioId;
        
        if (!entidadUserId || !usuarioLogueadoId) return false;
        
        return entidadUserId === usuarioLogueadoId ||
               entidadUserId?.toString() === usuarioLogueadoId?.toString();
      })
      .filter(reserva => reserva.estado === 'completada' || reserva.estado === 'confirmada')
      .sort((a, b) => new Date(b.fechaInicio || b.fecha || b.createdAt) - 
                     new Date(a.fechaInicio || a.fecha || a.createdAt))
      .slice(0, 10); // Mostrar solo las últimas 10

    return reservasDelUsuario.map(reserva => {
      const entidad = reserva.entidadReservada || reserva.oficina || reserva.espacio || reserva.escritorio || reserva.sala;
      
      // Determinar el nombre y tipo de la entidad
      const nombreEntidad = entidad?.nombre || entidad?.titulo || entidad?.name || 'Entidad';
      const tipoEntidad = reserva.tipo || 
                         entidad?.tipo || 
                         (reserva.entidadReservada ? 'espacio' : 'oficina');
      
      // Mapear tipos para mostrar nombres más amigables
      const tiposMapeados = {
        'oficina': 'Oficina',
        'espacio': 'Espacio',
        'escritorio': 'Escritorio',
        'escritorio_flexible': 'Escritorio',
        'sala': 'Sala',
        'sala_reunion': 'Sala de Reunión',
        'edificio': 'Edificio'
      };
      
      const tipoDisplay = tiposMapeados[tipoEntidad] || 'Espacio';
      
      return {
        id: reserva._id,
        fecha: new Date(reserva.fechaInicio || reserva.fecha || reserva.createdAt).toLocaleDateString('es-UY'),
        monto: reserva.precioTotal || 0,
        estado: reserva.estado,
        descripcion: `Reserva de ${tipoDisplay}: ${nombreEntidad}`,
        codigo: reserva.codigo || reserva._id?.slice(-6) || 'N/A',
        tipoEntidad: tipoDisplay
      };
    });
  };

  const ganancias = calcularGanancias();
  const historialReservas = generarHistorialReservas();

  const bancos = [
    { id: 'brou', nombre: 'Banco República (BROU)', color: '#0066CC' },
    { id: 'itau', nombre: 'Itaú', color: '#FF6600' },
    { id: 'santander', nombre: 'Santander', color: '#EC0000' },
    { id: 'scotiabank', nombre: 'Scotiabank', color: '#E60000' },
    { id: 'hsbc', nombre: 'HSBC', color: '#DC0000' },
    { id: 'bbva', nombre: 'BBVA', color: '#004B93' },
    { id: 'heritage', nombre: 'Banco Heritage', color: '#1B4F72' },
  ];

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleGuardarCuenta = () => {
    if (!cuentaBancaria.banco || !cuentaBancaria.numeroCuenta || !cuentaBancaria.titular) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const bancoSeleccionado = bancos.find(b => b.id === cuentaBancaria.banco);
    setCuentaGuardada({
      ...cuentaBancaria,
      banco: bancoSeleccionado?.nombre || cuentaBancaria.banco
    });
    setModalVisible(false);
    Alert.alert('Éxito', 'Cuenta bancaria guardada correctamente');
  };

  const formatearNumero = (numero) => {
    return `$${numero.toLocaleString('es-UY', { minimumFractionDigits: 2 })}`;
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'completada':
        return '#27ae60';
      case 'confirmada':
        return '#f39c12';
      case 'pendiente':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const getEstadoText = (estado) => {
    switch (estado) {
      case 'completada':
        return 'Completada';
      case 'confirmada':
        return 'Confirmada';
      case 'pendiente':
        return 'Pendiente';
      default:
        return estado;
    }
  };

  if (loading) {
    console.log('⏳ Mostrando pantalla de carga');
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ganancias</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando ganancias...</Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log('🎨 Renderizando componente principal');
  console.log('💰 Ganancias calculadas:', ganancias);

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
        <Text style={styles.headerTitle}>Ganancias</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ⭐ AGREGAR CARD DE DEBUG TEMPORAL ⭐ */}
        <View style={[styles.resumenContainer, { backgroundColor: '#e74c3c', marginBottom: 10 }]}>
          <Text style={[styles.gananciaLabel, { fontSize: 14 }]}>DEBUG INFO</Text>
          <Text style={[styles.gananciaLabel, { fontSize: 12 }]}>
            Usuario: {datosUsuario?.username || 'No logueado'}
          </Text>
          <Text style={[styles.gananciaLabel, { fontSize: 12 }]}>
            ID: {datosUsuario?.id || datosUsuario?._id || 'Sin ID'}
          </Text>
          <Text style={[styles.gananciaLabel, { fontSize: 12 }]}>
            Reservas: {reservas?.length || 0}
          </Text>
        </View>

        <View style={styles.resumenContainer}>
          <View style={styles.gananciaPrincipal}>
            <Text style={styles.gananciaLabel}>Disponible para transferir</Text>
            <Text style={styles.gananciaValor}>{formatearNumero(ganancias.disponible)}</Text>
          </View>

          <View style={styles.gananciaSecundaria}>
            <View style={styles.gananciaItem}>
              <Text style={styles.gananciaItemLabel}>Pendiente</Text>
              <Text style={styles.gananciaItemValor}>{formatearNumero(ganancias.pendiente)}</Text>
            </View>
            <View style={styles.gananciaItem}>
              <Text style={styles.gananciaItemLabel}>Total generado</Text>
              <Text style={styles.gananciaItemValor}>{formatearNumero(ganancias.total)}</Text>
            </View>
          </View>

          <Text style={styles.proximoPago}>
            Próximo pago disponible: {ganancias.proximoPago}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de reservas</Text>

          {historialReservas.length > 0 ? (
            historialReservas.map((reserva) => (
              <View key={reserva.id} style={styles.transaccionItem}>
                <View style={styles.transaccionLeft}>
                  <Text style={styles.transaccionFecha}>{reserva.fecha}</Text>
                  <Text style={styles.transaccionDescripcion}>{reserva.descripcion}</Text>
                  <Text style={styles.transaccionCodigo}>#{reserva.codigo}</Text>
                </View>
                <View style={styles.transaccionRight}>
                  <Text style={styles.transaccionMonto}>
                    {formatearNumero(reserva.monto)}
                  </Text>
                  <View style={[
                    styles.estadoBadge, 
                    { backgroundColor: `${getEstadoColor(reserva.estado)}15` }
                  ]}>
                    <Text style={[
                      styles.estadoText, 
                      { color: getEstadoColor(reserva.estado) }
                    ]}>
                      {getEstadoText(reserva.estado)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#bdc3c7" />
              <Text style={styles.emptyText}>No hay reservas registradas</Text>
              <Text style={styles.emptySubtext}>
                Las ganancias aparecerán aquí cuando tengas reservas completadas en tus espacios
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {cuentaGuardada ? 'Editar cuenta bancaria' : 'Agregar cuenta bancaria'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Banco</Text>
              <View style={styles.bancosList}>
                {bancos.map((banco) => (
                  <TouchableOpacity
                    key={banco.id}
                    style={[
                      styles.bancoOption,
                      cuentaBancaria.banco === banco.id && styles.bancoOptionSelected
                    ]}
                    onPress={() => setCuentaBancaria({ ...cuentaBancaria, banco: banco.id })}
                  >
                    <View style={[styles.bancoColor, { backgroundColor: banco.color }]} />
                    <Text style={[
                      styles.bancoOptionText,
                      cuentaBancaria.banco === banco.id && styles.bancoOptionTextSelected
                    ]}>
                      {banco.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Tipo de cuenta</Text>
              <View style={styles.tipoCuentaContainer}>
                <TouchableOpacity
                  style={[
                    styles.tipoCuentaButton,
                    cuentaBancaria.tipoCuenta === 'ahorro' && styles.tipoCuentaButtonActive
                  ]}
                  onPress={() => setCuentaBancaria({ ...cuentaBancaria, tipoCuenta: 'ahorro' })}
                >
                  <Text style={[
                    styles.tipoCuentaText,
                    cuentaBancaria.tipoCuenta === 'ahorro' && styles.tipoCuentaTextActive
                  ]}>
                    Caja de ahorro
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tipoCuentaButton,
                    cuentaBancaria.tipoCuenta === 'corriente' && styles.tipoCuentaButtonActive
                  ]}
                  onPress={() => setCuentaBancaria({ ...cuentaBancaria, tipoCuenta: 'corriente' })}
                >
                  <Text style={[
                    styles.tipoCuentaText,
                    cuentaBancaria.tipoCuenta === 'corriente' && styles.tipoCuentaTextActive
                  ]}>
                    Cuenta corriente
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Número de cuenta</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa el número de cuenta"
                value={cuentaBancaria.numeroCuenta}
                onChangeText={(text) => setCuentaBancaria({ ...cuentaBancaria, numeroCuenta: text })}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Titular de la cuenta</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre completo del titular"
                value={cuentaBancaria.titular}
                onChangeText={(text) => setCuentaBancaria({ ...cuentaBancaria, titular: text })}
              />

              <TouchableOpacity
                style={styles.guardarButton}
                onPress={handleGuardarCuenta}
              >
                <Text style={styles.guardarButtonText}>Guardar cuenta</Text>
              </TouchableOpacity>
            </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  resumenContainer: {
    backgroundColor: '#4a90e2',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gananciaPrincipal: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gananciaLabel: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    fontFamily: 'System',
  },
  gananciaValor: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
    fontFamily: 'System',
  },
  gananciaSecundaria: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 15,
  },
  gananciaItem: {
    alignItems: 'center',
  },
  gananciaItemLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    fontFamily: 'System',
  },
  gananciaItemValor: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 4,
    fontFamily: 'System',
  },
  proximoPago: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 15,
    fontFamily: 'System',
  },
  section: {
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  editButton: {
    padding: 5,
  },
  cuentaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  bancoIcon: {
    marginRight: 15,
  },
  cuentaInfo: {
    flex: 1,
  },
  bancoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  cuentaDetalle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
    fontFamily: 'System',
  },
  cuentaTitular: {
    fontSize: 14,
    color: '#5a6c7d',
    marginTop: 2,
    fontFamily: 'System',
  },
  agregarCuentaButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderStyle: 'dashed',
  },
  agregarCuentaText: {
    fontSize: 16,
    color: '#4a90e2',
    marginLeft: 10,
    fontWeight: '600',
    fontFamily: 'System',
  },
  transferirButton: {
    backgroundColor: '#27ae60',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  transferirButtonDisabled: {
    backgroundColor: '#95a5a6',
    elevation: 0,
  },
  transferirIcon: {
    marginRight: 8,
  },
  transferirButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  transaccionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  transaccionLeft: {
    flex: 1,
  },
  transaccionFecha: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'System',
  },
  transaccionDescripcion: {
    fontSize: 16,
    color: '#2c3e50',
    marginTop: 2,
    fontFamily: 'System',
  },
  transaccionCodigo: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
    fontFamily: 'System',
  },
  transaccionRight: {
    alignItems: 'flex-end',
  },
  transaccionMonto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
    fontFamily: 'System',
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  estadoText: {
    fontSize: 12,
    fontFamily: 'System',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  transaccionTipo: {
    fontSize: 11,
    color: '#3498db',
    marginTop: 2,
    fontFamily: 'System',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'System',
  },
  bottomSpacing: {
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'System',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
    marginTop: 15,
    fontFamily: 'System',
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
    fontFamily: 'System',
  },
  bancosList: {
    marginBottom: 15,
  },
  bancoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  bancoOptionSelected: {
    backgroundColor: '#e8f4fd',
    borderColor: '#4a90e2',
  },
  bancoColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  bancoOptionText: {
    fontSize: 16,
    color: '#2c3e50',
    fontFamily: 'System',
  },
  bancoOptionTextSelected: {
    color: '#4a90e2',
    fontWeight: '600',
  },
  tipoCuentaContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  tipoCuentaButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    alignItems: 'center',
  },
  tipoCuentaButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  tipoCuentaText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
    fontFamily: 'System',
  },
  tipoCuentaTextActive: {
    color: '#fff',
  },
  guardarButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
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
});

export default GestionGanancias;