import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';


export const obtenerOficinas = createAsyncThunk(
  'espacios/obtenerOficinas',
  async ({ skip = 0, limit = 100 } = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      console.log('🏢 Obteniendo oficinas...');

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/oficinas?skip=${skip}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('🔴 Error HTTP en obtenerOficinas:', response.status, data);
        return rejectWithValue(data.message || `Error HTTP ${response.status}: Error al obtener oficinas`);
      }

      
      const oficinasArray = Array.isArray(data) ? data : (data.datos || data.data || []);

      console.log('✅ Oficinas obtenidas:', oficinasArray.length);

      return { data: oficinasArray, tipo: 'oficina' };
    } catch (error) {
      console.error('🔴 Error de red en obtenerOficinas:', error);
      return rejectWithValue('Error de conexión al obtener oficinas');
    }
  }
);


export const obtenerEspacios = createAsyncThunk(
  'espacios/obtenerEspacios',
  async ({ skip = 0, limit = 100 } = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      console.log('🏠 Obteniendo espacios...');

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/espacios?skip=${skip}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('🔴 Error HTTP en obtenerEspacios:', response.status, data);
        return rejectWithValue(data.message || `Error HTTP ${response.status}: Error al obtener espacios`);
      }

      const espaciosArray = Array.isArray(data) ? data : (data.datos || data.data || []);

      console.log('✅ Espacios obtenidos:', espaciosArray.length);

      return { data: espaciosArray, tipo: 'espacio' };
    } catch (error) {
      console.error('🔴 Error de red en obtenerEspacios:', error);
      return rejectWithValue('Error de conexión al obtener espacios');
    }
  }
);


export const obtenerEscritorios = createAsyncThunk(
  'espacios/obtenerEscritorios',
  async ({ skip = 0, limit = 100 } = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      console.log('🖥️ Obteniendo escritorios...');

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/escritorios-flexibles?skip=${skip}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('🔴 Error HTTP en obtenerEscritorios:', response.status, data);
        return rejectWithValue(data.message || `Error HTTP ${response.status}: Error al obtener escritorios`);
      }

      const escritoriosArray = Array.isArray(data) ? data : (data.datos || data.data || []);

      console.log('✅ Escritorios obtenidos:', escritoriosArray.length);

      return { data: escritoriosArray, tipo: 'escritorio' };
    } catch (error) {
      console.error('🔴 Error de red en obtenerEscritorios:', error);
      return rejectWithValue('Error de conexión al obtener escritorios');
    }
  }
);


export const obtenerEdificios = createAsyncThunk(
  'espacios/obtenerEdificios',
  async ({ skip = 0, limit = 100 } = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      console.log('🏗️ Obteniendo edificios...');

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/edificios?skip=${skip}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('🔴 Error HTTP en obtenerEdificios:', response.status, data);
        return rejectWithValue(data.message || `Error HTTP ${response.status}: Error al obtener edificios`);
      }

      const edificiosArray = Array.isArray(data) ? data : (data.datos || data.data || []);

      console.log('✅ Edificios obtenidos:', edificiosArray.length);

      return { data: edificiosArray, tipo: 'edificio' };
    } catch (error) {
      console.error('🔴 Error de red en obtenerEdificios:', error);
      return rejectWithValue('Error de conexión al obtener edificios');
    }
  }
);

export const obtenerSalas = createAsyncThunk(
  'espacios/obtenerSalas',
  async ({ skip = 0, limit = 100 } = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      console.log('🏛️ Obteniendo salas...');

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/salas-reunion?skip=${skip}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('🔴 Error HTTP en obtenerSalas:', response.status, data);
        return rejectWithValue(data.message || `Error HTTP ${response.status}: Error al obtener salas`);
      }

      const salasArray = Array.isArray(data) ? data : (data.datos || data.data || []);

      console.log('✅ Salas obtenidas:', salasArray.length);

      return { data: salasArray, tipo: 'sala' };
    } catch (error) {
      console.error('🔴 Error de red en obtenerSalas:', error);
      return rejectWithValue('Error de conexión al obtener salas');
    }
  }
);


