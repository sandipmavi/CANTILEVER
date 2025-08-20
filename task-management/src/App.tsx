import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import TaskCard from './components/Tasks/TaskCard';
import TaskModal from './components/Tasks/TaskModal';
import TaskFilters from './components/Tasks/TaskFilters';
import { Task } from './types';

const AuthWrapper: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  return <MainApp />;
};

const MainApp: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all'
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { tasks, createTask, updateTask, deleteTask, filterTasks, sortTasks } = useTasks();

  const categories = [...new Set(tasks.map(task => task.category).filter(Boolean))];

  const getFilteredAndSortedTasks = () => {
    let filteredTasks = filterTasks(filters);
    
    // Apply view-specific filters
    const today = new Date().toDateString();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    switch (activeView) {
      case 'today':
        filteredTasks = filteredTasks.filter(task => 
          task.dueDate && new Date(task.dueDate).toDateString() === today
        );
        break;
      case 'upcoming':
        filteredTasks = filteredTasks.filter(task => 
          task.dueDate && new Date(task.dueDate) <= nextWeek && task.status !== 'completed'
        );
        break;
    }

    return sortTasks(filteredTasks, sortBy, sortOrder);
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    await createTask(taskData);
    setIsTaskModalOpen(false);
  };

  const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
      setEditingTask(null);
      setIsTaskModalOpen(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    await updateTask(taskId, { status });
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard';
      case 'all-tasks': return 'All Tasks';
      case 'today': return 'Today\'s Tasks';
      case 'upcoming': return 'Upcoming Tasks';
      case 'settings': return 'Settings';
      default: return 'Tasks';
    }
  };

  const displayedTasks = getFilteredAndSortedTasks();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{getViewTitle()}</h1>
            </div>

            {activeView === 'dashboard' ? (
              <Dashboard tasks={tasks} onRefresh={loadTasks} />
            ) : activeView === 'settings' ? (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
                <p className="text-gray-600">Settings panel coming soon...</p>
              </div>
            ) : (
              <>
                <TaskFilters
                  searchTerm={filters.search}
                  onSearchChange={(search) => setFilters({ ...filters, search })}
                  statusFilter={filters.status}
                  onStatusFilterChange={(status) => setFilters({ ...filters, status })}
                  priorityFilter={filters.priority}
                  onPriorityFilterChange={(priority) => setFilters({ ...filters, priority })}
                  categoryFilter={filters.category}
                  onCategoryFilterChange={(category) => setFilters({ ...filters, category })}
                  sortBy={sortBy}
                  onSortByChange={setSortBy}
                  sortOrder={sortOrder}
                  onSortOrderChange={setSortOrder}
                  onCreateTask={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  categories={categories}
                />

                {displayedTasks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayedTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No tasks found</p>
                    <button
                      onClick={() => {
                        setEditingTask(null);
                        setIsTaskModalOpen(true);
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Task
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
        editingTask={editingTask}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}

export default App;