const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Student = require('./models/student');

const app = express();
const PORT = process.env.PORT || 8006;
const JWT_SECRET = 'q6uX9$3iS^cC4h!vUe6aZ9y#K8mP1@2o';

mongoose.connect('mongodb://localhost:27017/studentDB')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};


app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
        name,
        email,
        age: req.body.age
    });

    await student.save();
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});
app.post('/login', async (req, res) => {
    console.log("Login attempt:", req.body);
    const { email, password } = req.body;
    const student = await Student.findOne({ email });

    if (student && await bcrypt.compare(password, student.password)) {
        const token = jwt.sign({ id: student._id }, JWT_SECRET);
        res.cookie('token', token, { httpOnly: true });
        console.log("Login successful, redirecting to /students");
        return res.redirect('/students');
    }
    console.log("Invalid login attempt");
    res.send('Invalid email or password');
});



app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});


app.get('/students', authenticateJWT, async (req, res) => {
    const students = await Student.find();
    res.render('students', { students });
});

app.get('/students/add', authenticateJWT, (req, res) => {
    res.render('addStudent');
});

app.post('/students', authenticateJWT, async (req, res) => {
    const { name, email, age } = req.body;
    const newStudent = new Student({ name, email, age });
    await newStudent.save();
    res.redirect('/students');
});

app.get('/students/edit/:id', authenticateJWT, async (req, res) => {
    const student = await Student.findById(req.params.id);
    res.render('editStudent', { student });
});

app.post('/students/edit/:id', authenticateJWT, async (req, res) => {
    const { name, email, age } = req.body;
    await Student.findByIdAndUpdate(req.params.id, { name, email, age });
    res.redirect('/students');
});

app.post('/students/delete/:id', authenticateJWT, async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect('/students');
});

app.listen(8006, () => {
    console.log(`Server running on http://localhost:${8006}`);
});
