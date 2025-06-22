import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const NotificacionesAdmin = ({ navigation }) => {
  const [modalDetalle, setModalDetalle] = useState(false);
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState(null);

  const [notificaciones, setNotificaciones] = useState([
    {
      id: 1,
      tipo: 'publicacion_pendiente',
      titulo: 'Nueva publicación pendiente',
      mensaje: 'El cliente "Business Center" ha creado una nueva publicación que requiere aprobación',
      fecha: '2025-06-20 10:30',
      leida: false,
      prioridad: 'alta',
      accion: 'GestionPublicaciones'
    },
    {
      id: 2,
      tipo: 'pago_pendiente',
      titulo: 'Pagos pendientes de procesamiento',
      mensaje: 'Hay 5 pagos de comisiones pendientes por un total de $8,450',
      fecha: '2025-06-20 09:15',
      leida: false,
      prioridad: 'urgente',
      accion: 'ComisionesAdmin'
    },
    {
      id: 3,
      tipo: 'reporte_problema',
      titulo: 'Nuevo reporte de problema',
      mensaje: 'Usuario reportó problemas con el servicio de limpieza en "Oficina Skyview"',
      fecha: '2025-06-19 18:45',
      leida: true,
      prioridad: 'media',
      accion: 'ReportesAdmin'
    },
    {
      id: 4,
      tipo: 'proveedor_nuevo',
      titulo: 'Proveedor pendiente de verificación',
      mensaje: 'TechSupport Solutions está esperando verificación de documentos',
      fecha: '2025-06-19 16:20',
      leida: true,
      prioridad: 'normal',
      accion: 'GestionProveedores'
    },
    {
      id: 5,
      tipo: 'meta_alcanzada',
      titulo: 'Meta mensual alcanzada',
      mensaje: '¡Se alcanzó el 105% de la meta de comisiones del mes!',
      fecha: '2025-06-19 12:00',
      leida: true,
      prioridad: 'info',
      accion: 'ReportesAdmin'
    }
  ]);

  const getTipoInfo = (tipo) => {
    switch (tipo) {
      case 'publicacion_pendiente':
        return { icono: 'document-text', color: '#f39c12' };
      case 'pago_pendiente':
        return { icono: 'card', color: '#e74c3c' };
      case 'reporte_problema':
        return { icono: 'warning', color: '#e67e22' };
      case 'proveedor_nuevo':
        return { icono: 'person-add', color: '#3498db' };
      case 'meta_alcanzada':
        return { icono: 'trophy', color: '#27ae60' };
      default:
        return { icono: 'notifications', color: '#7f8c8d' };
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'urgente': return '#e74c3c';
      case 'alta': return '#f39c12';
      case 'media': return '#3498db';
      case 'normal': return '#7f8c8d';
      case 'info': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  const handleMarcarLeida = (notificacion) => {
    setNotificaciones(prev => prev.map(n =>
      n.id === notificacion.id ? { ...n, leida: true } : n
    ));
  };

  const handleVerDetalle = (notificacion) => {
    handleMarcarLeida(notificacion);
    setNotificacionSeleccionada(notificacion);
    setModalDetalle(true);
  };

  const handleAccion = (notificacion) => {
    setModalDetalle(false);
    if (notificacion.accion) {
      navigation.navigate(notificacion.accion);
    }
  };

  const handleEliminar = (notificacion) => {
    Alert.alert(
      'Eliminar notificación',
      '¿Estás seguro de eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setNotificaciones(prev => prev.filter(n => n.id !== notificacion.id));
            setModalDetalle(false);
          }
        }
      ]
    );
  };

  const handleMarcarTodasLeidas = () => {
    Alert.alert(
      'Marcar todas como leídas',
      '¿Marcar todas las notificaciones como leídas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Marcar',
          onPress: () => {
            setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
          }
        }
      ]
    );
  };

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

  const renderNotificacion = ({ item }) => {
    const tipoInfo = getTipoInfo(item.tipo);

    return (
      <TouchableOpacity
        style={[styles.notificacionCard, !item.leida && styles.notificacionNoLeida]}
        onPress={() => handleVerDetalle(item)}
      >
        <View style={[styles.iconoContainer, { backgroundColor: tipoInfo.color + '20' }]}>
          <Ionicons name={tipoInfo.icono} size={24} color={tipoInfo.color} />
        </View>

        <View style={styles.contenido}>
          <View style={styles.header}>
            <Text style={[styles.titulo, !item.leida && styles.tituloNoLeido]}>
              {item.titulo}
            </Text>
            <View style={[
              styles.prioridadBadge,
              { backgroundColor: getPrioridadColor(item.prioridad) + '20' }
            ]}>
              <Text style={[
                styles.prioridadText,
                { color: getPrioridadColor(item.prioridad) }
              ]}>
                {item.prioridad}
              </Text>
            </View>
          </View>
          <Text style={styles.mensaje} numberOfLines={2}>{item.mensaje}</Text>
          <Text style={styles.fecha}>{item.fecha}</Text>
        </View>

        {!item.leida && (
          <View style={styles.indicadorNoLeido} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <TouchableOpacity
          onPress={handleMarcarTodasLeidas}
          style={styles.marcarButton}
        >
          <Ionicons name="checkmark-done" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      {notificacionesNoLeidas > 0 && (
        <View style={styles.resumenContainer}>
          <Text style={styles.resumenText}>
            {notificacionesNoLeidas} notificaciones sin leer
          </Text>
        </View>
      )}

      <FlatList
        data={notificaciones}
        renderItem={renderNotificacion}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listaContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={60} color="#bdc3c7" />
            <Text style={styles.emptyText}>No hay notificaciones</Text>
          </View>
        }
      />

      <Modal
        visible={modalDetalle}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalDetalle(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {notificacionSeleccionada && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[
                    styles.modalIcono,
                    { backgroundColor: getTipoInfo(notificacionSeleccionada.tipo).color + '20' }
                  ]}>
                    <Ionicons
                      name={getTipoInfo(notificacionSeleccionada.tipo).icono}
                      size={32}
                      color={getTipoInfo(notificacionSeleccionada.tipo).color}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => setModalDetalle(false)}
                    style={styles.modalCloseButton}
                  >
                    <Ionicons name="close" size={24} color="#2c3e50" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalTitulo}>{notificacionSeleccionada.titulo}</Text>
                <Text style={styles.modalFecha}>{notificacionSeleccionada.fecha}</Text>

                <View style={[
                  styles.modalPrioridad,
                  { backgroundColor: getPrioridadColor(notificacionSeleccionada.prioridad) + '20' }
                ]}>
                  <Text style={[
                    styles.modalPrioridadText,
                    { color: getPrioridadColor(notificacionSeleccionada.prioridad) }
                  ]}>
                    Prioridad: {notificacionSeleccionada.prioridad}
                  </Text>
                </View>

                <Text style={styles.modalMensaje}>{notificacionSeleccionada.mensaje}</Text>

                <View style={styles.modalAcciones}>
                  {notificacionSeleccionada.accion && (
                    <TouchableOpacity
                      style={styles.modalBoton}
                      onPress={() => handleAccion(notificacionSeleccionada)}
                    >
                      <Text style={styles.modalBotonText}>Ver detalles</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.modalBoton, styles.modalBotonEliminar]}
                    onPress={() => handleEliminar(notificacionSeleccionada)}
                  >
                    <Text style={[styles.modalBotonText, styles.modalBotonEliminarText]}>
                      Eliminar
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 2,
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
  marcarButton: {
    padding: 5,
  },
  resumenContainer: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d6e9f7',
  },
  resumenText: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '600',
  },
  listaContent: {
    paddingVertical: 10,
  },
  notificacionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    position: 'relative',
  },
  notificacionNoLeida: {
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#e8f4fd',
  },
  iconoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contenido: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
  },
  tituloNoLeido: {
    fontWeight: 'bold',
  },
  prioridadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prioridadText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  mensaje: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  fecha: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  indicadorNoLeido: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#4a90e2',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalIcono: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  modalFecha: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  modalPrioridad: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  modalPrioridadText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalMensaje: {
    fontSize: 16,
    color: '#5a6c7d',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalAcciones: {
    gap: 12,
  },
  modalBoton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBotonEliminar: {
    backgroundColor: '#fee',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  modalBotonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalBotonEliminarText: {
    color: '#e74c3c',
  },
});

export default NotificacionesAdmin;