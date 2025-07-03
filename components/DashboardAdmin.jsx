import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { obtenerProveedores } from '../store/slices/proveedoresSlice';
import { obtenerReservas, selectReservas } from '../store/slices/reservasSlice';
import { obtenerUsuarios } from '../store/slices/usuarioSlice';
const { width } = Dimensions.get('window');

const DashboardAdmin = ({ navigation }) => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');
  const dispatch = useDispatch();
  const usuarios = useSelector(state => state.usuario.usuarios);
  const reservas = useSelector(selectReservas);
  const { proveedores, loading } = useSelector(state => state.proveedores);
  const {
    espaciosFiltrados = [],
  } = useSelector(state => state.espacios || {});

  useEffect(() => {
    dispatch(obtenerReservas());
    dispatch(obtenerUsuarios({ skip: 0, limit: 100 }));
    dispatch(obtenerProveedores(0, 100));
  }, [dispatch]);

  const {
    gananciasTotales,
    comisionReservas,
    pendientesCobro
  } = useMemo(() => {
    const rate = 0.10;
    let ingresos = 0;
    let pendientes = 0;

    reservas.forEach(r => {
      const monto = r.precioTotal || 0;
      if (['confirmada', 'completada'].includes(r.estado)) {
        ingresos += monto;
      } else {
        pendientes += monto;
      }
    });

    return {
      gananciasTotales: ingresos,
      comisionReservas: ingresos * rate,
      pendientesCobro: pendientes
    };
  }, [reservas]);

  const datosBase = {
    día: {
      usuarios: {
        total: 1543,
        usuarios: 1200,
        clientes: 287,
        proveedores: 56,
        nuevosEstePeriodo: 12
      },
      espacios: {
        total: 342,
        activos: 298,
        pausados: 44,
        nuevosEstePeriodo: 3
      },
      reservas: {
        total: 8734,
        estePeriodo: 28,
        canceladas: 2,
        completadas: 7891
      },
      finanzas: {
        ingresosTotales: 234567.89,
        comisionesReservas: 1234.50,
        comisionesServicios: 456.78,
        pendientesCobro: 234.12,
        gananciasPeriodo: 1691.28
      }
    },
    semana: {
      usuarios: {
        total: 1543,
        usuarios: 1200,
        clientes: 287,
        proveedores: 56,
        nuevosEstePeriodo: 45
      },
      espacios: {
        total: 342,
        activos: 298,
        pausados: 44,
        nuevosEstePeriodo: 8
      },
      reservas: {
        total: 8734,
        estePeriodo: 198,
        canceladas: 12,
        completadas: 7891
      },
      finanzas: {
        ingresosTotales: 234567.89,
        comisionesReservas: 8765.43,
        comisionesServicios: 2345.67,
        pendientesCobro: 1234.56,
        gananciasPeriodo: 11111.10
      }
    },
    mes: {
      usuarios: {
        total: 1543,
        usuarios: 1200,
        clientes: 287,
        proveedores: 56,
        nuevosEstePeriodo: 123
      },
      espacios: {
        total: 342,
        activos: 298,
        pausados: 44,
        nuevosEstePeriodo: 28
      },
      reservas: {
        total: 8734,
        estePeriodo: 876,
        canceladas: 43,
        completadas: 7891
      },
      finanzas: {
        ingresosTotales: 234567.89,
        comisionesReservas: 45678.90,
        comisionesServicios: 12345.67,
        pendientesCobro: 8765.43,
        gananciasPeriodo: 58024.57
      }
    }
  };

  const estadisticas = useMemo(() => {
    const datos = datosBase[periodoSeleccionado];
    return {
      usuarios: datos.usuarios,
      espacios: datos.espacios,
      reservas: datos.reservas,
      finanzas: datos.finanzas,
      servicios: {
        solicitudes: periodoSeleccionado === 'día' ? 18 :
          periodoSeleccionado === 'semana' ? 89 : 567,
        completados: periodoSeleccionado === 'día' ? 15 :
          periodoSeleccionado === 'semana' ? 76 : 489,
        enProceso: periodoSeleccionado === 'día' ? 3 :
          periodoSeleccionado === 'semana' ? 13 : 78,
        proveedoresActivos: 45
      }
    };
  }, [periodoSeleccionado]);

  const getEtiquetaPeriodo = () => {
    switch (periodoSeleccionado) {
      case 'día': return 'hoy';
      case 'semana': return 'esta semana';
      case 'mes': return 'este mes';
      default: return 'este período';
    }
  };

  const transaccionesRecientes = [
    {
      id: 1,
      tipo: 'comision_reserva',
      descripcion: 'Comisión por reserva - Oficina Skyview',
      monto: 120.00,
      fecha: '18/06/2025',
      estado: 'completado',
      usuario: 'Cliente Demo'
    },
    {
      id: 2,
      tipo: 'comision_servicio',
      descripcion: 'Comisión servicio limpieza - Cleaning Pro',
      monto: 24.00,
      fecha: '18/06/2025',
      estado: 'pendiente',
      usuario: 'María González'
    },
    {
      id: 3,
      tipo: 'suscripcion',
      descripcion: 'Suscripción Premium - Juan Pérez',
      monto: 49.99,
      fecha: '17/06/2025',
      estado: 'completado',
      usuario: 'Juan Pérez'
    }
  ];

  const alertas = [
    {
      id: 1,
      tipo: 'publicacion',
      mensaje: '5 nuevas publicaciones pendientes de aprobación',
      urgencia: 'alta',
      icono: 'document-text',
      color: '#e74c3c'
    },
    {
      id: 2,
      tipo: 'pago',
      mensaje: '12 pagos pendientes de procesamiento',
      urgencia: 'media',
      icono: 'card',
      color: '#f39c12'
    },
    {
      id: 3,
      tipo: 'reporte',
      mensaje: '3 reportes de problemas sin resolver',
      urgencia: 'alta',
      icono: 'warning',
      color: '#e74c3c'
    },
    {
      id: 4,
      tipo: 'verificacion',
      mensaje: '8 proveedores pendientes de verificación',
      urgencia: 'media',
      icono: 'shield-checkmark',
      color: '#3498db'
    }
  ];

  const navegarA = (pantalla) => {
    navigation.navigate(pantalla);
  };

  const renderTransaccion = ({ item }) => (
    <TouchableOpacity style={styles.transaccionItem}>
      <View style={styles.transaccionInfo}>
        <Text style={styles.transaccionDescripcion}>{item.descripcion}</Text>
        <Text style={styles.transaccionUsuario}>{item.usuario}</Text>
        <Text style={styles.transaccionFecha}>{item.fecha}</Text>
      </View>
      <View style={styles.transaccionMontoContainer}>
        <Text style={[
          styles.transaccionMonto,
          item.tipo === 'comision_servicio' ? styles.montoServicio : styles.montoReserva
        ]}>
          ${item.monto.toFixed(2)}
        </Text>
        <View style={[
          styles.estadoBadge,
          { backgroundColor: item.estado === 'completado' ? '#27ae60' : '#f39c12' }
        ]}>
          <Text style={styles.estadoText}>
            {item.estado === 'completado' ? 'Cobrado' : 'Pendiente'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAlerta = ({ item }) => (
    <TouchableOpacity style={styles.alertaItem}>
      <View style={[styles.alertaIconContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icono} size={24} color={item.color} />
      </View>
      <Text style={styles.alertaMensaje}>{item.mensaje}</Text>
      <Ionicons name="chevron-forward" size={20} color="#7f8c8d" />
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Panel de Administración</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.resumenFinanciero}>
          <Text style={styles.resumenTitulo}>Resumen Financiero</Text>

          <View style={styles.montoContainer}>
            <Text style={styles.montoLabel}>Ganancias totales</Text>
            <Text style={styles.montoValor}>
              ${gananciasTotales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.detalleFinanciero}>
            <View style={styles.detalleItem}>
              <Ionicons name="business" size={20} color="#4a90e2" />
              <View style={styles.detalleInfo}>
                <Text style={styles.detalleLabel}>Comisiones reservas (10 %)</Text>
                <Text style={styles.detalleValor}>
                  ${comisionReservas.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            <View style={styles.detalleItem}>
              <Ionicons name="time" size={20} color="#f39c12" />
              <View style={styles.detalleInfo}>
                <Text style={styles.detalleLabel}>Pendiente cobro</Text>
                <Text style={styles.detalleValor}>
                  ${pendientesCobro.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navegarA('GestionUsuarios')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#4a90e220' }]}>
              <Ionicons name="people" size={24} color="#4a90e2" />
            </View>
            <Text style={styles.statNumber}>{usuarios.length}</Text>
            <Text style={styles.statLabel}>Usuarios totales</Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navegarA('GestionPublicaciones')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#27ae6020' }]}>
              <Ionicons name="business" size={24} color="#27ae60" />
            </View>
            <Text style={styles.statNumber}>{espaciosFiltrados.length}</Text>
            <Text style={styles.statLabel}>Espacios activos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navegarA('GestionReservas')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#9b59b620' }]}>
              <Ionicons name="calendar" size={24} color="#9b59b6" />
            </View>
            <Text style={styles.statNumber}>{reservas.length}</Text>
            <Text style={styles.statLabel}>Reservas totales</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navegarA('GestionProveedores')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#e67e2220' }]}>
              <Ionicons name="construct" size={24} color="#e67e22" />
            </View>
            <Text style={styles.statNumber}>{proveedores.length}</Text>
            <Text style={styles.statLabel}>Proveedores activos</Text>
          </TouchableOpacity>
        </View>
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  notificationButton: {
    position: 'relative',
    padding: 5,
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
  },
  content: {
    flex: 1,
  },
  resumenFinanciero: {
    backgroundColor: '#2c3e50',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
  },
  resumenTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  periodosContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 4,
  },
  periodoButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodoButtonActive: {
    backgroundColor: '#fff',
  },
  periodoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  periodoTextActive: {
    color: '#2c3e50',
  },
  montoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  montoLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  montoValor: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  detalleFinanciero: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 15,
  },
  detalleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detalleInfo: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detalleLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  detalleValor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: (width - 40) / 2 - 5,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: 12,
    color: '#bdc3c7',
    marginTop: 2,
  },
  seccion: {
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  verTodo: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '600',
  },
  alertaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
  },
  alertaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertaMensaje: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  transaccionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 1,
  },
  transaccionInfo: {
    flex: 1,
  },
  transaccionDescripcion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  transaccionUsuario: {
    fontSize: 12,
    color: '#4a90e2',
    marginBottom: 2,
  },
  transaccionFecha: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  transaccionMontoContainer: {
    alignItems: 'flex-end',
  },
  transaccionMonto: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  montoReserva: {
    color: '#27ae60',
  },
  montoServicio: {
    color: '#4a90e2',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  accesosRapidos: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  botonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  botonAcceso: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: (width - 50) / 2,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  botonAccesoText: {
    fontSize: 14,
    color: '#2c3e50',
    marginTop: 8,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 30,
  },
});

export default DashboardAdmin;