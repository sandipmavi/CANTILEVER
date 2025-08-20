const { tasks } = require('../middleware/auth');

let taskIdCounter = 1;

// Get all tasks for user
const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      status, 
      priority, 
      category, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    // Get user's tasks
    let userTasks = Array.from(tasks.values()).filter(task => task.userId === userId);

    // Apply filters
    if (status && status !== 'all') {
      userTasks = userTasks.filter(task => task.status === status);
    }

    if (priority && priority !== 'all') {
      userTasks = userTasks.filter(task => task.priority === priority);
    }

    if (category && category !== 'all') {
      userTasks = userTasks.filter(task => task.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      userTasks = userTasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort tasks
    userTasks.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'priority') {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
      }

      if (sortBy === 'dueDate') {
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      }

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTasks = userTasks.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        tasks: paginatedTasks,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(userTasks.length / limit),
          count: paginatedTasks.length,
          totalTasks: userTasks.length
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single task
const getTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user.id;

    const task = tasks.get(taskId);
    
    if (!task || task.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create task
const createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, status, priority, category, dueDate } = req.body;

    const taskId = taskIdCounter++;
    const task = {
      id: taskId,
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      category: category || '',
      dueDate: dueDate || null,
      completedAt: null,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tasks.set(taskId, task);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user.id;

    const task = tasks.get(taskId);
    
    if (!task || task.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const { title, description, status, priority, category, dueDate } = req.body;

    // Update task fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) {
      task.status = status;
      // Update completedAt when status changes
      if (status === 'completed' && !task.completedAt) {
        task.completedAt = new Date().toISOString();
      } else if (status !== 'completed') {
        task.completedAt = null;
      }
    }
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    if (dueDate !== undefined) task.dueDate = dueDate;

    task.updatedAt = new Date().toISOString();
    tasks.set(taskId, task);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user.id;

    const task = tasks.get(taskId);
    
    if (!task || task.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    tasks.delete(taskId);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get task statistics
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userTasks = Array.from(tasks.values()).filter(task => task.userId === userId);

    const stats = {
      total: userTasks.length,
      completed: userTasks.filter(task => task.status === 'completed').length,
      inProgress: userTasks.filter(task => task.status === 'in-progress').length,
      todo: userTasks.filter(task => task.status === 'todo').length,
      overdue: userTasks.filter(task => 
        task.dueDate && 
        new Date(task.dueDate) < new Date() && 
        task.status !== 'completed'
      ).length,
      highPriority: userTasks.filter(task => task.priority === 'high' && task.status !== 'completed').length,
      mediumPriority: userTasks.filter(task => task.priority === 'medium' && task.status !== 'completed').length,
      lowPriority: userTasks.filter(task => task.priority === 'low' && task.status !== 'completed').length
    };

    stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
};