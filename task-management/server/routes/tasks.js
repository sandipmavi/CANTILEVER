const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../controllers/taskController');
const { auth } = require('../middleware/auth');
const { taskValidation, validate } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(auth);

// Task routes
router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTask);
router.post('/', taskValidation.create, validate, createTask);
router.put('/:id', taskValidation.update, validate, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;