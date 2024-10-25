document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:8006/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = 'students.html'; 
    } else {
        document.getElementById('message').innerText = data.message || 'Login failed';
    }
});

async function fetchStudents() {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8006/students', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (response.ok) {
        const students = await response.json();
        const studentList = document.getElementById('student-list');
        students.forEach(student => {
            const li = document.createElement('li');
            li.innerText = `${student.name} - ${student.email}`;
            studentList.appendChild(li);
        });
    }
}

if (document.getElementById('student-list')) {
    fetchStudents();
}
