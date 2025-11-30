# Team Task Manager

A full-stack web application for managing tasks and collaborating with team members. Built with React, Node.js, Express, and MongoDB.

## Features

✅ **User Authentication** — Secure sign-up/login with JWT tokens and password hashing  
✅ **Task Management** — Create, assign, update, and track tasks with priorities and due dates  
✅ **Team Collaboration** — Assign tasks to team members and view team information  
✅ **Deadline Reminders** — Get notified of overdue and upcoming tasks on the dashboard  
✅ **Role-Based Access** — Admin and user roles with appropriate permissions  
✅ **Responsive Design** — Beautiful Material Design UI that works on desktop and mobile  
✅ **Task Status Tracking** — Mark tasks as pending, in-progress, or completed  

## Tech Stack

### Frontend
- **React 18** with React Router v6
- **Material-UI (MUI)** for components and styling
- **Formik + Yup** for form validation
- **Axios** for API calls
- **React Toastify** for notifications
- **MUI X Date Picker** for date selection

### Backend
- **Node.js + Express.js** for REST API
- **MongoDB + Mongoose** for database
- **JWT** for authentication
- **Bcryptjs** for password hashing
- **Express Validator** for input validation

## Project Structure

```
Algonive_TaskManagement_System/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/AppShell.js   # Main app layout with navigation
│   │   │   └── common/ProtectedRoute.js
│   │   ├── context/AuthContext.js   # Auth state management
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js         # Home page with deadline reminders
│   │   │   ├── Tasks.js             # Task CRUD and management
│   │   │   ├── Team.js              # Team members view
│   │   │   └── Profile.js           # User profile
│   │   ├── services/api.js          # API client
│   │   ├── theme.js                 # MUI theme
│   │   └── App.js
│   └── package.json
├── server/                          # Node.js backend
│   ├── models/
│   │   ├── User.js
│   │   ├── Task.js
│   │   └── Team.js
│   ├── routes/
│   │   ├── auth.js                  # Login, register, verify token
│   │   ├── tasks.js                 # Task CRUD endpoints
│   │   ├── users.js                 # User and team member endpoints
│   │   └── teams.js                 # Team endpoints
│   ├── middleware/auth.js           # JWT verification middleware
│   ├── config/                      # Database config
│   ├── server.js                    # Express server entry point
│   ├── seed.js                      # Database seeding script
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14+) and npm
- MongoDB (local or Atlas)

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   MONGO_URI=mongodb://localhost:27017/taskmanager
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   NODE_ENV=development
   ```

4. **Ensure MongoDB is running:**
   - Local: `mongod` (or via service)
   - Cloud: Use MongoDB Atlas connection string

5. **Seed the database (optional):**
   ```bash
   node seed.js
   ```
   
   This creates demo users:
   - Email: `john@example.com` | Password: `password123` | Role: Admin
   - Email: `jane@example.com` | Password: `password123` | Role: User
   - Email: `bob@example.com` | Password: `password123` | Role: User
   - Email: `alice@example.com` | Password: `password123` | Role: User

6. **Start the server:**
   ```bash
   npm run server
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   App opens on `http://localhost:3000`

## Usage

### Login
1. Open http://localhost:3000
2. Enter email and password (use seeded credentials or register a new account)
3. Click "Sign In"

### Dashboard
- View upcoming and overdue tasks
- Quick navigation to Tasks, Team, and Profile pages

### Tasks
- **Create Task** — Click "New Task" to add a task with title, description, priority, due date, and assignee
- **Filter by Team** — Filter tasks by team in the dropdown
- **Edit Task** — Click the edit icon to modify task details
- **Delete Task** — Click the delete icon to remove a task
- **Track Status** — Update task status (Pending → In Progress → Completed)

### Team
- View all team members
- See member roles (Admin/User)
- Contact information displayed

### Profile
- Edit your name and email
- (Optional) Update password
- View your current role

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login user
- `GET /api/auth/me` — Get current authenticated user

### Tasks
- `GET /api/tasks` — Get user's tasks
- `POST /api/tasks` — Create new task
- `PUT /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Delete task

### Users
- `GET /api/users/team-members` — Get all team members
- `GET /api/users/all-team-members` — Get all team members (admin)

### Teams
- `GET /api/teams` — Get all teams
- `POST /api/teams` — Create team (admin)
- `PUT /api/teams/:id` — Update team (admin)
- `DELETE /api/teams/:id` — Delete team (admin)

## Environment Variables

### Server (.env)
```env
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
```

### Client
The frontend connects to `http://localhost:5000/api` by default.

## Scripts

### Backend
- `npm run server` — Start server with nodemon (auto-reload)
- `node seed.js` — Seed database with demo data
- `npm start` — Start server (production mode)

### Frontend
- `npm start` — Start development server
- `npm run build` — Build for production
- `npm test` — Run tests

## Features in Detail

### Authentication
- JWT-based token authentication
- Passwords hashed with bcryptjs
- Token stored in localStorage and sent with every API request
- Auto-logout on token expiration

### Task Management
- Assign tasks to individual team members or teams
- Set priority levels (Low, Medium, High)
- Track task status (Pending, In Progress, Completed)
- Set and monitor due dates
- Filter tasks by team

### Deadline Reminders
- Dashboard shows overdue tasks in red alerts
- Upcoming tasks (within 3 days) shown in yellow alerts
- Only non-completed tasks trigger reminders

### Responsive Layout
- Fixed AppBar at top with user info
- Persistent drawer navigation on desktop
- Mobile hamburger menu that toggles drawer
- Responsive content area that adapts to drawer width

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or start via service
- Check MONGO_URI in `.env`
- If using Atlas, whitelist your IP and verify connection string

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: `npm start` will prompt to use a different port

### "Cannot find module" errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### CORS errors
- Ensure backend is running on port 5000
- Check that `http://localhost:5000` is the correct API base URL in `client/src/services/api.js`

## Future Enhancements

- [ ] Email notifications for task assignments
- [ ] Real-time updates with WebSockets
- [ ] Task comments and discussion threads
- [ ] File attachments for tasks
- [ ] Advanced filtering and search
- [ ] Task templates
- [ ] Time tracking
- [ ] Performance analytics and dashboards
- [ ] Dark mode theme toggle
- [ ] Multi-language support

## License

This project is open source and available under the MIT License.

## Contact & Support

For questions or issues, please open an issue on GitHub at:
https://github.com/annumariyamathew02-prog/teamtaskmanager.git

---

**Built with ❤️ by Annu Mariya Mathew**
