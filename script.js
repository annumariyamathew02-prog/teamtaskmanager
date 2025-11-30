// DOM Elements
const authSection = document.getElementById('auth-section');
const mainApp = document.getElementById('main-app');
const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('auth-email');
const passwordInput = document.getElementById('auth-password');
const authError = document.getElementById('auth-error');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const welcomeMsg = document.getElementById('welcome-msg');
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filter-btn');
const reminderPopup = document.getElementById('reminder-popup');
const reminderText = document.getElementById('reminder-text');
const closePopup = document.getElementById('close-popup');
const fabAdd = document.getElementById('add-task-fab');

// State
let currentFilter = 'all';
let tasks = [];
let unsubscribeTasks = null;
let isSignUp = false;

// Initialize the app when the DOM is fully loaded and Firebase is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for Firebase to be ready
  document.addEventListener('firebase-ready', () => {
    setupEventListeners();
    checkAuthState();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('task-date');
    if (dateInput) {
      dateInput.min = today;
      dateInput.value = today;
    }
  });
});

// Set up event listeners
function setupEventListeners() {
  // Auth form submission
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      
      try {
        if (isSignUp) {
          await handleSignUp(email, password);
        } else {
          await handleLogin(email, password);
        }
      } catch (error) {
        console.error('Auth error:', error);
        if (authError) {
          authError.textContent = error.message || 'Authentication failed. Please try again.';
          authError.style.display = 'block';
        }
      }
    });
  }
  
  // Toggle between login and signup
  if (signupBtn) {
    signupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      isSignUp = !isSignUp;
      
      if (isSignUp) {
        loginBtn.textContent = 'Sign Up';
        signupBtn.textContent = 'Already have an account? Log In';
      } else {
        loginBtn.textContent = 'Log In';
        signupBtn.textContent = 'Need an account? Sign Up';
      }
      if (authError) authError.style.display = 'none';
    });
  }
  
  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Task form submission
  if (taskForm) {
    taskForm.addEventListener('submit', handleAddTask);
  }
  
  // Filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });
  
  // Close popup
  if (closePopup) {
    closePopup.addEventListener('click', () => {
      if (reminderPopup) reminderPopup.style.display = 'none';
    });
  }
  
  // FAB add task
  if (fabAdd) {
    fabAdd.addEventListener('click', () => {
      if (taskForm) taskForm.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

// Check authentication state
function checkAuthState() {
  window.FirebaseApp.auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      if (authSection) authSection.style.display = 'none';
      if (mainApp) mainApp.style.display = 'block';
      if (welcomeMsg) {
        welcomeMsg.textContent = `, ${user.email?.split('@')[0] || 'User'}`;
      }
      setupTaskListener(user.uid);
    } else {
      // User is signed out
      if (authSection) authSection.style.display = 'block';
      if (mainApp) mainApp.style.display = 'none';
      if (authForm) authForm.reset();
      if (taskList) taskList.innerHTML = '';
      if (unsubscribeTasks) {
        unsubscribeTasks();
        unsubscribeTasks = null;
      }
    }
  });
}

// Handle login
async function handleLogin(email, password) {
  if (!email || !password) {
    throw new Error('Please enter both email and password');
  }
  await window.FirebaseApp.auth.signIn(email, password);
  if (authForm) authForm.reset();
  if (authError) authError.style.display = 'none';
}

