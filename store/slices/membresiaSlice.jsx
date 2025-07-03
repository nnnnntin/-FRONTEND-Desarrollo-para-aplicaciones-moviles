import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const obtenerMembresiasActivas = createAsyncThunk(
  'membresias/obtenerActivas',
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
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerPromocionesActivas = createAsyncThunk(
  'membresias/obtenerPromociones',
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

export const suscribirMembresia = createAsyncThunk(
  'membresias/suscribir',
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
        return rejectWithValue(data.message || 'Error al suscribirse a la membresía');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const cancelarMembresia = createAsyncThunk(
  'membresias/cancelar',
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
        return rejectWithValue(data.message || 'Error al cancelar la membresía');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const actualizarSuscripcionActual = createAsyncThunk(
  'membresias/actualizarSuscripcion',
  async (suscripcionData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias/actualizar-suscripcion`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(suscripcionData),
        }
      );

      const data = await response.json();

      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerSuscripcionActual = createAsyncThunk(
  'membresias/obtenerSuscripcionActual',
  async (usuarioId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias/suscripcion/${usuarioId}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al obtener suscripción actual');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const reactivarMembresia = createAsyncThunk(
  'membresias/reactivar',
  async (reactivacionData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias/reactivar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reactivacionData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al reactivar membresía');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const cambiarPlanMembresia = createAsyncThunk(
  'membresias/cambiarPlan',
  async ({ usuarioId, nuevoPlanId, metodoPagoId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias/cambiar-plan`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            usuarioId,
            nuevoPlanId,
            metodoPagoId,
            fechaCambio: new Date().toISOString()
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al cambiar plan de membresía');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerHistorialMembresias = createAsyncThunk(
  'membresias/obtenerHistorial',
  async (usuarioId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/membresias/historial/${usuarioId}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al obtener historial de membresías');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const aplicarCodigoPromocional = createAsyncThunk(
  'membresias/aplicarCodigo',
  async ({ codigo, membresiaId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/promociones/aplicar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ codigo, membresiaId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al aplicar código promocional');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

const initialState = {
  membresiasActivas: [],
  promocionesActivas: [],
  suscripcionActual: null,
  historialMembresias: [],
  loadingMembresiasActivas: false,
  loadingSuscripcion: false,
  loadingCancelacion: false,
  loadingReactivacion: false,
  loadingCambioPlan: false,
  loadingHistorial: false,
  loadingPromocion: false,
  errorMembresiasActivas: null,
  errorSuscripcion: null,
  errorCancelacion: null,
  errorReactivacion: null,
  errorCambioPlan: null,
  errorHistorial: null,
  errorPromocion: null,
  promocionAplicada: null,
  descuentoActivo: null,
  configuracion: {
    permitirCambiosPlan: true,
    permitirCancelacion: true,
    reembolsosParciales: true,
  }
};

const membresiaSlice = createSlice({
  name: 'membresias',
  initialState,
  reducers: {

    clearError: (state) => {
      state.errorMembresiasActivas = null;
      state.errorSuscripcion = null;
      state.errorCancelacion = null;
      state.errorReactivacion = null;
      state.errorCambioPlan = null;
      state.errorHistorial = null;
      state.errorPromocion = null;
    },
    clearSpecificError: (state, action) => {
      const errorType = action.payload;
      state[errorType] = null;
    },
    setSuscripcionActual: (state, action) => {
      state.suscripcionActual = action.payload;
    },
    clearSuscripcionActual: (state) => {
      state.suscripcionActual = null;
    },
    setPromocionAplicada: (state, action) => {
      state.promocionAplicada = action.payload;
    },
    clearPromocionAplicada: (state) => {
      state.promocionAplicada = null;
    },
    setDescuentoActivo: (state, action) => {
      state.descuentoActivo = action.payload;
    },
    clearDescuentoActivo: (state) => {
      state.descuentoActivo = null;
    },
    updateConfiguracion: (state, action) => {
      state.configuracion = { ...state.configuracion, ...action.payload };
    },
    resetMembresiaState: (state) => {
      return initialState;
    },
    updateMembresiaLocal: (state, action) => {
      const { membresiaId, cambios } = action.payload;
      const index = state.membresiasActivas.findIndex(m =>
        (m._id || m.id) === membresiaId
      );
      if (index !== -1) {
        state.membresiasActivas[index] = {
          ...state.membresiasActivas[index],
          ...cambios
        };
      }
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(obtenerMembresiasActivas.pending, (state) => {
        state.loadingMembresiasActivas = true;
        state.errorMembresiasActivas = null;
      })
      .addCase(obtenerMembresiasActivas.fulfilled, (state, action) => {
        state.loadingMembresiasActivas = false;
        state.membresiasActivas = action.payload.membresias || action.payload;
      })
      .addCase(obtenerMembresiasActivas.rejected, (state, action) => {
        state.loadingMembresiasActivas = false;
        state.errorMembresiasActivas = action.payload;

        if (!state.membresiasActivas.length) {
          state.membresiasActivas = [];
        }
      })
      .addCase(obtenerPromocionesActivas.pending, (state) => {
        state.loadingMembresiasActivas = true;
        state.errorMembresiasActivas = null;
      })
      .addCase(obtenerPromocionesActivas.fulfilled, (state, action) => {
        state.loadingMembresiasActivas = false;
        state.promocionesActivas = action.payload.promociones || action.payload;
      })
      .addCase(obtenerPromocionesActivas.rejected, (state, action) => {
        state.loadingMembresiasActivas = false;
        state.errorMembresiasActivas = action.payload;
      })
      .addCase(suscribirMembresia.pending, (state) => {
        state.loadingSuscripcion = true;
        state.errorSuscripcion = null;
      })
      .addCase(suscribirMembresia.fulfilled, (state, action) => {
        state.loadingSuscripcion = false;
        state.suscripcionActual = action.payload.suscripcion || action.payload;

        state.promocionAplicada = null;
        state.descuentoActivo = null;
      })
      .addCase(suscribirMembresia.rejected, (state, action) => {
        state.loadingSuscripcion = false;
        state.errorSuscripcion = action.payload;
      })
      .addCase(cancelarMembresia.pending, (state) => {
        state.loadingCancelacion = true;
        state.errorCancelacion = null;
      })
      .addCase(cancelarMembresia.fulfilled, (state, action) => {
        state.loadingCancelacion = false;
        if (state.suscripcionActual) {
          state.suscripcionActual = {
            ...state.suscripcionActual,
            renovacionAutomatica: false,
            fechaCancelacion: action.payload.fechaCancelacion || new Date().toISOString(),
            estado: 'cancelada'
          };
        }
      })
      .addCase(cancelarMembresia.rejected, (state, action) => {
        state.loadingCancelacion = false;
        state.errorCancelacion = action.payload;
      })
      .addCase(actualizarSuscripcionActual.pending, (state) => {
        state.loadingSuscripcion = true;
        state.errorSuscripcion = null;
      })
      .addCase(actualizarSuscripcionActual.fulfilled, (state, action) => {
        state.loadingSuscripcion = false;
        state.suscripcionActual = action.payload.suscripcion || action.payload;
      })
      .addCase(actualizarSuscripcionActual.rejected, (state, action) => {
        state.loadingSuscripcion = false;
        state.errorSuscripcion = action.payload;
      })
      .addCase(obtenerSuscripcionActual.pending, (state) => {
        state.loadingSuscripcion = true;
        state.errorSuscripcion = null;
      })
      .addCase(obtenerSuscripcionActual.fulfilled, (state, action) => {
        state.loadingSuscripcion = false;
        state.suscripcionActual = action.payload.suscripcion || action.payload;
      })
      .addCase(obtenerSuscripcionActual.rejected, (state, action) => {
        state.loadingSuscripcion = false;
        state.errorSuscripcion = action.payload;
      })
      .addCase(reactivarMembresia.pending, (state) => {
        state.loadingReactivacion = true;
        state.errorReactivacion = null;
      })
      .addCase(reactivarMembresia.fulfilled, (state, action) => {
        state.loadingReactivacion = false;
        state.suscripcionActual = {
          ...state.suscripcionActual,
          renovacionAutomatica: true,
          fechaCancelacion: null,
          estado: 'activa',
          fechaReactivacion: action.payload.fechaReactivacion || new Date().toISOString()
        };
      })
      .addCase(reactivarMembresia.rejected, (state, action) => {
        state.loadingReactivacion = false;
        state.errorReactivacion = action.payload;
      })
      .addCase(cambiarPlanMembresia.pending, (state) => {
        state.loadingCambioPlan = true;
        state.errorCambioPlan = null;
      })
      .addCase(cambiarPlanMembresia.fulfilled, (state, action) => {
        state.loadingCambioPlan = false;
        state.suscripcionActual = action.payload.suscripcion || action.payload;
      })
      .addCase(cambiarPlanMembresia.rejected, (state, action) => {
        state.loadingCambioPlan = false;
        state.errorCambioPlan = action.payload;
      })
      .addCase(obtenerHistorialMembresias.pending, (state) => {
        state.loadingHistorial = true;
        state.errorHistorial = null;
      })
      .addCase(obtenerHistorialMembresias.fulfilled, (state, action) => {
        state.loadingHistorial = false;
        state.historialMembresias = action.payload.historial || action.payload;
      })
      .addCase(obtenerHistorialMembresias.rejected, (state, action) => {
        state.loadingHistorial = false;
        state.errorHistorial = action.payload;
      })
      .addCase(aplicarCodigoPromocional.pending, (state) => {
        state.loadingPromocion = true;
        state.errorPromocion = null;
      })
      .addCase(aplicarCodigoPromocional.fulfilled, (state, action) => {
        state.loadingPromocion = false;
        state.promocionAplicada = action.payload.promocion;
        state.descuentoActivo = action.payload.descuento;
      })
      .addCase(aplicarCodigoPromocional.rejected, (state, action) => {
        state.loadingPromocion = false;
        state.errorPromocion = action.payload;
      });
  },
});

export const {
  clearError,
  clearSpecificError,
  setSuscripcionActual,
  clearSuscripcionActual,
  setPromocionAplicada,
  clearPromocionAplicada,
  setDescuentoActivo,
  clearDescuentoActivo,
  updateConfiguracion,
  resetMembresiaState,
  updateMembresiaLocal
} = membresiaSlice.actions;

export default membresiaSlice.reducer;