import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';




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
      console.error('Error en obtenerReservas:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);


export const obtenerReservasPorUsuario = createAsyncThunk(
  'reservas/obtenerPorUsuario',
  async (usuarioId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      console.log('Obteniendo reservas para usuario:', usuarioId);
      console.log('Token:', auth.token ? 'Presente' : 'No presente');

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/reservas/usuario/${usuarioId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        return rejectWithValue(errorData.message || 'Error al obtener reservas por usuario');
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);



      if (Array.isArray(data)) {
        return data;
      } else if (data.reservas && Array.isArray(data.reservas)) {
        return data.reservas;
      } else {
        console.warn('Formato de respuesta inesperado:', data);
        return [];
      }
    } catch (error) {
      console.error('Error en obtenerReservasPorUsuario:', error);
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
      console.error('Error en obtenerReservaPorId:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);


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
      console.error('Error en crearReserva:', error);
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
          body: JSON.stringify(datosActualizacion),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al actualizar reserva');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en actualizarReserva:', error);
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
      console.error('Error en eliminarReserva:', error);
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
          body: JSON.stringify({ reservaId, motivo }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al cancelar reserva');
      }

      const data = await response.json();
      return reservaId;
    } catch (error) {
      console.error('Error en cancelarReserva:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);


const initialState = {

  reservas: [],
  reservaSeleccionada: null,


  pagination: {
    skip: 0,
    limit: 10,
    total: 0,
  },


  loading: false,
  error: null,
  loadingDetalle: false,
  errorDetalle: null,
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
    },

    clearReservas: (state) => {
      state.reservas = [];
      state.reservaSeleccionada = null;
      state.error = null;
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
        console.error('Error al obtener reservas:', action.payload);
      })


      .addCase(obtenerReservasPorUsuario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerReservasPorUsuario.fulfilled, (state, action) => {
        state.loading = false;

        state.reservas = Array.isArray(action.payload) ? action.payload : [];
        console.log('Reservas guardadas en el estado:', state.reservas);
      })
      .addCase(obtenerReservasPorUsuario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.reservas = [];
        console.error('Error al obtener reservas por usuario:', action.payload);
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
        state.loading = true;
        state.error = null;
      })
      .addCase(crearReserva.fulfilled, (state, action) => {
        state.loading = false;
        state.reservas.unshift(action.payload);
      })
      .addCase(crearReserva.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      .addCase(actualizarReserva.fulfilled, (state, action) => {
        const idx = state.reservas.findIndex(r => (r._id || r.id) === (action.payload._id || action.payload.id));
        if (idx !== -1) {
          state.reservas[idx] = action.payload;
        }
      })


      .addCase(eliminarReserva.fulfilled, (state, action) => {
        state.reservas = state.reservas.filter(r => (r._id || r.id) !== action.payload);
      })


      .addCase(cancelarReserva.fulfilled, (state, action) => {
        const idx = state.reservas.findIndex(r => (r._id || r.id) === action.payload);
        if (idx !== -1) {
          state.reservas[idx].estado = 'cancelada';
        }
      });
  },
});

export const { setPaginacion, clearError, clearReservas } = reservasSlice.actions;
export default reservasSlice.reducer;