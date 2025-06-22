import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  tipoUsuario: null, 
  datosUsuario: null,
  
  oficinasPropias: [], 
  serviciosContratados: [], 
  serviciosOfrecidos: [],
  
  esAdmin: false,
  permisos: [],
  
  notificacionesActivas: true,
  idiomaPreferido: 'es',
  
  loading: false,
  error: null
};

const usuarioSlice = createSlice({
  name: 'usuario',
  initialState,
  reducers: {
    loguear: (state, action) => {
      state.isLoggedIn = true;
      state.tipoUsuario = action.payload.tipoUsuario;
      state.datosUsuario = action.payload.datosUsuario;
      
      if (action.payload.tipoUsuario === 'cliente') {
        state.oficinasPropias = action.payload.oficinasPropias || [1, 2];
      } else if (action.payload.tipoUsuario === 'usuario') {
        state.serviciosContratados = action.payload.serviciosContratados || [];
      } else if (action.payload.tipoUsuario === 'proveedor') {
        state.serviciosOfrecidos = action.payload.serviciosOfrecidos || [];
      } else if (action.payload.tipoUsuario === 'admin') {
        state.esAdmin = true;
        state.permisos = ['all'];
      }
    },
    
    desloguear: (state) => {
      return initialState;
    },
    
    actualizarDatosUsuario: (state, action) => {
      state.datosUsuario = { ...state.datosUsuario, ...action.payload };
    },
    
    actualizarOficinasPropias: (state, action) => {
      if (state.tipoUsuario === 'cliente') {
        state.oficinasPropias = action.payload;
      }
    },
    
    agregarOficinaPropia: (state, action) => {
      if (state.tipoUsuario === 'cliente' && !state.oficinasPropias.includes(action.payload)) {
        state.oficinasPropias.push(action.payload);
      }
    },
    
    eliminarOficinaPropia: (state, action) => {
      if (state.tipoUsuario === 'cliente') {
        state.oficinasPropias = state.oficinasPropias.filter(id => id !== action.payload);
      }
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
    }
  }
});

export const {
  loguear,
  desloguear,
  actualizarDatosUsuario,
  actualizarOficinasPropias,
  agregarOficinaPropia,
  eliminarOficinaPropia,
  toggleNotificaciones,
  cambiarIdioma,
  setLoading,
  setError
} = usuarioSlice.actions;

export default usuarioSlice.reducer;