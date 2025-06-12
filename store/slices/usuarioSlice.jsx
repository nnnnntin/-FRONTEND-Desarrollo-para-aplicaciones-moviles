import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    logueado: false
}

export const usuarioSlice = createSlice({
    name: "usuario",
    initialState,
    reducers:{
        loguear: state => {
            state.logueado = true;
        },
        desloguear: state => {
            state.logueado = false;
        }
    }
})


export const {loguear, desloguear} = usuarioSlice.actions;

export default usuarioSlice.reducer;
