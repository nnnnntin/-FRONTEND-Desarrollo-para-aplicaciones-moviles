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
        `${process.env.EXPO_PUBLIC_API_URL}/v1/reservas`,
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

export const obtenerReservasPorCliente = createAsyncThunk(
  'reservas/obtenerPorCliente',
  async (clienteId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/reservas/cliente/${clienteId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al obtener reservas por cliente');
      }

      const data = await response.json();

      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerEstadisticasGananciasCliente = createAsyncThunk(
  'reservas/obtenerEstadisticasGanancias',
  async ({ clienteId, fechaInicio, fechaFin }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      let url = `${process.env.EXPO_PUBLIC_API_URL}/v1/reservas/cliente/${clienteId}/estadisticas`;
      
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al obtener estadísticas');
      }

      const data = await response.json();

      return data;
    } catch (error) {
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
            motivo
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

  reservasCliente: [],
  clienteSeleccionado: null,
  resumenCliente: null,
  loadingReservasCliente: false,
  errorReservasCliente: null,

  estadisticasCliente: null,
  loadingEstadisticas: false,
  errorEstadisticas: null,

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
      state.errorReservasCliente = null; 
      state.errorEstadisticas = null;
    },

    clearReservas: (state) => {
      state.reservas = [];
      state.reservaSeleccionada = null;
      state.ultimaReservaCreada = null;
      state.error = null;
    },

    clearReservasCliente: (state) => {
      state.reservasCliente = [];
      state.clienteSeleccionado = null;
      state.resumenCliente = null;
      state.errorReservasCliente = null;
    },

    clearEstadisticasCliente: (state) => {
      state.estadisticasCliente = null;
      state.errorEstadisticas = null;
    },

    clearUltimaReservaCreada: (state) => {
      state.ultimaReservaCreada = null;
    },

    seleccionarReserva: (state, action) => {
      state.reservaSeleccionada = action.payload;
    },

    seleccionarCliente: (state, action) => {
      state.clienteSeleccionado = action.payload;
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

      .addCase(obtenerReservasPorCliente.pending, (state) => {
        state.loadingReservasCliente = true;
        state.errorReservasCliente = null;
      })
      .addCase(obtenerReservasPorCliente.fulfilled, (state, action) => {
        state.loadingReservasCliente = false;
        state.reservasCliente = action.payload.reservas || [];
        state.clienteSeleccionado = action.payload.cliente || null;
        state.resumenCliente = action.payload.resumen || null;
      })
      .addCase(obtenerReservasPorCliente.rejected, (state, action) => {
        state.loadingReservasCliente = false;
        state.errorReservasCliente = action.payload;
        state.reservasCliente = [];
      })

      .addCase(obtenerEstadisticasGananciasCliente.pending, (state) => {
        state.loadingEstadisticas = true;
        state.errorEstadisticas = null;
      })
      .addCase(obtenerEstadisticasGananciasCliente.fulfilled, (state, action) => {
        state.loadingEstadisticas = false;
        state.estadisticasCliente = action.payload;
      })
      .addCase(obtenerEstadisticasGananciasCliente.rejected, (state, action) => {
        state.loadingEstadisticas = false;
        state.errorEstadisticas = action.payload;
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

        const reservaCreada = action.payload.reserva || action.payload;
        state.ultimaReservaCreada = reservaCreada;

        state.reservas.unshift(reservaCreada);

        if (state.clienteSeleccionado && 
            reservaCreada.clienteId === state.clienteSeleccionado.id) {
          state.reservasCliente.unshift(reservaCreada);
          
          if (state.resumenCliente) {
            state.resumenCliente.totalReservas += 1;
            if (reservaCreada.estado === 'confirmada') {
              state.resumenCliente.reservasConfirmadas += 1;
              state.resumenCliente.ingresosTotales += (reservaCreada.precioFinalPagado || 0);
            }
          }
        }
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

        const reservaActualizada = action.payload;
        const reservaId = reservaActualizada._id || reservaActualizada.id;

        const idx = state.reservas.findIndex(r =>
          (r._id || r.id) === reservaId
        );

        if (idx !== -1) {
          state.reservas[idx] = reservaActualizada;
        }

        const idxCliente = state.reservasCliente.findIndex(r =>
          (r._id || r.id) === reservaId
        );

        if (idxCliente !== -1) {
          state.reservasCliente[idxCliente] = reservaActualizada;
        }

        if (state.reservaSeleccionada &&
          (state.reservaSeleccionada._id || state.reservaSeleccionada.id) === reservaId) {
          state.reservaSeleccionada = reservaActualizada;
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

        const reservaId = action.payload;

        state.reservas = state.reservas.filter(r =>
          (r._id || r.id) !== reservaId
        );

        state.reservasCliente = state.reservasCliente.filter(r =>
          (r._id || r.id) !== reservaId
        );

        if (state.reservaSeleccionada &&
          (state.reservaSeleccionada._id || state.reservaSeleccionada.id) === reservaId) {
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

        const idxCliente = state.reservasCliente.findIndex(r =>
          (r._id || r.id) === reservaId
        );

        if (idxCliente !== -1) {
          state.reservasCliente[idxCliente] = {
            ...state.reservasCliente[idxCliente],
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

        const reservaConfirmada = action.payload;
        const reservaId = reservaConfirmada._id || reservaConfirmada.id;

        const idx = state.reservas.findIndex(r =>
          (r._id || r.id) === reservaId
        );

        if (idx !== -1) {
          state.reservas[idx] = reservaConfirmada;
        }

        const idxCliente = state.reservasCliente.findIndex(r =>
          (r._id || r.id) === reservaId
        );

        if (idxCliente !== -1) {
          state.reservasCliente[idxCliente] = reservaConfirmada;
        }

        if (state.reservaSeleccionada &&
          (state.reservaSeleccionada._id || state.reservaSeleccionada.id) === reservaId) {
          state.reservaSeleccionada = reservaConfirmada;
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
  clearReservasCliente, 
  clearEstadisticasCliente, 
  clearUltimaReservaCreada,
  seleccionarReserva,
  seleccionarCliente
} = reservasSlice.actions;

export const selectReservas = (state) => state.reservas.reservas;
export const selectReservaSeleccionada = (state) => state.reservas.reservaSeleccionada;
export const selectUltimaReservaCreada = (state) => state.reservas.ultimaReservaCreada;
export const selectLoadingReservas = (state) => state.reservas.loading;
export const selectCreandoReserva = (state) => state.reservas.creandoReserva;
export const selectErrorReservas = (state) => state.reservas.error;
export const selectErrorCrearReserva = (state) => state.reservas.errorCrearReserva;

export const selectReservasCliente = (state) => state.reservas.reservasCliente;
export const selectClienteSeleccionado = (state) => state.reservas.clienteSeleccionado;
export const selectResumenCliente = (state) => state.reservas.resumenCliente;
export const selectLoadingReservasCliente = (state) => state.reservas.loadingReservasCliente;
export const selectErrorReservasCliente = (state) => state.reservas.errorReservasCliente;

export const selectEstadisticasCliente = (state) => state.reservas.estadisticasCliente;
export const selectLoadingEstadisticas = (state) => state.reservas.loadingEstadisticas;
export const selectErrorEstadisticas = (state) => state.reservas.errorEstadisticas;

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

export const selectReservasClientePorEstado = (estado) => (state) =>
  state.reservas.reservasCliente.filter(reserva => reserva.estado === estado);

export const selectGananciasClienteTotal = (state) => {
  return state.reservas.reservasCliente
    .filter(r => ['confirmada', 'completada'].includes(r.estado))
    .reduce((total, r) => total + (r.precioFinalPagado || 0), 0);
};

export const selectReservasClientePorMes = (state) => {
  const reservasPorMes = {};
  state.reservas.reservasCliente.forEach(reserva => {
    const fecha = new Date(reserva.fechaInicio);
    const mesAno = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    
    if (!reservasPorMes[mesAno]) {
      reservasPorMes[mesAno] = {
        cantidad: 0,
        ingresos: 0
      };
    }
    
    reservasPorMes[mesAno].cantidad += 1;
    if (['confirmada', 'completada'].includes(reserva.estado)) {
      reservasPorMes[mesAno].ingresos += (reserva.precioFinalPagado || 0);
    }
  });
  
  return reservasPorMes;
};

export default reservasSlice.reducer;