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
        return rejectWithValue(data.message || `Error HTTP ${response.status}: Error al obtener oficinas`);
      }

      const oficinasArray = Array.isArray(data) ? data : (data.datos || data.data || []);

      return { data: oficinasArray, tipo: 'oficina' };
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión al obtener oficinas');
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
        return rejectWithValue(data.message || `Error HTTP ${response.status}: Error al obtener espacios`);
      }

      const espaciosArray = Array.isArray(data) ? data : (data.datos || data.data || []);

      return { data: espaciosArray, tipo: 'espacio' };
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión al obtener espacios');
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
        return rejectWithValue(data.message || `Error HTTP ${response.status}: Error al obtener escritorios`);
      }

      const escritoriosArray = Array.isArray(data) ? data : (data.datos || data.data || []);

      return { data: escritoriosArray, tipo: 'escritorio' };
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión al obtener escritorios');
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
        return rejectWithValue(data.message || `Error HTTP ${response.status}: Error al obtener edificios`);
      }

      const edificiosArray = Array.isArray(data) ? data : (data.datos || data.data || []);

      return { data: edificiosArray, tipo: 'edificio' };
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión al obtener edificios');
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
        return rejectWithValue(data.message || `Error HTTP ${response.status}: Error al obtener salas`);
      }

      const salasArray = Array.isArray(data) ? data : (data.datos || data.data || []);

      return { data: salasArray, tipo: 'sala' };
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión al obtener salas');
    }
  }
);

export const obtenerDetalleEspacio = createAsyncThunk(
  'espacios/obtenerDetalleEspacio',
  async ({ id, tipo }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();


      const endpoints = {
        oficina: '/v1/oficinas',
        espacio: '/v1/espacios',
        escritorio: '/v1/escritorios-flexibles',
        edificio: '/v1/edificios',
        sala: '/v1/salas-reunion'
      };

      const endpoint = endpoints[tipo];
      if (!endpoint) {
        return rejectWithValue(`Tipo de espacio no válido: ${tipo}`);
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}${endpoint}/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || `Error HTTP ${response.status}: Error al obtener detalle del espacio`);
      }

      return { data, tipo, id };
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión al obtener el detalle del espacio');
    }
  }
);

export const actualizarEspacio = createAsyncThunk(
  'espacios/actualizarEspacio',
  async ({ id, tipo, datosActualizados }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const endpoints = {
        oficina: '/v1/oficinas',
        espacio: '/v1/espacios',
        escritorio: '/v1/escritorios-flexibles',
        edificio: '/v1/edificios',
        sala: '/v1/salas-reunion'
      };

      const endpoint = endpoints[tipo];
      if (!endpoint) {
        return rejectWithValue(`Tipo de espacio no válido: ${tipo}`);
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}${endpoint}/${id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosActualizados)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || `Error HTTP ${response.status}: Error al actualizar el espacio`);
      }

      return { data, tipo, id };
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión al actualizar el espacio');
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
      const successfulResults = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const action = result.value;
          if (action.meta && action.meta.requestStatus === 'fulfilled' && action.payload) {
            if (action.payload.data && action.payload.tipo) {
              successfulResults.push(action.payload);
            } else {
            }
          } else if (action.meta && action.meta.requestStatus === 'rejected') {
          }
        } else {
        }
      });

      return successfulResults;
    } catch (error) {
      console.error(error);
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

      const result = await dispatch(cargarTodosLosEspacios());

      if (cargarTodosLosEspacios.fulfilled.match(result)) {
        const todosLosEspacios = result.payload;

        if (!Array.isArray(todosLosEspacios)) {
          return [];
        }

        const espaciosCliente = [];

        todosLosEspacios.forEach(({ data, tipo } = {}) => {
          if (!Array.isArray(data)) {
            return;
          }

          const espaciosFiltrados = data.filter(espacio => {
            let propietarioIdStr = null;

            if (espacio.usuarioId) {
              if (typeof espacio.usuarioId === 'object' && espacio.usuarioId !== null) {
                propietarioIdStr = espacio.usuarioId._id ||
                  espacio.usuarioId.$oid ||
                  espacio.usuarioId.toString();
              } else {
                propietarioIdStr = espacio.usuarioId.toString();
              }
            }
            else if (espacio.propietarioId) {
              if (typeof espacio.propietarioId === 'object' && espacio.propietarioId !== null) {
                propietarioIdStr = espacio.propietarioId._id ||
                  espacio.propietarioId.$oid ||
                  espacio.propietarioId.toString();
              } else {
                propietarioIdStr = espacio.propietarioId.toString();
              }
            }

            const userIdStr = userId?.toString();
            const esPropio = propietarioIdStr && userIdStr && propietarioIdStr === userIdStr;

            return esPropio;
          });

          if (espaciosFiltrados.length > 0) {
            espaciosCliente.push({ data: espaciosFiltrados, tipo });
          }
        });
        return espaciosCliente;
      } else {
        throw new Error('Error al cargar espacios');
      }
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error al cargar espacios del cliente');
    }
  }
);

