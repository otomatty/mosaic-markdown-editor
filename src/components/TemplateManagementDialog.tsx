import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Paper,
  Fab,
  InputAdornment,
  Tooltip,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Preview as PreviewIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'
import { marked } from 'marked'
import type { Template, TemplateCategory } from '../types/electron'

const useStyles = makeStyles()((theme) => ({
  dialogContent: {
    padding: 0,
    height: '70vh',
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
  },
  mainContainer: {
    display: 'flex',
    flexGrow: 1,
    height: '100%',
  },
  sidebar: {
    width: '350px',
    borderRight: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  sidebarContent: {
    flexGrow: 1,
    overflow: 'auto',
  },
  contentArea: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  formContainer: {
    padding: theme.spacing(2),
    flexGrow: 1,
    overflow: 'auto',
  },
  previewContainer: {
    padding: theme.spacing(2),
    flexGrow: 1,
    overflow: 'auto',
    backgroundColor: theme.palette.background.default,
  },
  templateList: {
    padding: 0,
  },
  templateItem: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  selectedTemplate: {
    backgroundColor: theme.palette.action.selected,
  },
  emptyState: {
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  previewContent: {
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
    '& p': {
      marginBottom: theme.spacing(1),
    },
    '& ul, & ol': {
      paddingLeft: theme.spacing(3),
    },
    '& code': {
      backgroundColor: theme.palette.grey[100],
      padding: theme.spacing(0.5),
      borderRadius: theme.shape.borderRadius,
      fontFamily: 'monospace',
    },
    '& pre': {
      backgroundColor: theme.palette.grey[100],
      padding: theme.spacing(1),
      borderRadius: theme.shape.borderRadius,
      overflow: 'auto',
    },
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
  },
  fabContainer: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}))

interface TemplateManagementDialogProps {
  open: boolean
  onClose: () => void
}

interface TemplateFormData {
  name: string
  description: string
  category: TemplateCategory
  content: string
  tags: string[]
}

type ViewMode = 'list' | 'form' | 'preview'

const TemplateManagementDialog: React.FC<TemplateManagementDialogProps> = ({
  open,
  onClose,
}) => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  
  // State management
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all')
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    category: 'general',
    content: '',
    tags: [],
  })
  const [newTag, setNewTag] = useState('')

  // Categories for filter
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

  // Load templates from API
  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const templateList = await window.electronAPI.templates.getAll()
      setTemplates(templateList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load templates on mount
  useEffect(() => {
    if (open) {
      loadTemplates()
    }
  }, [open, loadTemplates])

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [templates, searchQuery, selectedCategory])

  // Handle template selection
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    setViewMode('preview')
    setIsEditing(false)
    setIsCreating(false)
  }

  // Handle create new template
  const handleCreateNew = () => {
    setFormData({
      name: '',
      description: '',
      category: 'general',
      content: '',
      tags: [],
    })
    setSelectedTemplate(null)
    setViewMode('form')
    setIsCreating(true)
    setIsEditing(false)
  }

  // Handle edit template
  const handleEdit = (template: Template) => {
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      content: template.content,
      tags: template.tags,
    })
    setSelectedTemplate(template)
    setViewMode('form')
    setIsEditing(true)
    setIsCreating(false)
  }

  // Handle delete template
  const handleDelete = async (template: Template) => {
    if (!window.confirm(t('templateManagement.confirmDelete', { name: template.name }))) {
      return
    }

    try {
      setLoading(true)
      const result = await window.electronAPI.templates.delete(template.id)
      if (result.success) {
        setSuccess(t('templateManagement.deleteSuccess'))
        loadTemplates()
        if (selectedTemplate?.id === template.id) {
          setSelectedTemplate(null)
          setViewMode('list')
        }
      } else {
        setError(result.error || 'Failed to delete template')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template')
    } finally {
      setLoading(false)
    }
  }

  // Handle save template
  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError(t('templateManagement.nameRequired'))
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const templateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        content: formData.content,
        tags: formData.tags,
        isBuiltIn: false,
      }

      let result
      if (isEditing && selectedTemplate) {
        result = await window.electronAPI.templates.update(selectedTemplate.id, templateData)
      } else {
        result = await window.electronAPI.templates.create(templateData)
      }

      if (result.success) {
        setSuccess(isEditing ? t('templateManagement.updateSuccess') : t('templateManagement.createSuccess'))
        loadTemplates()
        setViewMode('list')
        setIsEditing(false)
        setIsCreating(false)
        setSelectedTemplate(null)
      } else {
        setError(result.error || 'Failed to save template')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template')
    } finally {
      setLoading(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setViewMode('list')
    setIsEditing(false)
    setIsCreating(false)
    setSelectedTemplate(null)
  }

  // Handle form input changes
  const handleInputChange = (field: keyof TemplateFormData, value: string | TemplateCategory) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle tag management
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  // Generate preview HTML
  const previewHtml = useMemo(() => {
    const content = selectedTemplate?.content || formData.content
    if (!content) return ''
    
    try {
      marked.setOptions({
        breaks: true,
        gfm: true,
      })
      
      const result = marked(content)
      return typeof result === 'string' ? result : ''
    } catch (error) {
      return `<p>Preview error: ${error instanceof Error ? error.message : 'Unknown error'}</p>`
    }
  }, [selectedTemplate?.content, formData.content])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {t('templateManagement.title')}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent className={classes.dialogContent}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Box className={classes.mainContainer}>
          {/* Sidebar */}
          <Box className={classes.sidebar}>
            <Box className={classes.sidebarHeader}>
              <TextField
                fullWidth
                placeholder={t('templates.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth>
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
            
            <Box className={classes.sidebarContent}>
              {loading ? (
                <Box className={classes.emptyState}>
                  <Typography>{t('common.loading')}</Typography>
                </Box>
              ) : filteredTemplates.length === 0 ? (
                <Box className={classes.emptyState}>
                  <Typography>{t('templates.noTemplatesFound')}</Typography>
                  <Typography variant="body2">
                    {t('templates.noTemplatesFoundDescription')}
                  </Typography>
                </Box>
              ) : (
                <List className={classes.templateList}>
                  {filteredTemplates.map((template) => (
                    <ListItem
                      key={template.id}
                      component="button"
                      onClick={() => handleTemplateSelect(template)}
                      className={`${classes.templateItem} ${
                        selectedTemplate?.id === template.id ? classes.selectedTemplate : ''
                      }`}
                    >
                      <ListItemText
                        primary={template.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {template.description}
                            </Typography>
                            <Box className={classes.chipContainer}>
                              <Chip
                                label={t(`templates.categories.${template.category}`)}
                                size="small"
                                variant="outlined"
                              />
                              {template.tags.slice(0, 2).map(tag => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                              {template.tags.length > 2 && (
                                <Chip
                                  label={`+${template.tags.length - 2}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title={t('common.edit')}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(template)
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(template)
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Box>
          
          {/* Content Area */}
          <Box className={classes.contentArea}>
            {viewMode === 'list' ? (
              <Box className={classes.emptyState}>
                <Typography variant="h6" gutterBottom>
                  {t('templateManagement.selectTemplate')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('templateManagement.selectTemplateDescription')}
                </Typography>
              </Box>
            ) : viewMode === 'form' ? (
              <Box className={classes.formContainer}>
                <Typography variant="h6" gutterBottom>
                  {isCreating ? t('templateManagement.createTemplate') : t('templateManagement.editTemplate')}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        label={t('templateManagement.templateName')}
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel>{t('templates.category')}</InputLabel>
                        <Select
                          value={formData.category}
                          onChange={(e) => handleInputChange('category', e.target.value as TemplateCategory)}
                          label={t('templates.category')}
                        >
                          {categories.filter(cat => cat.value !== 'all').map(category => (
                            <MenuItem key={category.value} value={category.value}>
                              {category.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                  
                  <Box>
                    <TextField
                      fullWidth
                      label={t('templateManagement.description')}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      multiline
                      rows={2}
                    />
                  </Box>
                  
                  <Box>
                    <TextField
                      fullWidth
                      label={t('templateManagement.content')}
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      multiline
                      rows={10}
                      placeholder={t('templateManagement.contentPlaceholder')}
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('templateManagement.tags')}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <TextField
                        size="small"
                        placeholder={t('templateManagement.addTag')}
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleAddTag}
                        disabled={!newTag.trim()}
                      >
                        {t('common.add')}
                      </Button>
                    </Box>
                    <Box className={classes.chipContainer}>
                      {formData.tags.map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          onDelete={() => handleRemoveTag(tag)}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box display="flex" gap={2}>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={loading}
                      startIcon={<SaveIcon />}
                    >
                      {isCreating ? t('common.create') : t('common.save')}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      startIcon={<CancelIcon />}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setViewMode('preview')}
                      startIcon={<PreviewIcon />}
                    >
                      {t('templates.preview')}
                    </Button>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box className={classes.previewContainer}>
                <Typography variant="h6" gutterBottom>
                  {t('templates.preview')}
                  {selectedTemplate && (
                    <Typography variant="subtitle2" color="text.secondary">
                      {selectedTemplate.name}
                    </Typography>
                  )}
                </Typography>
                
                <Paper elevation={1} sx={{ p: 2, minHeight: '300px' }}>
                  <Box
                    className={classes.previewContent}
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </Paper>
                
                {selectedTemplate && (
                  <Box mt={2} display="flex" gap={2}>
                    <Button
                      variant="outlined"
                      onClick={() => handleEdit(selectedTemplate)}
                      startIcon={<EditIcon />}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(selectedTemplate)}
                      startIcon={<DeleteIcon />}
                    >
                      {t('common.delete')}
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
        
        {/* Floating Action Button */}
        <Box className={classes.fabContainer}>
          <Fab
            color="primary"
            onClick={handleCreateNew}
            disabled={loading}
          >
            <AddIcon />
          </Fab>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default TemplateManagementDialog 