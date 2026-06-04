const pool = require('../config/db');

const createTodo = async (req, res) => {
  try {
    const {title} = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required and cannot be empty' });
    }
    const userId = req.user.user_id;
    const newTodo = await pool.query(
      'INSERT INTO todos (title, user_id) VALUES ($1, $2) RETURNING *',
      [title, userId]
    );
    res.status(201).json({
      message: 'Todo created successfully',
      todo: newTodo.rows[0]
    });

  } catch (error) {
    console.error('Error in createTodo:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getTodos = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { status } = req.query; 

    let query = 'SELECT * FROM todos WHERE user_id = $1';
    let values = [userId];

    if (status) {
      query += ' AND status = $2';
      values.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);
    
    res.status(200).json(result.rows);

  } catch (error) {
    console.error('Error in getTodos:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getTodoById = async (req, res) => {
  try {
    const { id } = req.params; 
    const userId = req.user.user_id;

    const result = await pool.query(
      'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found or you do not have permission to view it' });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error('Error in getTodoById:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createTodo,
  getTodos,
  getTodoById
};

