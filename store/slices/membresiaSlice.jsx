import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Thunk para obtener todas las membresías con paginación
export const obtenerMembresias = createAsyncThunk(
  'membresia/obtenerTodas',
  async ({ skip = 0, limit = 10 } = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias?skip=${skip}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al obtener membresías');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerMembresias:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);

// Thunk para crear una membresía (admin)
export const crearMembresia = createAsyncThunk(
  'membresia/crear',
  async (membresiaData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(membresiaData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al crear membresía');
      }

      return data;
    } catch (error) {
      console.error('Error en crearMembresia:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);

// Thunk para obtener una membresía por ID
export const obtenerMembresiaPorId = createAsyncThunk(
  'membresia/obtenerPorId',
  async (membresiaId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias/${membresiaId}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al obtener membresía');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerMembresiaPorId:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);

// Thunk para actualizar una membresía (admin)
export const actualizarMembresia = createAsyncThunk(
  'membresia/actualizar',
  async ({ membresiaId, datosActualizacion }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias/${membresiaId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosActualizacion),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al actualizar membresía');
      }

      return data;
    } catch (error) {
      console.error('Error en actualizarMembresia:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);

// Thunk para eliminar una membresía (admin)
export const eliminarMembresia = createAsyncThunk(
  'membresia/eliminar',
  async (membresiaId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias/${membresiaId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.message || 'Error al eliminar membresía');
      }

      return membresiaId;
    } catch (error) {
      console.error('Error en eliminarMembresia:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);

// Thunk para obtener membresía por tipo
export const obtenerMembresiaPorTipo = createAsyncThunk(
  'membresia/obtenerPorTipo',
  async (tipo, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias/tipo/${tipo}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al obtener membresía por tipo');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerMembresiaPorTipo:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);

// Thunk para obtener solo las membresías activas
export const obtenerMembresiasActivas = createAsyncThunk(
  'membresia/obtenerActivas',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias/activas`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al obtener membresías activas');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerMembresiasActivas:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);

// Thunk para activar/desactivar una membresía (admin)
export const toggleActivarMembresia = createAsyncThunk(
  'membresia/toggleActivar',
  async ({ membresiaId, activar }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias/${membresiaId}/activar`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ activar }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al cambiar estado de membresía');
      }

      return { membresiaId, activar, ...data };
    } catch (error) {
      console.error('Error en toggleActivarMembresia:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);

// Thunk para suscribir a una membresía - VERSIÓN CORREGIDA
export const suscribirMembresia = createAsyncThunk(
  'membresia/suscribir',
  async (suscripcionData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      console.log('🔵 [Redux] Iniciando suscripción con datos:', suscripcionData);

      // ✅ VALIDACIONES PREVIAS
      if (!auth.token) {
        return rejectWithValue('Token de autenticación no disponible');
      }

      if (!suscripcionData.usuarioId) {
        return rejectWithValue('ID de usuario es requerido');
      }

      if (!suscripcionData.membresiaId) {
        return rejectWithValue('ID de membresía es requerido');
      }

      // ✅ PREPARAR PAYLOAD - usar exactamente la estructura que espera el backend
      const payload = {
        usuarioId: suscripcionData.usuarioId,
        membresiaId: suscripcionData.membresiaId, // ⚠️ NO cambiar el nombre
        fechaInicio: suscripcionData.fechaInicio,
        metodoPagoId: suscripcionData.metodoPagoId || 'default',
        renovacionAutomatica: suscripcionData.renovacionAutomatica !== false, // true por defecto
        codigoPromocional: suscripcionData.codigoPromocional
      };

      console.log('🔵 [Redux] Payload final enviado al backend:', payload);

      // ✅ LLAMADA A LA API
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias/suscribir`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      console.log('🔵 [Redux] Respuesta completa del servidor:', {
        status: response.status,
        ok: response.ok,
        data
      });

      // ✅ MANEJO DE ERRORES HTTP
      if (!response.ok) {
        console.error('🔴 [Redux] Error HTTP del servidor:', {
          status: response.status,
          message: data.message,
          details: data.details,
          field: data.field
        });

        // Retornar error específico del servidor
        return rejectWithValue(
          data.message ||
          data.details ||
          `Error HTTP ${response.status}: ${response.statusText}`
        );
      }

      // ✅ VALIDAR ESTRUCTURA DE RESPUESTA
      if (!data.usuario) {
        console.error('🔴 [Redux] Respuesta sin usuario:', data);
        return rejectWithValue('Respuesta del servidor incompleta: falta información del usuario');
      }

      if (!data.usuario.membresia) {
        console.error('🔴 [Redux] Usuario sin membresía en respuesta:', data.usuario);
        return rejectWithValue('El usuario no tiene membresía asignada en la respuesta del servidor');
      }

      console.log('🟢 [Redux] Suscripción exitosa:', {
        usuarioId: data.usuario._id,
        username: data.usuario.username,
        membresiaAsignada: data.usuario.membresia,
        suscripcionInfo: data.suscripcion
      });

      // ✅ RETORNAR ESTRUCTURA CONSISTENTE
      return {
        success: true,
        usuario: data.usuario,
        suscripcion: data.suscripcion,
        message: data.message
      };

    } catch (error) {
      console.error('🔴 [Redux] Error de conexión en suscripción:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      // Manejo específico de errores de red
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return rejectWithValue('Error de conexión. Verifica tu conexión a internet.');
      }

      if (error.name === 'AbortError') {
        return rejectWithValue('La solicitud fue cancelada. Intenta nuevamente.');
      }

      return rejectWithValue(
        error.message ||
        'Error inesperado al procesar la suscripción'
      );
    }
  }
);


// Thunk para cancelar una membresía
export const cancelarMembresia = createAsyncThunk(
  'membresia/cancelar',
  async (cancelacionData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      console.log('🔵 [cancelarMembresia] Datos recibidos:', cancelacionData);

      const payload = {
        usuarioId: cancelacionData.usuarioId,
        membresiaId: cancelacionData.membresiaId || cancelacionData.tipoMembresiaId,
        motivo: cancelacionData.motivo || 'Cancelación solicitada por el usuario',
        fechaCancelacion: cancelacionData.fechaCancelacion,
        reembolsoParcial: cancelacionData.reembolsoParcial || false
      };

      console.log('🔵 [cancelarMembresia] Payload enviado:', payload);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias/cancelar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      console.log('🔵 [cancelarMembresia] Respuesta del servidor:', data);

      if (!response.ok) {
        console.error('🔴 [cancelarMembresia] Error del servidor:', data);
        return rejectWithValue(data.message || data.details || 'Error al cancelar membresía');
      }

      // Retornar tanto los datos del usuario como la información de la cancelación
      return {
        usuario: data.usuario,
        cancelacion: data.cancelacion,
        message: data.message
      };
    } catch (error) {
      console.error('🔴 [cancelarMembresia] Error de conexión:', error);
      return rejectWithValue('Error de conexión al cancelar membresía');
    }
  }
);

// Thunks para promociones
export const obtenerPromociones = createAsyncThunk(
  'membresia/obtenerPromociones',
  async ({ skip = 0, limit = 10 } = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/promociones?skip=${skip}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al obtener promociones');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerPromociones:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const crearPromocion = createAsyncThunk(
  'membresia/crearPromocion',
  async (promocionData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/promociones`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(promocionData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al crear promoción');
      }

      return data;
    } catch (error) {
      console.error('Error en crearPromocion:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerPromocionPorCodigo = createAsyncThunk(
  'membresia/obtenerPromocionPorCodigo',
  async (codigo, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/promociones/codigo/${codigo}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al obtener promoción');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerPromocionPorCodigo:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerPromocionesActivas = createAsyncThunk(
  'membresia/obtenerPromocionesActivas',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/promociones/activas`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al obtener promociones activas');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerPromocionesActivas:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const validarPromocion = createAsyncThunk(
  'membresia/validarPromocion',
  async (validacionData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/promociones/validar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validacionData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al validar promoción');
      }

      return data;
    } catch (error) {
      console.error('Error en validarPromocion:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const filtrarPromociones = createAsyncThunk(
  'membresia/filtrarPromociones',
  async (filtros, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const queryParams = new URLSearchParams(filtros).toString();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/promociones/filtrar?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al filtrar promociones');
      }

      return data;
    } catch (error) {
      console.error('Error en filtrarPromociones:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);

// Estado inicial
const initialState = {
  // Membresías
  membresias: [],
  membresiaSeleccionada: null,
  membresiasActivas: [],

  // Promociones
  promociones: [],
  promocionSeleccionada: null,
  promocionesActivas: [],
  promocionValidada: null,

  // Suscripción actual del usuario
  suscripcionActual: null,

  // Paginación
  pagination: {
    skip: 0,
    limit: 10,
    total: 0,
  },

  // Estados de carga y errores
  loading: false,
  error: null,
  loadingPromociones: false,
  errorPromociones: null,
  loadingSuscripcion: false,
  errorSuscripcion: null,

  // Estados específicos para diferentes operaciones
  loadingMembresiasActivas: false,
  errorMembresiasActivas: null,
};

// Slice
const membresiaSlice = createSlice({
  name: 'membresia',
  initialState,
  reducers: {
    // Selección de membresía
    seleccionarMembresia: (state, action) => {
      state.membresiaSeleccionada = action.payload;
    },

    limpiarMembresiaSeleccionada: (state) => {
      state.membresiaSeleccionada = null;
    },

    // Selección de promoción
    seleccionarPromocion: (state, action) => {
      state.promocionSeleccionada = action.payload;
    },

    limpiarPromocionSeleccionada: (state) => {
      state.promocionSeleccionada = null;
    },

    limpiarPromocionValidada: (state) => {
      state.promocionValidada = null;
    },

    // Suscripción actual
    actualizarSuscripcionActual: (state, action) => {
      state.suscripcionActual = action.payload;
    },

    limpiarSuscripcionActual: (state) => {
      state.suscripcionActual = null;
    },

    // Paginación
    setPaginacion: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // Estados de carga y errores
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
      state.errorPromociones = null;
      state.errorSuscripcion = null;
      state.errorMembresiasActivas = null;
    },

    setLoadingPromociones: (state, action) => {
      state.loadingPromociones = action.payload;
    },

    setLoadingSuscripcion: (state, action) => {
      state.loadingSuscripcion = action.payload;
    },
  },

  // 🔥 EXTRA REDUCERS COMPLETO - membresiaSlice.js
  extraReducers: (builder) => {
    builder
      // obtenerMembresias
      .addCase(obtenerMembresias.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerMembresias.fulfilled, (state, action) => {
        state.loading = false;
        // Manejar diferentes formatos de respuesta del backend
        let membresias;
        if (Array.isArray(action.payload)) {
          membresias = action.payload;
        } else if (action.payload.membresias && Array.isArray(action.payload.membresias)) {
          membresias = action.payload.membresias;
        } else if (action.payload.data && Array.isArray(action.payload.data)) {
          membresias = action.payload.data;
        } else {
          membresias = [];
        }

        state.membresias = membresias;
        state.pagination.total = action.payload.total || membresias.length;
      })
      .addCase(obtenerMembresias.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // crearMembresia
      .addCase(crearMembresia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(crearMembresia.fulfilled, (state, action) => {
        state.loading = false;
        const nuevaMembresia = action.payload.membresia || action.payload;
        state.membresias.push(nuevaMembresia);
        // Si está activa, también añadirla a membresiasActivas
        if (nuevaMembresia.activo) {
          state.membresiasActivas.push(nuevaMembresia);
        }
      })
      .addCase(crearMembresia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // obtenerMembresiaPorId
      .addCase(obtenerMembresiaPorId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerMembresiaPorId.fulfilled, (state, action) => {
        state.loading = false;
        state.membresiaSeleccionada = action.payload;
      })
      .addCase(obtenerMembresiaPorId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // actualizarMembresia
      .addCase(actualizarMembresia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(actualizarMembresia.fulfilled, (state, action) => {
        state.loading = false;
        const membresiaActualizada = action.payload;
        const index = state.membresias.findIndex(m =>
          (m.id || m._id) === (membresiaActualizada.id || membresiaActualizada._id)
        );
        if (index !== -1) {
          state.membresias[index] = membresiaActualizada;
        }
        if (state.membresiaSeleccionada &&
          (state.membresiaSeleccionada.id || state.membresiaSeleccionada._id) ===
          (membresiaActualizada.id || membresiaActualizada._id)) {
          state.membresiaSeleccionada = membresiaActualizada;
        }
        // Actualizar también en membresiasActivas si corresponde
        const indexActivas = state.membresiasActivas.findIndex(m =>
          (m.id || m._id) === (membresiaActualizada.id || membresiaActualizada._id)
        );
        if (indexActivas !== -1) {
          if (membresiaActualizada.activo) {
            state.membresiasActivas[indexActivas] = membresiaActualizada;
          } else {
            state.membresiasActivas.splice(indexActivas, 1);
          }
        } else if (membresiaActualizada.activo) {
          state.membresiasActivas.push(membresiaActualizada);
        }
      })
      .addCase(actualizarMembresia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // eliminarMembresia
      .addCase(eliminarMembresia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(eliminarMembresia.fulfilled, (state, action) => {
        state.loading = false;
        const membresiaId = action.payload;
        state.membresias = state.membresias.filter(m =>
          (m.id || m._id) !== membresiaId
        );
        state.membresiasActivas = state.membresiasActivas.filter(m =>
          (m.id || m._id) !== membresiaId
        );
        if (state.membresiaSeleccionada &&
          (state.membresiaSeleccionada.id || state.membresiaSeleccionada._id) === membresiaId) {
          state.membresiaSeleccionada = null;
        }
      })
      .addCase(eliminarMembresia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // obtenerMembresiasActivas
      .addCase(obtenerMembresiasActivas.pending, (state) => {
        state.loadingMembresiasActivas = true;
        state.errorMembresiasActivas = null;
      })
      .addCase(obtenerMembresiasActivas.fulfilled, (state, action) => {
        state.loadingMembresiasActivas = false;
        // Manejar diferentes formatos de respuesta del backend
        let membresias;
        if (Array.isArray(action.payload)) {
          membresias = action.payload;
        } else if (action.payload.membresias && Array.isArray(action.payload.membresias)) {
          membresias = action.payload.membresias;
        } else if (action.payload.data && Array.isArray(action.payload.data)) {
          membresias = action.payload.data;
        } else {
          membresias = [];
        }

        state.membresiasActivas = membresias;
      })
      .addCase(obtenerMembresiasActivas.rejected, (state, action) => {
        state.loadingMembresiasActivas = false;
        state.errorMembresiasActivas = action.payload;
      })

      // toggleActivarMembresia
      .addCase(toggleActivarMembresia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleActivarMembresia.fulfilled, (state, action) => {
        state.loading = false;
        const { membresiaId, activar } = action.payload;
        const index = state.membresias.findIndex(m => (m.id || m._id) === membresiaId);
        if (index !== -1) {
          state.membresias[index].activo = activar;
        }
        // Actualizar membresiasActivas
        if (activar) {
          const membresia = state.membresias.find(m => (m.id || m._id) === membresiaId);
          if (membresia && !state.membresiasActivas.find(m => (m.id || m._id) === membresiaId)) {
            state.membresiasActivas.push(membresia);
          }
        } else {
          state.membresiasActivas = state.membresiasActivas.filter(m =>
            (m.id || m._id) !== membresiaId
          );
        }
      })
      .addCase(toggleActivarMembresia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ SUSCRIBIR MEMBRESIA - VERSIÓN CORREGIDA Y COMPLETA
      .addCase(suscribirMembresia.pending, (state) => {
        console.log('🔵 [Redux] Iniciando proceso de suscripción...');
        state.loadingSuscripcion = true;
        state.errorSuscripcion = null;
      })
      .addCase(suscribirMembresia.fulfilled, (state, action) => {
        console.log('🟢 [Redux] Suscripción completada exitosamente:', action.payload);

        state.loadingSuscripcion = false;
        state.errorSuscripcion = null;

        // ✅ Guardar la información de suscripción
        if (action.payload.suscripcion) {
          state.suscripcionActual = action.payload.suscripcion;
          console.log('🟢 [Redux] Suscripción actual actualizada:', state.suscripcionActual);
        }

        // ✅ Validar que la respuesta sea exitosa
        if (action.payload.success !== false) {
          console.log('🟢 [Redux] Suscripción marcada como exitosa');
        }

        // Nota: El usuario se actualiza en el auth slice mediante dispatch(loguear(...))
      })
      .addCase(suscribirMembresia.rejected, (state, action) => {
        console.error('🔴 [Redux] Error en suscripción:', action.payload);

        state.loadingSuscripcion = false;
        state.errorSuscripcion = action.payload;

        // ✅ Limpiar suscripción actual en caso de error
        state.suscripcionActual = null;
      })

      // ✅ CANCELAR MEMBRESIA - VERSIÓN CORREGIDA Y COMPLETA
      .addCase(cancelarMembresia.pending, (state) => {
        console.log('🔵 [Redux] Iniciando proceso de cancelación...');
        state.loadingSuscripcion = true;
        state.errorSuscripcion = null;
      })
      .addCase(cancelarMembresia.fulfilled, (state, action) => {
        console.log('🟢 [Redux] Cancelación completada exitosamente:', action.payload);

        state.loadingSuscripcion = false;
        state.errorSuscripcion = null;

        // ✅ Actualizar el estado con la información de cancelación
        if (action.payload.cancelacion) {
          // La suscripción sigue existiendo pero con renovación automática en false
          state.suscripcionActual = {
            ...state.suscripcionActual,
            renovacionAutomatica: false,
            fechaCancelacion: action.payload.cancelacion.fechaCancelacion,
            motivo: action.payload.cancelacion.motivo,
            mantenerHasta: action.payload.cancelacion.mantenerHasta
          };
          console.log('🟢 [Redux] Cancelación guardada en estado:', action.payload.cancelacion);
        }

        // Nota: El usuario se actualiza en el auth slice mediante dispatch(loguear(...))
      })
      .addCase(cancelarMembresia.rejected, (state, action) => {
        console.error('🔴 [Redux] Error en cancelación:', action.payload);

        state.loadingSuscripcion = false;
        state.errorSuscripcion = action.payload;
      })

      // obtenerMembresiaPorTipo
      .addCase(obtenerMembresiaPorTipo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerMembresiaPorTipo.fulfilled, (state, action) => {
        state.loading = false;
        state.membresiaSeleccionada = action.payload;
      })
      .addCase(obtenerMembresiaPorTipo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ PROMOCIONES - obtenerPromociones
      .addCase(obtenerPromociones.pending, (state) => {
        state.loadingPromociones = true;
        state.errorPromociones = null;
      })
      .addCase(obtenerPromociones.fulfilled, (state, action) => {
        state.loadingPromociones = false;
        state.promociones = action.payload.promociones || action.payload;
      })
      .addCase(obtenerPromociones.rejected, (state, action) => {
        state.loadingPromociones = false;
        state.errorPromociones = action.payload;
      })

      // crearPromocion
      .addCase(crearPromocion.pending, (state) => {
        state.loadingPromociones = true;
        state.errorPromociones = null;
      })
      .addCase(crearPromocion.fulfilled, (state, action) => {
        state.loadingPromociones = false;
        const nuevaPromocion = action.payload.promocion || action.payload;
        state.promociones.push(nuevaPromocion);
        // Si está activa, también añadirla a promocionesActivas
        if (nuevaPromocion.activa) {
          state.promocionesActivas.push(nuevaPromocion);
        }
      })
      .addCase(crearPromocion.rejected, (state, action) => {
        state.loadingPromociones = false;
        state.errorPromociones = action.payload;
      })

      // obtenerPromocionesActivas
      .addCase(obtenerPromocionesActivas.pending, (state) => {
        state.loadingPromociones = true;
        state.errorPromociones = null;
      })
      .addCase(obtenerPromocionesActivas.fulfilled, (state, action) => {
        state.loadingPromociones = false;
        state.promocionesActivas = Array.isArray(action.payload) ? action.payload :
          (action.payload.promociones || []);
      })
      .addCase(obtenerPromocionesActivas.rejected, (state, action) => {
        state.loadingPromociones = false;
        state.errorPromociones = action.payload;
      })

      // obtenerPromocionPorCodigo
      .addCase(obtenerPromocionPorCodigo.pending, (state) => {
        state.loadingPromociones = true;
        state.errorPromociones = null;
      })
      .addCase(obtenerPromocionPorCodigo.fulfilled, (state, action) => {
        state.loadingPromociones = false;
        state.promocionSeleccionada = action.payload;
      })
      .addCase(obtenerPromocionPorCodigo.rejected, (state, action) => {
        state.loadingPromociones = false;
        state.errorPromociones = action.payload;
      })

      // validarPromocion
      .addCase(validarPromocion.pending, (state) => {
        state.loadingPromociones = true;
        state.errorPromociones = null;
      })
      .addCase(validarPromocion.fulfilled, (state, action) => {
        state.loadingPromociones = false;
        state.promocionValidada = action.payload;
      })
      .addCase(validarPromocion.rejected, (state, action) => {
        state.loadingPromociones = false;
        state.errorPromociones = action.payload;
      })

      // filtrarPromociones
      .addCase(filtrarPromociones.pending, (state) => {
        state.loadingPromociones = true;
        state.errorPromociones = null;
      })
      .addCase(filtrarPromociones.fulfilled, (state, action) => {
        state.loadingPromociones = false;
        state.promociones = Array.isArray(action.payload) ? action.payload :
          (action.payload.promociones || []);
      })
      .addCase(filtrarPromociones.rejected, (state, action) => {
        state.loadingPromociones = false;
        state.errorPromociones = action.payload;
      });
  }
});

// Exportar las acciones
export const {
  seleccionarMembresia,
  limpiarMembresiaSeleccionada,
  seleccionarPromocion,
  limpiarPromocionSeleccionada,
  limpiarPromocionValidada,
  actualizarSuscripcionActual,
  limpiarSuscripcionActual,
  setPaginacion,
  setLoading,
  setError,
  clearError,
  setLoadingPromociones,
  setLoadingSuscripcion
} = membresiaSlice.actions;

// Exportar el reducer
export default membresiaSlice.reducer;