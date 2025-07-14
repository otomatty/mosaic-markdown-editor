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
  Card,
  CardContent,
  CardActions,
  Stack,
  Divider,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Task as TaskIcon,
  DateRange as DateRangeIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { Task, TaskBoard, TaskStatus, TaskPriority } from '../types/electron'

const useStyles = makeStyles()((theme) => ({
  dialogContent: {
    padding: 0,
    height: '80vh',
    minHeight: '600px',
    display: 'flex',
    flexDirection: 'column',
  },
  mainContainer: {
    display: 'flex',
    height: '100%',
  },
  sidebar: {
    width: '300px',
    borderRight: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
  },
  sidebarHeader: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.grey[50],
  },
  sidebarContent: {
    flex: 1,
    overflow: 'auto',
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.default,
  },
  kanbanBoard: {
    display: 'flex',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    height: '100%',
    overflow: 'auto',
  },
  kanbanColumn: {
    flex: 1,
    minWidth: '280px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  kanbanColumnHeader: {
    padding: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.grey[50],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kanbanColumnContent: {
    flex: 1,
    padding: theme.spacing(1),
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  taskCard: {
    marginBottom: theme.spacing(1),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    },
  },
  taskCardDragging: {
    opacity: 0.5,
    transform: 'rotate(5deg)',
  },
  taskCardContent: {
    padding: theme.spacing(1.5),
    paddingBottom: `${theme.spacing(1.5)} !important`,
  },
  taskTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  },
  taskDescription: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    marginBottom: theme.spacing(1),
  },
  taskMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  priorityChip: {
    fontSize: '0.75rem',
    height: '20px',
  },
  dueDateChip: {
    fontSize: '0.75rem',
    height: '20px',
  },
  tagChip: {
    fontSize: '0.75rem',
    height: '20px',
  },
  dropZone: {
    minHeight: '100px',
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.text.secondary,
    margin: theme.spacing(1),
  },
  dropZoneActive: {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main + '0A',
    color: theme.palette.primary.main,
  },
  boardListItem: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  selectedBoardItem: {
    backgroundColor: theme.palette.action.selected,
  },
  searchBox: {
    margin: theme.spacing(1),
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  formContainer: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
  },
  errorContainer: {
    padding: theme.spacing(2),
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
    color: theme.palette.text.secondary,
  },
}))

interface TaskBoardDialogProps {
  open: boolean
  onClose: () => void
  currentFileContent?: string
  currentFilePath?: string | null
}

interface TaskFormData {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  tags: string[]
  dueDate: string
}

interface BoardFormData {
  name: string
  description: string
  filePath: string
}

type ViewMode = 'list' | 'board' | 'form' | 'task-form'

