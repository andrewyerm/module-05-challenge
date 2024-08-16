// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
function generateTaskId() {
    let id = nextId++;
    localStorage.setItem('nextId', JSON.stringify(nextId));
    return id;
}

// Create a task card
function createTaskCard(task) {
    const card = $(`
        <div class="card mb-2 task-card" id="task-${task.id}" data-id="${task.id}">
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text"><small class="text-muted">Due: ${task.dueDate}</small></p>
                <button class="btn btn-danger btn-sm delete-task">Delete</button>
            </div>
        </div>
    `);

    // Add color coding for deadlines
    const dueDate = dayjs(task.dueDate);
    const now = dayjs();
    if (dueDate.isBefore(now, 'day')) {
        card.addClass('bg-danger text-white');
    } else if (dueDate.diff(now, 'day') <= 3) {
        card.addClass('bg-warning text-dark');
    }

    return card;
}

// Render the task list and make cards draggable
function renderTaskList() {
    // Clear existing tasks
    $('#todo-cards').empty();
    $('#in-progress-cards').empty();
    $('#done-cards').empty();

    // Add tasks to their respective columns
    taskList.forEach(task => {
        const card = createTaskCard(task);
        if (task.status === 'to-do') {
            $('#todo-cards').append(card);
        } else if (task.status === 'in-progress') {
            $('#in-progress-cards').append(card);
        } else if (task.status === 'done') {
            $('#done-cards').append(card);
        }
    });

    // Make tasks draggable
    $(".task-card").draggable({
        revert: "invalid",
        helper: "clone",
        start: function(event, ui) {
            $(this).addClass('dragging');
        },
        stop: function(event, ui) {
            $(this).removeClass('dragging');
        }
    });

    // Make lanes droppable
    $(".lane").droppable({
        accept: ".task-card",
        drop: function(event, ui) {
            const taskId = ui.helper.data("id");
            const newStatus = $(this).attr("id");
            updateTaskStatus(taskId, newStatus);
        }
    });

    // Add delete button functionality
    $(".delete-task").click(handleDeleteTask);
}

// Handle adding a new task
function handleAddTask(event) {
    event.preventDefault();
    const title = $('#task-title').val();
    const description = $('#task-desc').val();
    const dueDate = $('#task-due-date').val();

    if (title && description && dueDate) {
        const newTask = {
            id: generateTaskId(),
            title,
            description,
            dueDate,
            status: 'to-do'
        };
        taskList.push(newTask);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        $('#formModal').modal('hide');
        $('#add-task-form')[0].reset();
        renderTaskList();
    }
}

// Handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(event.target).closest('.task-card').data('id');
    taskList = taskList.filter(task => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Update task status
function updateTaskStatus(taskId, newStatus) {
    const task = taskList.find(task => task.id === taskId);
    task.status = newStatus;
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();
    $("#add-task-form").submit(handleAddTask);
    $("#task-due-date").datepicker({ dateFormat: "yy-mm-dd" });
});
