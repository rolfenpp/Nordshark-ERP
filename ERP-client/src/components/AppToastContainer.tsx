import { useTheme } from '@mui/material/styles'
import { ToastContainer } from 'react-toastify'

export function AppToastContainer() {
  const theme = useTheme()

  return (
    <ToastContainer
      position="bottom-center"
      autoClose={3000}
      hideProgressBar={true}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme.palette.mode}
      closeButton={false}
      icon={false}
    />
  )
}
