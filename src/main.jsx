import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppRouter from './Router/AppRouter'
import { Provider } from 'react-redux'
import store from './Redux/Store/Store'
import './index.css'
import { createTheme, ThemeProvider } from '@mui/material'

// PAra que los breakpoints coincidan con Tailwind
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
});


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AppRouter />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
