let token = '';

// Handle user registration
document.getElementById('registerBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:8007/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        alert('User registered successfully');
    } else {
        alert('Failed to register');
    }
});

// Handle user login
document.getElementById('loginBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:8007/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        token = data.token;
        alert('Login successful');
        fetchStudents();
    } else {
        alert('Invalid credentials');
    }
});

// Add Student
document.getElementById('addStudent').addEventListener('click', async () => {
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const email = document.getElementById('email').value;

    const response = await fetch('http://localhost:8007/students', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, age, email })
    });

    if (response.ok) {
        const newStudent = await response.json();
        addToList(newStudent);
    } else {
        alert('Failed to add student');
    }
});

// Fetch Students
const fetchStudents = async () => {
    const response = await fetch('http://localhost:8007/students', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const students = await response.json();
    students.forEach(student => addToList(student));
};

// Add Student to List
const addToList = (student) => {
    const li = document.createElement('li');
    li.textContent = `${student.name} - ${student.age} - ${student.email}`;
    document.getElementById('studentsList').appendChild(li);
};
