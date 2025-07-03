import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
  proveedores: [],
  proveedorSeleccionado: null,
  proveedoresVerificados: [],
  proveedoresPorTipo: {},
  serviciosProveedor: [],
  serviciosAdicionales: [],
  serviciosPorEspacio: {},
  solicitudesServicios: [],
  pagination: {
    skip: 0,
    limit: 10,
    total: 0
  },
  loading: false,
  error: null
};

export const obtenerProveedores = createAsyncThunk(
  'proveedores/obtenerTodos',
  async (
    { skip = 0, limit = 10 } = {},
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/proveedores`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al obtener proveedores');
      }
      const data = await response.json();
      const lista = data.proveedores ?? data;
      const total = data.total ?? lista.length;
      return { lista, skip, limit, total };
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const crearProveedor = createAsyncThunk(
  'proveedores/crear',
  async (datos, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/proveedores`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datos)
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al crear proveedor');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerProveedorPorId = createAsyncThunk(
  'proveedores/obtenerPorId',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/proveedores/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al obtener proveedor');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const actualizarProveedor = createAsyncThunk(
  'proveedores/actualizar',
  async (
    { id, datos },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/proveedores/${id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datos)
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al actualizar proveedor');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const eliminarProveedor = createAsyncThunk(
  'proveedores/eliminar',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/proveedores/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al eliminar proveedor');
      }
      return id;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerProveedoresPorTipo = createAsyncThunk(
  'proveedores/porTipo',
  async (tipo, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/proveedores/tipo/${tipo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al obtener por tipo');
      }
      const lista = await response.json();
      return { tipo, lista };
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerProveedoresVerificados = createAsyncThunk(
  'proveedores/verificados',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/proveedores/verificados`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al obtener verificados');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const activarProveedor = createAsyncThunk(
  'proveedores/activar',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/proveedores/${id}/activar`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al activar proveedor');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const verificarProveedor = createAsyncThunk(
  'proveedores/verificar',
  async (datos, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/proveedores/verificar`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datos)
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al verificar proveedor');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const actualizarCalificacionProveedor = createAsyncThunk(
  'proveedores/actualizarCalificacion',
  async (
    { id, calificacion },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/proveedores/${id}/calificacion`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(calificacion)
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al actualizar calificación');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const actualizarContactoProveedor = createAsyncThunk(
  'proveedores/actualizarContacto',
  async (
    { id, contacto },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/proveedores/${id}/contacto`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contacto)
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al actualizar contacto');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const actualizarMetodoPagoProveedor = createAsyncThunk(
  'proveedores/actualizarMetodoPago',
  async (
    { id, metodo },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/proveedores/${id}/metodo-pago`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(metodo)
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al actualizar método de pago');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerProveedoresPorCalificacion = createAsyncThunk(
  'proveedores/porCalificacion',
  async (
    calMin = 4,
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/proveedores/calificacion?calificacionMinima=${calMin}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al obtener por calificación');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerRankingProveedores = createAsyncThunk(
  'proveedores/rankingServicios',
  async (
    limite = 5,
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/proveedores/ranking/servicios?limite=${limite}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al obtener ranking');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const filtrarProveedores = createAsyncThunk(
  'proveedores/filtrar',
  async (
    filtros = {},
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth.token;
      const params = new URLSearchParams();
      if (filtros.tipo) {
        params.append('tipo', filtros.tipo);
      }
      if (filtros.servicioOfrecido) {
        params.append('servicioOfrecido', filtros.servicioOfrecido);
      }
      if (filtros.verificado !== undefined) {
        params.append('verificado', filtros.verificado);
      }
      if (filtros.activo !== undefined) {
        params.append('activo', filtros.activo);
      }
      if (filtros.busqueda) {
        params.append('busqueda', filtros.busqueda);
      }
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/proveedores/filtrar?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al filtrar proveedores');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerServiciosAdicionales = createAsyncThunk(
  'serviciosAdicionales/obtenerTodos',
  async (
    { skip = 0, limit = 10 } = {},
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/servicios-adicionales?skip=${skip}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al obtener servicios adicionales');
      }
      const data = await response.json();
      const lista = data.servicios ?? data;
      const total = data.total ?? lista.length;
      return { lista, skip, limit, total };
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const crearServicioAdicional = createAsyncThunk(
  'serviciosAdicionales/crear',
  async (datos, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      const usuario = state.auth.usuario;

      const proveedorId = usuario._id || usuario.id;

      if (usuario.tipoUsuario !== 'proveedor') {
        return rejectWithValue('El usuario debe ser de tipo proveedor para crear servicios');
      }

      const datosConProveedor = {
        ...datos,
        proveedorId: proveedorId
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/servicios-adicionales`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datosConProveedor)
        }
      );

      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al crear servicio adicional');
      }

      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const actualizarServicioAdicional = createAsyncThunk(
  'serviciosAdicionales/actualizar',
  async (
    { id, datos },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/servicios-adicionales/${id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datos)
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al actualizar servicio adicional');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const eliminarServicioAdicional = createAsyncThunk(
  'serviciosAdicionales/eliminar',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/servicios-adicionales/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al eliminar servicio adicional');
      }
      return id;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerServiciosPorTipo = createAsyncThunk(
  'serviciosAdicionales/porTipo',
  async (tipo, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/servicios-adicionales/tipo/${tipo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al obtener servicios por tipo');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerServiciosPorProveedor = createAsyncThunk(
  'serviciosAdicionales/porProveedor',
  async (proveedorId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/servicios-adicionales/proveedor/${proveedorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al obtener servicios del proveedor');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerServiciosPorEspacio = createAsyncThunk(
  'serviciosAdicionales/porEspacio',
  async (espacioId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/servicios-adicionales/espacio/${espacioId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al obtener servicios por espacio');
      }
      const lista = await response.json();
      return { espacioId, lista };
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerServiciosPorPrecio = createAsyncThunk(
  'serviciosAdicionales/porPrecio',
  async (
    { min, max },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/servicios-adicionales/precio?precioMin=${min}&precioMax=${max}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al obtener servicios por precio');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerServiciosPorUnidadPrecio = createAsyncThunk(
  'serviciosAdicionales/porUnidadPrecio',
  async (unidad, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/servicios-adicionales/unidad-precio/${unidad}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al obtener servicios por unidad de precio');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerServiciosDisponibles = createAsyncThunk(
  'serviciosAdicionales/disponibles',
  async (fecha, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/servicios-adicionales/disponibles?fecha=${fecha}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al obtener servicios disponibles');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const toggleServicioAdicional = createAsyncThunk(
  'serviciosAdicionales/toggleActivo',
  async (
    { id, activo },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/servicios-adicionales/${id}/activar`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ activo })
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al cambiar estado');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const asignarEspacioAServicio = createAsyncThunk(
  'serviciosAdicionales/asignarEspacio',
  async (
    { id, espacio },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/servicios-adicionales/${id}/espacio`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(espacio)
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al asignar espacio');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const eliminarEspacioDeServicio = createAsyncThunk(
  'serviciosAdicionales/eliminarEspacio',
  async (
    { id, espacioId },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/servicios-adicionales/${id}/espacio/${espacioId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al eliminar espacio');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerServiciosParaAprobacion = createAsyncThunk(
  'serviciosAdicionales/aprobacion',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/servicios-adicionales/aprobacion`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al obtener para aprobación');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const filtrarServiciosAdicionales = createAsyncThunk(
  'serviciosAdicionales/filtrar',
  async (
    filtros = {},
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth.token;
      const params = new URLSearchParams();
      if (filtros.tipo) {
        params.append('tipo', filtros.tipo);
      }
      if (filtros.precioMaximo !== undefined) {
        params.append('precioMaximo', filtros.precioMaximo);
      }
      if (filtros.unidadPrecio) {
        params.append('unidadPrecio', filtros.unidadPrecio);
      }
      if (filtros.diaDisponible) {
        params.append('diaDisponible', filtros.diaDisponible);
      }
      if (filtros.proveedorId) {
        params.append('proveedorId', filtros.proveedorId);
      }
      if (filtros.espacioId) {
        params.append('espacioId', filtros.espacioId);
      }
      if (filtros.requiereAprobacion !== undefined) {
        params.append('requiereAprobacion', filtros.requiereAprobacion);
      }
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/servicios-adicionales/filtrar?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || 'Error al filtrar servicios adicionales');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const crearSolicitudServicio = createAsyncThunk(
  'solicitudes/crear',
  async (
    datos,
    { rejectWithValue }
  ) => {
    try {
      const solicitud = {
        ...datos,
        estado: 'pendiente',
        fechaSolicitud: new Date().toISOString()
      };
      return solicitud;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error al crear solicitud');
    }
  }
);

export const responderSolicitudServicio = createAsyncThunk(
  'solicitudes/responder',
  async (
    { id, accion, mensaje },
    { rejectWithValue }
  ) => {
    try {
      const solicitudActualizada = {
        _id: id,
        estado: accion === 'aceptar' ? 'aceptada' : 'rechazada',
        fechaRespuesta: new Date().toISOString(),
        mensajeRespuesta: mensaje
      };
      return solicitudActualizada;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error al responder solicitud');
    }
  }
);

const proveedoresSlice = createSlice({
  name: 'proveedores',
  initialState,
  reducers: {
    setPagination(state, action) {
      state.pagination = {
        skip: action.payload.skip ?? state.pagination.skip,
        limit: action.payload.limit ?? state.pagination.limit,
        total: action.payload.total ?? state.pagination.total
      };
    },
    clearError(state) {
      state.error = null;
    },
    clearProveedores(state) {
      state.proveedores = [];
      state.proveedorSeleccionado = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {

    builder
      .addCase(obtenerProveedores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerProveedores.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.proveedores = payload.lista;
        state.pagination.skip = payload.skip;
        state.pagination.limit = payload.limit;
        state.pagination.total = payload.total;
      })
      .addCase(obtenerProveedores.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
    builder
      .addCase(crearProveedor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(crearProveedor.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.proveedores.unshift(payload);
      })
      .addCase(crearProveedor.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
    builder
      .addCase(obtenerProveedorPorId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerProveedorPorId.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.proveedorSeleccionado = payload;
      })
      .addCase(obtenerProveedorPorId.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
    builder
      .addCase(actualizarProveedor.fulfilled, (state, { payload }) => {
        const idx = state.proveedores.findIndex(p => p._id === payload._id);
        if (idx !== -1) {
          state.proveedores[idx] = payload;
        }
        if (
          state.proveedorSeleccionado &&
          state.proveedorSeleccionado._id === payload._id
        ) {
          state.proveedorSeleccionado = payload;
        }
      });
    builder
      .addCase(eliminarProveedor.fulfilled, (state, { payload }) => {
        state.proveedores = state.proveedores.filter(p => p._id !== payload);
        if (
          state.proveedorSeleccionado &&
          state.proveedorSeleccionado._id === payload
        ) {
          state.proveedorSeleccionado = null;
        }
      });
    builder
      .addCase(obtenerProveedoresPorTipo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerProveedoresPorTipo.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.proveedoresPorTipo[payload.tipo] = payload.lista;
      })
      .addCase(obtenerProveedoresPorTipo.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
    builder
      .addCase(obtenerProveedoresVerificados.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerProveedoresVerificados.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.proveedoresVerificados = payload;
      })
      .addCase(obtenerProveedoresVerificados.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
    builder
      .addCase(activarProveedor.fulfilled, (state, { payload }) => {
        const idx = state.proveedores.findIndex(p => p._id === payload._id);
        if (idx !== -1) {
          state.proveedores[idx] = payload;
        }
        if (
          state.proveedorSeleccionado &&
          state.proveedorSeleccionado._id === payload._id
        ) {
          state.proveedorSeleccionado = payload;
        }
      });
    builder
      .addCase(verificarProveedor.fulfilled, (state, { payload }) => {
        const idx = state.proveedores.findIndex(p => p._id === payload._id);
        if (idx !== -1) {
          state.proveedores[idx] = payload;
        }
        if (
          state.proveedorSeleccionado &&
          state.proveedorSeleccionado._id === payload._id
        ) {
          state.proveedorSeleccionado = payload;
        }
      });
    builder
      .addCase(actualizarCalificacionProveedor.fulfilled, (state, { payload }) => {
        const idx = state.proveedores.findIndex(p => p._id === payload._id);
        if (idx !== -1) {
          state.proveedores[idx] = payload;
        }
        if (
          state.proveedorSeleccionado &&
          state.proveedorSeleccionado._id === payload._id
        ) {
          state.proveedorSeleccionado = payload;
        }
      });
    builder
      .addCase(actualizarContactoProveedor.fulfilled, (state, { payload }) => {
        const idx = state.proveedores.findIndex(p => p._id === payload._1);
        if (idx !== -1) {
          state.proveedores[idx] = payload;
        }
        if (
          state.proveedorSeleccionado &&
          state.proveedorSeleccionado._id === payload._id
        ) {
          state.proveedorSeleccionado = payload;
        }
      });
    builder
      .addCase(actualizarMetodoPagoProveedor.fulfilled, (state, { payload }) => {
        const idx = state.proveedores.findIndex(p => p._id === payload._id);
        if (idx !== -1) {
          state.proveedores[idx] = payload;
        }
        if (
          state.proveedorSeleccionado &&
          state.proveedorSeleccionado._id === payload._id
        ) {
          state.proveedorSeleccionado = payload;
        }
      });
    builder
      .addCase(obtenerProveedoresPorCalificacion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerProveedoresPorCalificacion.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.proveedores = payload;
      })
      .addCase(obtenerProveedoresPorCalificacion.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
    builder
      .addCase(obtenerRankingProveedores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerRankingProveedores.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.proveedores = payload;
      })
      .addCase(obtenerRankingProveedores.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
    builder
      .addCase(filtrarProveedores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filtrarProveedores.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.proveedores = payload;
      })
      .addCase(filtrarProveedores.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
    builder
      .addCase(obtenerServiciosAdicionales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerServiciosAdicionales.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.serviciosAdicionales = payload.lista;
        state.pagination.skip = payload.skip;
        state.pagination.limit = payload.limit;
        state.pagination.total = payload.total;
      })
      .addCase(obtenerServiciosAdicionales.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
    builder
      .addCase(crearServicioAdicional.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(crearServicioAdicional.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.serviciosAdicionales.unshift(payload);
      })
      .addCase(crearServicioAdicional.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
    builder
      .addCase(actualizarServicioAdicional.fulfilled, (state, { payload }) => {
        const idx = state.serviciosAdicionales.findIndex(s => s._id === payload._id);
        if (idx !== -1) {
          state.serviciosAdicionales[idx] = payload;
        }
      });
    builder
      .addCase(eliminarServicioAdicional.fulfilled, (state, { payload }) => {
        state.serviciosAdicionales = state.serviciosAdicionales.filter(s => s._id !== payload);
      });
    builder
      .addCase(obtenerServiciosPorTipo.fulfilled, (state, { payload }) => {
        state.serviciosAdicionales = payload;
      });
    builder
      .addCase(obtenerServiciosPorProveedor.fulfilled, (state, { payload }) => {
        state.serviciosProveedor = payload;
      });
    builder
      .addCase(obtenerServiciosPorEspacio.fulfilled, (state, { payload }) => {
        state.serviciosPorEspacio[payload.espacioId] = payload.lista;
      });
    builder
      .addCase(obtenerServiciosPorPrecio.fulfilled, (state, { payload }) => {
        state.serviciosAdicionales = payload;
      });
    builder
      .addCase(obtenerServiciosPorUnidadPrecio.fulfilled, (state, { payload }) => {
        state.serviciosAdicionales = payload;
      });
    builder
      .addCase(obtenerServiciosDisponibles.fulfilled, (state, { payload }) => {
        state.serviciosAdicionales = payload;
      });
    builder
      .addCase(toggleServicioAdicional.fulfilled, (state, { payload }) => {
        const idx = state.serviciosAdicionales.findIndex(s => s._id === payload._id);
        if (idx !== -1) {
          state.serviciosAdicionales[idx] = payload;
        }
      });

    builder
      .addCase(asignarEspacioAServicio.fulfilled, (state, { payload }) => {
        const idx = state.serviciosAdicionales.findIndex(s => s._id === payload._id);
        if (idx !== -1) {
          state.serviciosAdicionales[idx] = payload;
        }
      });

    builder
      .addCase(eliminarEspacioDeServicio.fulfilled, (state, { payload }) => {
        const idx = state.serviciosAdicionales.findIndex(s => s._id === payload._id);
        if (idx !== -1) {
          state.serviciosAdicionales[idx] = payload;
        }
      });

    builder
      .addCase(obtenerServiciosParaAprobacion.fulfilled, (state, { payload }) => {
        state.serviciosAdicionales = payload;
      });

    builder
      .addCase(filtrarServiciosAdicionales.fulfilled, (state, { payload }) => {
        state.serviciosAdicionales = payload;
      });
    builder
      .addCase(crearSolicitudServicio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(crearSolicitudServicio.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.solicitudesServicios.unshift(payload);
      })
      .addCase(crearSolicitudServicio.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    builder
      .addCase(responderSolicitudServicio.fulfilled, (state, { payload }) => {
        const idx = state.solicitudesServicios.findIndex(q => q._id === payload._id);
        if (idx !== -1) {
          state.solicitudesServicios[idx] = payload;
        }
      });
  }
});

export const { setPagination, clearError, clearProveedores } = proveedoresSlice.actions;
export default proveedoresSlice.reducer;
