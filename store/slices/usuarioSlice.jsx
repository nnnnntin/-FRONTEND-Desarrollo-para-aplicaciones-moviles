import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    logueado: false,
    tipoUsuario: null,
    datosUsuario: null,
    oficinasPropias: []
}

export const usuarioSlice = createSlice({
    name: "usuario",
    initialState,
    reducers:{
        loguear: (state, action) => {
            state.logueado = true;
            state.tipoUsuario = action.payload?.tipoUsuario || 'usuario';
            state.datosUsuario = action.payload?.datosUsuario || null;
            state.oficinasPropias = action.payload?.oficinasPropias || [];
        },
        desloguear: state => {
            state.logueado = false;
            state.tipoUsuario = null;
            state.datosUsuario = null;
            state.oficinasPropias = [];
        },
        actualizarOficinasPropias: (state, action) => {
            state.oficinasPropias = action.payload;
        }
    }
})

export const {loguear, desloguear, actualizarOficinasPropias} = usuarioSlice.actions;

export default usuarioSlice.reducer;