const express = require('express');
const fs = require('fs/promises');
const {readTodo,writeTodo} = require('./db/file');
const data = require('./db/todolist.json');
const uuid = require('uuid')
const axios = require('axios');
const { json } = require('express');
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
app.get('/todos', (req, res) => {
    const { title, completed, dueDate, offset, limit, sort } = req.query;
    if (!req.query) { fs.readFile('./db/todolist.json', 'utf-8').then(data => res.status(200).json(JSON.parse(data))).catch(err=>res.status(500).json({err:err.message})) }
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
app.get('/todos/:id',async (req,res)=>{
    try {
        const {id}=req.params;
        const oldTodos = await readTodo();
        const todo = oldTodos.todos.find(item=>item.id===id)?? null;
        res.json({total:todo.lenght,todo});
    } catch (err) {
        res.status(500).json({err:err.message})
    }
})


//============================================ ADD DATA
app.post('/todos', (req, res) => {
    const { id, title, completed, dueDate = '1970-01-01' } = req.body
    // const obj = [...data.todos]

    if (!title || !title.trim()) {
        res.status(400).json({ message: 'title is required' });
    } else if (typeof completed !== 'boolean') {
        res.status(400).json({ message: 'completed must be a boolean' });
    } else if (dueDate !== undefined && isNaN(new Date(dueDate).getTime())) {
        res.status(400).json({ message: 'invalid due date' });
    } else {
        const obj = { id: uuid.v4(), title, completed, dueDate }
        fs.readFile('./db/todolist.json', 'utf-8').then(data => {
            const clone = [...JSON.parse(data).todos]
            const lenght = clone.unshift(obj)
            return fs.writeFile('./db/todolist.json', JSON.stringify({ total: lenght, todos: [...clone] }), 'utf-8')
        })
            .then((clone) => {
                res.status(201).json({ "newData": obj })
            })
            .catch(err => {
                res.status(500).json({ message: err.message })
            })
    }
})

//============================================ REMOVE DATA
app.delete('/todos/:id',async (req, res) => {
    const { id } = req.params;
    try {        
        const oldTodos = await readTodo();
        const newTodos = oldTodos.todos.filter(item=>item.id!==id)
        await writeTodo(newTodos)
        res.status(200).json({message:'Success delete'})
        
    } catch (err) {
        res.status(500).json({err:err.message})
    }
    const clone = [...data.todos];
    const newArr = clone.filter(item => item.id !== id);
    fs.writeFile('./db/todolist.json', JSON.stringify({ total: newArr.length, todos: [...newArr] }), 'utf-8');
    fs.readFile('./db/todolist.json', 'utf-8').then(data => res.json(JSON.parse(data)));
})

//============================================ UPDATE DATA
app.put('/todos/:id',async (req, res) => {
    try {
        const {title,completed,dueDate} = req.body;
        const {id} = req.params;        
        const oldTodos = await readTodo();
        const newTodo = {id,title,completed,dueDate};
        const mewTodos = oldTodos.todos.map(item=>(item.id===id?newTodo:item))
        await writeTodo({ total: mewTodos.length, todos: [...mewTodos] })
        res.status(200).json({update:newTodo})
    } catch (err) {
        res.status(500).json({err:err.message})
    }
})

const PORT = 8000;
app.listen(PORT, () => { console.log(`[PORT:${PORT}] Server is running...`) })