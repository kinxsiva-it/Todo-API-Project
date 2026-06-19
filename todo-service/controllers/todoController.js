const pool = require('../config/db');

const createTodo = async (req, res, next) => {
  try {
    const {title,due_date} = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required and cannot be empty' });
    }
    const userId = req.user.user_id;
    const newTodo = await pool.query(
      'INSERT INTO todos (title, due_date, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, due_date, userId]
    );
    res.status(201).json({
      message: 'Todo created successfully',
      todo: newTodo.rows[0]
    });

  } catch (error) {
    next(error);
  }
};

const getTodos = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    let { page = 1, limit = 10, search, status } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    let queryStr = 'select * from todos where user_id = $1';
    let countQueryStr = 'select count(*) from todos where user_id = $1';
    
    const values = [userId];
    let paramIndex = 2;

    if (status) {
      queryStr += ` AND status = $${paramIndex}`;
      countQueryStr += ` AND status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    if (search) {
      queryStr += ` AND title ILIKE $${paramIndex}`;
      countQueryStr += ` AND title ILIKE $${paramIndex}`;
      values.push(`%${search}%`);
      paramIndex++;
    }
    
    queryStr += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const queryValues = [...values, limit, offset];

    const countResult = await pool.query(countQueryStr, values);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await pool.query(queryStr, queryValues);

    res.status(200).json({
      data: result.rows,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    next(error);
  }
};

const getTodoById = async (req, res, next) => {
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
    next(error);
  }
};

const updateTodo = async (req, res, next) => {
    try {
        const {id} = req.params;
        const {title, status} = req.body;
        const userId = req.user.user_id;

        // validation
        if (!title || title.trim() === '' || !status) {
            return res.status(400).json({ error: 'Title and status are required' });
        }

        const validStatuses = ['PENDING', 'IN_PROGRESS', 'DONE'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
        }

        const result = await pool.query(
            'UPDATE todos SET title = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *',
            [title, status, id, userId]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Todo not found or you do not have permission to update it' });
        }
        res.status(200).json({
            message: 'Todo updated successfully',
            todo: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

const deleteTodo = async (req, res, next) => {
    try {
        const {id} = req.params;
        const userId = req.user.user_id;

        const result = await pool.query(
            'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        ); 
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Todo not found or you do not have permission to delete it' });
        }
        res.status(200).json({
            message: 'Todo deleted successfully',
            todo: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo
};