// Handle sign up
async function handleSignUp(email, password) {
  if (!email || !password) {
    throw new Error('Please enter both email and password');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  await window.FirebaseApp.auth.signUp(email, password);
  if (authForm) authForm.reset();
  if (authError) authError.style.display = 'none';
  showReminder('Account created successfully! Please sign in.');
  isSignUp = false;
  if (loginBtn) loginBtn.textContent = 'Log In';
  if (signupBtn) signupBtn.textContent = 'Need an account? Sign Up';
}

// Handle logout
async function handleLogout() {
  try {
    await window.FirebaseApp.auth.signOut();
    tasks = [];
    if (taskList) taskList.innerHTML = '';
    if (authForm) authForm.reset();
  } catch (error) {
    console.error('Logout error:', error);
    showReminder('Error logging out. Please try again.');
  }
}

// Set up real-time task listener
function setupTaskListener(userId) {
  if (unsubscribeTasks) {
    unsubscribeTasks();
  }
  
  const tasksRef = window.FirebaseApp.firestore.collection('tasks');
  const q = window.FirebaseApp.firestore.query(
    tasksRef, 
    window.FirebaseApp.firestore.where('userId', '==', userId),
    window.FirebaseApp.firestore.orderBy('createdAt', 'desc')
  );
  
  unsubscribeTasks = window.FirebaseApp.firestore.onSnapshot(q, 
    (snapshot) => {
      tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      renderTasks();
      checkReminders();
    },
    (error) => {
      console.error('Error getting tasks:', error);
      showReminder('Error loading tasks. Please refresh the page.');
    }
  );
}

// Add a new task
async function handleAddTask(e) {
  e?.preventDefault();
  
  const user = window.FirebaseApp.auth.currentUser();
  if (!user) {
    showReminder('Please log in to add tasks');
    return;
  }

  const title = document.getElementById('task-title')?.value.trim();
  const desc = document.getElementById('task-desc')?.value.trim() || '';
  const date = document.getElementById('task-date')?.value;
  const assignee = document.getElementById('task-assignee')?.value.trim();

  if (!title || !date || !assignee) {
    showReminder('Please fill in all required fields');
    return;
  }

  try {
    await window.FirebaseApp.firestore.addDoc('tasks', {
      title,
      description: desc,
      dueDate: date,
      assignee,
      status: 'pending',
      userId: user.uid
    });

    // Reset form and scroll to top
    if (taskForm) {
      taskForm.reset();
      // Reset date to today
      const today = new Date().toISOString().split('T')[0];
      const dateInput = document.getElementById('task-date');
      if (dateInput) {
        dateInput.value = today;
      }
    }
    
    showReminder('Task added successfully!');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('Error adding task:', error);
    showReminder('Error adding task. Please try again.');
  }
}

// Update task status
async function updateTaskStatus(taskId, status) {
  try {
    await window.FirebaseApp.firestore.updateDoc(`tasks/${taskId}`, {
      status
    });
  } catch (error) {
    console.error('Error updating task:', error);
    showReminder('Error updating task status. Please try again.');
  }
}

// Delete task
async function deleteTask(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  
  try {
    await window.FirebaseApp.firestore.deleteDoc(`tasks/${taskId}`);
    showReminder('Task deleted successfully!');
  } catch (error) {
    console.error('Error deleting task:', error);
    showReminder('Error deleting task. Please try again.');
  }
}

// Render tasks based on current filter
function renderTasks() {
  if (!taskList) return;
  
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'all') return true;
    return task.status === currentFilter;
  });
  
  if (filteredTasks.length === 0) {
    taskList.innerHTML = '<p class="no-tasks">No tasks found. Add a new task to get started!</p>';
    return;
  }
  
  taskList.innerHTML = filteredTasks.map(task => {
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const formattedDate = dueDate ? dueDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }) : 'No due date';
    
    return `
      <div class="task-card ${task.status}">
        <div class="task-header">
          <h3>${escapeHtml(task.title)}</h3>
          <div class="task-actions">
            <select onchange="updateTaskStatus('${task.id}', this.value)" 
                    class="status-select ${task.status}">
              <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
              <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
            <button onclick="deleteTask('${task.id}')" class="icon-btn" aria-label="Delete task">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : ''}
        <div class="task-footer">
          <span class="task-due">
            <i class="far fa-calendar-alt"></i> 
            ${formattedDate}
          </span>
          <span class="task-assignee">
            <i class="fas fa-user-tag"></i> 
            ${escapeHtml(task.assignee || 'Unassigned')}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

// Check for due tasks and show reminders
function checkReminders() {
  const now = new Date();
  const dueTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate <= now && task.status !== 'completed';
  });
  
  if (dueTasks.length > 0 && reminderText) {
    const taskWord = dueTasks.length === 1 ? 'task' : 'tasks';
    showReminder(`You have ${dueTasks.length} ${taskWord} due!`);
  }
}

// Show reminder popup
function showReminder(message) {
  if (reminderText && reminderPopup) {
    reminderText.textContent = message;
    reminderPopup.style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (reminderPopup) {
        reminderPopup.style.display = 'none';
      }
    }, 5000);
  }
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Make functions available globally for HTML event handlers
window.updateTaskStatus = updateTaskStatus;
window.deleteTask = deleteTask;