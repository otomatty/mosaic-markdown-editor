import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles()((theme) => ({
  previewPanel: {
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
  preview: {
    flexGrow: 1,
    padding: theme.spacing(2),
    overflow: 'auto',
    backgroundColor: theme.palette.background.paper,
    minHeight: 0, // 重要：これがないとスクロールコンテンツが縮まない
    
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
    '& p': {
      marginBottom: theme.spacing(1),
      lineHeight: 1.6,
    },
    '& pre': {
      backgroundColor: theme.palette.grey[100],
      padding: theme.spacing(1),
      borderRadius: theme.shape.borderRadius,
      overflow: 'auto',
      fontFamily: 'monospace',
    },
    '& code': {
      backgroundColor: theme.palette.grey[100],
      padding: theme.spacing(0.5),
      borderRadius: theme.shape.borderRadius,
      fontFamily: 'monospace',
    },
    '& blockquote': {
      borderLeft: `4px solid ${theme.palette.primary.main}`,
      paddingLeft: theme.spacing(2),
      marginLeft: 0,
      fontStyle: 'italic',
    },
    '& ul, & ol': {
      paddingLeft: theme.spacing(3),
    },
    '& li': {
      marginBottom: theme.spacing(0.5),
    },
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
}))

interface PreviewPanelProps {
  htmlContent: string
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ htmlContent }) => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  return (
    <div className={classes.previewPanel}>
      <div className={classes.panelHeader}>
        {t('preview.title')}
      </div>
      <div className={classes.preview}>
        {htmlContent ? (
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        ) : (
          <div className={classes.emptyState}>
            {t('preview.noContent')}
          </div>
        )}
      </div>
    </div>
  )
}

export default PreviewPanel 