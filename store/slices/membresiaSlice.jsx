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
      return rejectWithValue('Error de conexión');
    }
  }
);


export const obtenerMembresiasActivas = createAsyncThunk(
  'membresia/obtenerActivas',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      console.log('🔵 Realizando petición a membresías activas...');
      
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias/activas`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('🔵 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();
      console.log('🔵 Datos recibidos:', data);
      
      if (!response.ok) {
        console.error('🔴 Error en respuesta del servidor:', data);
        return rejectWithValue(data.message || 'Error al obtener membresías activas');
      }

      return data;
    } catch (error) {
      console.error('🔴 Error de conexión en membresías activas:', error);
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
      return rejectWithValue('Error de conexión');
    }
  }
);


export const suscribirMembresia = createAsyncThunk(
  'membresia/suscribir',
  async (suscripcionData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias/suscribir`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(suscripcionData),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al suscribir a membresía');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);


export const cancelarMembresia = createAsyncThunk(
  'membresia/cancelar',
  async (cancelacionData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias/cancelar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cancelacionData),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al cancelar membresía');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
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
        
        console.log('🔵 Respuesta de membresías:', action.payload);
        
        
        let membresias;
        if (Array.isArray(action.payload)) {
          membresias = action.payload;
        } else if (action.payload.membresias && Array.isArray(action.payload.membresias)) {
          membresias = action.payload.membresias;
        } else if (action.payload.data && Array.isArray(action.payload.data)) {
          membresias = action.payload.data;
        } else {
          console.warn('🟡 Formato de respuesta inesperado para membresías:', action.payload);
          membresias = [];
        }
        
        state.membresias = membresias;
        state.pagination.total = action.payload.total || membresias.length;
        console.log('🔵 Membresías guardadas en state:', membresias.length);
      })
      .addCase(obtenerMembresias.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      
      .addCase(crearMembresia.fulfilled, (state, action) => {
        state.membresias.push(action.payload);
      })
      
      
      .addCase(obtenerMembresiaPorId.fulfilled, (state, action) => {
        state.membresiaSeleccionada = action.payload;
      })
      
      
      .addCase(actualizarMembresia.fulfilled, (state, action) => {
        const index = state.membresias.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.membresias[index] = action.payload;
        }
        if (state.membresiaSeleccionada?.id === action.payload.id) {
          state.membresiaSeleccionada = action.payload;
        }
      })
      
      
      .addCase(eliminarMembresia.fulfilled, (state, action) => {
        state.membresias = state.membresias.filter(m => m.id !== action.payload);
        if (state.membresiaSeleccionada?.id === action.payload) {
          state.membresiaSeleccionada = null;
        }
      })
      
      
      .addCase(obtenerMembresiasActivas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerMembresiasActivas.fulfilled, (state, action) => {
        state.loading = false;
        
        console.log('🔵 Respuesta de membresías activas:', action.payload);
        
        
        let membresias;
        if (Array.isArray(action.payload)) {
          membresias = action.payload;
        } else if (action.payload.membresias && Array.isArray(action.payload.membresias)) {
          membresias = action.payload.membresias;
        } else if (action.payload.data && Array.isArray(action.payload.data)) {
          membresias = action.payload.data;
        } else {
          console.warn('🟡 Formato de respuesta inesperado para membresías activas:', action.payload);
          membresias = [];
        }
        
        state.membresiasActivas = membresias;
        console.log('🔵 Membresías activas guardadas en state:', membresias.length);
      })
      .addCase(obtenerMembresiasActivas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('🔴 Error al obtener membresías activas:', action.payload);
      })
      
      
      .addCase(toggleActivarMembresia.fulfilled, (state, action) => {
        const { membresiaId, activar } = action.payload;
        const index = state.membresias.findIndex(m => m.id === membresiaId);
        if (index !== -1) {
          state.membresias[index].activa = activar;
        }
      })
      
      
      .addCase(suscribirMembresia.pending, (state) => {
        state.loadingSuscripcion = true;
        state.errorSuscripcion = null;
      })
      .addCase(suscribirMembresia.fulfilled, (state, action) => {
        state.loadingSuscripcion = false;
        state.suscripcionActual = action.payload;
      })
      .addCase(suscribirMembresia.rejected, (state, action) => {
        state.loadingSuscripcion = false;
        state.errorSuscripcion = action.payload;
      })
      
      
      .addCase(cancelarMembresia.fulfilled, (state, action) => {
        state.suscripcionActual = action.payload;
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
      
      
      .addCase(crearPromocion.fulfilled, (state, action) => {
        state.promociones.push(action.payload);
      })
      
      
      .addCase(obtenerPromocionesActivas.fulfilled, (state, action) => {
        state.promocionesActivas = action.payload;
      })
      
      
      .addCase(validarPromocion.fulfilled, (state, action) => {
        state.promocionValidada = action.payload;
      })
      
      
      .addCase(filtrarPromociones.fulfilled, (state, action) => {
        state.promociones = action.payload;
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