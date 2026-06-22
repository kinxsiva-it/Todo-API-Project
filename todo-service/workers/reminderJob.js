const cron = require('node-cron');
const pool = require('../config/db');

const schedule = '0 9 * * *'; 

console.log('Todo Reminder Worker initialized...');

const startReminderJob = () => {
    cron.schedule(schedule, async () => {
        const timestamp = new Date().toLocaleString('en-US'); 
        console.log(`[${timestamp}] Cron Job is running to check for upcoming Todos...`);

        try {
            const query = `
                SELECT id, title, user_id, due_date 
                FROM todos 
                WHERE status = 'PENDING' 
                AND due_date IS NOT NULL
                AND due_date <= NOW() + INTERVAL '1 day'
                AND due_date > NOW();
            `;
            const result = await pool.query(query);

            if (result.rows.length > 0) {
                console.log(`URGENT! Found ${result.rows.length} task(s) approaching due date:`);
                
                result.rows.forEach(todo => {
                    const dueTime = new Date(todo.due_date).toLocaleString('en-US');
                    console.log(`   - [User ${todo.user_id}] Task: "${todo.title}" (Due: ${dueTime})`);
                });
            } else {
                console.log('All clear! No tasks are due within the next 24 hours.');
            }

        } catch (error) {
            console.error('Cron Job Error:', error.message);
        }
    });
};

module.exports = startReminderJob;