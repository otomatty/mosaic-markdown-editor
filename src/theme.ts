import { createTheme } from '@mui/material/styles'

// MUIのテーマを作成
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

export default theme 