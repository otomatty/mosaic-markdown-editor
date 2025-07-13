import React, { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MenuIcon from '@mui/icons-material/Menu'
import LanguageIcon from '@mui/icons-material/Language'
import SettingsIcon from '@mui/icons-material/Settings'
import HelpIcon from '@mui/icons-material/Help'

import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'
import FileMenu from '../FileMenu'

const useStyles = makeStyles()((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  toolbar: {
    // ツールバーの基本スタイル
  },
}))

interface AppHeaderProps {
  currentFilePath: string | null
  hasUnsavedChanges: boolean
  fileMenuAnchor: HTMLElement | null
  onFileMenuOpen: (event: React.MouseEvent<HTMLElement>) => void
  onFileMenuClose: () => void
  onOpenFile: () => void
  onSaveFile: () => void
  onSaveAsFile: () => void
  onCreateNew: () => void

  onHelpDialogOpen?: () => void
  onTemplateManagementOpen?: () => void
  onThemeEditorOpen?: () => void
  onTaskBoardOpen?: () => void
}

const AppHeader: React.FC<AppHeaderProps> = ({
  currentFilePath,
  hasUnsavedChanges,
  fileMenuAnchor,
  onFileMenuOpen,
  onFileMenuClose,
  onOpenFile,
  onSaveFile,
  onSaveAsFile,
  onCreateNew,
  onHelpDialogOpen,
  onTemplateManagementOpen,
  onThemeEditorOpen,
  onTaskBoardOpen,
}) => {
  const { classes } = useStyles()
  const { t, i18n } = useTranslation()
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState<HTMLElement | null>(null)
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState<HTMLElement | null>(null)

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageMenuAnchor(event.currentTarget)
  }

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null)
  }

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language)
    handleLanguageMenuClose()
  }

  const handleSettingsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsMenuAnchor(event.currentTarget)
  }

  const handleSettingsMenuClose = () => {
    setSettingsMenuAnchor(null)
  }





  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <Button
          color="inherit"
          onClick={onFileMenuOpen}
          startIcon={<MenuIcon />}
          sx={{ mr: 2 }}
        >
          {t('menu.file')}
        </Button>
        <FileMenu
          anchorEl={fileMenuAnchor}
          open={Boolean(fileMenuAnchor)}
          onClose={onFileMenuClose}
          onOpenFile={onOpenFile}
          onSaveFile={onSaveFile}
          onSaveAsFile={onSaveAsFile}
          onCreateNew={onCreateNew}
        />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {t('appName')}
          {currentFilePath && (
            <Typography variant="subtitle2" component="span" sx={{ ml: 2, opacity: 0.7 }}>
              - {currentFilePath}
              {hasUnsavedChanges && (
                <Typography component="span" sx={{ ml: 1, color: 'warning.main' }}>
                  ({t('editor.hasUnsavedChanges')})
                </Typography>
              )}
            </Typography>
          )}
        </Typography>
        <Button
          color="inherit"
          onClick={handleLanguageMenuOpen}
          startIcon={<LanguageIcon />}
          sx={{ ml: 2 }}
        >
          {t('menu.language')}
        </Button>
        <Menu
          anchorEl={languageMenuAnchor}
          open={Boolean(languageMenuAnchor)}
          onClose={handleLanguageMenuClose}
        >
          <MenuItem onClick={() => handleLanguageChange('ja')}>
            {t('menu.japanese')}
          </MenuItem>
          <MenuItem onClick={() => handleLanguageChange('en')}>
            {t('menu.english')}
          </MenuItem>
        </Menu>
        <Button
          color="inherit"
          onClick={handleSettingsMenuOpen}
          startIcon={<SettingsIcon />}
          sx={{ ml: 1 }}
        >
          {t('menu.settings')}
        </Button>
        <Menu
          anchorEl={settingsMenuAnchor}
          open={Boolean(settingsMenuAnchor)}
          onClose={handleSettingsMenuClose}
        >
          {onTemplateManagementOpen && (
            <MenuItem onClick={() => { onTemplateManagementOpen(); handleSettingsMenuClose(); }}>
              <SettingsIcon sx={{ mr: 1 }} />
              {t('menu.templateManagement')}
            </MenuItem>
          )}
          {onThemeEditorOpen && (
            <MenuItem onClick={() => { onThemeEditorOpen(); handleSettingsMenuClose(); }}>
              <SettingsIcon sx={{ mr: 1 }} />
              {t('menu.themeEditor')}
            </MenuItem>
          )}
          {onTaskBoardOpen && (
            <MenuItem onClick={() => { onTaskBoardOpen(); handleSettingsMenuClose(); }}>
              <SettingsIcon sx={{ mr: 1 }} />
              {t('menu.taskManagement')}
            </MenuItem>
          )}

        </Menu>
        {onHelpDialogOpen && (
          <Button
            color="inherit"
            onClick={onHelpDialogOpen}
            startIcon={<HelpIcon />}
            sx={{ ml: 1 }}
          >
            {t('menu.help')}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default AppHeader 