const TaskBoardDialog: React.FC<TaskBoardDialogProps> = ({
  open,
  onClose,
  currentFileContent,
  currentFilePath,
}) => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  // State management
  const [boards, setBoards] = useState<TaskBoard[]>([])
  const [selectedBoard, setSelectedBoard] = useState<TaskBoard | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form data
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    tags: [],
    dueDate: '',
  })

  const [boardFormData, setBoardFormData] = useState<BoardFormData>({
    name: '',
    description: '',
    filePath: currentFilePath || '',
  })

  // Task filtering and sorting
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')

  // Load boards on component mount
  const loadBoards = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const boardList = await window.electronAPI.tasks.getAllBoards()
      setBoards(boardList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task boards')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      loadBoards()
    }
  }, [open, loadBoards])

  // Get tasks for selected board
  const tasks = useMemo(() => {
    if (!selectedBoard) return []
    return selectedBoard.tasks || []
  }, [selectedBoard])

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tasks, searchQuery, statusFilter, priorityFilter])

  // Group tasks by status for kanban view
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      'todo': [],
      'in-progress': [],
      'done': [],
    }

    filteredTasks.forEach(task => {
      grouped[task.status].push(task)
    })

    return grouped
  }, [filteredTasks])

  // Board selection handler
  const handleBoardSelect = (board: TaskBoard) => {
    setSelectedBoard(board)
    setViewMode('board')
  }

  // Create new board
  const handleCreateBoard = () => {
    setBoardFormData({
      name: '',
      description: '',
      filePath: currentFilePath || '',
    })
    setViewMode('form')
  }

  // Edit existing board
  const handleEditBoard = (board: TaskBoard) => {
    setBoardFormData({
      name: board.name,
      description: board.description,
      filePath: board.filePath || '',
    })
    setSelectedBoard(board)
    setViewMode('form')
  }

  // Delete board
  const handleDeleteBoard = async (board: TaskBoard) => {
    if (!window.confirm(t('taskManagement.dialog.confirmDeleteBoard', { name: board.name }))) {
      return
    }

    try {
      setLoading(true)
      const result = await window.electronAPI.tasks.deleteBoard(board.id)
      if (result.success) {
        setSuccess(t('taskManagement.notifications.boardDeleted', { name: board.name }))
        loadBoards()
        if (selectedBoard?.id === board.id) {
          setSelectedBoard(null)
          setViewMode('list')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete board')
    } finally {
      setLoading(false)
    }
  }

  // Save board (create or update)
  const handleSaveBoard = async () => {
    if (!boardFormData.name.trim()) {
      setError(t('taskManagement.dialog.boardNameRequired'))
      return
    }

    try {
      setLoading(true)
      let result
      
      if (selectedBoard) {
        // Update existing board
        result = await window.electronAPI.tasks.updateBoard(selectedBoard.id, {
          name: boardFormData.name.trim(),
          description: boardFormData.description.trim(),
          filePath: boardFormData.filePath.trim() || null,
        })
      } else {
        // Create new board
        result = await window.electronAPI.tasks.createBoard({
          name: boardFormData.name.trim(),
          description: boardFormData.description.trim(),
          filePath: boardFormData.filePath.trim() || null,
          tasks: [],
        })
      }

      if (result.success && result.board) {
        setSuccess(selectedBoard 
          ? t('taskManagement.notifications.boardUpdated', { name: result.board.name })
          : t('taskManagement.notifications.boardCreated', { name: result.board.name })
        )
        loadBoards()
        setSelectedBoard(result.board)
        setViewMode('board')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save board')
    } finally {
      setLoading(false)
    }
  }

  // Create new task
  const handleCreateTask = () => {
    setTaskFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      tags: [],
      dueDate: '',
    })
    setSelectedTask(null)
    setViewMode('task-form')
  }

  // Edit existing task
  const handleEditTask = (task: Task) => {
    setTaskFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      tags: task.tags,
      dueDate: task.dueDate || '',
    })
    setSelectedTask(task)
    setViewMode('task-form')
  }

  // Delete task
  const handleDeleteTask = async (task: Task) => {
    if (!window.confirm(t('taskManagement.dialog.confirmDeleteTask', { title: task.title }))) {
      return
    }

    try {
      setLoading(true)
      const result = await window.electronAPI.tasks.deleteTask(task.id)
      if (result.success) {
        setSuccess(t('taskManagement.notifications.taskDeleted', { title: task.title }))
        loadBoards()
        // Refresh selected board
        if (selectedBoard) {
          const updatedBoard = await window.electronAPI.tasks.getBoardById(selectedBoard.id)
          if (updatedBoard) {
            setSelectedBoard(updatedBoard)
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    } finally {
      setLoading(false)
    }
  }

  // Save task (create or update)
  const handleSaveTask = async () => {
    if (!taskFormData.title.trim()) {
      setError(t('taskManagement.dialog.taskTitleRequired'))
      return
    }

    if (!selectedBoard) {
      setError('No board selected')
      return
    }

    try {
      setLoading(true)
      let result
      
      if (selectedTask) {
        // Update existing task
        result = await window.electronAPI.tasks.updateTask(selectedTask.id, {
          title: taskFormData.title.trim(),
          description: taskFormData.description.trim(),
          status: taskFormData.status,
          priority: taskFormData.priority,
          tags: taskFormData.tags,
          dueDate: taskFormData.dueDate || null,
        })
      } else {
        // Create new task
        result = await window.electronAPI.tasks.createTask(selectedBoard.id, {
          title: taskFormData.title.trim(),
          description: taskFormData.description.trim(),
          status: taskFormData.status,
          priority: taskFormData.priority,
          tags: taskFormData.tags,
          dueDate: taskFormData.dueDate || null,
          completedAt: null,
          lineNumber: null,
        })
      }

      if (result.success && result.task) {
        setSuccess(selectedTask 
          ? t('taskManagement.notifications.taskUpdated', { title: result.task.title })
          : t('taskManagement.notifications.taskCreated', { title: result.task.title })
        )
        loadBoards()
        // Refresh selected board
        if (selectedBoard) {
          const updatedBoard = await window.electronAPI.tasks.getBoardById(selectedBoard.id)
          if (updatedBoard) {
            setSelectedBoard(updatedBoard)
          }
        }
        setViewMode('board')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task')
    } finally {
      setLoading(false)
    }
  }

  // Handle task drag and drop
  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const result = await window.electronAPI.tasks.updateTask(taskId, { status: newStatus })
      if (result.success && result.task) {
        setSuccess(t('taskManagement.notifications.taskMoved', { 
          title: result.task.title, 
          status: t(`taskManagement.statuses.${newStatus}`)
        }))
        loadBoards()
        // Refresh selected board
        if (selectedBoard) {
          const updatedBoard = await window.electronAPI.tasks.getBoardById(selectedBoard.id)
          if (updatedBoard) {
            setSelectedBoard(updatedBoard)
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move task')
    }
  }

  // Extract tasks from markdown
  const handleExtractTasks = async () => {
    if (!currentFileContent) {
      setError('No file content available')
      return
    }

    try {
      setLoading(true)
      const result = await window.electronAPI.tasks.extractTasksFromMarkdown(currentFileContent)
      if (result.success) {
        if (result.tasks.length > 0) {
          setSuccess(t('taskManagement.notifications.tasksExtracted', { count: result.tasks.length }))
          // Create a new board with extracted tasks
          const boardResult = await window.electronAPI.tasks.createBoard({
            name: `Tasks from ${currentFilePath || 'Current File'}`,
            description: 'Auto-extracted tasks from Markdown file',
            filePath: currentFilePath || null,
            tasks: result.tasks,
          })
          if (boardResult.success && boardResult.board) {
            loadBoards()
            setSelectedBoard(boardResult.board)
            setViewMode('board')
          }
        } else {
          setSuccess(t('taskManagement.notifications.tasksExtractedNone'))
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract tasks')
    } finally {
      setLoading(false)
    }
  }

  // Cancel form editing
  const handleCancel = () => {
    if (selectedBoard) {
      setViewMode('board')
    } else {
      setViewMode('list')
    }
    setSelectedTask(null)
    setError(null)
  }

  // Handle form input changes
  const handleTaskFormChange = (field: keyof TaskFormData, value: string | TaskStatus | TaskPriority | string[]) => {
    setTaskFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBoardFormChange = (field: keyof BoardFormData, value: string) => {
    setBoardFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Add tag to task
  const handleAddTag = (tag: string) => {
    if (tag && !taskFormData.tags.includes(tag)) {
      setTaskFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  // Remove tag from task
  const handleRemoveTag = (tagToRemove: string) => {
    setTaskFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Get priority color
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  // Task Card Component
  const TaskCard: React.FC<{ task: Task; onEdit: (task: Task) => void; onDelete: (task: Task) => void }> = ({ 
    task, 
    onEdit, 
    onDelete 
  }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'task',
      item: { id: task.id, status: task.status },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    })

    return (
      <Card 
        ref={drag}
        className={`${classes.taskCard} ${isDragging ? classes.taskCardDragging : ''}`}
        onClick={() => onEdit(task)}
      >
        <CardContent className={classes.taskCardContent}>
          <Typography variant="subtitle2" className={classes.taskTitle}>
            {task.title}
          </Typography>
          {task.description && (
            <Typography variant="body2" className={classes.taskDescription}>
              {task.description}
            </Typography>
          )}
          <Box className={classes.taskMeta}>
            <Chip 
              size="small" 
              label={t(`taskManagement.priorities.${task.priority}`)}
              color={getPriorityColor(task.priority)}
              className={classes.priorityChip}
            />
            {task.dueDate && (
              <Chip 
                size="small" 
                label={task.dueDate}
                icon={<DateRangeIcon />}
                className={classes.dueDateChip}
              />
            )}
            {task.tags.map(tag => (
              <Chip 
                key={tag} 
                size="small" 
                label={tag}
                className={classes.tagChip}
              />
            ))}
          </Box>
        </CardContent>
        <CardActions>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(task); }}>
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>
    )
  }

  // Drop Zone Component
  const DropZone: React.FC<{ status: TaskStatus; children: React.ReactNode }> = ({ status, children }) => {
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: 'task',
      drop: (item: { id: string; status: TaskStatus }) => {
        if (item.status !== status) {
          handleTaskMove(item.id, status)
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    })

    return (
      <Box 
        ref={drop}
        className={`${classes.kanbanColumnContent} ${isOver && canDrop ? classes.dropZoneActive : ''}`}
      >
        {children}
      </Box>
    )
  }

  // Render sidebar content based on view mode
  const renderSidebarContent = () => {
    if (viewMode === 'list') {
      return (
        <>
          <Box className={classes.sidebarHeader}>
            <Typography variant="h6">{t('taskManagement.boards')}</Typography>
            <TextField
              size="small"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={classes.searchBox}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box className={classes.sidebarContent}>
            {loading ? (
              <Box className={classes.loadingContainer}>
                <Typography>{t('common.loading')}</Typography>
              </Box>
            ) : boards.length === 0 ? (
              <Box className={classes.emptyState}>
                <DashboardIcon style={{ fontSize: 48, marginBottom: 16 }} />
                <Typography variant="h6">{t('taskManagement.noBoards')}</Typography>
                <Typography variant="body2">{t('taskManagement.createBoard')}</Typography>
              </Box>
            ) : (
              <List>
                {boards.map(board => (
                  <ListItem
                    key={board.id}
                    className={classes.boardListItem}
                    onClick={() => handleBoardSelect(board)}
                  >
                    <ListItemText
                      primary={board.name}
                      secondary={`${board.tasks.length} ${t('taskManagement.tasks')}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton size="small" onClick={() => handleEditBoard(board)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteBoard(board)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </>
      )
    }

    if (viewMode === 'board' && selectedBoard) {
      return (
        <>
          <Box className={classes.sidebarHeader}>
            <Typography variant="h6">{selectedBoard.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedBoard.description}
            </Typography>
          </Box>
          <Box className={classes.sidebarContent}>
            <Stack spacing={2} sx={{ p: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleCreateTask}
                fullWidth
              >
                {t('taskManagement.createTask')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<TaskIcon />}
                onClick={handleExtractTasks}
                fullWidth
                disabled={!currentFileContent}
              >
                {t('taskManagement.actions.extractFromMarkdown')}
              </Button>
              <Divider />
              <FormControl size="small" fullWidth>
                <InputLabel>{t('taskManagement.status')}</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                >
                  <MenuItem value="all">{t('common.all')}</MenuItem>
                  <MenuItem value="todo">{t('taskManagement.statuses.todo')}</MenuItem>
                  <MenuItem value="in-progress">{t('taskManagement.statuses.in-progress')}</MenuItem>
                  <MenuItem value="done">{t('taskManagement.statuses.done')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>{t('taskManagement.priority')}</InputLabel>
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
                >
                  <MenuItem value="all">{t('common.all')}</MenuItem>
                  <MenuItem value="high">{t('taskManagement.priorities.high')}</MenuItem>
                  <MenuItem value="medium">{t('taskManagement.priorities.medium')}</MenuItem>
                  <MenuItem value="low">{t('taskManagement.priorities.low')}</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>
        </>
      )
    }

    return null
  }

  // Render main content based on view mode
  const renderMainContent = () => {
    if (viewMode === 'list') {
      return (
        <Box className={classes.emptyState}>
          <DashboardIcon style={{ fontSize: 64, marginBottom: 16 }} />
          <Typography variant="h5">{t('taskManagement.title')}</Typography>
          <Typography variant="body1" color="textSecondary">
            {t('taskManagement.createBoard')}
          </Typography>
        </Box>
      )
    }

    if (viewMode === 'board' && selectedBoard) {
      return (
        <DndProvider backend={HTML5Backend}>
          <Box className={classes.toolbar}>
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={() => setViewMode('list')}
            >
              {t('taskManagement.boards')}
            </Button>
            <Typography variant="h6">{selectedBoard.name}</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleCreateTask}
            >
              {t('taskManagement.createTask')}
            </Button>
          </Box>
          <Box className={classes.kanbanBoard}>
            {(['todo', 'in-progress', 'done'] as TaskStatus[]).map(status => (
              <Paper key={status} className={classes.kanbanColumn}>
                <Box className={classes.kanbanColumnHeader}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {t(`taskManagement.kanban.${status}Column`)}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={tasksByStatus[status].length} 
                    color="primary"
                  />
                </Box>
                <DropZone status={status}>
                  {tasksByStatus[status].length === 0 ? (
                    <Box className={classes.emptyState}>
                      <Typography variant="body2" color="textSecondary">
                        {t('taskManagement.kanban.emptyColumn')}
                      </Typography>
                    </Box>
                  ) : (
                    tasksByStatus[status].map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                      />
                    ))
                  )}
                </DropZone>
              </Paper>
            ))}
          </Box>
        </DndProvider>
      )
    }

    if (viewMode === 'form') {
      return (
        <Box className={classes.formContainer}>
          <Typography variant="h6">
            {selectedBoard ? t('taskManagement.editBoard') : t('taskManagement.createBoard')}
          </Typography>
          <TextField
            label={t('taskManagement.boardName')}
            value={boardFormData.name}
            onChange={(e) => handleBoardFormChange('name', e.target.value)}
            fullWidth
            required
          />
          <TextField
            label={t('taskManagement.boardDescription')}
            value={boardFormData.description}
            onChange={(e) => handleBoardFormChange('description', e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label={t('taskManagement.filePath')}
            value={boardFormData.filePath}
            onChange={(e) => handleBoardFormChange('filePath', e.target.value)}
            fullWidth
            helperText="Optional: Associate with a Markdown file"
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveBoard}
              disabled={loading}
            >
              {t('common.save')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
            >
              {t('common.cancel')}
            </Button>
          </Box>
        </Box>
      )
    }

    if (viewMode === 'task-form') {
      return (
        <Box className={classes.formContainer}>
          <Typography variant="h6">
            {selectedTask ? t('taskManagement.editTask') : t('taskManagement.createTask')}
          </Typography>
          <TextField
            label={t('taskManagement.taskTitle')}
            value={taskFormData.title}
            onChange={(e) => handleTaskFormChange('title', e.target.value)}
            fullWidth
            required
          />
          <TextField
            label={t('taskManagement.taskDescription')}
            value={taskFormData.description}
            onChange={(e) => handleTaskFormChange('description', e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
          <FormControl fullWidth>
            <InputLabel>{t('taskManagement.status')}</InputLabel>
            <Select
              value={taskFormData.status}
              onChange={(e) => handleTaskFormChange('status', e.target.value as TaskStatus)}
            >
              <MenuItem value="todo">{t('taskManagement.statuses.todo')}</MenuItem>
              <MenuItem value="in-progress">{t('taskManagement.statuses.in-progress')}</MenuItem>
              <MenuItem value="done">{t('taskManagement.statuses.done')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>{t('taskManagement.priority')}</InputLabel>
            <Select
              value={taskFormData.priority}
              onChange={(e) => handleTaskFormChange('priority', e.target.value as TaskPriority)}
            >
              <MenuItem value="high">{t('taskManagement.priorities.high')}</MenuItem>
              <MenuItem value="medium">{t('taskManagement.priorities.medium')}</MenuItem>
              <MenuItem value="low">{t('taskManagement.priorities.low')}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label={t('taskManagement.dueDate')}
            type="date"
            value={taskFormData.dueDate}
            onChange={(e) => handleTaskFormChange('dueDate', e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t('taskManagement.tags')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {taskFormData.tags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                />
              ))}
            </Box>
            <TextField
              size="small"
              placeholder={t('taskManagement.actions.addTag')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement
                  handleAddTag(target.value)
                  target.value = ''
                }
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveTask}
              disabled={loading}
            >
              {t('common.save')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
            >
              {t('common.cancel')}
            </Button>
          </Box>
        </Box>
      )
    }

    return null
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        style: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">{t('taskManagement.title')}</Typography>
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
          <Box className={classes.sidebar}>
            {renderSidebarContent()}
          </Box>
          
          <Box className={classes.contentArea}>
            {renderMainContent()}
          </Box>
        </Box>
        
        {viewMode === 'list' && (
          <Fab
            color="primary"
            className={classes.fab}
            onClick={handleCreateBoard}
          >
            <AddIcon />
          </Fab>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default TaskBoardDialog