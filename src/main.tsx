import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import App from './App.tsx'
import { ModalProvider } from './services/ModalContext.tsx';


const darkTheme = createTheme({
  palette: {
    mode: "dark"
  },
  typography: {
    // 👇 sets default font family for everything
    fontFamily: "'Ubuntu', sans-serif",
    // 👇 base font size (html <body> equivalent, in px)
    fontSize: 14,
  },  
  components: {
    MuiSelect: {
      styleOverrides: {
        root: {
          color: "white",
          backgroundColor: "#222",
          "&.MuiSvgIcon-root": { color: "white" },
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "white",
          "&.Mui-focused": { color: "#90caf9" },
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: "white"
        }
      }
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <ModalProvider>
      <App />
      </ModalProvider>
    </ThemeProvider>
  </StrictMode>,
)