export const crearPublicacion = createAsyncThunk(
  'espacios/crearPublicacion',
  async ({ payload, endpoint, tipo }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
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
        return rejectWithValue(data.message || `Error HTTP ${response.status}: Error al crear ${tipo}`);
      }
      return { data, tipo, endpoint };
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión al crear la publicación');
    }
  }
);

const mapearEspacio = (espacio, tipo) => {
  const servicios = [];
  if (espacio.amenidades) {
    if (Array.isArray(espacio.amenidades)) {
      espacio.amenidades.forEach(amenidad => {
        if (typeof amenidad === 'string') {
          servicios.push(amenidad);
        } else if (typeof amenidad === 'object' && amenidad !== null) {
          Object.keys(amenidad).forEach(key => {
            if (amenidad[key] && typeof amenidad[key] === 'string') {
              servicios.push(key);
            }
          });
        }
      });
    } else if (typeof espacio.amenidades === 'object') {
      if (espacio.amenidades.wifi) servicios.push('wifi');
      if (espacio.amenidades.cafe) servicios.push('cafe');
      if (espacio.amenidades.seguridad) servicios.push('seguridad');
      if (espacio.amenidades.parking) servicios.push('parking');
      if (espacio.amenidades.impresora) servicios.push('impresora');
      if (espacio.amenidades.proyector) servicios.push('proyector');
      if (espacio.amenidades.pizarra) servicios.push('pizarra');
    }
  }
  if (tipo === 'sala' && Array.isArray(espacio.equipamiento)) {
    espacio.equipamiento.forEach(item => {
      if (item.tipo) servicios.push(item.tipo);
    });
  }

  const getColorForType = t => {
    switch (t) {
      case 'oficina': return '#4a90e2';
      case 'espacio': return '#9b59b6';
      case 'escritorio': return '#e67e22';
      case 'edificio': return '#27ae60';
      case 'sala': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  let nombre = '';
  if (espacio.nombre && espacio.nombre.trim()) {
    nombre = espacio.nombre.trim();
  } else if (espacio.titulo && espacio.titulo.trim()) {
    nombre = espacio.titulo.trim();
  } else {
    switch (tipo) {
      case 'oficina':
        nombre = espacio.codigo || `Oficina ${espacio.ubicacion?.numero || 'S/N'}`;
        break;
      case 'escritorio':
        nombre = espacio.codigo || `Escritorio ${espacio.ubicacion?.numero || 'S/N'}`;
        break;
      case 'sala':
        nombre = espacio.codigo || `Sala ${espacio.ubicacion?.numero || 'S/N'}`;
        break;
      case 'espacio':
        nombre = `Espacio ${espacio.ubicacion?.sector || espacio.ubicacion?.numero || 'S/N'}`;
        break;
      case 'edificio':
        nombre = `Edificio ${espacio.direccionCompleta?.calle || 'S/N'}`;
        break;
      default:
        nombre = `${tipo} sin nombre`;
    }
  }

  let direccion = '';
  if (espacio.direccionCompleta) {
    const { calle, numero: num, ciudad, departamento, pais, codigoPostal } = espacio.direccionCompleta;
    direccion = [
      calle + (num ? ' ' + num : ''),
      ciudad,
      departamento,
      pais,
      codigoPostal
    ].filter(Boolean).join(', ');
  } else if (espacio.ubicacion) {
    const { piso, numero, zona, sector } = espacio.ubicacion;
    const ubicacionParts = [];

    if (piso) ubicacionParts.push(`Piso ${piso}`);
    if (numero) ubicacionParts.push(`Número ${numero}`);
    if (zona) ubicacionParts.push(`Zona ${zona}`);
    if (sector) ubicacionParts.push(`Sector ${sector}`);

    direccion = ubicacionParts.length > 0 ? ubicacionParts.join(', ') : 'Ubicación no especificada';
  } else {
    direccion = 'Ubicación no especificada';
  }

  let propietarioId = null;
  let propietarioNombre = 'Propietario';
  if (espacio.usuarioId) {
    if (typeof espacio.usuarioId === 'object') {
      propietarioId = espacio.usuarioId._id || espacio.usuarioId.$oid;
      propietarioNombre = espacio.usuarioId.nombre || propietarioNombre;
    } else {
      propietarioId = espacio.usuarioId;
    }
  } else if (espacio.propietarioId) {
    if (typeof espacio.propietarioId === 'object') {
      propietarioId = espacio.propietarioId._id || espacio.propietarioId.$oid;
      propietarioNombre = espacio.propietarioId.nombre || propietarioNombre;
    } else {
      propietarioId = espacio.propietarioId;
    }
  }

  let precio = '0';
  if (espacio.precios) {
    precio = espacio.precios.porHora ||
      espacio.precios.porDia ||
      espacio.precios.porMes ||
      '0';
  } else if (espacio.precio) {
    precio = espacio.precio;
  }

  return {
    id: espacio._id,
    nombre,
    tipo,
    servicios,
    color: getColorForType(tipo),
    precio,
    capacidad: espacio.capacidad || espacio.capacidadMaxima || 1,
    direccion,
    disponible: espacio.estado === 'disponible' && espacio.activo !== false,
    descripcion: espacio.descripcion || '',
    fotos: espacio.imagenes || espacio.fotosPrincipales || espacio.fotos || [],
    propietario: propietarioNombre,
    datosCompletos: {
      ...espacio,
      propietarioId
    }
  };
};

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
  detalleActual: null,
  loadingDetalle: false,
  errorDetalle: null,
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

    limpiarDetalle: (state) => {
      state.detalleActual = null;
      state.errorDetalle = null;
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

      .addCase(obtenerDetalleEspacio.pending, (state) => {
        state.loadingDetalle = true;
        state.errorDetalle = null;
      })
      .addCase(obtenerDetalleEspacio.fulfilled, (state, action) => {
        state.loadingDetalle = false;
        state.detalleActual = action.payload.data;
      })
      .addCase(obtenerDetalleEspacio.rejected, (state, action) => {
        state.loadingDetalle = false;
        state.errorDetalle = action.payload;
        state.detalleActual = null;
      })

      .addCase(actualizarEspacio.pending, (state) => {
        state.loadingDetalle = true;
        state.errorDetalle = null;
      })
      .addCase(actualizarEspacio.fulfilled, (state, action) => {
        state.loadingDetalle = false;
        state.detalleActual = action.payload.data;

        const { data, tipo } = action.payload;

        switch (tipo) {
          case 'oficina':
            const oficinaIndex = state.oficinas.findIndex(o => o._id === data._id);
            if (oficinaIndex !== -1) {
              state.oficinas[oficinaIndex] = data;
            }
            break;
          case 'espacio':
            const espacioIndex = state.espacios.findIndex(e => e._id === data._id);
            if (espacioIndex !== -1) {
              state.espacios[espacioIndex] = data;
            }
            break;
          case 'escritorio':
            const escritorioIndex = state.escritorios.findIndex(e => e._id === data._id);
            if (escritorioIndex !== -1) {
              state.escritorios[escritorioIndex] = data;
            }
            break;
          case 'edificio':
            const edificioIndex = state.edificios.findIndex(e => e._id === data._id);
            if (edificioIndex !== -1) {
              state.edificios[edificioIndex] = data;
            }
            break;
          case 'sala':
            const salaIndex = state.salas.findIndex(s => s._id === data._id);
            if (salaIndex !== -1) {
              state.salas[salaIndex] = data;
            }
            break;
        }

        const espacioMapeadoIndex = state.espaciosMapeados.findIndex(e => e.id === data._id);
        if (espacioMapeadoIndex !== -1) {
          const espacioActualizado = mapearEspacio(data, tipo);
          state.espaciosMapeados[espacioMapeadoIndex] = espacioActualizado;

          const espacioFiltradoIndex = state.espaciosFiltrados.findIndex(e => e.id === data._id);
          if (espacioFiltradoIndex !== -1) {
            state.espaciosFiltrados[espacioFiltradoIndex] = espacioActualizado;
          }
        }
      })
      .addCase(actualizarEspacio.rejected, (state, action) => {
        state.loadingDetalle = false;
        state.errorDetalle = action.payload;
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


        const payload = action.payload || [];
        if (!Array.isArray(payload)) {
          state.espaciosMapeados = [];
          state.espaciosFiltrados = [];
          return;
        }

        const validResults = payload.filter(item => {
          const isValid = item &&
            typeof item === 'object' &&
            Array.isArray(item.data) &&
            typeof item.tipo === 'string';

          return isValid;
        });

        const espaciosMapeados = [];
        validResults.forEach(({ data, tipo }) => {
          if (Array.isArray(data) && data.length > 0) {
            try {
              const espaciosDelTipo = data.map(espacio => {
                try {
                  return mapearEspacio(espacio, tipo);
                } catch (error) {
                  console.error(error);
                }
              }).filter(Boolean);

              espaciosMapeados.push(...espaciosDelTipo);
            } catch (error) {
              console.error(error);
            }
          } else {
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

        const payload = action.payload || [];
        if (!Array.isArray(payload)) {
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
                } catch (error) {
                  console.error(error);
                }
              }).filter(Boolean);

              espaciosMapeados.push(...espaciosDelTipo);
            } catch (error) {
              console.error(error);
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
  clearError,
  limpiarDetalle
} = espaciosSlice.actions;

export default espaciosSlice.reducer;