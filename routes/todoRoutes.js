const express = require('express');
const router = express.Router();
const { createTodo,getTodos,getTodoById,updateTodo} = require('../controllers/todoController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/', verifyToken, createTodo);

router.get('/', verifyToken, getTodos);

router.get('/:id', verifyToken, getTodoById);

router.put('/:id', verifyToken, updateTodo);

module.exports = router;