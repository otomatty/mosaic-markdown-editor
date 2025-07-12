import React, { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Divider
} from '@mui/material'
import {
  Search as SearchIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Preview as PreviewIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import type { Template, TemplateCategory } from '../types/electron'

const useStyles = makeStyles()((theme) => ({
  dialogContent: {
    padding: theme.spacing(3),
    height: '70vh',
    display: 'flex',
    flexDirection: 'column',
  },
  searchSection: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
  },
  mainContent: {
    flexGrow: 1,
    display: 'flex',
    gap: theme.spacing(3),
    minHeight: 0,
  },
  templatesSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  templatesList: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: theme.spacing(1),
  },
  previewSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  templateCard: {
    marginBottom: theme.spacing(2),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    },
  },
  selectedCard: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '& .MuiCardContent-root': {
      color: theme.palette.primary.contrastText,
    },
  },
  templatePreview: {
    flexGrow: 1,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    lineHeight: 1.6,
  },
  noPreview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    color: theme.palette.text.secondary,
    gap: theme.spacing(1),
  },
  categoryChip: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  emptyState: {
    textAlign: 'center',
    color: theme.palette.text.secondary,
    padding: theme.spacing(4),
  },
}))

interface TemplateSelectionDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (template: Template) => void
  onCreateEmpty: () => void
}

const TemplateSelectionDialog: React.FC<TemplateSelectionDialogProps> = ({
  open,
  onClose,
  onSelect,
  onCreateEmpty,
}) => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // テンプレート一覧の読み込み
  useEffect(() => {
    const loadTemplates = async () => {
      if (!open) return
      
      setIsLoading(true)
      try {
        const allTemplates = await window.electronAPI.templates.getAll()
        setTemplates(allTemplates)
      } catch (error) {
        console.error('Failed to load templates:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTemplates()
  }, [open])

  // フィルタリングされたテンプレート一覧
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [templates, searchQuery, selectedCategory])

  // カテゴリ一覧
  const categories: { value: TemplateCategory | 'all'; label: string }[] = [
    { value: 'all', label: t('templates.categories.all') },
    { value: 'general', label: t('templates.categories.general') },
    { value: 'document', label: t('templates.categories.document') },
    { value: 'blog', label: t('templates.categories.blog') },
    { value: 'technical', label: t('templates.categories.technical') },
    { value: 'meeting', label: t('templates.categories.meeting') },
    { value: 'project', label: t('templates.categories.project') },
    { value: 'personal', label: t('templates.categories.personal') },
    { value: 'other', label: t('templates.categories.other') },
  ]

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
  }

  const handleConfirmSelection = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate)
    }
  }

  const handleCreateEmpty = () => {
    onCreateEmpty()
  }

  const handleClose = () => {
    setSelectedTemplate(null)
    setSearchQuery('')
    setSelectedCategory('all')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {t('templates.selectTemplate')}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent className={classes.dialogContent}>
        {/* 検索・フィルター部分 */}
        <Box className={classes.searchSection}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('templates.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>{t('templates.category')}</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | 'all')}
              label={t('templates.category')}
            >
              {categories.map(category => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* メインコンテンツ */}
        <Box className={classes.mainContent}>
          {/* テンプレート一覧 */}
          <Paper className={classes.templatesSection}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('templates.availableTemplates')}
              </Typography>
              <Divider />
            </Box>
            <Box className={classes.templatesList}>
              {isLoading ? (
                <Box className={classes.emptyState}>
                  <Typography>{t('common.loading')}</Typography>
                </Box>
              ) : filteredTemplates.length === 0 ? (
                <Box className={classes.emptyState}>
                  <DescriptionIcon sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {t('templates.noTemplatesFound')}
                  </Typography>
                  <Typography variant="body2">
                    {t('templates.noTemplatesFoundDescription')}
                  </Typography>
                </Box>
              ) : (
                filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`${classes.templateCard} ${
                      selectedTemplate?.id === template.id ? classes.selectedCard : ''
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {template.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {template.description}
                      </Typography>
                      <Box mt={1}>
                        <Chip
                          label={t(`templates.categories.${template.category}`)}
                          size="small"
                          color="primary"
                          variant="outlined"
                          className={classes.categoryChip}
                        />
                        {template.tags.map(tag => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                            className={classes.categoryChip}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Paper>

          {/* プレビュー部分 */}
          <Paper className={classes.previewSection}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                <PreviewIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('templates.preview')}
              </Typography>
              <Divider />
            </Box>
            <Box className={classes.templatePreview}>
              {selectedTemplate ? (
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {selectedTemplate.content}
                </pre>
              ) : (
                <Box className={classes.noPreview}>
                  <PreviewIcon sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {t('templates.selectToPreview')}
                  </Typography>
                  <Typography variant="body2">
                    {t('templates.selectToPreviewDescription')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCreateEmpty} color="inherit">
          {t('templates.createEmpty')}
        </Button>
        <Button onClick={handleClose} color="inherit">
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleConfirmSelection}
          variant="contained"
          color="primary"
          disabled={!selectedTemplate}
        >
          {t('templates.useTemplate')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TemplateSelectionDialog 