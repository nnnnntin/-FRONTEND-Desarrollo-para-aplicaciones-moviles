import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const crearReserva = createAsyncThunk(
  'reservas/crear',
  async (datosReserva, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/reservas`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosReserva),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al crear reserva');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión al crear la reserva');
    }
  }
);

export const obtenerReservas = createAsyncThunk(
  'reservas/obtenerTodos',
  async ({ skip = 0, limit = 10 } = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/reservas?skip=${skip}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al obtener reservas');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerReservasPorUsuario = createAsyncThunk(
  'reservas/obtenerPorUsuario',
  async (usuarioId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/reservas/usuario/${usuarioId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al obtener reservas por usuario');
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      } else if (data.reservas && Array.isArray(data.reservas)) {
        return data.reservas;
      } else {
        return [];
      }
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerReservaPorId = createAsyncThunk(
  'reservas/obtenerPorId',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/reservas/${id}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al obtener reserva');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const actualizarReserva = createAsyncThunk(
  'reservas/actualizar',
  async ({ id, datosActualizacion }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/reservas/${id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...datosActualizacion,
            fechaActualizacion: new Date().toISOString()
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al actualizar reserva');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const eliminarReserva = createAsyncThunk(
  'reservas/eliminar',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/reservas/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al eliminar reserva');
      }

      return id;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const cancelarReserva = createAsyncThunk(
  'reservas/cancelar',
  async ({ reservaId, motivo }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/reservas/cancelar`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reservaId,
            motivo,
            fechaCancelacion: new Date().toISOString()
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al cancelar reserva');
      }

      const data = await response.json();
      return { reservaId, motivo, fecha: new Date().toISOString() };
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const confirmarReserva = createAsyncThunk(
  'reservas/confirmar',
  async ({ reservaId, datosPago }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/reservas/${reservaId}/confirmar`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            datosPago,
            fechaConfirmacion: new Date().toISOString()
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al confirmar reserva');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

const initialState = {
  reservas: [],
  reservaSeleccionada: null,

  ultimaReservaCreada: null,

  pagination: {
    skip: 0,
    limit: 10,
    total: 0,
  },

  loading: false,
  error: null,
  loadingDetalle: false,
  errorDetalle: null,

  creandoReserva: false,
  errorCrearReserva: null,
};

const reservasSlice = createSlice({
  name: 'reservas',
  initialState,
  reducers: {
    setPaginacion: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    clearError: (state) => {
      state.error = null;
      state.errorDetalle = null;
      state.errorCrearReserva = null;
    },

    clearReservas: (state) => {
      state.reservas = [];
      state.reservaSeleccionada = null;
      state.ultimaReservaCreada = null;
      state.error = null;
    },

    clearUltimaReservaCreada: (state) => {
      state.ultimaReservaCreada = null;
    },

    seleccionarReserva: (state, action) => {
      state.reservaSeleccionada = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(obtenerReservas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerReservas.fulfilled, (state, action) => {
        state.loading = false;

        if (Array.isArray(action.payload)) {
          state.reservas = action.payload;
          state.pagination.total = action.payload.length;
        } else if (action.payload.reservas && Array.isArray(action.payload.reservas)) {
          state.reservas = action.payload.reservas;
          state.pagination.total = action.payload.total ?? action.payload.reservas.length;
        } else {
          state.reservas = [];
          state.pagination.total = 0;
        }
      })
      .addCase(obtenerReservas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(obtenerReservasPorUsuario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerReservasPorUsuario.fulfilled, (state, action) => {
        state.loading = false;
        state.reservas = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(obtenerReservasPorUsuario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.reservas = [];
      })

      .addCase(obtenerReservaPorId.pending, (state) => {
        state.loadingDetalle = true;
        state.errorDetalle = null;
      })
      .addCase(obtenerReservaPorId.fulfilled, (state, action) => {
        state.loadingDetalle = false;
        state.reservaSeleccionada = action.payload;
      })
      .addCase(obtenerReservaPorId.rejected, (state, action) => {
        state.loadingDetalle = false;
        state.errorDetalle = action.payload;
      })

      .addCase(crearReserva.pending, (state) => {
        state.creandoReserva = true;
        state.errorCrearReserva = null;
        state.ultimaReservaCreada = null;
      })
      .addCase(crearReserva.fulfilled, (state, action) => {
        state.creandoReserva = false;
        state.errorCrearReserva = null;

        state.ultimaReservaCreada = action.payload;

        state.reservas.unshift(action.payload);

      })
      .addCase(crearReserva.rejected, (state, action) => {
        state.creandoReserva = false;
        state.errorCrearReserva = action.payload;
        state.ultimaReservaCreada = null;
      })

      .addCase(actualizarReserva.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(actualizarReserva.fulfilled, (state, action) => {
        state.loading = false;

        const idx = state.reservas.findIndex(r =>
          (r._id || r.id) === (action.payload._id || action.payload.id)
        );

        if (idx !== -1) {
          state.reservas[idx] = action.payload;
        }

        if (state.reservaSeleccionada &&
          (state.reservaSeleccionada._id || state.reservaSeleccionada.id) ===
          (action.payload._id || action.payload.id)) {
          state.reservaSeleccionada = action.payload;
        }
      })
      .addCase(actualizarReserva.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(eliminarReserva.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(eliminarReserva.fulfilled, (state, action) => {
        state.loading = false;

        state.reservas = state.reservas.filter(r =>
          (r._id || r.id) !== action.payload
        );

        if (state.reservaSeleccionada &&
          (state.reservaSeleccionada._id || state.reservaSeleccionada.id) === action.payload) {
          state.reservaSeleccionada = null;
        }

      })
      .addCase(eliminarReserva.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(cancelarReserva.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelarReserva.fulfilled, (state, action) => {
        state.loading = false;

        const { reservaId } = action.payload;

        const idx = state.reservas.findIndex(r =>
          (r._id || r.id) === reservaId
        );

        if (idx !== -1) {
          state.reservas[idx] = {
            ...state.reservas[idx],
            estado: 'cancelada',
            fechaCancelacion: action.payload.fecha,
            motivoCancelacion: action.payload.motivo
          };
        }

        if (state.reservaSeleccionada &&
          (state.reservaSeleccionada._id || state.reservaSeleccionada.id) === reservaId) {
          state.reservaSeleccionada = {
            ...state.reservaSeleccionada,
            estado: 'cancelada',
            fechaCancelacion: action.payload.fecha,
            motivoCancelacion: action.payload.motivo
          };
        }
      })
      .addCase(cancelarReserva.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(confirmarReserva.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmarReserva.fulfilled, (state, action) => {
        state.loading = false;

        const idx = state.reservas.findIndex(r =>
          (r._id || r.id) === (action.payload._id || action.payload.id)
        );

        if (idx !== -1) {
          state.reservas[idx] = action.payload;
        }

        if (state.reservaSeleccionada &&
          (state.reservaSeleccionada._id || state.reservaSeleccionada.id) ===
          (action.payload._id || action.payload.id)) {
          state.reservaSeleccionada = action.payload;
        }
      })
      .addCase(confirmarReserva.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setPaginacion,
  clearError,
  clearReservas,
  clearUltimaReservaCreada,
  seleccionarReserva
} = reservasSlice.actions;

export const selectReservas = (state) => state.reservas.reservas;
export const selectReservaSeleccionada = (state) => state.reservas.reservaSeleccionada;
export const selectUltimaReservaCreada = (state) => state.reservas.ultimaReservaCreada;
export const selectLoadingReservas = (state) => state.reservas.loading;
export const selectCreandoReserva = (state) => state.reservas.creandoReserva;
export const selectErrorReservas = (state) => state.reservas.error;
export const selectErrorCrearReserva = (state) => state.reservas.errorCrearReserva;

export const selectReservasPorEstado = (estado) => (state) =>
  state.reservas.reservas.filter(reserva => reserva.estado === estado);

export const selectReservasFuturas = (state) => {
  const ahora = new Date();
  return state.reservas.reservas.filter(reserva => {
    const fechaReserva = new Date(reserva.fechaInicio || reserva.fecha);
    return fechaReserva >= ahora && reserva.estado !== 'cancelada';
  });
};

export const selectReservasPasadas = (state) => {
  const ahora = new Date();
  return state.reservas.reservas.filter(reserva => {
    const fechaReserva = new Date(reserva.fechaInicio || reserva.fecha);
    return fechaReserva < ahora;
  });
};

export default reservasSlice.reducer;