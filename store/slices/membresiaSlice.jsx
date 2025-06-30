import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

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
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

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
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

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
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

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
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

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
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

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
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

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
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

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
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const suscribirMembresia = createAsyncThunk(
  'membresia/suscribir',
  async (suscripcionData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      if (!auth.token) {
        return rejectWithValue('Token de autenticación no disponible');
      }

      if (!suscripcionData.usuarioId) {
        return rejectWithValue('ID de usuario es requerido');
      }

      if (!suscripcionData.membresiaId) {
        return rejectWithValue('ID de membresía es requerido');
      }

      const payload = {
        usuarioId: suscripcionData.usuarioId,
        membresiaId: suscripcionData.membresiaId, 
        fechaInicio: suscripcionData.fechaInicio,
        metodoPagoId: suscripcionData.metodoPagoId || 'default',
        renovacionAutomatica: suscripcionData.renovacionAutomatica !== false, 
      };

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

      if (!response.ok) {
        return rejectWithValue(
          data.message ||
          data.details ||
          `Error HTTP ${response.status}: ${response.statusText}`
        );
      }

      if (!data.usuario) {
        return rejectWithValue('Respuesta del servidor incompleta: falta información del usuario');
      }

      if (!data.usuario.membresia) {
        return rejectWithValue('El usuario no tiene membresía asignada en la respuesta del servidor');
      }

      return {
        success: true,
        usuario: data.usuario,
        suscripcion: data.suscripcion,
        message: data.message
      };

    } catch (error) {
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

export const cancelarMembresia = createAsyncThunk(
  'membresia/cancelar',
  async (cancelacionData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const payload = {
        usuarioId: cancelacionData.usuarioId,
        membresiaId: cancelacionData.membresiaId || cancelacionData.tipoMembresiaId,
        motivo: cancelacionData.motivo || 'Cancelación solicitada por el usuario',
        fechaCancelacion: cancelacionData.fechaCancelacion,
        reembolsoParcial: cancelacionData.reembolsoParcial || false
      };

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

      if (!response.ok) {
        return rejectWithValue(data.message || data.details || 'Error al cancelar membresía');
      }

      return {
        usuario: data.usuario,
        cancelacion: data.cancelacion,
        message: data.message
      };
    } catch (error) {
      return rejectWithValue('Error de conexión al cancelar membresía');
    }
  }
);

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
      return rejectWithValue('Error de conexión');
    }
  }
);

const initialState = {
  membresias: [],
  membresiaSeleccionada: null,
  membresiasActivas: [],

  promociones: [],
  promocionSeleccionada: null,
  promocionesActivas: [],
  promocionValidada: null,

  suscripcionActual: null,

  pagination: {
    skip: 0,
    limit: 10,
    total: 0,
  },

  loading: false,
  error: null,
  loadingPromociones: false,
  errorPromociones: null,
  loadingSuscripcion: false,
  errorSuscripcion: null,

  loadingMembresiasActivas: false,
  errorMembresiasActivas: null,
};

const membresiaSlice = createSlice({
  name: 'membresia',
  initialState,
  reducers: {
    seleccionarMembresia: (state, action) => {
      state.membresiaSeleccionada = action.payload;
    },

    limpiarMembresiaSeleccionada: (state) => {
      state.membresiaSeleccionada = null;
    },

    seleccionarPromocion: (state, action) => {
      state.promocionSeleccionada = action.payload;
    },

    limpiarPromocionSeleccionada: (state) => {
      state.promocionSeleccionada = null;
    },

    limpiarPromocionValidada: (state) => {
      state.promocionValidada = null;
    },

    actualizarSuscripcionActual: (state, action) => {
      state.suscripcionActual = action.payload;
    },

    limpiarSuscripcionActual: (state) => {
      state.suscripcionActual = null;
    },

    setPaginacion: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

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

  extraReducers: (builder) => {
    builder
      .addCase(obtenerMembresias.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerMembresias.fulfilled, (state, action) => {
        state.loading = false;
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

      .addCase(crearMembresia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(crearMembresia.fulfilled, (state, action) => {
        state.loading = false;
        const nuevaMembresia = action.payload.membresia || action.payload;
        state.membresias.push(nuevaMembresia);
        if (nuevaMembresia.activo) {
          state.membresiasActivas.push(nuevaMembresia);
        }
      })
      .addCase(crearMembresia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

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

      .addCase(obtenerMembresiasActivas.pending, (state) => {
        state.loadingMembresiasActivas = true;
        state.errorMembresiasActivas = null;
      })
      .addCase(obtenerMembresiasActivas.fulfilled, (state, action) => {
        state.loadingMembresiasActivas = false;
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

      .addCase(suscribirMembresia.pending, (state) => {
        state.loadingSuscripcion = true;
        state.errorSuscripcion = null;
      })
      .addCase(suscribirMembresia.fulfilled, (state, action) => {
        state.loadingSuscripcion = false;
        state.errorSuscripcion = null;

        if (action.payload.suscripcion) {
          state.suscripcionActual = action.payload.suscripcion;
        }

      })
      .addCase(suscribirMembresia.rejected, (state, action) => {
        state.loadingSuscripcion = false;
        state.errorSuscripcion = action.payload;

        state.suscripcionActual = null;
      })

      .addCase(cancelarMembresia.pending, (state) => {
        state.loadingSuscripcion = true;
        state.errorSuscripcion = null;
      })
      .addCase(cancelarMembresia.fulfilled, (state, action) => {
        state.loadingSuscripcion = false;
        state.errorSuscripcion = null;

        if (action.payload.cancelacion) {
          state.suscripcionActual = {
            ...state.suscripcionActual,
            renovacionAutomatica: false,
            fechaCancelacion: action.payload.cancelacion.fechaCancelacion,
            motivo: action.payload.cancelacion.motivo,
            mantenerHasta: action.payload.cancelacion.mantenerHasta
          };
        }

      })
      .addCase(cancelarMembresia.rejected, (state, action) => {
        state.loadingSuscripcion = false;
        state.errorSuscripcion = action.payload;
      })

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

      .addCase(crearPromocion.pending, (state) => {
        state.loadingPromociones = true;
        state.errorPromociones = null;
      })
      .addCase(crearPromocion.fulfilled, (state, action) => {
        state.loadingPromociones = false;
        const nuevaPromocion = action.payload.promocion || action.payload;
        state.promociones.push(nuevaPromocion);
        if (nuevaPromocion.activa) {
          state.promocionesActivas.push(nuevaPromocion);
        }
      })
      .addCase(crearPromocion.rejected, (state, action) => {
        state.loadingPromociones = false;
        state.errorPromociones = action.payload;
      })

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

export default membresiaSlice.reducer;