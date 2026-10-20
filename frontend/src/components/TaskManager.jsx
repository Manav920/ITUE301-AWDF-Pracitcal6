import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import Toast from './Toast';

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Coursework',
  });
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast Notification State (Supplementary Problem 3)
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Delete Confirmation Modal State (Supplementary Problem 2)
  const [taskToDelete, setTaskToDelete] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch all tasks from MongoDB on component mount
  const fetchTasksList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTasks();
      if (response && response.data) {
        setTasks(response.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to Node/Express backend at http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksList();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Task Creation with Optimistic UI Update (Supplementary Problem 1)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Task title is required', 'error');
      return;
    }

    const trimmedTitle = formData.title.trim();
    const tempId = `temp-${Date.now()}`;

    // 1. Optimistic Task Object
    const optimisticTask = {
      _id: tempId,
      title: trimmedTitle,
      description: formData.description.trim(),
      priority: formData.priority,
      category: formData.category || 'Coursework',
      completed: false,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // visual indicator
    };

    // 2. Show immediately in UI before server confirms
    setTasks((prev) => [optimisticTask, ...prev]);

    // Reset input form immediately for fluid UX
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: 'Coursework',
    });

    setSubmitting(true);

    try {
      // 3. Make real POST API call to MongoDB
      const res = await createTask({
        title: trimmedTitle,
        description: optimisticTask.description,
        priority: optimisticTask.priority,
        category: optimisticTask.category,
      });

      // 4. Replace optimistic item with true MongoDB document
      setTasks((prev) =>
        prev.map((t) => (t._id === tempId ? res.data : t))
      );
      showToast(`Task "${res.data.title}" saved to MongoDB!`, 'success');
    } catch (err) {
      // 5. Rollback on failure
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      showToast(`Failed to save task: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Completion Status (PUT /tasks/:id)
  const handleToggleComplete = async (task) => {
    const updatedStatus = !task.completed;

    // Optimistic toggle
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, completed: updatedStatus } : t))
    );

    try {
      const res = await updateTask(task._id, { completed: updatedStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? res.data : t))
      );
      showToast(
        `Task marked as ${updatedStatus ? 'Completed' : 'Pending'}!`,
        'success'
      );
    } catch (err) {
      // Revert status on failure
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, completed: !updatedStatus } : t))
      );
      showToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  // Delete Task with Confirmation (Supplementary Problem 2)
  const confirmDelete = async () => {
    if (!taskToDelete) return;
    const { _id, title } = taskToDelete;
    setTaskToDelete(null);

    // Optimistically remove from state
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t._id !== _id));

    try {
      await deleteTask(_id);
      showToast(`Deleted task "${title}" from MongoDB`, 'success');
    } catch (err) {
      // Rollback
      setTasks(previousTasks);
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  // Filter tasks by priority and search
  const filteredTasks = tasks.filter((task) => {
    const matchesPriority =
      filterPriority === 'all' || task.priority === filterPriority;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPriority && matchesSearch;
  });

  return (
    <div className="task-manager-container">
      {/* Toast Notification Component */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Backend Status Banner */}
      <div className="backend-status-card">
        <div className="status-indicator">
          <span className="live-dot" />
          <span>
            Connected Backend: <strong>http://localhost:5000/tasks</strong>
          </span>
        </div>
        <div className="db-info">
          <span>Database: <strong>MongoDB (task_manager_24cs048)</strong></span>
          <button type="button" className="refresh-btn" onClick={fetchTasksList} title="Sync with MongoDB">
            ↻ Sync
          </button>
        </div>
      </div>

      {/* Task Creation Form (POST /tasks) */}
      <div className="section-card">
        <h2 className="section-heading">Create New Task in MongoDB</h2>
        <p className="section-subtext">
          Features optimistic UI updates: new tasks appear immediately in the list and synchronize with MongoDB via Mongoose.
        </p>

        <form onSubmit={handleCreateTask} className="task-create-form">
          <div className="form-row">
            <div className="form-group flex-2">
              <label htmlFor="taskTitle">Task Title (Required):</label>
              <input
                id="taskTitle"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Implement Full-Stack Integration Testing"
                className="form-input"
                required
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="taskPriority">Priority (Enum):</label>
              <select
                id="taskPriority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="form-input select-input"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label htmlFor="taskDesc">Description (Optional):</label>
              <input
                id="taskDesc"
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add brief details about the task objective"
                className="form-input"
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="taskCategory">Category:</label>
              <input
                id="taskCategory"
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g. Practical 6"
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" className="action-btn" disabled={submitting}>
            {submitting ? 'Saving to Database...' : '+ Add Task (Optimistic)'}
          </button>
        </form>
      </div>

      {/* Task List Section */}
      <div className="section-card">
        <div className="tasks-header-row">
          <div>
            <h2 className="section-heading">Live Tasks from MongoDB</h2>
            <p className="section-subtext">
              Showing persistent documents stored in MongoDB collection <code>tasks</code>.
            </p>
          </div>

          {/* Filters */}
          <div className="tasks-filters">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-small"
            />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && <Spinner message="Fetching tasks from MongoDB via Express API..." />}

        {!loading && error && (
          <ErrorMessage message={error} onRetry={fetchTasksList} />
        )}

        {!loading && !error && (
          <>
            <div className="task-stats-bar">
              <span>Total: <strong>{tasks.length}</strong> tasks in MongoDB</span>
              <span>
                Completed: <strong>{tasks.filter((t) => t.completed).length}</strong> / {tasks.length}
              </span>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="no-tasks-box">
                <p>No tasks found matching your filter criteria.</p>
              </div>
            ) : (
              <div className="tasks-list">
                {filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    className={`task-item-card ${task.completed ? 'completed' : ''} ${task.isOptimistic ? 'optimistic-syncing' : ''}`}
                  >
                    <div className="task-checkbox-col">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task)}
                        title="Click to toggle status (PUT /tasks/:id)"
                        className="task-check"
                      />
                    </div>

                    <div className="task-body-col">
                      <div className="task-title-line">
                        <span className={`task-title-text ${task.completed ? 'strikethrough' : ''}`}>
                          {task.title}
                        </span>
                        {task.isOptimistic && (
                          <span className="syncing-badge">⚡ Syncing...</span>
                        )}
                        <span className={`priority-badge priority-${task.priority}`}>
                          {task.priority}
                        </span>
                        <span className="category-badge">{task.category}</span>
                      </div>

                      {task.description && (
                        <p className="task-desc-text">{task.description}</p>
                      )}

                      <div className="task-meta-line">
                        <span className="meta-id">
                          ID: <code>{task._id}</code>
                        </span>
                        <span className="meta-date">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="task-actions-col">
                      {/* Delete with Confirmation Dialog Trigger */}
                      <button
                        type="button"
                        className="delete-task-btn"
                        onClick={() => setTaskToDelete(task)}
                        title="Delete task from MongoDB"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Dialog Modal (Supplementary Problem 2) */}
      {taskToDelete && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h3 className="modal-title">Confirm Deletion</h3>
            <p className="modal-text">
              Are you sure you want to permanently delete task{' '}
              <strong>"{taskToDelete.title}"</strong> from the MongoDB database?
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setTaskToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-delete-btn"
                onClick={confirmDelete}
              >
                Yes, Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskManager;
