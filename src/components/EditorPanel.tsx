import React from 'react'
import TextField from '@mui/material/TextField'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles()((theme) => ({
  editorPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%', // 親コンテナの高さを継承
    minHeight: 0,   // flexboxで重要
  },
  panelHeader: {
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.grey[100],
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontWeight: 'bold',
    flexShrink: 0, // ヘッダーのサイズを固定
  },
  editor: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0, // 重要：これがないとTextFieldが縮まない
    
    '& .MuiInputBase-root': {
      height: '100%',
      alignItems: 'flex-start',
      display: 'flex',
      flexDirection: 'column',
    },
    '& .MuiInputBase-input': {
      height: '100% !important',
      overflow: 'auto !important',
      resize: 'none', // リサイズハンドルを無効化
      minHeight: 'unset', // デフォルトの最小高さを解除
      lineHeight: 1.6,
      fontFamily: 'monospace',
      fontSize: '14px',
    },
    '& .MuiOutlinedInput-root': {
      height: '100%',
      alignItems: 'flex-start',
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
  },
}))

interface EditorPanelProps {
  content: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const EditorPanel: React.FC<EditorPanelProps> = ({ content, onChange }) => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  return (
    <div className={classes.editorPanel}>
      <div className={classes.panelHeader}>
        {t('editor.title')}
      </div>
      <div className={classes.editor}>
        <TextField
          fullWidth
          multiline
          variant="outlined"
          value={content}
          onChange={onChange}
          placeholder={t('editor.placeholder')}
          InputProps={{
            style: {
              height: '100%',
              alignItems: 'flex-start',
            },
          }}
        />
      </div>
    </div>
  )
}

export default EditorPanel 