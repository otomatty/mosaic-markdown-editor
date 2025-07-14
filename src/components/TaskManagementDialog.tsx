import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Fab,
  Toolbar,
  Badge,
  Backdrop,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  ViewKanban as ViewKanbanIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as TodoIcon,
  Schedule as InProgressIcon,
  Pause as OnHoldIcon,
  Cancel as CancelledIcon,
  Person as PersonIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Task, TaskStatus, TaskPriority, TaskBoard, TaskColumn } from '../types/electron'

const useStyles = makeStyles()((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      width: '90vw',
      maxWidth: '1200px',
      height: '80vh',
      maxHeight: '800px',
    },
  },
  dialogContent: {
    padding: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  toolbar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1, 2),
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  kanbanBoard: {
    flex: 1,
    display: 'flex',
    overflow: 'auto',
    padding: theme.spacing(2),
    gap: theme.spacing(2),
  },
  kanbanColumn: {
    minWidth: 280,
    maxWidth: 320,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
  },
  kanbanColumnHeader: {
    padding: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kanbanColumnContent: {
    flex: 1,
    padding: theme.spacing(1),
    overflow: 'auto',
    minHeight: 400,
  },
  taskCard: {
    marginBottom: theme.spacing(1),
    cursor: 'pointer',
    '&:hover': {
      boxShadow: theme.shadows[2],
    },
  },
  taskCardDragging: {
    opacity: 0.5,
  },
  taskCardContent: {
    padding: theme.spacing(1.5),
    '&:last-child': {
      paddingBottom: theme.spacing(1.5),
    },
  },
  taskTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  },
  taskDescription: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  taskMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
  },
  priorityChip: {
    fontSize: '0.7rem',
    height: 20,
  },
  statusIcon: {
    fontSize: '1rem',
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  loadingBackdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}))

interface TaskManagementDialogProps {
  open: boolean
  onClose: () => void
}

type ViewMode = 'kanban' | 'list'

const TaskManagementDialog: React.FC<TaskManagementDialogProps> = ({
  open,
  onClose,
}) => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  // State management
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentBoard, setCurrentBoard] = useState<TaskBoard | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([])
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority[]>([])
  const [assigneeFilter, setAssigneeFilter] = useState('')

  // Load data
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const taskList = await window.electronAPI.tasks.getAll()
      setTasks(taskList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadBoards = useCallback(async () => {
    try {
      const boardList = await window.electronAPI.taskBoards.getAll()
      
      // Set default board if none selected
      if (!currentBoard && boardList.length > 0) {
        const defaultBoard = boardList.find(b => b.isDefault) || boardList[0]
        setCurrentBoard(defaultBoard)
      }
    } catch (err) {
      console.error('Failed to load boards:', err)
    }
  }, [currentBoard])

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadTasks()
      loadBoards()
    }
  }, [open, loadTasks, loadBoards])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(task.status)
      const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(task.priority)
      const matchesAssignee = !assigneeFilter || task.assignee?.toLowerCase().includes(assigneeFilter.toLowerCase())
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
    })
  }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter])

  // Group tasks by status for kanban
  const tasksByStatus = useMemo(() => {
    const grouped = filteredTasks.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = []
      }
      acc[task.status].push(task)
      return acc
    }, {} as Record<TaskStatus, Task[]>)
    
    return grouped
  }, [filteredTasks])

  // Task handlers
  const handleTaskCreate = () => {
    // TODO: Implement task creation
    console.log('Create task')
  }

  const handleTaskEdit = (task: Task) => {
    // TODO: Implement task editing
    console.log('Edit task:', task)
  }

  const handleTaskDelete = async (task: Task) => {
    if (!window.confirm(t('taskManagement.confirmDeleteTask', { title: task.title }))) {
      return
    }

    try {
      setLoading(true)
      const result = await window.electronAPI.tasks.delete(task.id)
      if (result.success) {
        loadTasks()
      } else {
        setError(result.error || 'Failed to delete task')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      setLoading(true)
      const result = await window.electronAPI.tasks.updateStatus(taskId, newStatus)
      if (result.success) {
        loadTasks()
      } else {
        setError(result.error || 'Failed to update task status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status')
    } finally {
      setLoading(false)
    }
  }

  // Priority colors
  const getPriorityColor = (priority: TaskPriority): 'error' | 'warning' | 'info' | 'success' | 'default' => {
    switch (priority) {
      case 'urgent': return 'error'
      case 'high': return 'warning'
      case 'normal': return 'info'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  // Status icons
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return <TodoIcon className={classes.statusIcon} />
      case 'in-progress': return <InProgressIcon className={classes.statusIcon} />
      case 'completed': return <CheckCircleIcon className={classes.statusIcon} />
      case 'on-hold': return <OnHoldIcon className={classes.statusIcon} />
      case 'cancelled': return <CancelledIcon className={classes.statusIcon} />
      default: return <TodoIcon className={classes.statusIcon} />
    }
  }

  // Default columns for kanban
  const defaultColumns: TaskColumn[] = [
    { id: 'todo', name: t('taskManagement.status.todo'), status: 'todo', order: 0, color: '#f3f4f6', taskIds: [] },
    { id: 'in-progress', name: t('taskManagement.status.inProgress'), status: 'in-progress', order: 1, color: '#dbeafe', taskIds: [] },
    { id: 'completed', name: t('taskManagement.status.completed'), status: 'completed', order: 2, color: '#dcfce7', taskIds: [] },
    { id: 'on-hold', name: t('taskManagement.status.onHold'), status: 'on-hold', order: 3, color: '#fef3c7', taskIds: [] },
    { id: 'cancelled', name: t('taskManagement.status.cancelled'), status: 'cancelled', order: 4, color: '#fee2e2', taskIds: [] },
  ]

  const columns = currentBoard?.columns || defaultColumns

  return (
    <DndProvider backend={HTML5Backend}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        fullWidth
        className={classes.dialog}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{t('taskManagement.title')}</Typography>
            <Box display="flex" gap={1}>
              <IconButton
                onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
                color={viewMode === 'kanban' ? 'primary' : 'default'}
              >
                <ViewKanbanIcon />
              </IconButton>
              <IconButton onClick={onClose}>
                <EditIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent className={classes.dialogContent}>
          {/* Toolbar */}
          <Toolbar className={classes.toolbar} variant="dense">
            <TextField
              size="small"
              placeholder={t('taskManagement.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon />,
              }}
              sx={{ minWidth: 200, mr: 2 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel>{t('taskManagement.status')}</InputLabel>
              <Select
                multiple
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus[])}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={t(`taskManagement.status.${value}`)} size="small" />
                    ))}
                  </Box>
                )}
              >
                {(['todo', 'in-progress', 'completed', 'on-hold', 'cancelled'] as TaskStatus[]).map((status) => (
                  <MenuItem key={status} value={status}>
                    {t(`taskManagement.status.${status}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel>{t('taskManagement.priority')}</InputLabel>
              <Select
                multiple
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TaskPriority[])}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={t(`taskManagement.priority.${value}`)} size="small" />
                    ))}
                  </Box>
                )}
              >
                {(['low', 'normal', 'high', 'urgent'] as TaskPriority[]).map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {t(`taskManagement.priority.${priority}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box flexGrow={1} />
            
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSearchQuery('')
                setStatusFilter([])
                setPriorityFilter([])
                setAssigneeFilter('')
              }}
              size="small"
            >
              {t('taskManagement.actions.clearFilters')}
            </Button>
          </Toolbar>
          
          {/* Main Content */}
          <div className={classes.mainContent}>
            {/* Kanban Board */}
            {viewMode === 'kanban' && (
              <div className={classes.kanbanBoard}>
                {columns.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    tasks={tasksByStatus[column.status] || []}
                    onTaskEdit={handleTaskEdit}
                    onTaskDelete={handleTaskDelete}
                    onTaskStatusChange={handleTaskStatusChange}
                    getPriorityColor={getPriorityColor}
                    getStatusIcon={getStatusIcon}
                  />
                ))}
              </div>
            )}
            
            {/* List View */}
            {viewMode === 'list' && (
              <Box p={2}>
                <Typography variant="h6" gutterBottom>
                  {t('taskManagement.taskList')}
                </Typography>
                {/* List view implementation would go here */}
              </Box>
            )}
          </div>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>
            {t('taskManagement.close')}
          </Button>
        </DialogActions>
        
        {/* Add Task FAB */}
        <Fab
          color="primary"
          aria-label="add"
          className={classes.fab}
          onClick={handleTaskCreate}
        >
          <AddIcon />
        </Fab>
        
        {/* Loading Backdrop */}
        {loading && (
          <Backdrop className={classes.loadingBackdrop} open={loading}>
            <CircularProgress color="inherit" />
          </Backdrop>
        )}
        
        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </Dialog>
    </DndProvider>
  )
}

