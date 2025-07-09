import React from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import SaveIcon from '@mui/icons-material/Save'
import SaveAsIcon from '@mui/icons-material/SaveAs'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import { useTranslation } from 'react-i18next'

interface FileMenuProps {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  onOpenFile: () => void
  onSaveFile: () => void
  onSaveAsFile: () => void
  onCreateNew: () => void
}

const FileMenu: React.FC<FileMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onOpenFile,
  onSaveFile,
  onSaveAsFile,
  onCreateNew,
}) => {
  const { t } = useTranslation()

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
    >
      <MenuItem onClick={onCreateNew}>
        <NoteAddIcon sx={{ mr: 1 }} />
        {t('menu.newFile')}
      </MenuItem>
      <MenuItem onClick={onOpenFile}>
        <FolderOpenIcon sx={{ mr: 1 }} />
        {t('menu.openFile')}
      </MenuItem>
      <MenuItem onClick={onSaveFile}>
        <SaveIcon sx={{ mr: 1 }} />
        {t('menu.saveFile')}
      </MenuItem>
      <MenuItem onClick={onSaveAsFile}>
        <SaveAsIcon sx={{ mr: 1 }} />
        {t('menu.saveAsFile')}
      </MenuItem>
    </Menu>
  )
}

export default FileMenu 