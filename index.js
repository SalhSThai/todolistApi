const express = require('express');
const fs = require('fs/promises');
const data = require('./db/todolist.json');
const uuid = require('uuid')
const axios = require('axios')
const app = express();
//============================================ Imported ZONE
//============================================ Encoding ZONE

app.use(express.json())
app.use(express.urlencoded({ extended: false }));

//============================================ Encoding ZONE
//============================================ LAB 01
app.get('/users', (req, res) => {
    const { id, email } = req.body;
})
app.post('/login', (req, res) => {
    const { email, password } = req.body;
})
app.put('/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;
})
app.delete('/products', (req, res) => {
    const { productId } = req.body;
})
//============================================ LAB 01
//============================================ LAB 02

//============================================ GET DATA
app.get('/todo', (req, res) => {
    const { title, completed, dueDate, offset, limit, sort } = req.query;
    if (!req.query) { fs.readFile('./db/todolist.json', 'utf-8').then(data => res.json(JSON.parse(data))) }
    else {
        let clone = [...data.todos];
        clone = title ? clone.filter(item => item.todos.title === title) : clone;
        clone = completed ? clone.filter(item => item.todos.completed === completed) : clone;
        clone = dueDate ? clone.filter(item => item.todos.dueDate === dueDate) : clone;
        clone = offset ? clone.slice(offset) : clone;
        clone = limit ? clone.slice(0, limit) : clone;
        clone = sort ? clone.sort((a, b) => { a > b ? 1 : -1 }) : clone;
        res.json(clone)

    }
})
app.get('/todo/:id', (req, res) => {
    const { id } = req.params;
    let clone = [...data.todos];
    clone = id ? clone.find(item => item.todos.id === id) : {};
    res.json(clone)

})

//============================================ ADD DATA
app.post('/todo', (req, res) => {
    const { id, title, completed, dueDate = '01-01-2022' } = req.body
    const clone = [...data.todos]
    if (!title || !title.trim()) {
        res.status(400).json({ message: 'title is required' });
    } else if (typeof completed !== 'boolean') {
        res.status(400).json({ message: 'completed must be a boolean' });
    } else if (dueDate !== undefined && isNaN(new Date(dueDate).getTime())) {
        res.status(400).json({ message: 'invalid due date' });
    } else {
        const lenght = clone.unshift({ id: uuid.v4(), title, completed, dueDate })
        fs.writeFile('./db/todolist.json', JSON.stringify({ total: lenght, todos: [...clone] }), 'utf-8')
        fs.readFile('./db/todolist.json', 'utf-8').then(data => res.status(201).json(JSON.parse(data).todos[0]))
    }
})

//============================================ REMOVE DATA
app.delete('/todo/:id', (req, res) => {
    const { id } = req.params;
    const clone = [...data.todos];
    const newArr = clone.filter(item => item.id !== id);
    fs.writeFile('./db/todolist.json', JSON.stringify({ total: newArr.length, todos: [...newArr] }), 'utf-8');
    fs.readFile('./db/todolist.json', 'utf-8').then(data => res.json(JSON.parse(data)));
})

//============================================ UPDATE DATA
app.put('/todo/:id', (req, res) => {
    const { id } = req.params;
    const newInfo = req.body;
    const clone = [...data.todos];
    const newArr = clone.map(item => item.id === id ? { ...item, ...newInfo } : item)
    fs.writeFile('./db/todolist.json', JSON.stringify({ total: newArr.length, todos: [...newArr] }), 'utf-8');
    fs.readFile('./db/todolist.json', 'utf-8').then(data => res.json(JSON.parse(data)));
})


const PORT = 8000;
app.listen(PORT, () => { console.log(`[PORT:${PORT}] Server is running...)`) })