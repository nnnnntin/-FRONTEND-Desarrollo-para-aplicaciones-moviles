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
  async ({ usuarioId, datosActualizacion }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/${usuarioId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosActualizacion),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Error al actualizar usuario');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
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
      console.log('🏦 Obteniendo métodos de pago para usuario:', usuarioId);
      
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
      console.log('🏦 Métodos de pago recibidos:', usuario.metodoPago);
      
      return usuario.metodoPago || [];
    } catch (error) {
      console.error('Error en obtenerMetodosPagoUsuario:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const agregarMetodoPago = createAsyncThunk(
  'usuario/agregarMetodoPago',
  async ({ usuarioId, metodoPago }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      console.log('🏦 Agregando método de pago:', metodoPago);
      
      
      const responseGet = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/${usuarioId}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!responseGet.ok) {
        throw new Error('Error al obtener usuario actual');
      }

      const usuarioActual = await responseGet.json();
      const metodosPagoActuales = usuarioActual.metodoPago || [];

      
      
      let nuevosMetodosPago = [...metodosPagoActuales];
      
      if (metodoPago.predeterminado || metodosPagoActuales.length === 0) {
        nuevosMetodosPago = metodosPagoActuales.map(mp => ({
          ...mp,
          predeterminado: false
        }));
        metodoPago.predeterminado = true;
      }

      
      const nuevoMetodo = {
        ...metodoPago,
        id: `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      
      nuevosMetodosPago.push(nuevoMetodo);

      
      const responseUpdate = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/${usuarioId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metodoPago: nuevosMetodosPago
          }),
        }
      );

      if (!responseUpdate.ok) {
        const errorData = await responseUpdate.json();
        return rejectWithValue(errorData.message || 'Error al agregar método de pago');
      }

      const usuarioActualizado = await responseUpdate.json();
      console.log('✅ Método de pago agregado exitosamente');
      
      return usuarioActualizado.metodoPago;
    } catch (error) {
      console.error('Error en agregarMetodoPago:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);


export const eliminarMetodoPago = createAsyncThunk(
  'usuario/eliminarMetodoPago',
  async ({ usuarioId, metodoId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      console.log('🗑️ Eliminando método de pago:', metodoId);
      
      
      const responseGet = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/${usuarioId}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!responseGet.ok) {
        throw new Error('Error al obtener usuario actual');
      }

      const usuarioActual = await responseGet.json();
      const metodosPagoActuales = usuarioActual.metodoPago || [];

      
      const nuevosMetodosPago = metodosPagoActuales.filter(mp => 
        (mp.id || mp._id) !== metodoId
      );

      
      const metodoEliminado = metodosPagoActuales.find(mp => (mp.id || mp._id) === metodoId);
      if (metodoEliminado?.predeterminado && nuevosMetodosPago.length > 0) {
        nuevosMetodosPago[0].predeterminado = true;
      }

      
      const responseUpdate = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/${usuarioId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metodoPago: nuevosMetodosPago
          }),
        }
      );

      if (!responseUpdate.ok) {
        const errorData = await responseUpdate.json();
        return rejectWithValue(errorData.message || 'Error al eliminar método de pago');
      }

      const usuarioActualizado = await responseUpdate.json();
      console.log('✅ Método de pago eliminado exitosamente');
      
      return usuarioActualizado.metodoPago;
    } catch (error) {
      console.error('Error en eliminarMetodoPago:', error);
      return rejectWithValue('Error de conexión');
    }
  }
);


export const actualizarMetodoPagoPredeterminado = createAsyncThunk(
  'usuario/actualizarMetodoPredeterminado',
  async ({ usuarioId, metodoId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      
      const responseGet = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/${usuarioId}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!responseGet.ok) {
        throw new Error('Error al obtener usuario actual');
      }

      const usuarioActual = await responseGet.json();
      const metodosPagoActuales = usuarioActual.metodoPago || [];

      
      const nuevosMetodosPago = metodosPagoActuales.map(mp => ({
        ...mp,
        predeterminado: (mp.id || mp._id) === metodoId
      }));

      
      const responseUpdate = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v1/usuarios/${usuarioId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metodoPago: nuevosMetodosPago
          }),
        }
      );

      if (!responseUpdate.ok) {
        const errorData = await responseUpdate.json();
        return rejectWithValue(errorData.message || 'Error al actualizar método predeterminado');
      }

      const usuarioActualizado = await responseUpdate.json();
      return usuarioActualizado.metodoPago;
    } catch (error) {
      console.error('Error en actualizarMetodoPagoPredeterminado:', error);
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
        
        const index = state.usuarios.findIndex(u => (u.id || u._id) === (action.payload.id || action.payload._id));
        if (index !== -1) {
          state.usuarios[index] = action.payload;
        }
        
        if (state.usuarioSeleccionado && (state.usuarioSeleccionado.id || state.usuarioSeleccionado._id) === (action.payload.id || action.payload._id)) {
          state.usuarioSeleccionado = action.payload;
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
  clearError
} = usuarioSlice.actions;

export default usuarioSlice.reducer;