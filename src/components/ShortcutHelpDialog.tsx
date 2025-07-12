import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'

interface ShortcutHelpDialogProps {
  open: boolean
  onClose: () => void
}

const useStyles = makeStyles()((theme) => ({
  dialogContent: {
    padding: theme.spacing(3),
    minWidth: '400px',
    [theme.breakpoints.down('sm')]: {
      minWidth: 'auto',
      padding: theme.spacing(2),
    },
  },
  shortcutItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  shortcutKeys: {
    display: 'flex',
    gap: theme.spacing(0.5),
  },
  keyChip: {
    fontSize: '0.75rem',
    height: '24px',
    fontFamily: 'monospace',
    backgroundColor: theme.palette.mode === 'dark' 
      ? theme.palette.grey[700] 
      : theme.palette.grey[200],
    color: theme.palette.text.primary,
  },
  sectionTitle: {
    margin: theme.spacing(2, 0, 1, 0),
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  description: {
    color: theme.palette.text.secondary,
    flex: 1,
    marginRight: theme.spacing(2),
  },
}))

const ShortcutHelpDialog: React.FC<ShortcutHelpDialogProps> = ({ open, onClose }) => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const shortcuts = [
    {
      category: 'file',
      items: [
        { keys: ['Ctrl/⌘', 'N'], description: t('help.shortcuts.newFile') },
        { keys: ['Ctrl/⌘', 'O'], description: t('help.shortcuts.openFile') },
        { keys: ['Ctrl/⌘', 'S'], description: t('help.shortcuts.saveFile') },
      ]
    },
    {
      category: 'general',
      items: [
        { keys: ['F1'], description: t('help.shortcuts.showHelp') },
      ]
    }
  ]

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        {t('help.title')}
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {t('help.description')}
        </Typography>
        
        {shortcuts.map((section) => (
          <Box key={section.category}>
            <Typography variant="h6" className={classes.sectionTitle}>
              {t(`help.categories.${section.category}`)}
            </Typography>
            {section.items.map((shortcut, index) => (
              <div key={index} className={classes.shortcutItem}>
                <Typography variant="body2" className={classes.description}>
                  {shortcut.description}
                </Typography>
                <div className={classes.shortcutKeys}>
                  {shortcut.keys.map((key, keyIndex) => (
                    <Chip
                      key={keyIndex}
                      label={key}
                      size="small"
                      className={classes.keyChip}
                    />
                  ))}
                </div>
              </div>
            ))}
          </Box>
        ))}
        
        <Divider style={{ margin: '16px 0' }} />
        
        <Typography variant="body2" color="textSecondary">
          {t('help.note')}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t('help.close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ShortcutHelpDialog 