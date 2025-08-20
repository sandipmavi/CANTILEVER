import React from 'react';
import { Task } from '../../types';
import { Calendar, Flag, Edit2, Trash2, Check, Clock, AlertCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-green-600 bg-green-50';
    }
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return AlertCircle;
      case 'medium': return Clock;
      case 'low': return Flag;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'todo': return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  const PriorityIcon = getPriorityIcon(task.priority);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${task.status === 'completed' ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onStatusChange(task.id, task.status === 'completed' ? 'todo' : 'completed')}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.status === 'completed'
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            {task.status === 'completed' && <Check className="h-3 w-3 text-white" />}
          </button>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
            <PriorityIcon className="h-3 w-3 inline mr-1" />
            {task.priority}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h3 className={`font-medium text-gray-900 mb-2 ${task.status === 'completed' ? 'line-through' : ''}`}>
        {task.title}
      </h3>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded border ${getStatusColor(task.status)}`}>
            {task.status.replace('-', ' ')}
          </span>
          
          {task.category && (
            <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {task.category}
            </span>
          )}
        </div>

        {task.dueDate && (
          <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
            <Calendar className="h-3 w-3" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;