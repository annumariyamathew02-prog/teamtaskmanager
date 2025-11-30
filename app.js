// Firebase Authentication UI toggle
const authApp = document.getElementById('auth-app');
const mainApp = document.getElementById('main-app');
const fabAdd = document.querySelector('.fab-add');
const authForm = document.getElementById('auth-form');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const authError = document.getElementById('auth-error');

let currentFilter = 'all';
let teamMembers = [];
let currentUser = null;
let currentTeam = 'demo-team';

// Handle login
authForm.onsubmit = async function(e) {
  e.preventDefault();
  try {
    const result = await auth.signInWithEmailAndPassword(
      authForm['auth-email'].value, 
      authForm['auth-password'].value
    );
    currentUser = result.user;
    authError.innerText = "";
  } catch (error) {
    authError.innerText = `Login failed: ${error.message}`;
  }
}

// Handle signup
signupBtn.onclick = async function() {
  try {
    const result = await auth.createUserWithEmailAndPassword(
      authForm['auth-email'].value, 
      authForm['auth-password'].value
    );
    currentUser = result.user;
    // Store user in Firestore
    await db.collection('users').doc(result.user.uid).set({
      email: result.user.email,
      team: currentTeam,
      createdAt: new Date()
    });
    authError.innerText = "Sign up complete. You are now logged in!";
  } catch (error) {
    authError.innerText = `Signup failed: ${error.message}`;
  }
}

logoutBtn.onclick = () => {
  auth.signOut();
  currentUser = null;
}

// Auth state
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    authApp.style.display = 'none';
    mainApp.style.display = '';
    fabAdd.style.display = '';
    document.getElementById('welcome-msg').innerText = `Hi, ${user.email}`;
    loadTasks();
    loadAssignees();
  } else {
    authApp.style.display = '';
    mainApp.style.display = 'none';
    fabAdd.style.display = 'none';
    currentUser = null;
  }
});

// --- Task CRUD ---

function loadTasks() {
  if (!currentUser) return;
  
  const taskList = document.getElementById('task-list');
  db.collection('tasks')
    .where('team', '==', currentTeam)
    .orderBy('date', 'asc')
    .onSnapshot(snapshot => {
      const tasks = [];
      snapshot.forEach(doc => {
        tasks.push({ ...doc.data(), id: doc.id });
      });
      renderTasks(tasks);
      
      // Collect team members
      const assignees = new Set(tasks.map(t => t.assignee));
      assignees.add(currentUser.email);
      teamMembers = Array.from(assignees);
      updateAssigneeDropdown();
    });
}

function addTask(title, desc, date, assignee, priority = 'medium') {
  if (!currentUser) return;
  
  db.collection('tasks').add({
    title,
    desc,
    date,
    assignee,
    priority,
    status: 'pending',
    team: currentTeam,
    createdBy: currentUser.email,
    createdAt: new Date(),
    updatedAt: new Date()
  }).then(() => {
    document.getElementById('task-form').reset();
    console.log('Task added successfully');
  }).catch(error => {
    console.error('Error adding task:', error);
  });
}

function updateStatus(id, newStatus) {
  db.collection('tasks').doc(id).update({ 
    status: newStatus,
    updatedAt: new Date()
  }).catch(error => {
    console.error('Error updating task:', error);
  });
}

function deleteTask(id) {
  if (confirm('Are you sure you want to delete this task?')) {
    db.collection('tasks').doc(id).delete().catch(error => {
      console.error('Error deleting task:', error);
    });
  }
}

function editTask(id, newTitle, newDesc, newDate, newAssignee, newPriority = 'medium') {
  db.collection('tasks').doc(id).update({
    title: newTitle,
    desc: newDesc,
    date: newDate,
    assignee: newAssignee,
    priority: newPriority,
    updatedAt: new Date()
  }).catch(error => {
    console.error('Error updating task:', error);
  });
}

function filterTasksArray(tasks) {
  if (currentFilter === 'all') return tasks;
  return tasks.filter(t => t.status === currentFilter);
}

