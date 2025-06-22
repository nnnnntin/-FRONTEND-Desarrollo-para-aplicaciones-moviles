import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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
  View
} from 'react-native';

const GestionProveedores = ({ navigation }) => {
  const [tabActiva, setTabActiva] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [modalDetalles, setModalDetalles] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  const [proveedores] = useState([
    {
      id: 1,
      nombre: 'María González',
      empresa: 'Cleaning Pro Services',
      email: 'maria@cleaningpro.com',
      telefono: '+598 99 123 456',
      servicios: ['Limpieza profunda', 'Limpieza regular', 'Sanitización'],
      estado: 'activo',
      fechaRegistro: '2024-02-20',
      calificacion: 4.8,
      serviciosCompletados: 156,
      gananciasGeneradas: 18720,
      comisionesPagadas: 3744,
      documentos: {
        rut: true,
        certificadoDgi: true,
        seguro: true,
        certificadoSanitario: true
      },
      zonasCubiertas: ['Montevideo', 'Ciudad de la Costa']
    },
    {
      id: 2,
      nombre: 'Carlos Rodríguez',
      empresa: 'TechSupport Solutions',
      email: 'carlos@techsupport.com',
      telefono: '+598 98 765 432',
      servicios: ['Soporte IT', 'Instalación equipos', 'Mantenimiento'],
      estado: 'pendiente',
      fechaRegistro: '2025-06-15',
      documentos: {
        rut: true,
        certificadoDgi: false,
        seguro: false,
        certificadoTecnico: false
      },
      documentosPendientes: ['Certificado DGI', 'Seguro de responsabilidad', 'Certificación técnica']
    },
    {
      id: 3,
      nombre: 'Ana Martínez',
      empresa: 'Catering Gourmet',
      email: 'ana@cateringgourmet.com',
      telefono: '+598 91 234 567',
      servicios: ['Catering eventos', 'Coffee break', 'Almuerzos ejecutivos'],
      estado: 'activo',
      fechaRegistro: '2024-05-10',
      calificacion: 4.9,
      serviciosCompletados: 89,
      gananciasGeneradas: 24500,
      comisionesPagadas: 4900,
      documentos: {
        rut: true,
        certificadoDgi: true,
        seguro: true,
        habilitacionBromatologica: true
      },
      zonasCubiertas: ['Montevideo', 'Canelones']
    },
    {
      id: 4,
      nombre: 'Roberto Silva',
      empresa: 'Seguridad Integral',
      email: 'roberto@seguridadintegral.com',
      telefono: '+598 94 567 890',
      servicios: ['Seguridad privada', 'Monitoreo', 'Custodia'],
      estado: 'suspendido',
      fechaRegistro: '2024-01-15',
      calificacion: 3.2,
      serviciosCompletados: 45,
      gananciasGeneradas: 8900,
      comisionesPagadas: 1780,
      razonSuspension: 'Múltiples quejas de clientes',
      documentos: {
        rut: true,
        certificadoDgi: true,
        seguro: true,
        habilitacionPolicial: true
      }
    },
    {
      id: 5,
      nombre: 'Laura Pérez',
      empresa: 'Mantenimiento Express',
      email: 'laura@mantenimientoexpress.com',
      telefono: '+598 92 345 678',
      servicios: ['Electricidad', 'Plomería', 'Pintura', 'Albañilería'],
      estado: 'activo',
      fechaRegistro: '2024-03-25',
      calificacion: 4.6,
      serviciosCompletados: 234,
      gananciasGeneradas: 31200,
      comisionesPagadas: 6240,
      documentos: {
        rut: true,
        certificadoDgi: true,
        seguro: true,
        certificadoUte: true
      },
      zonasCubiertas: ['Todo Montevideo']
    }
  ]);

  const estadisticas = {
    total: proveedores.length,
    activos: proveedores.filter(p => p.estado === 'activo').length,
    pendientes: proveedores.filter(p => p.estado === 'pendiente').length,
    suspendidos: proveedores.filter(p => p.estado === 'suspendido').length,
    serviciosTotales: proveedores.reduce((sum, p) => sum + (p.serviciosCompletados || 0), 0),
    gananciasTotales: proveedores.reduce((sum, p) => sum + (p.gananciasGeneradas || 0), 0),
    comisionesTotales: proveedores.reduce((sum, p) => sum + (p.comisionesPagadas || 0), 0)
  };

  const getProveedoresFiltrados = () => {
    let filtrados = proveedores;

    if (tabActiva !== 'todos') {
      filtrados = filtrados.filter(p => {
        if (tabActiva === 'activos') return p.estado === 'activo';
        if (tabActiva === 'pendientes') return p.estado === 'pendiente';
        if (tabActiva === 'suspendidos') return p.estado === 'suspendido';
        return true;
      });
    }

    if (busqueda) {
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.empresa.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.servicios.some(s => s.toLowerCase().includes(busqueda.toLowerCase()))
      );
    }

    return filtrados;
  };

  const getEstadoInfo = (estado) => {
    switch (estado) {
      case 'activo': return { color: '#27ae60', icono: 'checkmark-circle' };
      case 'pendiente': return { color: '#f39c12', icono: 'time' };
      case 'suspendido': return { color: '#e74c3c', icono: 'close-circle' };
      default: return { color: '#7f8c8d', icono: 'help-circle' };
    }
  };

  const handleVerDetalles = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setModalDetalles(true);
  };

  const handleCambiarEstado = (proveedor, nuevoEstado) => {
    Alert.alert(
      'Cambiar estado',
      `¿Cambiar el estado de ${proveedor.empresa} a ${nuevoEstado}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            Alert.alert('Éxito', 'Estado actualizado correctamente');
            setModalDetalles(false);
          }
        }
      ]
    );
  };

  const handleVerDocumentos = (proveedor) => {
    setModalDetalles(false);
    Alert.alert('Documentos', 'Funcionalidad de ver documentos en desarrollo');
  };

  const handleContactar = (proveedor) => {
    Alert.alert(
      'Contactar proveedor',
      `¿Cómo deseas contactar a ${proveedor.nombre}?`,
      [
        { text: 'Email', onPress: () => console.log('Abrir email') },
        { text: 'Teléfono', onPress: () => console.log('Llamar') },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const renderServicio = (servicio) => (
    <View key={servicio} style={styles.servicioChip}>
      <Text style={styles.servicioText}>{servicio}</Text>
    </View>
  );

  const renderProveedor = ({ item }) => {
    const estadoInfo = getEstadoInfo(item.estado);

    return (
      <TouchableOpacity
        style={styles.proveedorCard}
        onPress={() => handleVerDetalles(item)}
      >
        <View style={styles.proveedorHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {item.empresa.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <View style={styles.proveedorInfo}>
            <Text style={styles.proveedorNombre}>{item.nombre}</Text>
            <Text style={styles.proveedorEmpresa}>{item.empresa}</Text>
            <Text style={styles.proveedorEmail}>{item.email}</Text>
          </View>
          <View style={[styles.estadoIcon, { backgroundColor: estadoInfo.color + '20' }]}>
            <Ionicons name={estadoInfo.icono} size={24} color={estadoInfo.color} />
          </View>
        </View>

        <View style={styles.serviciosContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {item.servicios.map(servicio => renderServicio(servicio))}
          </ScrollView>
        </View>

        <View style={styles.proveedorStats}>
          {item.estado === 'activo' && (
            <>
              <View style={styles.statItem}>
                <Ionicons name="star" size={16} color="#f39c12" />
                <Text style={styles.statText}>{item.calificacion}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="construct" size={16} color="#4a90e2" />
                <Text style={styles.statText}>{item.serviciosCompletados} servicios</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="cash" size={16} color="#27ae60" />
                <Text style={styles.statText}>${item.gananciasGeneradas}</Text>
              </View>
            </>
          )}
          {item.estado === 'pendiente' && (
            <View style={styles.alertaBadge}>
              <Ionicons name="alert-circle" size={16} color="#f39c12" />
              <Text style={styles.alertaText}>
                {item.documentosPendientes?.length || 0} documentos pendientes
              </Text>
            </View>
          )}
          {item.estado === 'suspendido' && (
            <View style={styles.alertaBadge}>
              <Ionicons name="warning" size={16} color="#e74c3c" />
              <Text style={styles.alertaText}>{item.razonSuspension}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.headerTitle}>Gestión de Proveedores</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, empresa o servicio..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <View style={styles.estadisticasCard}>
        <View style={styles.estatItem}>
          <Text style={styles.estatNumero}>{estadisticas.total}</Text>
          <Text style={styles.estatLabel}>Total</Text>
        </View>
        <View style={styles.estatItem}>
          <Text style={[styles.estatNumero, { color: '#27ae60' }]}>
            {estadisticas.activos}
          </Text>
          <Text style={styles.estatLabel}>Activos</Text>
        </View>
        <View style={styles.estatItem}>
          <Text style={[styles.estatNumero, { color: '#f39c12' }]}>
            {estadisticas.pendientes}
          </Text>
          <Text style={styles.estatLabel}>Pendientes</Text>
        </View>
        <View style={styles.estatItem}>
          <Text style={[styles.estatNumero, { color: '#4a90e2' }]}>
            {estadisticas.serviciosTotales}
          </Text>
          <Text style={styles.estatLabel}>Servicios</Text>
        </View>
      </View>

      <View style={styles.estadisticasFinancieras}>
        <View style={styles.financieraItem}>
          <Text style={styles.financieraLabel}>Ganancias generadas</Text>
          <Text style={styles.financieraValue}>
            ${estadisticas.gananciasTotales.toLocaleString()}
          </Text>
        </View>
        <View style={styles.financieraItem}>
          <Text style={styles.financieraLabel}>Comisiones totales</Text>
          <Text style={[styles.financieraValue, { color: '#27ae60' }]}>
            ${estadisticas.comisionesTotales.toLocaleString()}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {['todos', 'activos', 'pendientes', 'suspendidos'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, tabActiva === tab && styles.tabActive]}
            onPress={() => setTabActiva(tab)}
          >
            <Text style={[styles.tabText, tabActiva === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={getProveedoresFiltrados()}
        renderItem={renderProveedor}
        keyExtractor={(item) => item.id.toString()}
        style={styles.lista}
        contentContainerStyle={styles.listaContent}
      />

      <Modal
        visible={modalDetalles}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalDetalles(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles del proveedor</Text>
              <TouchableOpacity
                onPress={() => setModalDetalles(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            {proveedorSeleccionado && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.modalProveedorHeader}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>
                      {proveedorSeleccionado.empresa.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </Text>
                  </View>
                  <View style={styles.modalProveedorInfo}>
                    <Text style={styles.modalProveedorNombre}>{proveedorSeleccionado.nombre}</Text>
                    <Text style={styles.modalProveedorEmpresa}>{proveedorSeleccionado.empresa}</Text>
                    <View style={[
                      styles.modalEstadoBadge,
                      { backgroundColor: getEstadoInfo(proveedorSeleccionado.estado).color + '20' }
                    ]}>
                      <Ionicons
                        name={getEstadoInfo(proveedorSeleccionado.estado).icono}
                        size={16}
                        color={getEstadoInfo(proveedorSeleccionado.estado).color}
                      />
                      <Text style={[
                        styles.modalEstadoText,
                        { color: getEstadoInfo(proveedorSeleccionado.estado).color }
                      ]}>
                        {proveedorSeleccionado.estado.charAt(0).toUpperCase() + proveedorSeleccionado.estado.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalSeccion}>
                  <Text style={styles.modalSeccionTitle}>Información de contacto</Text>
                  <View style={styles.modalInfoItem}>
                    <Ionicons name="mail" size={16} color="#4a90e2" />
                    <Text style={styles.modalInfoValue}>{proveedorSeleccionado.email}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Ionicons name="call" size={16} color="#4a90e2" />
                    <Text style={styles.modalInfoValue}>{proveedorSeleccionado.telefono}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Ionicons name="calendar" size={16} color="#4a90e2" />
                    <Text style={styles.modalInfoValue}>
                      Registrado el {proveedorSeleccionado.fechaRegistro}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSeccion}>
                  <Text style={styles.modalSeccionTitle}>Servicios ofrecidos</Text>
                  <View style={styles.modalServiciosGrid}>
                    {proveedorSeleccionado.servicios.map((servicio, index) => (
                      <View key={index} style={styles.modalServicioChip}>
                        <Text style={styles.modalServicioText}>{servicio}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {proveedorSeleccionado.zonasCubiertas && (
                  <View style={styles.modalSeccion}>
                    <Text style={styles.modalSeccionTitle}>Zonas de cobertura</Text>
                    <View style={styles.modalZonasContainer}>
                      {proveedorSeleccionado.zonasCubiertas.map((zona, index) => (
                        <View key={index} style={styles.modalZonaItem}>
                          <Ionicons name="location" size={16} color="#4a90e2" />
                          <Text style={styles.modalZonaText}>{zona}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {proveedorSeleccionado.estado === 'activo' && (
                  <View style={styles.modalSeccion}>
                    <Text style={styles.modalSeccionTitle}>Estadísticas</Text>
                    <View style={styles.modalEstadisticas}>
                      <View style={styles.modalEstatItem}>
                        <Ionicons name="star" size={20} color="#f39c12" />
                        <Text style={styles.modalEstatValor}>{proveedorSeleccionado.calificacion}</Text>
                        <Text style={styles.modalEstatLabel}>Calificación</Text>
                      </View>
                      <View style={styles.modalEstatItem}>
                        <Ionicons name="construct" size={20} color="#4a90e2" />
                        <Text style={styles.modalEstatValor}>{proveedorSeleccionado.serviciosCompletados}</Text>
                        <Text style={styles.modalEstatLabel}>Servicios</Text>
                      </View>
                      <View style={styles.modalEstatItem}>
                        <Ionicons name="cash" size={20} color="#27ae60" />
                        <Text style={styles.modalEstatValor}>${proveedorSeleccionado.gananciasGeneradas}</Text>
                        <Text style={styles.modalEstatLabel}>Ganancias</Text>
                      </View>
                    </View>
                  </View>
                )}

                {proveedorSeleccionado.documentos && (
                  <View style={styles.modalSeccion}>
                    <Text style={styles.modalSeccionTitle}>Documentación</Text>
                    {Object.entries(proveedorSeleccionado.documentos).map(([doc, status]) => (
                      <View key={doc} style={styles.modalDocumentoItem}>
                        <Ionicons
                          name={status ? 'checkmark-circle' : 'close-circle'}
                          size={20}
                          color={status ? '#27ae60' : '#e74c3c'}
                        />
                        <Text style={styles.modalDocumentoText}>
                          {doc.replace(/([A-Z])/g, ' $1').charAt(0).toUpperCase() +
                            doc.replace(/([A-Z])/g, ' $1').slice(1)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {proveedorSeleccionado.estado === 'pendiente' && proveedorSeleccionado.documentosPendientes && (
                  <View style={styles.modalAlerta}>
                    <Ionicons name="alert-circle" size={20} color="#f39c12" />
                    <View style={styles.modalAlertaContent}>
                      <Text style={styles.modalAlertaTitle}>Documentos pendientes:</Text>
                      {proveedorSeleccionado.documentosPendientes.map((doc, index) => (
                        <Text key={index} style={styles.modalAlertaText}>• {doc}</Text>
                      ))}
                    </View>
                  </View>
                )}

                {proveedorSeleccionado.estado === 'suspendido' && proveedorSeleccionado.razonSuspension && (
                  <View style={[styles.modalAlerta, { backgroundColor: '#fee' }]}>
                    <Ionicons name="warning" size={20} color="#e74c3c" />
                    <Text style={[styles.modalAlertaText, { color: '#e74c3c' }]}>
                      {proveedorSeleccionado.razonSuspension}
                    </Text>
                  </View>
                )}

                <View style={styles.modalAcciones}>
                  {proveedorSeleccionado.estado === 'pendiente' && (
                    <TouchableOpacity
                      style={[styles.modalBoton, styles.botonAprobar]}
                      onPress={() => handleCambiarEstado(proveedorSeleccionado, 'activo')}
                    >
                      <Ionicons name="checkmark" size={16} color="#fff" />
                      <Text style={styles.modalBotonText}>Aprobar</Text>
                    </TouchableOpacity>
                  )}

                  {proveedorSeleccionado.estado === 'activo' && (
                    <TouchableOpacity
                      style={[styles.modalBoton, styles.botonSuspender]}
                      onPress={() => handleCambiarEstado(proveedorSeleccionado, 'suspendido')}
                    >
                      <Ionicons name="pause" size={16} color="#fff" />
                      <Text style={styles.modalBotonText}>Suspender</Text>
                    </TouchableOpacity>
                  )}

                  {proveedorSeleccionado.estado === 'suspendido' && (
                    <TouchableOpacity
                      style={[styles.modalBoton, styles.botonActivar]}
                      onPress={() => handleCambiarEstado(proveedorSeleccionado, 'activo')}
                    >
                      <Ionicons name="play" size={16} color="#fff" />
                      <Text style={styles.modalBotonText}>Activar</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.modalBoton, styles.botonDocumentos]}
                    onPress={() => handleVerDocumentos(proveedorSeleccionado)}
                  >
                    <Ionicons name="document-text" size={16} color="#fff" />
                    <Text style={styles.modalBotonText}>Ver documentos</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBoton, styles.botonContactar]}
                    onPress={() => handleContactar(proveedorSeleccionado)}
                  >
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text style={styles.modalBotonText}>Contactar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
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
  header: {
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
  addButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 10,
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#2c3e50',
  },
  estadisticasCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  estatItem: {
    alignItems: 'center',
    flex: 1,
  },
  estatNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  estatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  estadisticasFinancieras: {
    backgroundColor: '#2c3e50',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  financieraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  financieraLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  financieraValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f8f9fa',
  },
  tabActive: {
    backgroundColor: '#4a90e2',
  },
  tabText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  lista: {
    flex: 1,
  },
  listaContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  proveedorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  proveedorHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  proveedorInfo: {
    flex: 1,
  },
  proveedorNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  proveedorEmpresa: {
    fontSize: 14,
    color: '#4a90e2',
    marginBottom: 2,
  },
  proveedorEmail: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  estadoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviciosContainer: {
    marginBottom: 12,
  },
  servicioChip: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  servicioText: {
    fontSize: 12,
    color: '#4a90e2',
  },
  proveedorStats: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#5a6c7d',
  },
  alertaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbf0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  alertaText: {
    fontSize: 12,
    color: '#f39c12',
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
    maxHeight: '90%',
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
  },
  modalProveedorHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  modalAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalProveedorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  modalProveedorNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  modalProveedorEmpresa: {
    fontSize: 16,
    color: '#4a90e2',
    marginBottom: 8,
  },
  modalEstadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  modalEstadoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalSeccion: {
    marginBottom: 20,
  },
  modalSeccionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  modalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#2c3e50',
  },
  modalServiciosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalServicioChip: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalServicioText: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '500',
  },
  modalZonasContainer: {
    gap: 8,
  },
  modalZonaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalZonaText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  modalEstadisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  modalEstatItem: {
    alignItems: 'center',
  },
  modalEstatValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginVertical: 4,
  },
  modalEstatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalDocumentoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalDocumentoText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  modalAlerta: {
    flexDirection: 'row',
    backgroundColor: '#fffbf0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  modalAlertaContent: {
    flex: 1,
  },
  modalAlertaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f39c12',
    marginBottom: 4,
  },
  modalAlertaText: {
    fontSize: 12,
    color: '#f39c12',
  },
  modalAcciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  modalBoton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  botonAprobar: {
    backgroundColor: '#27ae60',
  },
  botonSuspender: {
    backgroundColor: '#f39c12',
  },
  botonActivar: {
    backgroundColor: '#27ae60',
  },
  botonDocumentos: {
    backgroundColor: '#3498db',
  },
  botonContactar: {
    backgroundColor: '#4a90e2',
  },
  modalBotonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GestionProveedores;