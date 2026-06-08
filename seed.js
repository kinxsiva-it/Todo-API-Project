const pool = require('./config/db.js'); // แก้ path ให้ตรงกับที่เชื่อมต่อ Database ของคุณ
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        console.log('🌱 เริ่มต้นการทำ Super Seeding (สร้างข้อมูล 100+ รายการ)...');

        // 1. ล้างข้อมูลเก่า
        await pool.query('DELETE FROM todos');
        await pool.query('DELETE FROM users');
        await pool.query('ALTER SEQUENCE todos_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
        console.log('🧹 ล้างข้อมูลตารางเรียบร้อย');

        // 2. สร้าง User สำหรับทดสอบ
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        const userRes = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
            ['testuser@example.com', hashedPassword]
        );
        const userId = userRes.rows[0].id;
        console.log(`👤 สร้าง User สำเร็จ: testuser@example.com`);

        // 3. ชุดข้อมูลเริ่มต้นแบบเจาะจง (ไว้เทสต์ระบบ Search คำเฉพาะเจาะจง)
        const specificTodos = [
            { title: 'เตรียมเอกสารเริ่มฝึกงาน Full Stack Developer ที่ Nilecon', description: 'เช็กกำหนดการเริ่มงานเดือนมิถุนายน', status: 'DONE' },
            { title: 'เอาไม้แบด Victor Ryuga ไปขึ้นเอ็นใหม่', description: 'สั่งขึ้นเอ็นความตึง 27 lbs สำหรับเกมบุกแดนหลัง', status: 'PENDING' },
            { title: 'ตารางเข้ายิม Upper Body', description: 'เล่นเสร็จอย่าลืมไปวัดมวลร่างกายด้วยเครื่อง EVOLT', status: 'IN_PROGRESS' },
            { title: 'เช็กราคา MacBook Pro มือสอง', description: 'เปรียบเทียบสเปคสำหรับเขียน Node.js และรันคอนเทนเนอร์', status: 'DONE' },
            { title: 'ทบทวนเฟรมเวิร์ก Go (Fiber) และ Java (Spring Boot)', description: 'อัปเดตความรู้ในพอร์ตโฟลิโอ', status: 'PENDING' },
            { title: 'เตรียมกระเป๋ากีฬาสำหรับแมตช์วันศุกร์', description: 'หยิบไม้ VS Dragon Subduing ไปด้วย', status: 'PENDING' }
        ];

        // 4. สร้างข้อมูลแบบสุ่มเพิ่มอีก 100 รายการ!
        const categories = ['อ่านบล็อก', 'แก้บั๊ก', 'ประชุม', 'ทำความสะอาด', 'ซื้อของ', 'พักผ่อนดูซีรีส์', 'อัปเดตเรซูเม่'];
        const statuses = ['PENDING', 'IN_PROGRESS', 'DONE'];

        const todos = [...specificTodos]; // เอาข้อมูลชุดแรกรวมกับก้อนใหญ่

        for (let i = 1; i <= 100; i++) {
            // สุ่มเลือกหมวดหมู่และสถานะ
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            todos.push({
                title: `${randomCategory} - งานย่อยที่ ${i}`,
                description: `รายละเอียดจำลองสำหรับ${randomCategory} ลำดับที่ ${i} ใช้สำหรับทดสอบ Pagination`,
                status: randomStatus
            });
        }

        const insertPromises = todos.map(todo => 
            pool.query(
                'INSERT INTO todos (user_id, title, status) VALUES ($1, $2, $3)',
                [userId, todo.title, todo.status]
            )
        );

        await Promise.all(insertPromises);
        
        console.log(`📝 บันทึก Todos ทั้งหมด ${todos.length} รายการสำเร็จ!`);
        console.log('✅ พร้อมสำหรับการทดสอบ Pagination แบบจัดเต็ม!');
        
        process.exit(0);

    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error);
        process.exit(1);
    }
};

seedDatabase();