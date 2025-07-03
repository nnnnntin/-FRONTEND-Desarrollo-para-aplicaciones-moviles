import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

export const loadLanguagePreference = createAsyncThunk(
  'configuration/loadLanguagePreference',
  async () => {
    try {
      const savedLanguage = await SecureStore.getItemAsync('idiomaPreferido');
      return savedLanguage || 'es'; 
    } catch (error) {
      return 'es'; 
    }
  }
);

export const saveLanguagePreference = createAsyncThunk(
  'configuration/saveLanguagePreference',
  async (language) => {
    try {
      await SecureStore.setItemAsync('idiomaPreferido', language);
      return language;
    } catch (error) {
      throw error;
    }
  }
);

const initialState = {
  idiomaPreferido: 'es',
  isLoading: false,
  error: null,
};

const configurationSlice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {
    setIdiomaPreferido: (state, action) => {
      state.idiomaPreferido = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLanguagePreference.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadLanguagePreference.fulfilled, (state, action) => {
        state.isLoading = false;
        state.idiomaPreferido = action.payload;
      })
      .addCase(loadLanguagePreference.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(saveLanguagePreference.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveLanguagePreference.fulfilled, (state, action) => {
        state.isLoading = false;
        state.idiomaPreferido = action.payload;
      })
      .addCase(saveLanguagePreference.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { setIdiomaPreferido, clearError } = configurationSlice.actions;

export default configurationSlice.reducer;