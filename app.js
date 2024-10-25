// const express = require('express');
// const mongoose = require('mongoose');
// const multer = require('multer');
// const path = require('path');
// const bodyParser = require('body-parser');

// const app = express();
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static('uploads'));

// mongoose.connect('mongodb://localhost:27017/userDB', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => console.log('MongoDB connected'))
// .catch(err => console.error('Database connection error:', err));

// const userSchema = new mongoose.Schema({
//     name: String,
//     email: String,
//     uploadedFiles: [String]
// });

// const User = mongoose.model('User', userSchema);

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/'); 
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname)); 
//     }
// });

// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 5 * 1024 * 1024 }, 
//     fileFilter: function (req, file, cb) {
//         const filetypes = /jpeg|jpg|png|pdf/;
//         const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//         const mimetype = filetypes.test(file.mimetype);
//         if (mimetype && extname) {
//             return cb(null, true);
//         } else {
//             cb(new Error('Only images and PDFs are allowed!'));
//         }
//     }
// });

// app.get('/register', (req, res) => {
//     res.send(`
//         <form action="/register" method="post" enctype="multipart/form-data">
//             <label>Name:</label><input type="text" name="name" required><br>
//             <label>Email:</label><input type="email" name="email" required><br>
//             <label>Upload Files:</label><input type="file" name="uploadedFiles" multiple><br>
//             <button type="submit">Register</button>
//         </form>
//     `);
// });

// app.post('/register', upload.array('uploadedFiles', 5), async (req, res) => {
//     try {
//         const { name, email } = req.body;
//         const uploadedFiles = req.files.map(file => file.filename);

//         const newUser = new User({ name, email, uploadedFiles });
//         await newUser.save();

//         res.send('User registered successfully!');
//     } catch (err) {
//         res.status(500).send('Error: ' + err.message);
//     }
// });

// app.get('/users', async (req, res) => {
//     const users = await User.find();
//     let userHtml = users.map(user => {
//         const files = user.uploadedFiles.map(file =>
//             `<li><a href="/download/${file}">${file}</a></li>`
//         ).join('');
//         return `<div><h3>${user.name} (${user.email})</h3><ul>${files}</ul></div>`;
//     }).join('');
//     res.send(`<h1>User List</h1>${userHtml}`);
// });


// app.get('/download/:filename', (req, res) => {
//     const filePath = path.join(__dirname, 'uploads', req.params.filename);
//     res.download(filePath, err => {
//         if (err) {
//             res.status(404).send("File not found");
//         }
//     });
// });

// app.listen(8000, () => {
//     console.log('Server running on http://localhost:8000');
// });

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
