/* ==========================================
JAVASCRIPT BEHAVIORS & LOGIC
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const closeMenuBtn = document.getElementById('close-menu');
    const navLinks = document.getElementById('nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('open');
        });
    }

    if (closeMenuBtn && navLinks) {
        closeMenuBtn.addEventListener('click', () => {
            navLinks.classList.remove('open');
        });
    }

    // Close mobile dropdown/menu when clicking anywhere outside of it
    document.addEventListener('click', (e) => {
        if (navLinks && navLinks.classList.contains('open')) {
            if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navLinks.classList.remove('open');
            }
        }
    });

    // Restore active page from localStorage on load
    const savedPage = localStorage.getItem('activePortfolioPage');
    if (savedPage) {
        switchPage(savedPage);
    }

    renderTasks();
    setInterval(renderTasks, 60000);

    const taskInput = document.getElementById("taskInput");
    const taskDateTime = document.getElementById("taskDateTime");
    const addTaskBtn = document.getElementById("addTaskBtn");

    if (addTaskBtn) {
        addTaskBtn.addEventListener("click", () => {
            const taskText = taskInput.value.trim();
            const dateTimeVal = taskDateTime.value;

            if (taskText === "") {
                alert("Please enter a task description!");
                return;
            }

            function formatDateTime(dtStr) {
                const dateObj = new Date(dtStr);
                return dateObj.toLocaleString('en-US', { 
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                });
            }

            const newTask = {
                id: Date.now(),
                text: taskText,
                rawDateTime: dateTimeVal || null,
                dateTime: dateTimeVal ? formatDateTime(dateTimeVal) : "No deadline set",
                completed: false
            };

            tasks.push(newTask);
            saveAndRenderTasks();
            taskInput.value = "";
            taskDateTime.value = "";
        });
    }

    const phoneInput = document.getElementById("phone");
    if (phoneInput) {
        phoneInput.addEventListener("input", (e) => {
            let val = e.target.value.trim();
            if (val.length > 0 && !val.startsWith('+') && /^\d/.test(val)) {
                val = '+' + val;
            }
            let cleaned = val.replace(/[^\d+]/g, '');
            
            if (cleaned.length > 1) {
                let formatted = cleaned.substring(0, 4);
                if (cleaned.length > 4) formatted += ' ' + cleaned.substring(4, 7);
                if (cleaned.length > 7) formatted += ' ' + cleaned.substring(7, 10);
                if (cleaned.length > 10) formatted += ' ' + cleaned.substring(10, 15);
                e.target.value = formatted;
            } else {
                e.target.value = cleaned;
            }
        });
    }

    const contactForm = document.getElementById("contactForm");
    const submitBtn = document.getElementById("submitBtn");

    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = phoneInput.value.trim();
            const message = document.getElementById("message").value.trim();

            const nameError = document.getElementById("nameError");
            const emailError = document.getElementById("emailError");
            const phoneError = document.getElementById("phoneError");
            const messageError = document.getElementById("messageError");

            nameError.textContent = "";
            emailError.textContent = "";
            phoneError.textContent = "";
            messageError.textContent = "";

            let isValid = true;

            if (name === "") {
                nameError.textContent = "Name field cannot be empty.";
                isValid = false;
            }

            if (email === "") {
                emailError.textContent = "Email field cannot be empty.";
                isValid = false;
            } else {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(email)) {
                    emailError.textContent = "Please enter a valid email address format.";
                    isValid = false;
                }
            }

            if (phone === "") {
                phoneError.textContent = "Phone number field cannot be empty.";
                isValid = false;
            } else {
                const rawDigits = phone.replace(/\D/g, '');
                if (!phone.startsWith('+')) {
                    phoneError.textContent = "Phone number must start with a country code (e.g. +234...).";
                    isValid = false;
                } else if (rawDigits.length < 11) {
                    phoneError.textContent = "Please enter a complete phone number including country code.";
                    isValid = false;
                }
            }

            if (message === "") {
                messageError.textContent = "Message field cannot be empty.";
                isValid = false;
            }

            if (isValid) {
                submitBtn.innerHTML = `<span class="spinner"></span> Sending message...`;
                submitBtn.disabled = true;

                setTimeout(() => {
                    showPopupAlert(`Success! Thank you, ${name}. Your message has been sent.`);
                    contactForm.reset();
                    submitBtn.innerHTML = "Send Message";
                    submitBtn.disabled = false;
                }, 1000);
            }
        });
    }
});

// Global Helper Functions
function switchPage(pageId) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => sec.classList.remove('active-page'));

    const targetSection = document.getElementById(pageId);
    if (targetSection) targetSection.classList.add('active-page');

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('data-target') === pageId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    localStorage.setItem('activePortfolioPage', pageId);
    const navLinks = document.getElementById('nav-links');
    if (navLinks) navLinks.classList.remove('open');
    window.scrollTo(0, 0);
}

let tasks = JSON.parse(localStorage.getItem('academicTasks')) || [];

function renderTasks() {
    const taskList = document.getElementById("taskList");
    if (!taskList) return;

    taskList.innerHTML = "";
    if (tasks.length === 0) {
        taskList.innerHTML = "<p style='color: #7f8c8d; text-align: center; padding: 1rem;'>No tasks added yet.</p>";
        return;
    }

    const now = new Date();

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = `task-item ${task.completed ? "completed" : ""}`;
        
        let badgeHTML = "";
        if (task.rawDateTime && !task.completed) {
            const dueDate = new Date(task.rawDateTime);
            if (now > dueDate) {
                badgeHTML = `<span class="overdue-badge">⚠️ OVERDUE</span>`;
            } else if (dueDate - now <= 24 * 60 * 60 * 1000) {
                badgeHTML = `<span class="due-badge">🔔 DUE SOON</span>`;
            }
        }

        li.innerHTML = `
            <div class="task-info-content">
                <input type="checkbox" ${task.completed ? "checked" : ""} onclick="toggleTask(${task.id})">
                <div>
                    <span class="task-text">${task.text}</span>
                    <div class="task-meta">📅 ${task.dateTime} ${badgeHTML}</div>
                </div>
            </div>
            <div class="task-actions">
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

function saveAndRenderTasks() {
    localStorage.setItem('academicTasks', JSON.stringify(tasks));
    renderTasks();
}

function toggleTask(id) {
    tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
    saveAndRenderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRenderTasks();
}

function showPopupAlert(message) {
    const popup = document.getElementById("popupAlert");
    const popupText = document.getElementById("popupAlertText");
    popupText.textContent = message;
    popup.classList.add("show");

    setTimeout(() => {
        popup.classList.remove("show");
    }, 3500);
}