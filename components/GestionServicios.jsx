import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import {
  obtenerProveedores,
  obtenerServiciosPorEspacio,
  toggleServicioAdicional
} from '../store/slices/proveedoresSlice';

const servicioSchema = yup.object({
  _id: yup.string().required('ID del servicio es requerido'),
  nombre: yup.string().required('Nombre del servicio es requerido').min(2, 'Nombre debe tener al menos 2 caracteres'),
  activo: yup.boolean().required('Estado activo es requerido')
});

const proveedorExternoSchema = yup.object({
  _id: yup.string().required('ID del proveedor es requerido'),
  proveedor: yup.string().required('Nombre del proveedor es requerido').min(2, 'Nombre debe tener al menos 2 caracteres'),
  servicio: yup.string().required('Servicio es requerido').min(2, 'Servicio debe tener al menos 2 caracteres'),
  precio: yup.number().min(0, 'Precio debe ser mayor o igual a 0').required('Precio es requerido'),
  calificacion: yup.number().min(0, 'Calificación mínima es 0').max(5, 'Calificación máxima es 5').required('Calificación es requerida'),
  activo: yup.boolean().required('Estado activo es requerido')
});

const espacioSchema = yup.object({
  id: yup.number().positive('ID debe ser un número positivo').required('ID del espacio es requerido'),
  nombre: yup.string().required('Nombre del espacio es requerido').min(3, 'Nombre debe tener al menos 3 caracteres'),
  serviciosIncluidos: yup.array().of(servicioSchema).default([]),
  proveedoresExternos: yup.array().of(proveedorExternoSchema).default([])
});

const gestionServiciosSchema = yup.object({
  tabActiva: yup.string()
    .test('tab-valida', 'Tab debe ser incluidos o externos', function(value) {
      const tabsValidas = ['incluidos', 'externos'];
      return tabsValidas.includes(value);
    })
    .required('Tab activa es requerida'),
  espaciosData: yup.array().of(espacioSchema).required('Datos de espacios son requeridos')
});

