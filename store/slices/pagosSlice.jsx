import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const obtenerPagos = createAsyncThunk(
  'pagos/obtenerTodos',
  async ({ skip = 0, limit = 10 } = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/pagos?skip=${skip}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al obtener pagos');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const crearPago = createAsyncThunk(
  'pagos/crear',
  async (pagoData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/pagos`,
        {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${auth.token}`, 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(pagoData)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || `Error ${res.status}: ${res.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerPagoPorId = createAsyncThunk(
  'pagos/obtenerPorId',
  async (pagoId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/pagos/${pagoId}`,
        { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al obtener pago');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const actualizarPago = createAsyncThunk(
  'pagos/actualizar',
  async ({ pagoId, datosActualizacion }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/pagos/${pagoId}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(datosActualizacion)
        }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al actualizar pago');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const eliminarPago = createAsyncThunk(
  'pagos/eliminar',
  async (pagoId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/pagos/${pagoId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
      );
      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data.message || 'Error al eliminar pago');
      }
      return pagoId;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerPagosPorUsuario = createAsyncThunk(
  'pagos/porUsuario',
  async (usuarioId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/pagos/usuario/${usuarioId}`,
        { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al obtener pagos por usuario');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerPagosPorConcepto = createAsyncThunk(
  'pagos/porConcepto',
  async (concepto, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/pagos/concepto/${concepto}`,
        { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al obtener pagos por concepto');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerPagosPorEstado = createAsyncThunk(
  'pagos/porEstado',
  async (estado, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/pagos/estado/${estado}`,
        { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al obtener pagos por estado');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerPagosPorEntidad = createAsyncThunk(
  'pagos/porEntidad',
  async ({ tipoEntidad, entidadId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/pagos/entidad/${tipoEntidad}/${entidadId}`,
        { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al obtener pagos por entidad');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const cambiarEstadoPago = createAsyncThunk(
  'pagos/cambiarEstado',
  async ({ pagoId, nuevoEstado }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/pagos/${pagoId}/estado`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: nuevoEstado })
        }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al cambiar estado del pago');
      return { pagoId, nuevoEstado };
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const completarPago = createAsyncThunk(
  'pagos/completar',
  async ({ pagoId, datosCompleto = {} }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/pagos/${pagoId}/completar`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(datosCompleto)
        }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al completar pago');
      return { pagoId };
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const reembolsarPago = createAsyncThunk(
  'pagos/reembolsar',
  async (reembolsoData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/pagos/reembolsar`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(reembolsoData)
        }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al reembolsar pago');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const vincularFacturaPago = createAsyncThunk(
  'pagos/vincularFactura',
  async ({ pagoId, facturaData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/pagos/${pagoId}/factura`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(facturaData)
        }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al vincular factura a pago');
      return { pagoId };
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const filtrarPagos = createAsyncThunk(
  'pagos/filtrar',
  async (filtros, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const qs = new URLSearchParams(filtros).toString();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/pagos/filtrar?${qs}`,
        { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al filtrar pagos');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerFacturas = createAsyncThunk(
  'pagos/obtenerFacturas',
  async ({ skip = 0, limit = 10 } = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/facturas?skip=${skip}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al obtener facturas');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const crearFactura = createAsyncThunk(
  'pagos/crearFactura',
  async (facturaData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/facturas`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(facturaData)
        }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al crear factura');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerFacturaPorId = createAsyncThunk(
  'pagos/obtenerFacturaPorId',
  async (facturaId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/facturas/${facturaId}`,
        { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al obtener factura');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const actualizarFactura = createAsyncThunk(
  'pagos/actualizarFactura',
  async ({ facturaId, datosActualizacion }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/facturas/${facturaId}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(datosActualizacion)
        }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al actualizar factura');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const eliminarFactura = createAsyncThunk(
  'pagos/eliminarFactura',
  async (facturaId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/facturas/${facturaId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
      );
      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data.message || 'Error al eliminar factura');
      }
      return facturaId;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerFacturaPorNumero = createAsyncThunk(
  'pagos/obtenerFacturaPorNumero',
  async (numeroFactura, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/facturas/numero/${numeroFactura}`,
        { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al obtener factura por número');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerFacturasPorUsuario = createAsyncThunk(
  'pagos/obtenerFacturasPorUsuario',
  async (usuarioId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/facturas/usuario/${usuarioId}`,
        { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al obtener facturas por usuario');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerFacturasPorEstado = createAsyncThunk(
  'pagos/obtenerFacturasPorEstado',
  async (estado, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/facturas/estado/${estado}`,
        { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al obtener facturas por estado');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerFacturasVencidas = createAsyncThunk(
  'pagos/obtenerFacturasVencidas',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/facturas/vencidas`,
        { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al obtener facturas vencidas');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerFacturasPorFechas = createAsyncThunk(
  'pagos/obtenerFacturasPorFechas',
  async ({ fechaInicio, fechaFin, tipoFecha = 'emision' }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/facturas/fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&tipoFecha=${tipoFecha}`,
        { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al obtener facturas por fechas');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const cancelarFactura = createAsyncThunk(
  'pagos/cancelarFactura',
  async ({ facturaId, datosCancelacion = {} }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/facturas/${facturaId}/cancelar`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(datosCancelacion)
        }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al cancelar factura');
      return { facturaId };
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const agregarPagoFactura = createAsyncThunk(
  'pagos/agregarPagoFactura',
  async ({ facturaId, pagoData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/facturas/${facturaId}/pago`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(pagoData)
        }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al agregar pago a factura');
      return { facturaId };
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const actualizarPDFFactura = createAsyncThunk(
  'pagos/actualizarPDFFactura',
  async ({ facturaId, pdfData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/facturas/${facturaId}/pdf`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(pdfData)
        }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al actualizar PDF de factura');
      return { facturaId };
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const filtrarFacturas = createAsyncThunk(
  'pagos/filtrarFacturas',
  async (filtros, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const qs = new URLSearchParams(filtros).toString();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/facturas/filtrar?${qs}`,
        { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Error al filtrar facturas');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

const initialState = {
  pagos: [],
  pagoSeleccionado: null,
  pagosPorUsuario: [],
  pagosPorConcepto: [],
  pagosPorEstado: [],
  pagosPorEntidad: [],

  facturas: [],
  facturaSeleccionada: null,
  facturasPorUsuario: [],
  facturasPorEstado: [],
  facturasVencidas: [],
  facturasPorFechas: [],

  pagination: { skip: 0, limit: 10, total: 0 },
  paginationFacturas: { skip: 0, limit: 10, total: 0 },

  loading: false,
  error: null,
  loadingFacturas: false,
  errorFacturas: null,
  loadingOperacion: false,
  errorOperacion: null,
};

const pagosSlice = createSlice({
  name: 'pagos',
  initialState,
  reducers: {
    seleccionarPago(state, action) {
      state.pagoSeleccionado = action.payload;
    },
    limpiarPagoSeleccionado(state) {
      state.pagoSeleccionado = null;
    },
    seleccionarFactura(state, action) {
      state.facturaSeleccionada = action.payload;
    },
    limpiarFacturaSeleccionada(state) {
      state.facturaSeleccionada = null;
    },
    setPaginacion(state, action) {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setPaginacionFacturas(state, action) {
      state.paginationFacturas = { ...state.paginationFacturas, ...action.payload };
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setLoadingFacturas(state, action) {
      state.loadingFacturas = action.payload;
    },
    setLoadingOperacion(state, action) {
      state.loadingOperacion = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setErrorFacturas(state, action) {
      state.errorFacturas = action.payload;
    },
    setErrorOperacion(state, action) {
      state.errorOperacion = action.payload;
    },
    clearError(state) {
      state.error = null;
      state.errorFacturas = null;
      state.errorOperacion = null;
    },
    limpiarPagosPorUsuario(state) {
      state.pagosPorUsuario = [];
    },
    limpiarPagosPorConcepto(state) {
      state.pagosPorConcepto = [];
    },
    limpiarFacturasVencidas(state) {
      state.facturasVencidas = [];
    },
    limpiarFacturasPorUsuario(state) {
      state.facturasPorUsuario = [];
    },
    limpiarFacturasPorEstado(state) {
      state.facturasPorEstado = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(obtenerPagos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerPagos.fulfilled, (state, { payload }) => {
        state.loading = false;
        let list = Array.isArray(payload)
          ? payload
          : payload.pagos ?? payload.data ?? [];
        state.pagos = list;
        state.pagination.total = payload.total ?? list.length;
      })
      .addCase(obtenerPagos.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      .addCase(crearPago.fulfilled, (state, { payload }) => {
        state.pagos.push(payload);
      })

      .addCase(obtenerPagoPorId.fulfilled, (state, { payload }) => {
        state.pagoSeleccionado = payload;
      })

      .addCase(actualizarPago.fulfilled, (state, { payload }) => {
        const idx = state.pagos.findIndex(p => p.id === payload.id);
        if (idx !== -1) state.pagos[idx] = payload;
        if (state.pagoSeleccionado?.id === payload.id) {
          state.pagoSeleccionado = payload;
        }
      })

      .addCase(eliminarPago.fulfilled, (state, { payload }) => {
        state.pagos = state.pagos.filter(p => p.id !== payload);
        if (state.pagoSeleccionado?.id === payload) {
          state.pagoSeleccionado = null;
        }
      })

      .addCase(obtenerPagosPorUsuario.fulfilled, (state, { payload }) => {
        state.pagosPorUsuario = payload;
      })
      .addCase(obtenerPagosPorConcepto.fulfilled, (state, { payload }) => {
        state.pagosPorConcepto = payload;
      })
      .addCase(obtenerPagosPorEstado.fulfilled, (state, { payload }) => {
        state.pagosPorEstado = payload;
      })
      .addCase(obtenerPagosPorEntidad.fulfilled, (state, { payload }) => {
        state.pagosPorEntidad = payload;
      })

      .addCase(cambiarEstadoPago.pending, (state) => {
        state.loadingOperacion = true;
        state.errorOperacion = null;
      })
      .addCase(cambiarEstadoPago.fulfilled, (state, { payload }) => {
        state.loadingOperacion = false;
        const idx = state.pagos.findIndex(p => p.id === payload.pagoId);
        if (idx !== -1) state.pagos[idx].estado = payload.nuevoEstado;
      })
      .addCase(cambiarEstadoPago.rejected, (state, { payload }) => {
        state.loadingOperacion = false;
        state.errorOperacion = payload;
      })

      .addCase(completarPago.pending, (state) => {
        state.loadingOperacion = true;
        state.errorOperacion = null;
      })
      .addCase(completarPago.fulfilled, (state, { payload }) => {
        state.loadingOperacion = false;
      })
      .addCase(completarPago.rejected, (state, { payload }) => {
        state.loadingOperacion = false;
        state.errorOperacion = payload;
      })

      .addCase(filtrarPagos.fulfilled, (state, { payload }) => {
        state.pagos = payload;
      });

    builder
      .addCase(obtenerFacturas.pending, (state) => {
        state.loadingFacturas = true;
        state.errorFacturas = null;
      })
      .addCase(obtenerFacturas.fulfilled, (state, { payload }) => {
        state.loadingFacturas = false;
        let list = Array.isArray(payload)
          ? payload
          : payload.facturas ?? payload.data ?? [];
        state.facturas = list;
        state.paginationFacturas.total = payload.total ?? list.length;
      })
      .addCase(obtenerFacturas.rejected, (state, { payload }) => {
        state.loadingFacturas = false;
        state.errorFacturas = payload;
      })

      .addCase(crearFactura.fulfilled, (state, { payload }) => {
        state.facturas.push(payload);
      })

      .addCase(obtenerFacturaPorId.fulfilled, (state, { payload }) => {
        state.facturaSeleccionada = payload;
      })

      .addCase(actualizarFactura.fulfilled, (state, { payload }) => {
        const idx = state.facturas.findIndex(f => f.id === payload.id);
        if (idx !== -1) state.facturas[idx] = payload;
        if (state.facturaSeleccionada?.id === payload.id) {
          state.facturaSeleccionada = payload;
        }
      })

      .addCase(eliminarFactura.fulfilled, (state, { payload }) => {
        state.facturas = state.facturas.filter(f => f.id !== payload);
        if (state.facturaSeleccionada?.id === payload) {
          state.facturaSeleccionada = null;
        }
      })

      .addCase(obtenerFacturaPorNumero.fulfilled, (state, { payload }) => {
        state.facturaSeleccionada = payload;
      })
      .addCase(obtenerFacturasPorUsuario.fulfilled, (state, { payload }) => {
        state.facturasPorUsuario = payload;
      })
      .addCase(obtenerFacturasPorEstado.fulfilled, (state, { payload }) => {
        state.facturasPorEstado = payload;
      })
      .addCase(obtenerFacturasVencidas.fulfilled, (state, { payload }) => {
        state.facturasVencidas = payload;
      })

      .addCase(obtenerFacturasPorFechas.fulfilled, (state, { payload }) => {
        state.facturasPorFechas = payload;
      })

      .addCase(cancelarFactura.fulfilled, (state, { payload }) => {
        const idx = state.facturas.findIndex(f => f.id === payload.facturaId);
        if (idx !== -1) state.facturas[idx].estado = 'cancelada';
      })

      .addCase(filtrarFacturas.fulfilled, (state, { payload }) => {
        state.facturas = payload;
      });
  }
});

export const {
  seleccionarPago, limpiarPagoSeleccionado,
  seleccionarFactura, limpiarFacturaSeleccionada,
  setPaginacion, setPaginacionFacturas,
  setLoading, setLoadingFacturas, setLoadingOperacion,
  setError, setErrorFacturas, setErrorOperacion,
  clearError,
  limpiarPagosPorUsuario, limpiarPagosPorConcepto,
  limpiarFacturasVencidas, limpiarFacturasPorUsuario, limpiarFacturasPorEstado
} = pagosSlice.actions;

export default pagosSlice.reducer;