function renderTasks(tasks) {
  const filtered = filterTasksArray(tasks);
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = '';
  
  if (filtered.length === 0) {
    taskList.innerHTML = '<p style="text-align: center; color: #999;">No tasks found</p>';
    return;
  }
  
  filtered.forEach(task => {
    const item = document.createElement('li');
    item.className = `task-item ${task.status}`;
    item.innerHTML = `
      <div class="task-meta">
        <span class="chip assignee">👤 ${task.assignee}</span>
        <span class="task-date">📅 ${task.date}</span>
        <span class="chip priority ${task.priority || 'medium'}">${capitalize(task.priority || 'medium')}</span>
        <span class="chip status ${task.status}">${capitalize(task.status)}</span>
      </div>
      <div class="task-main">
        <span class="icon-task">✓</span>
        <div>
          <strong>${task.title}</strong>
          <p class="task-desc">${task.desc}</p>
        </div>
      </div>
      <div class="task-actions">
        <button title="Mark Pending" class="pending-btn">⏳</button>
        <button title="Mark In Progress" class="progress-btn">🚧</button>
        <button title="Mark Completed" class="complete-btn">✅</button>
        <button title="Edit" class="edit-btn">✏️</button>
        <button title="Delete" class="delete-btn">🗑</button>
      </div>
    `;
    
    item.querySelector('.pending-btn').onclick = () => updateStatus(task.id, 'pending');
    item.querySelector('.progress-btn').onclick = () => updateStatus(task.id, 'in-progress');
    item.querySelector('.complete-btn').onclick = () => updateStatus(task.id, 'completed');
    item.querySelector('.edit-btn').onclick = () => showEditPopup(task);
    item.querySelector('.delete-btn').onclick = () => deleteTask(task.id);

    // Reminder if due soon
    const days = daysToDeadline(task.date);
    if (task.status !== 'completed' && days <= 1 && days >= 0) {
      showReminder(`⚠️ Task "${task.title}" due soon!`);
    }
    
    taskList.appendChild(item);
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function daysToDeadline(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
}

function showReminder(msg) {
  const popup = document.getElementById('reminder-popup');
  if (!popup) return;
  
  document.getElementById('reminder-text').innerText = msg;
  popup.classList.remove('hidden');
  setTimeout(() => {
    popup.classList.add('hidden');
  }, 5000);
}

function showEditPopup(task) {
  const newTitle = prompt('Edit Title:', task.title);
  if (newTitle !== null) {
    const newDesc = prompt('Edit Description:', task.desc);
    if (newDesc !== null) {
      const newDate = prompt('Edit Due Date (YYYY-MM-DD):', task.date);
      if (newDate !== null) {
        const newAssignee = prompt('Edit Assignee:', task.assignee);
        if (newAssignee !== null) {
          const newPriority = prompt('Edit Priority (low/medium/high):', task.priority || 'medium');
          if (newPriority !== null) {
            editTask(task.id, newTitle, newDesc, newDate, newAssignee, newPriority);
          }
        }
      }
    }
  }
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.onclick = function() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentFilter = this.id.replace('filter-', '').toLowerCase();
    loadTasks();
  };
});

// New task form
document.getElementById('task-form').onsubmit = function(e) {
  e.preventDefault();
  addTask(
    document.getElementById('task-title').value,
    document.getElementById('task-desc').value,
    document.getElementById('task-date').value,
    document.getElementById('task-assignee').value,
    document.getElementById('task-priority')?.value || 'medium'
  );
};

document.getElementById('close-popup').onclick = function() {
  const popup = document.getElementById('reminder-popup');
  if (popup) popup.classList.add('hidden');
};

// Load assignees from team
function loadAssignees() {
  if (!currentUser) return;
  
  db.collection('users')
    .where('team', '==', currentTeam)
    .onSnapshot(snapshot => {
      const users = new Set();
      snapshot.forEach(doc => {
        users.add(doc.data().email);
      });
      users.add(currentUser.email);
      
      const assigneeSelect = document.getElementById('task-assignee');
      if (!assigneeSelect) return;
      
      const selectedValue = assigneeSelect.value;
      assigneeSelect.innerHTML = '<option value="">Select Assignee</option>';
      users.forEach(user => {
        const option = document.createElement('option');
        option.value = user;
        option.textContent = `👤 ${user}`;
        assigneeSelect.appendChild(option);
      });
      
      if (selectedValue) assigneeSelect.value = selectedValue;
    });
}