export const cargarTodosLosEspacios = createAsyncThunk(
  'espacios/cargarTodos',
  async ({ filtroTipo = 'todos', limit = 100 } = {}, { dispatch, rejectWithValue }) => {
    try {
      console.log('🚀 Iniciando cargarTodosLosEspacios con filtro:', filtroTipo);

      const promises = [];

      if (filtroTipo === 'todos') {
        
        promises.push(
          dispatch(obtenerOficinas({ limit })),
          dispatch(obtenerEspacios({ limit })),
          dispatch(obtenerEscritorios({ limit })),
          dispatch(obtenerEdificios({ limit })),
          dispatch(obtenerSalas({ limit }))
        );
      } else {
        
        switch (filtroTipo) {
          case 'oficina':
            promises.push(dispatch(obtenerOficinas({ limit })));
            break;
          case 'espacio':
            promises.push(dispatch(obtenerEspacios({ limit })));
            break;
          case 'escritorio':
            promises.push(dispatch(obtenerEscritorios({ limit })));
            break;
          case 'edificio':
            promises.push(dispatch(obtenerEdificios({ limit })));
            break;
          case 'sala':
            promises.push(dispatch(obtenerSalas({ limit })));
            break;
        }
      }

      const results = await Promise.allSettled(promises);
      console.log('📊 Resultados de las promesas:', results);

      const successfulResults = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const action = result.value;
          console.log(`✅ Resultado ${index}:`, action);

          
          if (action.meta && action.meta.requestStatus === 'fulfilled' && action.payload) {
            
            if (action.payload.data && action.payload.tipo) {
              successfulResults.push(action.payload);
              console.log(`✅ Datos de ${action.payload.tipo} cargados:`, action.payload.data.length, 'elementos');
            } else {
              console.warn(`⚠️ Payload inválido para resultado ${index}:`, action.payload);
            }
          } else if (action.meta && action.meta.requestStatus === 'rejected') {
            console.error(`❌ Error en resultado ${index}:`, action.payload || action.error);
          }
        } else {
          console.error(`❌ Promesa ${index} rechazada:`, result.reason);
        }
      });

      console.log('🎯 Resultados exitosos finales:', successfulResults.length);

      
      return successfulResults;
    } catch (error) {
      console.error('🔴 Error en cargarTodosLosEspacios:', error);
      return rejectWithValue('Error al cargar espacios');
    }
  }
);


export const cargarEspaciosCliente = createAsyncThunk(
  'espacios/cargarEspaciosCliente',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userId = auth.usuario?.id || auth.usuario?._id;

      if (!userId) {
        return rejectWithValue('No se encontró ID del usuario');
      }

      console.log('🔥 Cargando espacios para cliente con ID:', userId);

      
      const result = await dispatch(cargarTodosLosEspacios());

      if (cargarTodosLosEspacios.fulfilled.match(result)) {
        const todosLosEspacios = result.payload;

        
        if (!Array.isArray(todosLosEspacios)) {
          console.log('⚠️ todosLosEspacios no es un array:', todosLosEspacios);
          return []; 
        }

        
        const espaciosCliente = [];

        todosLosEspacios.forEach(({ data, tipo } = {}) => {
          
          if (!Array.isArray(data)) {
            console.log(`⚠️ Data de ${tipo} no es un array:`, data);
            return;
          }

          console.log(`🔍 Filtrando ${tipo}s para propietarioId: ${userId}`);

          const espaciosFiltrados = data.filter(espacio => {
            
            let propietarioIdStr = null;

            if (espacio.propietarioId) {
              if (typeof espacio.propietarioId === 'object') {
                
                propietarioIdStr = espacio.propietarioId._id || espacio.propietarioId.$oid;
              } else {
                
                propietarioIdStr = espacio.propietarioId;
              }
            }

            
            propietarioIdStr = propietarioIdStr?.toString();
            const userIdStr = userId?.toString();

            const esPropio = propietarioIdStr && userIdStr && propietarioIdStr === userIdStr;

            if (esPropio) {
              console.log(`✅ ${tipo} encontrado: ${espacio.nombre || espacio.titulo}`);
              console.log(`   PropietarioId: ${propietarioIdStr}`);
              console.log(`   UserId: ${userIdStr}`);
            }

            return esPropio;
          });

          if (espaciosFiltrados.length > 0) {
            espaciosCliente.push({ data: espaciosFiltrados, tipo });
          }
        });

        console.log('🎯 Espacios del cliente encontrados:', espaciosCliente.length);

        
        return espaciosCliente;
      } else {
        throw new Error('Error al cargar espacios');
      }
    } catch (error) {
      console.error('🔴 Error en cargarEspaciosCliente:', error);
      return rejectWithValue('Error al cargar espacios del cliente');
    }
  }
);

