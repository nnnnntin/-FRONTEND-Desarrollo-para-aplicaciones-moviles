import { applyMiddleware, combineReducers, legacy_createStore as createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-expo-dev-plugin";
import { thunk } from 'redux-thunk';
import authReducer from './slices/authSlice';
import configurationReducer from './slices/configurationSlice';
import espaciosReducer from './slices/espaciosSlice';
import membresiaReducer from './slices/membresiaSlice';
import notificacionesReducer from './slices/notificacionesSlice';
import proveedoresReducer from './slices/proveedoresSlice';
import reservasReducer from './slices/reservasSlice';
import usuarioReducer from './slices/usuarioSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  usuario: usuarioReducer,
  espacios: espaciosReducer,
  membresias: membresiaReducer,
  notificaciones: notificacionesReducer,
  reservas: reservasReducer,
  proveedores: proveedoresReducer,
  configuration: configurationReducer
});

const enhancer = composeWithDevTools(
  applyMiddleware(thunk)
);

export const store = createStore(rootReducer, enhancer);
