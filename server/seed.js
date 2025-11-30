const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Team = require('./models/Team');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/taskmanager', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected...');

    // Clear existing data
    await User.deleteMany({});
    await Team.deleteMany({});
    console.log('Cleared existing data...');

    // Create users (password is hashed by User model pre-save hook)
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'admin',
        department: 'Engineering',
        position: 'Team Lead'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
        department: 'Design',
        position: 'UI/UX Designer'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'password123',
        role: 'user',
        department: 'Engineering',
        position: 'Full Stack Developer'
      },
      {
        name: 'Alice Williams',
        email: 'alice@example.com',
        password: 'password123',
        role: 'user',
        department: 'Product',
        position: 'Product Manager'
      }
    ];

    const createdUsers = await User.create(users);
    console.log('Created users:', createdUsers.map(u => u.email));

    // Create teams with proper member structure
    const teams = [
      {
        name: 'Development Team',
        description: 'Main development team',
        members: [
          { user: createdUsers[0]._id, role: 'admin' },
          { user: createdUsers[1]._id, role: 'member' },
          { user: createdUsers[2]._id, role: 'member' }
        ],
        createdBy: createdUsers[0]._id
      },
      {
        name: 'Design Team',
        description: 'UI/UX Design team',
        members: [
          { user: createdUsers[1]._id, role: 'admin' },
          { user: createdUsers[0]._id, role: 'member' }
        ],
        createdBy: createdUsers[1]._id
      },
      {
        name: 'Product Team',
        description: 'Product and Strategy team',
        members: [
          { user: createdUsers[3]._id, role: 'admin' },
          { user: createdUsers[0]._id, role: 'member' }
        ],
        createdBy: createdUsers[3]._id
      }
    ];

    const createdTeams = await Team.insertMany(teams);
    console.log('Created teams:', createdTeams.map(t => t.name));

    // Update users with team references
    await User.findByIdAndUpdate(
      createdUsers[0]._id,
      { $set: { teams: [createdTeams[0]._id, createdTeams[1]._id, createdTeams[2]._id] } }
    );
    await User.findByIdAndUpdate(
      createdUsers[1]._id,
      { $set: { teams: [createdTeams[0]._id, createdTeams[1]._id] } }
    );
    await User.findByIdAndUpdate(
      createdUsers[2]._id,
      { $set: { teams: [createdTeams[0]._id] } }
    );
    await User.findByIdAndUpdate(
      createdUsers[3]._id,
      { $set: { teams: [createdTeams[2]._id] } }
    );

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();