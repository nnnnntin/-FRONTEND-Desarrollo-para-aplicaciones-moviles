import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notificaciones: [],
  isLoading: false,
  error: null,
  lastFetch: null,
  totalNoLeidas: 0,
};

const notificacionesSlice = createSlice({
  name: 'notificaciones',
  initialState,
  reducers: {

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearError: (state) => {
      state.error = null;
    },


    setNotificaciones: (state, action) => {
      state.notificaciones = action.payload;
      state.totalNoLeidas = action.payload.filter(n => !n.leida).length;
      state.lastFetch = new Date().toISOString();
      state.error = null;
      state.isLoading = false;
    },

    addNotificacion: (state, action) => {
      state.notificaciones.unshift(action.payload);
      if (!action.payload.leida) {
        state.totalNoLeidas += 1;
      }
    },

    updateNotificacion: (state, action) => {
      const index = state.notificaciones.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        const wasUnread = !state.notificaciones[index].leida;
        const isNowRead = action.payload.leida;

        state.notificaciones[index] = { ...state.notificaciones[index], ...action.payload };


        if (wasUnread && isNowRead) {
          state.totalNoLeidas = Math.max(0, state.totalNoLeidas - 1);
        } else if (!wasUnread && !isNowRead) {
          state.totalNoLeidas += 1;
        }
      }
    },

    marcarComoLeida: (state, action) => {
      const notificacion = state.notificaciones.find(n => n.id === action.payload);
      if (notificacion && !notificacion.leida) {
        notificacion.leida = true;
        state.totalNoLeidas = Math.max(0, state.totalNoLeidas - 1);
      }
    },

    marcarTodasComoLeidas: (state) => {
      state.notificaciones.forEach(notificacion => {
        notificacion.leida = true;
      });
      state.totalNoLeidas = 0;
    },

    eliminarNotificacion: (state, action) => {
      const index = state.notificaciones.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notificacion = state.notificaciones[index];
        if (!notificacion.leida) {
          state.totalNoLeidas = Math.max(0, state.totalNoLeidas - 1);
        }
        state.notificaciones.splice(index, 1);
      }
    },

    limpiarNotificaciones: (state) => {
      state.notificaciones = [];
      state.totalNoLeidas = 0;
      state.lastFetch = null;
    },
  },
});


export const {
  setLoading,
  setError,
  clearError,
  setNotificaciones,
  addNotificacion,
  updateNotificacion,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  limpiarNotificaciones,
} = notificacionesSlice.actions;


export const cargarNotificacionesUsuario = (usuarioId, token, options = {}) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const { limit = 50, leidas } = options;
      let url = `${process.env.EXPO_PUBLIC_API_URL}/v1/notificaciones/usuario/${usuarioId}?limit=${limit}`;

      if (typeof leidas === 'boolean') {
        url += `&leidas=${leidas}`;
      }

      console.log('🔵 Haciendo petición a:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar notificaciones');
      }

      const data = await response.json();
      console.log('🔵 Datos recibidos del backend:', data);


      let notificacionesData;
      if (Array.isArray(data)) {
        notificacionesData = data;
      } else if (data.notificaciones && Array.isArray(data.notificaciones)) {
        notificacionesData = data.notificaciones;
      } else if (data.datos && Array.isArray(data.datos)) {
        notificacionesData = data.datos;
      } else {
        notificacionesData = [];
      }

      console.log('🔵 Notificaciones extraídas:', notificacionesData);


      const notificacionesProcesadas = notificacionesData
        .map(notif => mapearNotificacion(notif))
        .sort((a, b) => new Date(b.fechaRaw) - new Date(a.fechaRaw));

      console.log('🔵 Notificaciones procesadas:', notificacionesProcesadas);

      dispatch(setNotificaciones(notificacionesProcesadas));

    } catch (error) {
      console.error('🔴 Error al cargar notificaciones:', error);
      dispatch(setError(error.message || 'Error al cargar notificaciones'));
    }
  };
};

export const marcarNotificacionComoLeida = (notificacionId, token) => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/notificaciones/leer`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notificacionId: notificacionId
          }),
        }
      );

      if (response.ok) {
        dispatch(marcarComoLeida(notificacionId));
      } else {

        dispatch(marcarComoLeida(notificacionId));
        console.warn('🟡 No se pudo marcar como leída en el servidor');
      }
    } catch (error) {
      console.error('🔴 Error al marcar como leída:', error);

      dispatch(marcarComoLeida(notificacionId));
    }
  };
};

export const marcarTodasNotificacionesComoLeidas = (usuarioId, token) => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/notificaciones/usuario/${usuarioId}/leer-todas`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        dispatch(marcarTodasComoLeidas());
      } else {
        throw new Error('No se pudieron marcar todas como leídas');
      }
    } catch (error) {
      console.error('🔴 Error al marcar todas como leídas:', error);
      dispatch(setError('No se pudieron marcar todas como leídas'));
      throw error;
    }
  };
};

export const eliminarNotificacionPorId = (notificacionId, token) => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/notificaciones/${notificacionId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        dispatch(eliminarNotificacion(notificacionId));
      } else {
        throw new Error('No se pudo eliminar la notificación');
      }
    } catch (error) {
      console.error('🔴 Error al eliminar notificación:', error);
      dispatch(setError('No se pudo eliminar la notificación'));
      throw error;
    }
  };
};


