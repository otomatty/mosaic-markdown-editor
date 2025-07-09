import React from 'react'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

interface NotificationSnackbarProps {
  open: boolean
  message: string
  severity: 'success' | 'error' | 'info' | 'warning'
  onClose: () => void
}

const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  open,
  message,
  severity,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}

export default NotificationSnackbar 