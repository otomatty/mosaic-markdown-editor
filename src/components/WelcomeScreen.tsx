import React from 'react'
import { Typography, Button, Box } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles()((theme) => ({
  welcomeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  subtitle: {
    marginBottom: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  buttonContainer: {
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  hint: {
    color: theme.palette.text.secondary,
    fontSize: '0.9rem',
    fontStyle: 'italic',
  },
}))

interface WelcomeScreenProps {
  onCreateNew: () => void
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateNew }) => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  const handleOpenFile = async () => {
    try {
      await window.electronAPI.openFile()
    } catch (error) {
      console.error('Error opening file:', error)
    }
  }

  const handleCreateNew = () => {
    onCreateNew()
  }

  return (
    <Box className={classes.welcomeContainer}>
      <Typography variant="h3" className={classes.title}>
        {t('welcome.title')}
      </Typography>
      <Typography variant="h6" className={classes.subtitle}>
        {t('welcome.subtitle')}
      </Typography>
      <Box className={classes.buttonContainer}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenFile}
          size="large"
        >
          {t('welcome.openFile')}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleCreateNew}
          size="large"
        >
          {t('welcome.createNew')}
        </Button>
      </Box>
      <Typography className={classes.hint}>
        {t('welcome.dragDropHint')}
      </Typography>
    </Box>
  )
}

export default WelcomeScreen 