// Kanban Column Component
interface KanbanColumnProps {
  column: TaskColumn
  tasks: Task[]
  onTaskEdit: (task: Task) => void
  onTaskDelete: (task: Task) => void
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void
  getPriorityColor: (priority: TaskPriority) => 'error' | 'warning' | 'info' | 'success' | 'default'
  getStatusIcon: (status: TaskStatus) => React.ReactNode
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  getPriorityColor,
  getStatusIcon,
}) => {
  const { classes } = useStyles()

  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item: { id: string }) => {
      onTaskStatusChange(item.id, column.status)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  return (
    <div
      ref={drop}
      className={classes.kanbanColumn}
      style={{
        backgroundColor: isOver ? column.color : undefined,
        opacity: isOver ? 0.8 : 1,
      }}
    >
      <div className={classes.kanbanColumnHeader}>
        <Box display="flex" alignItems="center" gap={1}>
          {getStatusIcon(column.status)}
          <Typography variant="subtitle2" fontWeight="bold">
            {column.name}
          </Typography>
          <Badge badgeContent={tasks.length} color="primary" />
        </Box>
      </div>
      
      <div className={classes.kanbanColumnContent}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onTaskEdit}
            onDelete={onTaskDelete}
            getPriorityColor={getPriorityColor}
          />
        ))}
      </div>
    </div>
  )
}

// Task Card Component
interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  getPriorityColor: (priority: TaskPriority) => 'error' | 'warning' | 'info' | 'success' | 'default'
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  getPriorityColor,
}) => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task.id },
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
        <Typography className={classes.taskTitle}>
          {task.title}
        </Typography>
        
        {task.description && (
          <Typography className={classes.taskDescription}>
            {task.description}
          </Typography>
        )}
        
        <div className={classes.taskMeta}>
          <Chip
            label={t(`taskManagement.priority.${task.priority}`)}
            size="small"
            color={getPriorityColor(task.priority)}
            className={classes.priorityChip}
          />
          
          {task.assignee && (
            <Chip
              icon={<PersonIcon />}
              label={task.assignee}
              size="small"
              variant="outlined"
              className={classes.priorityChip}
            />
          )}
          
          {task.dueDate && (
            <Chip
              icon={<DateRangeIcon />}
              label={new Date(task.dueDate).toLocaleDateString()}
              size="small"
              variant="outlined"
              className={classes.priorityChip}
            />
          )}
        </div>
      </CardContent>
      
      <CardActions>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(task) }}>
          <EditIcon />
        </IconButton>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(task) }}>
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  )
}

export default TaskManagementDialog