const GestionServicios = ({ navigation }) => {
  const dispatch = useDispatch();
  const { oficinasPropias } = useSelector(state => state.usuario);
  const { serviciosPorEspacio, proveedores, loading } = useSelector(state => state.proveedores);

  const [tabActiva, setTabActiva] = useState('incluidos');
  const [validationErrors, setValidationErrors] = useState({});

  const misEspacios = [
    {
      id: 1,
      nombre: "Oficina Panorámica 'Skyview'",
      serviciosIncluidos: [
        { _id: '1', nombre: 'Wi-Fi Premium', activo: true },
        { _id: '2', nombre: 'Café gratis', activo: true },
        { _id: '3', nombre: 'Estacionamiento', activo: true },
        { _id: '4', nombre: 'Recepcionista', activo: false },
      ],
      proveedoresExternos: []
    },
    {
      id: 2,
      nombre: "Oficina 'El mirador'",
      serviciosIncluidos: [
        { _id: '5', nombre: 'Wi-Fi Premium', activo: true },
        { _id: '6', nombre: 'Café gratis', activo: true },
        { _id: '7', nombre: 'Estacionamiento', activo: false },
        { _id: '8', nombre: 'Aire acondicionado', activo: true },
      ],
      proveedoresExternos: []
    }
  ];

  const [espaciosData, setEspaciosData] = useState(misEspacios);

  const validateData = async (data, schema) => {
    try {
      await schema.validate(data, { abortEarly: false });
      return { isValid: true, errors: {} };
    } catch (error) {
      const errors = {};
      error.inner.forEach(err => {
        errors[err.path] = err.message;
      });
      return { isValid: false, errors };
    }
  };

  const validateCompleteState = async () => {
    const stateData = {
      tabActiva,
      espaciosData
    };

    const { isValid, errors } = await validateData(stateData, gestionServiciosSchema);
    setValidationErrors(errors);
    return isValid;
  };

  const validateEspacio = async (espacio) => {
    return await validateData(espacio, espacioSchema);
  };

  const validateServicio = async (servicio) => {
    return await validateData(servicio, servicioSchema);
  };

  const validateProveedorExterno = async (proveedor) => {
    return await validateData(proveedor, proveedorExternoSchema);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    validateCompleteState();
  }, [tabActiva, espaciosData]);

  const cargarDatos = async () => {
    try {
      await dispatch(obtenerProveedores(0, 50));

      for (const espacioId of oficinasPropias) {
        await dispatch(obtenerServiciosPorEspacio(espacioId));
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const getProveedoresExternosPorEspacio = (espacioId) => {
    if (!proveedores) return [];

    const proveedoresEspacio = proveedores
      .filter(proveedor => proveedor.espaciosAtendidos?.includes(espacioId))
      .map(proveedor => ({
        _id: proveedor._id,
        proveedor: proveedor.empresa || proveedor.nombre,
        servicio: proveedor.servicios?.[0]?.nombre || 'Servicio general',
        precio: proveedor.servicios?.[0]?.precio || 0,
        calificacion: proveedor.calificacion || 0,
        activo: proveedor.activo || false
      }));

    proveedoresEspacio.forEach(async (proveedor) => {
      const { isValid, errors } = await validateProveedorExterno(proveedor);
      if (!isValid) {
        console.warn('Proveedor externo inválido:', errors);
      }
    });

    return proveedoresEspacio;
  };

  const toggleServicioIncluido = async (espacioId, servicioId) => {
    try {
      const isStateValid = await validateCompleteState();
      if (!isStateValid) {
        console.warn('Estado inválido antes de toggle:', validationErrors);
      }

      setEspaciosData(prev => prev.map(espacio => {
        if (espacio.id === espacioId) {
          const updatedEspacio = {
            ...espacio,
            serviciosIncluidos: espacio.serviciosIncluidos.map(servicio =>
              servicio._id === servicioId
                ? { ...servicio, activo: !servicio.activo }
                : servicio
            )
          };

          validateEspacio(updatedEspacio).then(({ isValid, errors }) => {
            if (!isValid) {
              console.warn('Espacio inválido después de actualización:', errors);
            }
          });

          return updatedEspacio;
        }
        return espacio;
      }));

      const servicio = espaciosData
        .find(e => e.id === espacioId)
        ?.serviciosIncluidos.find(s => s._id === servicioId);

      if (servicio) {
        const { isValid } = await validateServicio(servicio);
        if (isValid) {
          await dispatch(toggleServicioAdicional(servicioId, !servicio.activo));
        }
      }
    } catch (error) {
      console.error('Error toggling servicio incluido:', error);
      setEspaciosData(prev => prev.map(espacio => {
        if (espacio.id === espacioId) {
          return {
            ...espacio,
            serviciosIncluidos: espacio.serviciosIncluidos.map(servicio =>
              servicio._id === servicioId
                ? { ...servicio, activo: !servicio.activo }
                : servicio
            )
          };
        }
        return espacio;
      }));
    }
  };

  const toggleProveedorExterno = async (espacioId, proveedorId) => {
    try {
      const proveedor = proveedores.find(p => p._id === proveedorId);
      if (proveedor) {
        const proveedorData = {
          _id: proveedor._id,
          proveedor: proveedor.empresa || proveedor.nombre,
          servicio: proveedor.servicios?.[0]?.nombre || 'Servicio general',
          precio: proveedor.servicios?.[0]?.precio || 0,
          calificacion: proveedor.calificacion || 0,
          activo: proveedor.activo || false
        };

        const { isValid, errors } = await validateProveedorExterno(proveedorData);
        if (!isValid) {
          console.warn('Proveedor inválido:', errors);
          return;
        }

        await dispatch(toggleServicioAdicional(proveedorId, !proveedor.activo));
        await cargarDatos();
      }
    } catch (error) {
      console.error('Error toggling proveedor externo:', error);
    }
  };

  const buscarProveedores = () => {
    navigation.navigate('BuscarProveedores');
  };

  const renderServicioIncluido = ({ item: servicio, espacio }) => (
    <View style={[styles.servicioItem, !servicio.activo && styles.servicioInactivo]}>
      <View style={styles.servicioInfo}>
        <Text style={[styles.servicioNombre, !servicio.activo && styles.textoInactivo]}>
          {servicio.nombre}
        </Text>
        <Text style={styles.servicioTipo}>Incluido en el espacio</Text>
      </View>
      <TouchableOpacity
        style={[styles.toggleButton, servicio.activo && styles.toggleButtonActive]}
        onPress={() => toggleServicioIncluido(espacio.id, servicio._id)}
        disabled={loading}
      >
        <Ionicons
          name={servicio.activo ? 'checkmark' : 'close'}
          size={20}
          color={servicio.activo ? '#fff' : '#7f8c8d'}
        />
      </TouchableOpacity>
    </View>
  );

  const renderProveedorExterno = ({ item: proveedor, espacio }) => (
    <View style={[styles.servicioItem, !proveedor.activo && styles.servicioInactivo]}>
      <View style={styles.servicioInfo}>
        <Text style={[styles.servicioNombre, !proveedor.activo && styles.textoInactivo]}>
          {proveedor.servicio}
        </Text>
        <Text style={styles.proveedorNombre}>por {proveedor.proveedor}</Text>
        <View style={styles.proveedorDetalles}>
          <View style={styles.calificacion}>
            <Ionicons name="star" size={14} color="#f39c12" />
            <Text style={styles.calificacionText}>{proveedor.calificacion}</Text>
          </View>
          <Text style={styles.precio}>${proveedor.precio}/servicio</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.toggleButton, proveedor.activo && styles.toggleButtonActive]}
        onPress={() => toggleProveedorExterno(espacio.id, proveedor._id)}
        disabled={loading}
      >
        <Ionicons
          name={proveedor.activo ? 'checkmark' : 'close'}
          size={20}
          color={proveedor.activo ? '#fff' : '#7f8c8d'}
        />
      </TouchableOpacity>
    </View>
  );

  const renderEspacio = ({ item: espacio }) => {
    const serviciosIncluidos = espacio.serviciosIncluidos || [];
    const proveedoresExternos = getProveedoresExternosPorEspacio(espacio.id);

    const servicios = tabActiva === 'incluidos'
      ? serviciosIncluidos
      : proveedoresExternos;

    return (
      <View style={styles.espacioContainer}>
        <Text style={styles.espacioNombre}>{espacio.nombre}</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando servicios...</Text>
          </View>
        ) : servicios.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={tabActiva === 'incluidos' ? 'construct-outline' : 'people-outline'}
              size={40}
              color="#bdc3c7"
            />
            <Text style={styles.emptyText}>
              {tabActiva === 'incluidos'
                ? 'No hay servicios incluidos'
                : 'No hay proveedores externos'}
            </Text>
            {tabActiva === 'externos' && (
              <TouchableOpacity style={styles.buscarButton} onPress={buscarProveedores}>
                <Text style={styles.buscarButtonText}>Buscar proveedores</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={servicios}
            keyExtractor={(item) => `${espacio.id}-${item._id}`}
            renderItem={({ item }) =>
              tabActiva === 'incluidos'
                ? renderServicioIncluido({ item, espacio })
                : renderProveedorExterno({ item, espacio })
            }
            scrollEnabled={false}
          />
        )}
      </View>
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
        <Text style={styles.headerTitle}>Gestión de servicios</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, tabActiva === 'incluidos' && styles.tabActive]}
          onPress={() => setTabActiva('incluidos')}
        >
          <Ionicons
            name="construct"
            size={20}
            color={tabActiva === 'incluidos' ? '#4a90e2' : '#7f8c8d'}
          />
          <Text style={[
            styles.tabText,
            tabActiva === 'incluidos' && styles.tabTextActive
          ]}>
            Servicios incluidos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tabActiva === 'externos' && styles.tabActive]}
          onPress={() => setTabActiva('externos')}
        >
          <Ionicons
            name="people"
            size={20}
            color={tabActiva === 'externos' ? '#4a90e2' : '#7f8c8d'}
          />
          <Text style={[
            styles.tabText,
            tabActiva === 'externos' && styles.tabTextActive
          ]}>
            Proveedores externos
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={espaciosData.filter(espacio => oficinasPropias.includes(espacio.id))}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEspacio}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={cargarDatos}
      />

      {tabActiva === 'externos' && (
        <TouchableOpacity style={styles.fabButton} onPress={buscarProveedores}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  tabActive: {
    backgroundColor: '#e3f2fd',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    marginLeft: 8,
  },
  tabTextActive: {
    color: '#4a90e2',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  espacioContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  espacioNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  servicioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  servicioInactivo: {
    opacity: 0.6,
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
  textoInactivo: {
    color: '#7f8c8d',
  },
  servicioTipo: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  proveedorNombre: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  proveedorDetalles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  calificacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calificacionText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  precio: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27ae60',
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
    marginBottom: 20,
  },
  buscarButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buscarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});

export default GestionServicios;