import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const obtenerUsuarios = createAsyncThunk(
  'usuario/obtenerTodos',
  async ({ skip = 0, limit = 10 }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al obtener usuarios');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerUsuarioPorId = createAsyncThunk(
  'usuario/obtenerPorId',
  async (usuarioId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/${usuarioId}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al obtener usuario');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const actualizarUsuario = createAsyncThunk(
  'usuario/actualizar',
  async ({ usuarioId, datosActualizacion }, { getState, rejectWithValue, signal }) => {
    try {
      const { auth } = getState();
      const url = `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/${usuarioId}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosActualizacion),
        signal,
      });

      const hasBody = ![204, 205].includes(response.status);
      const data = hasBody ? await response.json() : null;

      if (!response.ok) {
        const errMsg =
          data?.message || data?.error || `Error ${response.status}`;
        return rejectWithValue(errMsg);
      }

      return data?.data ?? data;
    } catch (err) {
      return rejectWithValue(err.message || 'Error de conexión');
    }
  }
);

export const eliminarUsuario = createAsyncThunk(
  'usuario/eliminar',
  async (usuarioId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/${usuarioId}`,
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
        return rejectWithValue(data.message || 'Error al eliminar usuario');
      }

      return usuarioId;
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const cambiarRolUsuario = createAsyncThunk(
  'usuario/cambiarRol',
  async ({ usuarioId, nuevoRol }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/rol`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ usuarioId, nuevoRol }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al cambiar rol');
      }

      return { usuarioId, nuevoRol, ...data };
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const actualizarMembresiaUsuario = createAsyncThunk(
  'usuario/actualizarMembresia',
  async ({ usuarioId, membresiaData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/${usuarioId}/membresia`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(membresiaData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al actualizar membresía');
      }

      return { usuarioId, ...data };
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerUsuariosPorTipo = createAsyncThunk(
  'usuario/obtenerPorTipo',
  async (tipo, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/tipo/${tipo}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al obtener usuarios por tipo');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerMetodosPagoUsuario = createAsyncThunk(
  'usuario/obtenerMetodosPago',
  async (usuarioId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/${usuarioId}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al obtener métodos de pago');
      }

      const usuario = await response.json();

      return Array.isArray(usuario.metodoPago) ? usuario.metodoPago : [];
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const agregarMetodoPago = createAsyncThunk(
  'usuario/agregarMetodoPago',
  async ({ usuarioId, metodoPago }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      if (!usuarioId) {
        return rejectWithValue('ID de usuario requerido');
      }

      if (!auth?.token) {
        return rejectWithValue('Token de autenticación requerido');
      }

      const detectarMarcaTarjeta = (numero) => {
        const numeroLimpio = numero.replace(/\s/g, '');
        if (numeroLimpio.startsWith('4')) return 'visa';
        if (numeroLimpio.startsWith('5') ||
          (numeroLimpio.startsWith('2') &&
            parseInt(numeroLimpio.substring(0, 4)) >= 2221 &&
            parseInt(numeroLimpio.substring(0, 4)) <= 2720)) return 'mastercard';
        if (numeroLimpio.startsWith('34') || numeroLimpio.startsWith('37')) return 'american_express';
        if (numeroLimpio.startsWith('6')) return 'discover';
        return 'otro';
      };

      const bodyPayload = {
        predeterminado: Boolean(metodoPago.predeterminado || false),
        tipo: 'tarjeta_credito',
        numero: metodoPago.numeroTarjeta.replace(/\s/g, ''),
        titular: metodoPago.nombreTitular.trim(),
        fechaVencimiento: metodoPago.fechaExpiracion,
        cvc: metodoPago.cvc,
        marca: detectarMarcaTarjeta(metodoPago.numeroTarjeta)
      };

      const validarPayload = (payload) => {
        const errores = [];

        if (!payload.numero || !/^\d{13,19}$/.test(payload.numero)) {
          errores.push('El número de tarjeta debe tener entre 13 y 19 dígitos');
        }

        if (!payload.titular || payload.titular.length < 2 || payload.titular.length > 100) {
          errores.push('El titular debe tener entre 2 y 100 caracteres');
        }

        if (!payload.fechaVencimiento || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(payload.fechaVencimiento)) {
          errores.push('La fecha de vencimiento debe tener el formato MM/AA');
        }

        if (!payload.cvc || !/^\d{3,4}$/.test(payload.cvc)) {
          errores.push('El CVC debe tener 3 o 4 dígitos');
        }

        if (!['tarjeta_credito', 'tarjeta_debito'].includes(payload.tipo)) {
          errores.push('El tipo debe ser tarjeta_credito o tarjeta_debito');
        }

        if (!['visa', 'mastercard', 'american_express', 'discover', 'otro'].includes(payload.marca)) {
          errores.push('La marca debe ser una de las válidas');
        }

        return errores;
      };

      const erroresValidacion = validarPayload(bodyPayload);
      if (erroresValidacion.length > 0) {
        return rejectWithValue(`Datos inválidos: ${erroresValidacion.join(', ')}`);
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/${usuarioId}/metodos-pago`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyPayload),
        }
      );

      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          try {
            errorData = await response.json();
          } catch (parseError) {
            errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
          }
        } else {
          const textResponse = await response.text();
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }

        const errorMessage = errorData.details
          ? `Error de validación: ${JSON.stringify(errorData.details)}`
          : errorData.message ||
          errorData.error ||
          errorData.msg ||
          `Error del servidor: ${response.status} ${response.statusText}`;

        return rejectWithValue(errorMessage);
      }

      const result = await response.json();

      if (!result.usuario) {
        return rejectWithValue('Respuesta del servidor inválida: falta campo usuario');
      }

      const metodosPago = Array.isArray(result.usuario.metodoPago) ? result.usuario.metodoPago : [];

      return metodosPago;

    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return rejectWithValue('Error de conexión: Verifica tu conexión a internet');
      }

      if (error.name === 'AbortError') {
        return rejectWithValue('Solicitud cancelada: Tiempo de espera agotado');
      }

      return rejectWithValue(`Error de red: ${error.message}`);
    }
  }
);

const validarDatosMetodoPago = (metodoPagoData) => {
  const errores = [];

  if (!metodoPagoData.numeroTarjeta) {
    errores.push('Número de tarjeta es requerido');
  } else {
    const numeroLimpio = metodoPagoData.numeroTarjeta.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(numeroLimpio)) {
      errores.push('Número de tarjeta debe tener entre 13 y 19 dígitos');
    }
  }

  if (!metodoPagoData.nombreTitular) {
    errores.push('Nombre del titular es requerido');
  } else {
    const titular = metodoPagoData.nombreTitular.trim();
    if (titular.length < 2 || titular.length > 100) {
      errores.push('Nombre del titular debe tener entre 2 y 100 caracteres');
    }
  }

  if (!metodoPagoData.fechaExpiracion) {
    errores.push('Fecha de expiración es requerida');
  } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(metodoPagoData.fechaExpiracion)) {
    errores.push('Formato de fecha inválido (debe ser MM/AA con mes 01-12)');
  } else {
    const [mes, año] = metodoPagoData.fechaExpiracion.split('/');
    const fechaActual = new Date();
    const fechaTarjeta = new Date(2000 + parseInt(año), parseInt(mes) - 1);

    if (fechaTarjeta < fechaActual) {
      errores.push('La tarjeta está vencida');
    }
  }

  if (!metodoPagoData.cvc) {
    errores.push('CVC es requerido');
  } else if (!/^\d{3,4}$/.test(metodoPagoData.cvc)) {
    errores.push('CVC debe tener exactamente 3 o 4 dígitos');
  }

  return errores;
};

export const eliminarMetodoPago = createAsyncThunk(
  'usuario/eliminarMetodoPago',
  async ({ usuarioId, metodoId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/${usuarioId}/metodos-pago`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metodoPagoId: metodoId
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al eliminar método de pago');
      }

      const result = await response.json();

      return Array.isArray(result.usuario.metodoPago) ? result.usuario.metodoPago : [];
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const actualizarMetodoPagoPredeterminado = createAsyncThunk(
  'usuario/actualizarMetodoPredeterminado',
  async ({ usuarioId, metodoId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/${usuarioId}/metodos-pago/predeterminado`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metodoPagoId: metodoId
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al actualizar método predeterminado');
      }

      const result = await response.json();
      return Array.isArray(result.usuario.metodoPago) ? result.usuario.metodoPago : [];
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const crearEmpresaInmobiliaria = createAsyncThunk(
  'usuario/crearEmpresa',
  async ({ usuarioId, datosEmpresa }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/empresas-inmobiliarias`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            usuarioId,
            ...datosEmpresa
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al crear empresa inmobiliaria');
      }

      const empresa = await response.json();

      return empresa;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const crearProveedor = createAsyncThunk(
  'usuario/crearProveedor',
  async ({ usuarioId, datosProveedor }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/proveedores`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            usuarioId,
            ...datosProveedor
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al crear proveedor');
      }

      const proveedor = await response.json();

      return proveedor;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerEmpresaPorUsuario = createAsyncThunk(
  'usuario/obtenerEmpresaPorUsuario',
  async (usuarioId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/empresas-inmobiliarias/usuario/${usuarioId}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al obtener empresa');
      }

      const empresa = await response.json();
      return empresa;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const obtenerProveedorPorUsuario = createAsyncThunk(
  'usuario/obtenerProveedorPorUsuario',
  async (usuarioId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/proveedores/usuario/${usuarioId}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al obtener proveedor');
      }

      const proveedor = await response.json();
      return proveedor;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

const initialState = {
  usuarios: [],
  usuarioSeleccionado: null,
  oficinasPropias: [],
  serviciosContratados: [],
  serviciosOfrecidos: [],
  empresaAsociada: null,
  proveedorAsociado: null,
  metodosPago: [],
  loadingMetodosPago: false,
  errorMetodosPago: null,
  pagination: {
    skip: 0,
    limit: 10,
    total: 0,
  },
  loading: false,
  error: null,
  loadingDetalle: false,
  errorDetalle: null,
  loadingEmpresa: false,
  loadingProveedor: false,
};

const usuarioSlice = createSlice({
  name: 'usuario',
  initialState,
  reducers: {

    actualizarDatosUsuario: (state, action) => {
      const { tipoUsuario } = action.payload;

      if (tipoUsuario === 'cliente') {
        state.oficinasPropias = action.payload.oficinasPropias || state.oficinasPropias;
      } else if (tipoUsuario === 'usuario') {
        state.serviciosContratados = action.payload.serviciosContratados || state.serviciosContratados;
      } else if (tipoUsuario === 'proveedor') {
        state.serviciosOfrecidos = action.payload.serviciosOfrecidos || state.serviciosOfrecidos;
      }
    },
    actualizarOficinasPropias: (state, action) => {
      state.oficinasPropias = action.payload;
    },
    agregarOficinaPropia: (state, action) => {
      if (!state.oficinasPropias.includes(action.payload)) {
        state.oficinasPropias.push(action.payload);
      }
    },
    eliminarOficinaPropia: (state, action) => {
      state.oficinasPropias = state.oficinasPropias.filter(id => id !== action.payload);
    },
    actualizarServiciosContratados: (state, action) => {
      state.serviciosContratados = action.payload;
    },
    actualizarServiciosOfrecidos: (state, action) => {
      state.serviciosOfrecidos = action.payload;
    },
    seleccionarUsuario: (state, action) => {
      state.usuarioSeleccionado = action.payload;
    },
    limpiarUsuarioSeleccionado: (state) => {
      state.usuarioSeleccionado = null;
      state.empresaAsociada = null;
      state.proveedorAsociado = null;
    },
    setMetodosPago: (state, action) => {
      state.metodosPago = action.payload;
    },
    clearErrorMetodosPago: (state) => {
      state.errorMetodosPago = null;
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
      state.errorDetalle = null;
    },
    setEmpresaAsociada: (state, action) => {
      state.empresaAsociada = action.payload;
    },
    setProveedorAsociado: (state, action) => {
      state.proveedorAsociado = action.payload;
    },
    clearEmpresaAsociada: (state) => {
      state.empresaAsociada = null;
    },
    clearProveedorAsociado: (state) => {
      state.proveedorAsociado = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(obtenerUsuarios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerUsuarios.fulfilled, (state, action) => {
        state.loading = false;
        state.usuarios = action.payload.usuarios || action.payload;
        state.pagination.total = action.payload.total || state.usuarios.length;
      })
      .addCase(obtenerUsuarios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(obtenerUsuarioPorId.pending, (state) => {
        state.loadingDetalle = true;
        state.errorDetalle = null;
      })
      .addCase(obtenerUsuarioPorId.fulfilled, (state, action) => {
        state.loadingDetalle = false;
        state.usuarioSeleccionado = action.payload;
      })
      .addCase(obtenerUsuarioPorId.rejected, (state, action) => {
        state.loadingDetalle = false;
        state.errorDetalle = action.payload;
      })
      .addCase(actualizarUsuario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(actualizarUsuario.fulfilled, (state, action) => {
        state.loading = false;

        const updatedUser = action.payload;
        const updatedId = updatedUser.id || updatedUser._id;

        const index = state.usuarios.findIndex(
          u => (u.id || u._id) === updatedId
        );
        if (index !== -1) {
          state.usuarios[index] = updatedUser;
        }

        const selectedId = state.usuarioSeleccionado?.id || state.usuarioSeleccionado?._id;
        if (selectedId === updatedId) {
          state.usuarioSeleccionado = updatedUser;
        }
      })
      .addCase(actualizarUsuario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(eliminarUsuario.fulfilled, (state, action) => {
        state.usuarios = state.usuarios.filter(u => (u.id || u._id) !== action.payload);
        if (state.usuarioSeleccionado && (state.usuarioSeleccionado.id || state.usuarioSeleccionado._id) === action.payload) {
          state.usuarioSeleccionado = null;
        }
      })
      .addCase(cambiarRolUsuario.fulfilled, (state, action) => {
        const { usuarioId, nuevoRol } = action.payload;
        const index = state.usuarios.findIndex(u => (u.id || u._id) === usuarioId);
        if (index !== -1) {
          state.usuarios[index].tipoUsuario = nuevoRol;
        }
      })
      .addCase(obtenerUsuariosPorTipo.fulfilled, (state, action) => {
        state.usuarios = action.payload;
      })
      .addCase(obtenerMetodosPagoUsuario.pending, (state) => {
        state.loadingMetodosPago = true;
        state.errorMetodosPago = null;
      })
      .addCase(obtenerMetodosPagoUsuario.fulfilled, (state, action) => {
        state.loadingMetodosPago = false;
        state.metodosPago = action.payload;
      })
      .addCase(obtenerMetodosPagoUsuario.rejected, (state, action) => {
        state.loadingMetodosPago = false;
        state.errorMetodosPago = action.payload;
      })
      .addCase(agregarMetodoPago.pending, (state) => {
        state.loadingMetodosPago = true;
        state.errorMetodosPago = null;
      })
      .addCase(agregarMetodoPago.fulfilled, (state, action) => {
        state.loadingMetodosPago = false;
        state.metodosPago = action.payload;
      })
      .addCase(agregarMetodoPago.rejected, (state, action) => {
        state.loadingMetodosPago = false;
        state.errorMetodosPago = action.payload;
      })
      .addCase(eliminarMetodoPago.pending, (state) => {
        state.loadingMetodosPago = true;
        state.errorMetodosPago = null;
      })
      .addCase(eliminarMetodoPago.fulfilled, (state, action) => {
        state.loadingMetodosPago = false;
        state.metodosPago = action.payload;
      })
      .addCase(eliminarMetodoPago.rejected, (state, action) => {
        state.loadingMetodosPago = false;
        state.errorMetodosPago = action.payload;
      })
      .addCase(actualizarMetodoPagoPredeterminado.pending, (state) => {
        state.loadingMetodosPago = true;
        state.errorMetodosPago = null;
      })
      .addCase(actualizarMetodoPagoPredeterminado.fulfilled, (state, action) => {
        state.loadingMetodosPago = false;
        state.metodosPago = action.payload;
      })
      .addCase(actualizarMetodoPagoPredeterminado.rejected, (state, action) => {
        state.loadingMetodosPago = false;
        state.errorMetodosPago = action.payload;
      })
      .addCase(crearEmpresaInmobiliaria.pending, (state) => {
        state.loadingEmpresa = true;
        state.error = null;
      })
      .addCase(crearEmpresaInmobiliaria.fulfilled, (state, action) => {
        state.loadingEmpresa = false;
        state.empresaAsociada = action.payload;
      })
      .addCase(crearEmpresaInmobiliaria.rejected, (state, action) => {
        state.loadingEmpresa = false;
        state.error = action.payload;
      })
      .addCase(crearProveedor.pending, (state) => {
        state.loadingProveedor = true;
        state.error = null;
      })
      .addCase(crearProveedor.fulfilled, (state, action) => {
        state.loadingProveedor = false;
        state.proveedorAsociado = action.payload;
      })
      .addCase(crearProveedor.rejected, (state, action) => {
        state.loadingProveedor = false;
        state.error = action.payload;
      })
      .addCase(obtenerEmpresaPorUsuario.pending, (state) => {
        state.loadingEmpresa = true;
        state.error = null;
      })
      .addCase(obtenerEmpresaPorUsuario.fulfilled, (state, action) => {
        state.loadingEmpresa = false;
        state.empresaAsociada = action.payload;
      })
      .addCase(obtenerEmpresaPorUsuario.rejected, (state, action) => {
        state.loadingEmpresa = false;
        state.error = action.payload;
      })
      .addCase(obtenerProveedorPorUsuario.pending, (state) => {
        state.loadingProveedor = true;
        state.error = null;
      })
      .addCase(obtenerProveedorPorUsuario.fulfilled, (state, action) => {
        state.loadingProveedor = false;
        state.proveedorAsociado = action.payload;
      })
      .addCase(obtenerProveedorPorUsuario.rejected, (state, action) => {
        state.loadingProveedor = false;
        state.error = action.payload;
      });
  }
});

export const {
  actualizarDatosUsuario,
  actualizarOficinasPropias,
  agregarOficinaPropia,
  eliminarOficinaPropia,
  actualizarServiciosContratados,
  actualizarServiciosOfrecidos,
  seleccionarUsuario,
  limpiarUsuarioSeleccionado,
  setMetodosPago,
  clearErrorMetodosPago,
  setPaginacion,
  setLoading,
  setError,
  clearError,
  setEmpresaAsociada,
  setProveedorAsociado,
  clearEmpresaAsociada,
  clearProveedorAsociado
} = usuarioSlice.actions;

export default usuarioSlice.reducer;