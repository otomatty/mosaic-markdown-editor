import React from 'react'
import { useDrop } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles()((theme) => ({
  dropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    borderRadius: theme.shape.borderRadius,
    border: `2px dashed ${theme.palette.primary.main}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  dropText: {
    color: theme.palette.primary.main,
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
  },
  dropHint: {
    color: theme.palette.text.secondary,
    fontSize: '0.9rem',
  },
}))

interface DropTargetOverlayProps {
  onFilesDrop: (files: File[]) => void
}

const DropTargetOverlay: React.FC<DropTargetOverlayProps> = ({ onFilesDrop }) => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: NativeTypes.FILE,
    drop: (item: { files: File[] }) => {
      const validFiles = item.files.filter((file) => {
        const validExtensions = ['.md', '.markdown', '.txt']
        return validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
      })
      
      if (validFiles.length > 0) {
        onFilesDrop(validFiles)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  const isVisible = isOver && canDrop

  return (
    <div 
      ref={drop}
      className={classes.dropOverlay}
      style={{
        display: isVisible ? 'flex' : 'none',
      }}
    >
      <div className={classes.dropText}>
        {t('dragDrop.dropFilesHere')}
      </div>
      <div className={classes.dropHint}>
        {t('dragDrop.supportedFormats')}
      </div>
    </div>
  )
}

export default DropTargetOverlay 