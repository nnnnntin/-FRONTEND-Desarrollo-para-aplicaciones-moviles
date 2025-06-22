import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  estadisticas: {
    usuarios: {
      total: 0,
      usuarios: 0,
      clientes: 0,
      proveedores: 0,
      nuevosEsteMes: 0
    },
    espacios: {
      total: 0,
      activos: 0,
      pausados: 0,
      nuevosEsteMes: 0
    },
    reservas: {
      total: 0,
      esteMes: 0,
      canceladas: 0,
      completadas: 0
    },
    finanzas: {
      ingresosTotales: 0,
      comisionesReservas: 0,
      comisionesServicios: 0,
      pendientesCobro: 0,
      gananciasMes: 0
    },
    servicios: {
      solicitudes: 0,
      completados: 0,
      enProceso: 0,
      proveedoresActivos: 0
    }
  },
  
  configuracionComisiones: {
    reservas: {
      porcentaje: 10,
      minimo: 5,
      maximo: 500
    },
    servicios: {
      porcentaje: 20,
      minimo: 10,
      maximo: 200
    },
    membresias: {
      premium: 49.99,
      empresarial: 149.99,
      basico: 19.99
    }
  },
  
  notificacionesAdmin: [],
  
  reportesPendientes: [],
  
  loading: false,
  error: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    actualizarEstadisticas: (state, action) => {
      state.estadisticas = action.payload;
    },
    
    actualizarConfiguracionComisiones: (state, action) => {
      state.configuracionComisiones = action.payload;
    },
    
    agregarNotificacionAdmin: (state, action) => {
      state.notificacionesAdmin.unshift(action.payload);
    },
    
    marcarNotificacionComoLeida: (state, action) => {
      const notificacion = state.notificacionesAdmin.find(n => n.id === action.payload);
      if (notificacion) {
        notificacion.leida = true;
      }
    },
    
    eliminarNotificacionAdmin: (state, action) => {
      state.notificacionesAdmin = state.notificacionesAdmin.filter(n => n.id !== action.payload);
    },
    
    agregarReportePendiente: (state, action) => {
      state.reportesPendientes.unshift(action.payload);
    },
    
    resolverReporte: (state, action) => {
      state.reportesPendientes = state.reportesPendientes.filter(r => r.id !== action.payload);
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    resetAdminState: () => initialState
  }
});

export const {
  actualizarEstadisticas,
  actualizarConfiguracionComisiones,
  agregarNotificacionAdmin,
  marcarNotificacionComoLeida,
  eliminarNotificacionAdmin,
  agregarReportePendiente,
  resolverReporte,
  setLoading,
  setError,
  resetAdminState
} = adminSlice.actions;

export default adminSlice.reducer;