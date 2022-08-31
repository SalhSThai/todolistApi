const { readFile, writeFile } = require('fs/promises');
exports.readTodo = () => readFile('db/todolist.json', 'utf-8').then((result) => JSON.parse(result));
exports.writeTodo = data => writeFile('db/todolist.json', JSON.stringify(data), 'utf-8');