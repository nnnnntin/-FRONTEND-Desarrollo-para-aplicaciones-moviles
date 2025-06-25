import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';




export const obtenerOficinas = createAsyncThunk(
  'espacios/obtenerOficinas',
  async ({ skip = 0, limit = 100 } = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
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
        return rejectWithValue(data.message || 'Error al obtener oficinas');
      }

      return { data: Array.isArray(data) ? data : data.datos || [], tipo: 'oficina' };
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);


export const obtenerEspacios = createAsyncThunk(
  'espacios/obtenerEspacios',
  async ({ skip = 0, limit = 100 } = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
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
        return rejectWithValue(data.message || 'Error al obtener espacios');
      }

      return { data: Array.isArray(data) ? data : data.datos || [], tipo: 'espacio' };
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);


export const obtenerEscritorios = createAsyncThunk(
  'espacios/obtenerEscritorios',
  async ({ skip = 0, limit = 100 } = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
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
        return rejectWithValue(data.message || 'Error al obtener escritorios');
      }

      return { data: Array.isArray(data) ? data : data.datos || [], tipo: 'escritorio' };
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);


export const obtenerEdificios = createAsyncThunk(
  'espacios/obtenerEdificios',
  async ({ skip = 0, limit = 100 } = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
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
        return rejectWithValue(data.message || 'Error al obtener edificios');
      }

      return { data: Array.isArray(data) ? data : data.datos || [], tipo: 'edificio' };
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);


export const obtenerSalas = createAsyncThunk(
  'espacios/obtenerSalas',
  async ({ skip = 0, limit = 100 } = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
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
        return rejectWithValue(data.message || 'Error al obtener salas');
      }

      return { data: Array.isArray(data) ? data : data.datos || [], tipo: 'sala' };
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);


export const cargarTodosLosEspacios = createAsyncThunk(
  'espacios/cargarTodos',
  async ({ filtroTipo = 'todos', limit = 100 } = {}, { dispatch, rejectWithValue }) => {
    try {
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
      const successfulResults = results
        .filter(result => result.status === 'fulfilled' && result.value?.payload)
        .map(result => result.value.payload);

      return successfulResults;
    } catch (error) {
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
        
        
        const espaciosCliente = [];
        
        todosLosEspacios.forEach(({ data, tipo }) => {
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
            } else if (espacio.propietarioId) {
              console.log(`❌ ${tipo} NO coincide: ${espacio.nombre || espacio.titulo}`);
              console.log(`   PropietarioId: ${propietarioIdStr}`);
              console.log(`   UserId: ${userIdStr}`);
            } else {
              console.log(`⚠️ ${tipo} sin propietario: ${espacio.nombre || espacio.titulo}`);
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
    const { calle, ciudad, departamento, pais } = espacio.ubicacion;
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

  return {
    id: espacio._id,
    nombre: espacio.nombre || espacio.titulo || 'Sin nombre',
    tipo: tipo,
    servicios: servicios,
    color: getColorForType(tipo),
    propietario: espacio.propietarioNombre || 'Propietario',
    precio: espacio.precio?.precioPorHora || espacio.precio?.precioPorDia || espacio.precio || '0',
    capacidad: espacio.capacidad || espacio.capacidadMaxima || 1,
    direccion: direccion || 'Ubicación no especificada',
    disponible: espacio.disponible !== false,
    descripcion: espacio.descripcion || '',
    fotos: espacio.fotos || [],
    datosCompletos: espacio
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
      
      state.espaciosFiltrados = state.espaciosMapeados.filter(espacio =>
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
        state.oficinas = action.payload.data;
      })
      .addCase(obtenerOficinas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      
      .addCase(obtenerEspacios.fulfilled, (state, action) => {
        state.espacios = action.payload.data;
      })
      
      
      .addCase(obtenerEscritorios.fulfilled, (state, action) => {
        state.escritorios = action.payload.data;
      })
      
      
      .addCase(obtenerEdificios.fulfilled, (state, action) => {
        state.edificios = action.payload.data;
      })
      
      
      .addCase(obtenerSalas.fulfilled, (state, action) => {
        state.salas = action.payload.data;
      })
      
      
      .addCase(cargarTodosLosEspacios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cargarTodosLosEspacios.fulfilled, (state, action) => {
        state.loading = false;
        
        
        const espaciosMapeados = [];
        action.payload.forEach(({ data, tipo }) => {
          const espaciosDelTipo = data.map(espacio => mapearEspacio(espacio, tipo));
          espaciosMapeados.push(...espaciosDelTipo);
        });
        
        state.espaciosMapeados = espaciosMapeados;
        state.espaciosFiltrados = espaciosMapeados.filter(espacio =>
          espacio.nombre.toLowerCase().includes(state.textoBusqueda.toLowerCase()) ||
          espacio.direccion.toLowerCase().includes(state.textoBusqueda.toLowerCase()) ||
          espacio.propietario.toLowerCase().includes(state.textoBusqueda.toLowerCase())
        );
      })
      .addCase(cargarTodosLosEspacios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      
      .addCase(cargarEspaciosCliente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cargarEspaciosCliente.fulfilled, (state, action) => {
        state.loading = false;
        
        
        const espaciosMapeados = [];
        action.payload.forEach(({ data, tipo }) => {
          const espaciosDelTipo = data.map(espacio => mapearEspacio(espacio, tipo));
          espaciosMapeados.push(...espaciosDelTipo);
        });
        
        state.espaciosMapeados = espaciosMapeados;
        state.espaciosFiltrados = espaciosMapeados.filter(espacio =>
          espacio.nombre.toLowerCase().includes(state.textoBusqueda.toLowerCase()) ||
          espacio.direccion.toLowerCase().includes(state.textoBusqueda.toLowerCase()) ||
          espacio.propietario.toLowerCase().includes(state.textoBusqueda.toLowerCase())
        );
      })
      .addCase(cargarEspaciosCliente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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