const initialState = {
  oficinas: [],
  espacios: [],
  escritorios: [],
  edificios: [],
  salas: [],
  espaciosMapeados: [],
  espaciosFiltrados: [], 
  filtroTipo: 'todos',
  textoBusqueda: '',
  pagination: {
    skip: 0,
    limit: 100,
    total: 0,
  },
  loading: false,
  error: null,
  refreshing: false,
};

export const crearPublicacion = createAsyncThunk(
  'espacios/crearPublicacion',
  async ({ payload, endpoint, tipo }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      console.log('📤 Creando publicación:', { endpoint, tipo, payload });

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('🔴 Error HTTP en crearPublicacion:', response.status, data);
        return rejectWithValue(data.message || `Error HTTP ${response.status}: Error al crear ${tipo}`);
      }

      console.log('✅ Publicación creada exitosamente:', data);

      return { data, tipo, endpoint };
    } catch (error) {
      console.error('🔴 Error de red en crearPublicacion:', error);
      return rejectWithValue('Error de conexión al crear la publicación');
    }
  }
);


const mapearEspacio = (espacio, tipo) => {
  
  const servicios = [];
  if (espacio.amenidades) {
    if (espacio.amenidades.wifi) servicios.push('wifi');
    if (espacio.amenidades.cafe) servicios.push('cafe');
    if (espacio.amenidades.seguridad) servicios.push('seguridad');
    if (espacio.amenidades.parking) servicios.push('parking');
    if (espacio.amenidades.impresora) servicios.push('impresora');
    if (espacio.amenidades.proyector) servicios.push('proyector');
    if (espacio.amenidades.pizarra) servicios.push('pizarra');
  }

  
  let direccion = '';
  if (espacio.ubicacion) {
    const { calle, ciudad, departamento, pais } = espacio.ubicacion.direccionCompleta || espacio.ubicacion;
    direccion = [calle, ciudad, departamento, pais].filter(Boolean).join(', ');
  }

  
  const getColorForType = (tipo) => {
    switch (tipo) {
      case 'oficina': return '#4a90e2';
      case 'espacio': return '#9b59b6';
      case 'escritorio': return '#e67e22';
      case 'edificio': return '#27ae60';
      case 'sala': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  
  let propietarioId = null;
  let propietarioNombre = 'Propietario';

  
  if (espacio.usuarioId) {
    if (typeof espacio.usuarioId === 'object') {
      propietarioId = espacio.usuarioId._id || espacio.usuarioId.$oid;
      propietarioNombre = espacio.usuarioId.nombre || 'Propietario';
    } else {
      propietarioId = espacio.usuarioId;
    }
  } else if (espacio.propietarioId) {
    
    if (typeof espacio.propietarioId === 'object') {
      propietarioId = espacio.propietarioId._id || espacio.propietarioId.$oid;
      propietarioNombre = espacio.propietarioId.nombre || 'Propietario';
    } else {
      propietarioId = espacio.propietarioId;
    }
  }

  return {
    id: espacio._id,
    nombre: espacio.nombre || espacio.titulo || 'Sin nombre',
    tipo: tipo,
    servicios: servicios,
    color: getColorForType(tipo),
    propietario: propietarioNombre,
    precio: espacio.precios?.porHora || espacio.precios?.porDia || espacio.precio || '0',
    capacidad: espacio.capacidad || espacio.capacidadMaxima || 1,
    direccion: direccion || 'Ubicación no especificada',
    disponible: espacio.estado === 'disponible' && espacio.activo !== false,
    descripcion: espacio.descripcion || '',
    fotos: espacio.fotosPrincipales || espacio.fotos || [],
    datosCompletos: {
      ...espacio,
      
      propietarioId: propietarioId
    }
  };
};


const espaciosSlice = createSlice({
  name: 'espacios',
  initialState,
  reducers: {
    
    setFiltroTipo: (state, action) => {
      state.filtroTipo = action.payload;
    },

    
    setTextoBusqueda: (state, action) => {
      state.textoBusqueda = action.payload;
      
      state.espaciosFiltrados = (state.espaciosMapeados || []).filter(espacio =>
        espacio.nombre.toLowerCase().includes(action.payload.toLowerCase()) ||
        espacio.direccion.toLowerCase().includes(action.payload.toLowerCase()) ||
        espacio.propietario.toLowerCase().includes(action.payload.toLowerCase())
      );
    },

    
    limpiarEspacios: (state) => {
      state.oficinas = [];
      state.espacios = [];
      state.escritorios = [];
      state.edificios = [];
      state.salas = [];
      state.espaciosMapeados = [];
      state.espaciosFiltrados = [];
    },

    
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    },

    
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      
      .addCase(obtenerOficinas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerOficinas.fulfilled, (state, action) => {
        state.loading = false;
        state.oficinas = Array.isArray(action.payload?.data) ? action.payload.data : [];
      })
      .addCase(obtenerOficinas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.oficinas = [];
      })

      
      .addCase(obtenerEspacios.fulfilled, (state, action) => {
        state.espacios = Array.isArray(action.payload?.data) ? action.payload.data : [];
      })
      .addCase(obtenerEspacios.rejected, (state) => {
        state.espacios = [];
      })

      
      .addCase(obtenerEscritorios.fulfilled, (state, action) => {
        state.escritorios = Array.isArray(action.payload?.data) ? action.payload.data : [];
      })
      .addCase(obtenerEscritorios.rejected, (state) => {
        state.escritorios = [];
      })

      
      .addCase(obtenerEdificios.fulfilled, (state, action) => {
        state.edificios = Array.isArray(action.payload?.data) ? action.payload.data : [];
      })
      .addCase(obtenerEdificios.rejected, (state) => {
        state.edificios = [];
      })

      
      .addCase(obtenerSalas.fulfilled, (state, action) => {
        state.salas = Array.isArray(action.payload?.data) ? action.payload.data : [];
      })
      .addCase(obtenerSalas.rejected, (state) => {
        state.salas = [];
      })
      .addCase(crearPublicacion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(crearPublicacion.fulfilled, (state, action) => {
        state.loading = false;

        const { data, tipo } = action.payload;

        
        switch (tipo) {
          case 'oficina':
            state.oficinas.unshift(data);
            break;
          case 'sala':
            state.salas.unshift(data);
            break;
          case 'escritorio':
            state.escritorios.unshift(data);
            break;
          case 'espacio':
            state.espacios.unshift(data);
            break;
        }

        
        const nuevoEspacioMapeado = mapearEspacio(data, tipo);
        state.espaciosMapeados.unshift(nuevoEspacioMapeado);

        
        const searchTerm = (state.textoBusqueda || '').toLowerCase();
        if (nuevoEspacioMapeado.nombre.toLowerCase().includes(searchTerm) ||
          nuevoEspacioMapeado.direccion.toLowerCase().includes(searchTerm) ||
          nuevoEspacioMapeado.propietario.toLowerCase().includes(searchTerm)) {
          state.espaciosFiltrados.unshift(nuevoEspacioMapeado);
        }
      })
      .addCase(crearPublicacion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      
      .addCase(cargarTodosLosEspacios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cargarTodosLosEspacios.fulfilled, (state, action) => {
        state.loading = false;

        console.log('🎯 Procesando cargarTodosLosEspacios.fulfilled:', action.payload);

        
        const payload = action.payload || [];
        if (!Array.isArray(payload)) {
          console.error('🔴 Payload no es un array:', payload);
          state.espaciosMapeados = [];
          state.espaciosFiltrados = [];
          return;
        }

        
        const validResults = payload.filter(item => {
          const isValid = item &&
            typeof item === 'object' &&
            Array.isArray(item.data) &&
            typeof item.tipo === 'string';

          if (!isValid) {
            console.warn('🔴 Elemento inválido filtrado:', item);
          }

          return isValid;
        });

        console.log('✅ Elementos válidos después del filtrado:', validResults.length);

        
        const espaciosMapeados = [];
        validResults.forEach(({ data, tipo }) => {
          if (Array.isArray(data) && data.length > 0) {
            try {
              console.log(`📝 Mapeando ${data.length} elementos de tipo ${tipo}`);
              const espaciosDelTipo = data.map(espacio => {
                try {
                  return mapearEspacio(espacio, tipo);
                } catch (mapError) {
                  console.error(`🔴 Error mapeando espacio individual de ${tipo}:`, mapError, espacio);
                  return null;
                }
              }).filter(Boolean); 

              espaciosMapeados.push(...espaciosDelTipo);
              console.log(`✅ ${espaciosDelTipo.length} espacios de tipo ${tipo} mapeados correctamente`);
            } catch (error) {
              console.error(`🔴 Error mapeando ${tipo}:`, error);
            }
          } else {
            console.log(`ℹ️ No hay datos para el tipo ${tipo} o data está vacío`);
          }
        });

        console.log('🎯 Total de espacios mapeados:', espaciosMapeados.length);

        state.espaciosMapeados = espaciosMapeados;
        state.espaciosFiltrados = espaciosMapeados.filter(espacio => {
          const searchTerm = (state.textoBusqueda || '').toLowerCase();
          return espacio.nombre.toLowerCase().includes(searchTerm) ||
            espacio.direccion.toLowerCase().includes(searchTerm) ||
            espacio.propietario.toLowerCase().includes(searchTerm);
        });

        console.log('🎯 Espacios filtrados final:', state.espaciosFiltrados.length);
      })
      .addCase(cargarTodosLosEspacios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.espaciosMapeados = [];
        state.espaciosFiltrados = [];
      })

      
      .addCase(cargarEspaciosCliente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cargarEspaciosCliente.fulfilled, (state, action) => {
        state.loading = false;

        console.log('🎯 Procesando cargarEspaciosCliente.fulfilled:', action.payload);

        
        const payload = action.payload || [];
        if (!Array.isArray(payload)) {
          console.error('🔴 Payload de cliente no es un array:', payload);
          state.espaciosMapeados = [];
          state.espaciosFiltrados = [];
          return;
        }

        
        const espaciosMapeados = [];
        payload.forEach(({ data, tipo } = {}) => {
          
          if (Array.isArray(data) && data.length > 0) {
            try {
              const espaciosDelTipo = data.map(espacio => {
                try {
                  return mapearEspacio(espacio, tipo);
                } catch (mapError) {
                  console.error(`🔴 Error mapeando espacio individual del cliente de ${tipo}:`, mapError, espacio);
                  return null;
                }
              }).filter(Boolean); 

              espaciosMapeados.push(...espaciosDelTipo);
            } catch (error) {
              console.error(`🔴 Error mapeando ${tipo} del cliente:`, error);
            }
          }
        });

        state.espaciosMapeados = espaciosMapeados;
        state.espaciosFiltrados = espaciosMapeados.filter(espacio => {
          const searchTerm = (state.textoBusqueda || '').toLowerCase();
          return espacio.nombre.toLowerCase().includes(searchTerm) ||
            espacio.direccion.toLowerCase().includes(searchTerm) ||
            espacio.propietario.toLowerCase().includes(searchTerm);
        });
      })
      .addCase(cargarEspaciosCliente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.espaciosMapeados = [];
        state.espaciosFiltrados = [];
      });
  }
});

export const {
  setFiltroTipo,
  setTextoBusqueda,
  limpiarEspacios,
  setRefreshing,
  clearError
} = espaciosSlice.actions;

export default espaciosSlice.reducer;