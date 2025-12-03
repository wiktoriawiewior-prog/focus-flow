let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let draggedTask = null;

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
    const input = document.getElementById('taskInput');
    const timeInput = document.getElementById('timeInput');
    const text = input.value.trim();
    const time = parseInt(timeInput.value) || null;
    
    if (text === '') {
        alert('Wpisz treść zadania!');
        return;
    }
    
    const task = {
        id: Date.now(),
        text: text,
        status: 'todo',
        time: time
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks();
    input.value = '';
    timeInput.value = '';
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

function moveTask(id, direction) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const statuses = ['todo', 'inprogress', 'done'];
    const currentIndex = statuses.indexOf(task.status);
    
    if (direction === 'next' && currentIndex < statuses.length - 1) {
        task.status = statuses[currentIndex + 1];
    } else if (direction === 'prev' && currentIndex > 0) {
        task.status = statuses[currentIndex - 1];
    }
    
    saveTasks();
    renderTasks();
}

function renderTasks() {
    const columns = ['todo', 'inprogress', 'done'];
    
    columns.forEach(status => {
        const container = document.getElementById(status);
        const columnTasks = tasks.filter(task => task.status === status);
        
        container.innerHTML = '';
        
        columnTasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'task';
            taskEl.draggable = true;
            taskEl.dataset.id = task.id;
            
            const actions = [];
            if (task.status !== 'todo') {
                actions.push(`<button class="move-btn" onclick="moveTask(${task.id}, 'prev')">← Wstecz</button>`);
            }
            if (task.status !== 'done') {
                actions.push(`<button class="move-btn" onclick="moveTask(${task.id}, 'next')">Dalej →</button>`);
            }
            actions.push(`<button class="delete-btn" onclick="deleteTask(${task.id})">🗑️</button>`);
            
            const timeDisplay = task.time ? `<span class="task-time">⏱️ ${task.time} min</span>` : '';
            
            taskEl.innerHTML = `
                <div class="task-content">
                    <span class="task-text">${task.text}</span>
                    <div class="task-actions">
                        ${timeDisplay}
                        ${actions.join('')}
                    </div>
                </div>
            `;
            
            taskEl.addEventListener('dragstart', handleDragStart);
            taskEl.addEventListener('dragend', handleDragEnd);
            
            container.appendChild(taskEl);
        });
        
        const column = document.querySelector(`[data-status="${status}"]`);
        const count = column.querySelector('.task-count');
        count.textContent = columnTasks.length;
    });
}

function handleDragStart(e) {
    draggedTask = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

document.querySelectorAll('.tasks').forEach(container => {
    container.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });
    
    container.addEventListener('drop', e => {
        e.preventDefault();
        if (!draggedTask) return;
        
        const taskId = parseInt(draggedTask.dataset.id);
        const newStatus = container.id;
        
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            saveTasks();
            renderTasks();
        }
    });
});

document.getElementById('taskInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        addTask();
    }
});

renderTasks();
