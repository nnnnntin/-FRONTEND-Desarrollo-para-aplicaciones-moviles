import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSelector } from 'react-redux';

const Notificaciones = ({ navigation }) => {
  const { tipoUsuario } = useSelector(state => state.usuario);
  const [notificaciones, setNotificaciones] = useState(getNotificacionesPorTipo());

  function getNotificacionesPorTipo() {
    const notificacionesBase = {
      usuario: [
        {
          id: 1,
          tipo: 'reserva',
          titulo: 'Reserva confirmada',
          mensaje: 'Tu reserva para la Oficina Skyview ha sido confirmada para el 20/06/2025',
          fecha: '15/06/2025',
          leida: false,
          icono: 'checkmark-circle',
          color: '#27ae60'
        },
        {
          id: 2,
          tipo: 'membresia',
          titulo: 'Membresía por vencer',
          mensaje: 'Tu membresía Premium vence en 5 días. ¡Renuévala ahora!',
          fecha: '14/06/2025',
          leida: false,
          icono: 'alert-circle',
          color: '#f39c12'
        },
        {
          id: 3,
          tipo: 'reseña',
          titulo: 'Deja tu reseña',
          mensaje: 'Ya pasó tu reserva en Oficina Centro. ¿Qué tal estuvo?',
          fecha: '13/06/2025',
          leida: true,
          icono: 'star',
          color: '#3498db'
        }
      ],
      cliente: [
        {
          id: 1,
          tipo: 'nueva_reserva',
          titulo: 'Nueva reserva',
          mensaje: 'Juan Pérez ha reservado tu Oficina Skyview para el 20/06/2025',
          fecha: '15/06/2025',
          leida: false,
          icono: 'calendar',
          color: '#4a90e2'
        },
        {
          id: 2,
          tipo: 'ganancia',
          titulo: 'Pago recibido',
          mensaje: 'Has recibido $1,200 USD por la reserva de la Oficina Skyview',
          fecha: '14/06/2025',
          leida: false,
          icono: 'cash',
          color: '#27ae60'
        },
        {
          id: 3,
          tipo: 'servicio',
          titulo: 'Servicio programado',
          mensaje: 'Limpieza programada para mañana en Oficina Mirador',
          fecha: '13/06/2025',
          leida: true,
          icono: 'construct',
          color: '#9b59b6'
        }
      ],
      proveedor: [
        {
          id: 1,
          tipo: 'solicitud_servicio',
          titulo: 'Nueva solicitud',
          mensaje: 'Empresa ABC solicita servicio de limpieza para 3 oficinas',
          fecha: '15/06/2025',
          leida: false,
          icono: 'briefcase',
          color: '#3498db'
        },
        {
          id: 2,
          tipo: 'pago_servicio',
          titulo: 'Pago procesado',
          mensaje: 'Has recibido $450 USD por servicios completados',
          fecha: '14/06/2025',
          leida: false,
          icono: 'cash',
          color: '#27ae60'
        },
        {
          id: 3,
          tipo: 'calificacion',
          titulo: 'Nueva calificación',
          mensaje: 'Empresa XYZ te calificó con 5 estrellas',
          fecha: '13/06/2025',
          leida: true,
          icono: 'star',
          color: '#f39c12'
        }
      ]
    };

    return notificacionesBase[tipoUsuario] || [];
  }

  const marcarComoLeida = (id) => {
    setNotificaciones(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, leida: true } : notif
      )
    );
  };

  const eliminarNotificacion = (id) => {
    setNotificaciones(prev => prev.filter(notif => notif.id !== id));
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderNotificacion = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificacionItem,
        !item.leida && styles.notificacionNoLeida
      ]}
      onPress={() => marcarComoLeida(item.id)}
    >
      <View style={[styles.iconoContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icono} size={24} color={item.color} />
      </View>

      <View style={styles.contenidoNotificacion}>
        <View style={styles.headerNotificacion}>
          <Text style={styles.tituloNotificacion}>{item.titulo}</Text>
          {!item.leida && <View style={styles.indicadorNoLeido} />}
        </View>
        <Text style={styles.mensajeNotificacion}>{item.mensaje}</Text>
        <Text style={styles.fechaNotificacion}>{item.fecha}</Text>
      </View>

      <TouchableOpacity
        style={styles.botonEliminar}
        onPress={() => eliminarNotificacion(item.id)}
      >
        <Ionicons name="close" size={20} color="#7f8c8d" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={styles.placeholder} />
      </View>

      {notificaciones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>No tienes notificaciones</Text>
        </View>
      ) : (
        <FlatList
          data={notificaciones}
          renderItem={renderNotificacion}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
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
  listContainer: {
    padding: 20,
  },
  notificacionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  notificacionNoLeida: {
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  iconoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contenidoNotificacion: {
    flex: 1,
  },
  headerNotificacion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tituloNotificacion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: 'System',
    flex: 1,
  },
  indicadorNoLeido: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4a90e2',
    marginLeft: 8,
  },
  mensajeNotificacion: {
    fontSize: 14,
    color: '#5a6c7d',
    lineHeight: 20,
    marginBottom: 4,
    fontFamily: 'System',
  },
  fechaNotificacion: {
    fontSize: 12,
    color: '#bdc3c7',
    fontFamily: 'System',
  },
  botonEliminar: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 20,
    fontFamily: 'System',
  },
});

export default Notificaciones;