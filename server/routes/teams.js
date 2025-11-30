// server/routes/teams.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Team = require('../models/Team');
const User = require('../models/User');

// @route   GET api/teams
// @desc    Get all teams for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { 'members.user': req.user.id },
        { createdBy: req.user.id }
      ]
    }).populate('members.user', ['name', 'email']);
    res.json(teams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/teams
// @desc    Create a new team
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, description } = req.body;

  try {
    const newTeam = new Team({
      name,
      description,
      createdBy: req.user.id,
      members: [{ user: req.user.id, role: 'admin' }]
    });

    const team = await newTeam.save();
    res.json(team);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/teams/:id
// @desc    Update a team
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, description } = req.body;

  try {
    let team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ msg: 'Team not found' });

    // Check if user is team admin
    if (team.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    team.name = name || team.name;
    team.description = description || team.description;

    await team.save();
    res.json(team);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/teams/:id
// @desc    Delete a team
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ msg: 'Team not found' });

    // Check if user is team admin
    if (team.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await team.remove();
    res.json({ msg: 'Team removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;