const mapearNotificacion = (notifBackend) => {
  console.log('🔍 Mapeando notificación desde backend:', notifBackend);


  const tiposConfig = {
    'reserva': { icono: 'calendar', color: '#4a90e2' },
    'confirmacion_reserva': { icono: 'checkmark-circle', color: '#27ae60' },
    'cancelacion_reserva': { icono: 'close-circle', color: '#e74c3c' },
    'nueva_reserva': { icono: 'calendar', color: '#4a90e2' },
    'pago': { icono: 'cash', color: '#27ae60' },
    'pago_recibido': { icono: 'cash', color: '#27ae60' },
    'membresia': { icono: 'card', color: '#9b59b6' },
    'membresia_vencimiento': { icono: 'alert-circle', color: '#f39c12' },
    'servicio': { icono: 'construct', color: '#9b59b6' },
    'solicitud_servicio': { icono: 'briefcase', color: '#3498db' },
    'servicio_completado': { icono: 'checkmark-done', color: '#27ae60' },
    'reseña': { icono: 'star', color: '#f39c12' },
    'calificacion': { icono: 'star', color: '#f39c12' },
    'recordatorio': { icono: 'alarm', color: '#e67e22' },
    'sistema': { icono: 'information-circle', color: '#3498db' },
    'promocion': { icono: 'pricetag', color: '#e74c3c' },
    'mantenimiento': { icono: 'settings', color: '#95a5a6' },
    'bienvenida': { icono: 'heart', color: '#e91e63' },
    'default': { icono: 'notifications', color: '#7f8c8d' }
  };

  const tipoNotif = notifBackend.tipoNotificacion || notifBackend.tipo || 'default';
  const config = tiposConfig[tipoNotif] || tiposConfig['default'];


  let fechaFormateada = 'Fecha no disponible';
  let fechaRaw = new Date();

  if (notifBackend.fechaCreacion || notifBackend.createdAt || notifBackend.fecha) {
    const fechaString = notifBackend.fechaCreacion || notifBackend.createdAt || notifBackend.fecha;
    fechaRaw = new Date(fechaString);
    fechaFormateada = formatearFecha(fechaRaw);
  }


  let estadoLeido = false;
  if (notifBackend.hasOwnProperty('leido')) {
    estadoLeido = notifBackend.leido;
  } else if (notifBackend.hasOwnProperty('leida')) {
    estadoLeido = notifBackend.leida;
  }

  const notificacionMapeada = {
    id: notifBackend._id || notifBackend.id,
    tipo: tipoNotif,
    titulo: notifBackend.titulo || obtenerTituloPorTipo(tipoNotif),
    mensaje: notifBackend.mensaje || notifBackend.contenido || 'Sin mensaje',
    fecha: fechaFormateada,
    fechaRaw: fechaRaw,
    leida: estadoLeido,
    icono: config.icono,
    color: config.color,
    prioridad: notifBackend.prioridad || 'normal',
    datosCompletos: notifBackend
  };

  console.log('🔍 Notificación mapeada:', {
    id: notificacionMapeada.id,
    titulo: notificacionMapeada.titulo,
    leidoOriginal: notifBackend.leido,
    leidaMapeada: notificacionMapeada.leida,
    tipo: notificacionMapeada.tipo
  });

  return notificacionMapeada;
};

const obtenerTituloPorTipo = (tipo) => {
  const titulos = {
    'reserva': 'Nueva reserva',
    'confirmacion_reserva': 'Reserva confirmada',
    'cancelacion_reserva': 'Reserva cancelada',
    'nueva_reserva': 'Nueva reserva recibida',
    'pago': 'Pago procesado',
    'pago_recibido': 'Pago recibido',
    'membresia': 'Información de membresía',
    'membresia_vencimiento': 'Membresía por vencer',
    'servicio': 'Servicio programado',
    'solicitud_servicio': 'Nueva solicitud de servicio',
    'servicio_completado': 'Servicio completado',
    'reseña': 'Nueva reseña',
    'calificacion': 'Nueva calificación',
    'recordatorio': 'Recordatorio',
    'sistema': 'Notificación del sistema',
    'promocion': 'Oferta especial',
    'mantenimiento': 'Mantenimiento programado',
    'bienvenida': 'Bienvenido',
    'default': 'Notificación'
  };

  return titulos[tipo] || 'Notificación';
};

const formatearFecha = (fecha) => {
  const ahora = new Date();
  const diff = ahora - fecha;
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor(diff / (1000 * 60 * 60));
  const minutos = Math.floor(diff / (1000 * 60));

  if (minutos < 60) {
    return minutos <= 1 ? 'Hace un momento' : `Hace ${minutos} minutos`;
  } else if (horas < 24) {
    return horas === 1 ? 'Hace 1 hora' : `Hace ${horas} horas`;
  } else if (dias < 7) {
    return dias === 1 ? 'Ayer' : `Hace ${dias} días`;
  } else {
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
};


export const selectNotificaciones = (state) => state.notificaciones.notificaciones;
export const selectNotificacionesNoLeidas = (state) =>
  state.notificaciones.notificaciones.filter(n => !n.leida);
export const selectTotalNoLeidas = (state) => state.notificaciones.totalNoLeidas;
export const selectIsLoading = (state) => state.notificaciones.isLoading;
export const selectError = (state) => state.notificaciones.error;

export default notificacionesSlice.reducer;