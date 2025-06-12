// DOM Elements
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const todoList = document.getElementById('todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalTasksElement = document.getElementById('total-tasks');
const completedTasksElement = document.getElementById('completed-tasks');
const pendingTasksElement = document.getElementById('pending-tasks');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentTheme = localStorage.getItem('theme') || 'light';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    renderTasks();
    applyTheme(currentTheme);
});

// Event Listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
});

// Functions
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date()
        };

        tasks.unshift(task);
        saveTasks();
        renderTasks();
        updateStats();
        taskInput.value = '';
        
        // Add animation to new task
        const newTaskElement = todoList.firstElementChild;
        if (newTaskElement) {
            newTaskElement.style.animation = 'slideIn 0.3s ease-out';
        }
    }
}

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
    renderTasks();
    updateStats();
}

function deleteTask(id) {
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    if (taskElement) {
        taskElement.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
            updateStats();
        }, 300);
    }
}

function renderTasks() {
    todoList.innerHTML = '';
    
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="todo-text">${task.text}</span>
            <button class="delete-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;

        const checkbox = li.querySelector('.todo-checkbox');
        const deleteBtn = li.querySelector('.delete-btn');

        checkbox.addEventListener('change', () => toggleTask(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        todoList.appendChild(li);
    });
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    // Update stats immediately
    totalTasksElement.textContent = total;
    completedTasksElement.textContent = completed;
    pendingTasksElement.textContent = pending;

    // Then animate if there's a change
    if (total > 0 || completed > 0 || pending > 0) {
        animateNumber(totalTasksElement, total);
        animateNumber(completedTasksElement, completed);
        animateNumber(pendingTasksElement, pending);
    }
}

function animateNumber(element, target) {
    const current = parseInt(element.textContent) || 0;
    const increment = (target - current) / 10;
    let currentValue = current;

    const animate = () => {
        currentValue += increment;
        if ((increment > 0 && currentValue >= target) || 
            (increment < 0 && currentValue <= target)) {
            element.textContent = target;
        } else {
            element.textContent = Math.round(currentValue);
            requestAnimationFrame(animate);
        }
    };

    animate();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add slideOut animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(20px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 