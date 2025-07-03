import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const loginUsuario = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error en el login');
      }

      return data;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

export const signupUsuario = createAsyncThunk(
  'auth/signup',
  async ({ tipoUsuario, username, email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tipoUsuario, username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error en el registro');
      }

      return data;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Error de conexión');
    }
  }
);

const initialState = {
  isLoggedIn: false,
  token: null,
  usuario: null,
  tipoUsuario: null,
  esAdmin: false,
  permisos: [],

  loading: false,
  error: null,

  notificacionesActivas: true,
  idiomaPreferido: 'es',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loguear: (state, action) => {
      state.isLoggedIn = true;
      state.usuario = action.payload.usuario;
      state.token = action.payload.token;
      state.tipoUsuario = action.payload.tipoUsuario || action.payload.usuario?.tipoUsuario;

      if (state.tipoUsuario === 'administrador') {
        state.esAdmin = true;
        state.permisos = ['all'];
      }
    },

    desloguear: (state) => {
      return {
        ...initialState,
        notificacionesActivas: state.notificacionesActivas,
        idiomaPreferido: state.idiomaPreferido,
      };
    },

    actualizarUsuario: (state, action) => {
      if (state.isLoggedIn) {
        const usuarioActualizado = action.payload;
        state.usuario = usuarioActualizado;
        state.tipoUsuario = usuarioActualizado.tipoUsuario;

        if (usuarioActualizado.tipoUsuario === 'administrador') {
          state.esAdmin = true;
          state.permisos = ['all'];
        } else {
          state.esAdmin = false;
          state.permisos = [];
        }

      }
    },

    actualizarToken: (state, action) => {
      state.token = action.payload;
    },

    toggleNotificaciones: (state) => {
      state.notificacionesActivas = !state.notificacionesActivas;
    },

    cambiarIdioma: (state, action) => {
      state.idiomaPreferido = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUsuario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUsuario.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;

        const { usuario, token } = action.payload;

        if (!usuario) {
          state.error = 'Error: datos de usuario no encontrados';
          state.isLoggedIn = false;
          return;
        }

        state.usuario = usuario;
        state.token = token;
        state.tipoUsuario = usuario.tipoUsuario || usuario.role;

        if (state.tipoUsuario === 'administrador') {
          state.esAdmin = true;
          state.permisos = ['all'];
        }
      })
      .addCase(loginUsuario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isLoggedIn = false;
      })

      .addCase(signupUsuario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUsuario.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(signupUsuario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  loguear,
  desloguear,
  actualizarUsuario,
  actualizarToken,
  toggleNotificaciones,
  cambiarIdioma,
  setLoading,
  setError,
  clearError
} = authSlice.actions;

export default authSlice.reducer;