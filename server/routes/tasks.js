// server/routes/tasks.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Team = require('../models/Team');

// @route   GET api/tasks
// @desc    Get all tasks for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { assignedTo: req.user.id },
        { createdBy: req.user.id }
      ]
    })
      .populate('assignedTo', ['name', 'email'])
      .populate('createdBy', ['name', 'email'])
      .populate('team', ['name'])
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/tasks
// @desc    Create a new task
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      // Accept the status values used by the frontend
      check('status', 'Status is required').isIn(['pending', 'in-progress', 'completed']),
      check('priority', 'Priority is required').isIn(['low', 'medium', 'high']),
      check('dueDate', 'Please include a valid due date').isISO8601()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      team
    } = req.body;

    try {
      // If team is provided, verify the user is a member
      if (team) {
        const teamExists = await Team.findOne({
          _id: team,
          $or: [
            { 'members.user': req.user.id },
            { createdBy: req.user.id }
          ]
        });

        if (!teamExists) {
          return res.status(400).json({ msg: 'Team not found or not authorized' });
        }
      }

      const newTask = new Task({
        title,
        description,
        status,
        priority,
        dueDate,
        assignedTo: assignedTo || req.user.id,
        createdBy: req.user.id,
        team: team || null
      });

      const task = await newTask.save();
      res.json(task);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const {
    title,
    description,
    status,
    priority,
    dueDate,
    assignedTo
  } = req.body;

  // Build task object
  const taskFields = {};
  if (title) taskFields.title = title;
  if (description) taskFields.description = description;
  if (status) taskFields.status = status;
  if (priority) taskFields.priority = priority;
  if (dueDate) taskFields.dueDate = dueDate;
  if (assignedTo) taskFields.assignedTo = assignedTo;

  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // Make sure user owns the task or is assigned to it
    if (task.createdBy.toString() !== req.user.id && task.assignedTo.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: taskFields },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // Check user is the creator of the task
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await task.remove();
    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;