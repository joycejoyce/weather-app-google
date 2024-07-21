// src/App.jsx
import React from 'react';
import Map from './Map';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Map />
    </ThemeProvider>
  );
}

export default App;
