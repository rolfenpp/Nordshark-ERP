import { toast } from 'react-toastify'
import { colors } from '../theme/theme'

export const showSuccess = (message: string) => {
  toast.success(message, {
    position: "bottom-center",
    autoClose: 2000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      backgroundColor: colors.status.success,
      color: 'white',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  })
}

export const showError = (message: string) => {
  toast.error(message, {
    position: "bottom-center",
    autoClose: 3000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      backgroundColor: colors.status.error,
      color: 'white',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  })
}

export const showWarning = (message: string) => {
  toast.warning(message, {
    position: "bottom-center",
    autoClose: 3000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      backgroundColor: colors.status.warning,
      color: 'white',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  })
}

export const showInfo = (message: string) => {
  toast.info(message, {
    position: "bottom-center",
    autoClose: 3000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      backgroundColor: colors.status.info,
      color: 'white',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  })
}

export const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', options?: any) => {
  const defaultOptions = {
    position: "bottom-center" as const,
    autoClose: type === 'error' ? 5000 : 3000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options
  }

  switch (type) {
    case 'success':
      return toast.success(message, defaultOptions)
    case 'error':
      return toast.error(message, defaultOptions)
    case 'warning':
      return toast.warning(message, defaultOptions)
    case 'info':
      return toast.info(message, defaultOptions)
    default:
      return toast(message, defaultOptions)
  }
}
