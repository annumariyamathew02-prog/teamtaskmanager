// server/routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Team = require('../models/Team');

// @route   GET api/users/team
// @desc    Get current user's teams
// @access  Private
router.get('/team', auth, async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { 'members.user': req.user.id },
        { createdBy: req.user.id }
      ]
    }).populate('members.user', ['name', 'email', 'role']);
    res.json(teams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/team-members/:teamId
// @desc    Get all members of a team
// @access  Private
router.get('/team-members/:teamId', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate('members.user', ['_id', 'name', 'email', 'role']);

    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    // Check if user is a member of the team
    const isMember = team.members.some(
      member => member.user._id.toString() === req.user.id
    );

    if (!isMember && team.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Return members with user details and role
    const members = team.members.map(m => ({
      _id: m.user._id,
      name: m.user.name,
      email: m.user.email,
      role: m.role || 'member'
    }));

    res.json(members);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/all-team-members
// @desc    Get all team members (for task assignment)
// @access  Private
router.get('/all-team-members', auth, async (req, res) => {
  try {
    // Get the current user's teams
    const userTeams = await Team.find({
      $or: [
        { 'members.user': req.user.id },
        { createdBy: req.user.id }
      ]
    }).populate('members.user', ['_id', 'name', 'email', 'role', 'department', 'position']);

    // Collect unique members from all teams
    const membersMap = new Map();
    
    userTeams.forEach(team => {
      team.members.forEach(member => {
        const userId = member.user._id.toString();
        if (!membersMap.has(userId)) {
          membersMap.set(userId, {
            _id: member.user._id,
            name: member.user.name,
            email: member.user.email,
            role: member.user.role || 'user',
            department: member.user.department || '',
            position: member.user.position || ''
          });
        }
      });
    });

    // Also add the current user
    try {
      const currentUser = await User.findById(req.user.id).select('_id name email role department position');
      if (currentUser) {
        const userId = currentUser._id.toString();
        if (!membersMap.has(userId)) {
          membersMap.set(userId, {
            _id: currentUser._id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role || 'user',
            department: currentUser.department || '',
            position: currentUser.position || ''
          });
        }
      }
    } catch (userErr) {
      console.warn('Could not fetch current user:', userErr.message);
    }

    const members = Array.from(membersMap.values());
    res.json(members);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;