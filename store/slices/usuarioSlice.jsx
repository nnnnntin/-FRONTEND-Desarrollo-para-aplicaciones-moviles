import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const obtenerUsuarios = createAsyncThunk(
  'usuario/obtenerTodos',
  async ({ skip = 0, limit = 10 }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios?skip=${skip}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      console.log('Usuarios obtenidos:', data);

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
        signal,                 // 👈  permite cancelar
      });

      // ⚠️  204/205 no traen cuerpo
      const hasBody = ![204, 205].includes(response.status);
      const data = hasBody ? await response.json() : null;

      if (!response.ok) {
        const errMsg =
          data?.message || data?.error || `Error ${response.status}`;
        return rejectWithValue(errMsg);
      }

      console.log('Usuario actualizado:', data);  
      // Si tu backend envía { data: usuario }, devuélvelo así:
      return data?.data ?? data;   // ← el usuario actualizado
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

      const bodyPayload = {
        tipo: 'tarjeta_credito',
        numero: metodoPago.numeroTarjeta.replace(/\s/g, ''),
        titular: metodoPago.nombreTitular,
        fechaVencimiento: metodoPago.fechaExpiracion,
        cvc: metodoPago.cvc,
        predeterminado: metodoPago.predeterminado || false,
        ...(metodoPago.marca && { marca: metodoPago.marca }),
      };

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
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Error al agregar método de pago');
      }

      const result = await response.json();

      return Array.isArray(result.usuario.metodoPago)
        ? result.usuario.metodoPago
        : [];
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

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

  // Actualizar en la lista
  const index = state.usuarios.findIndex(
    u => (u.id || u._id) === updatedId
  );
  if (index !== -1) {
    state.usuarios[index] = updatedUser;
  }

  // Actualizar si está seleccionado
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