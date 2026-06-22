const nodemailer = require('nodemailer');

const createTestTransporter = async () => {
    console.log('Requesting temporary test account from Ethereal...');
    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
            user: testAccount.user, 
            pass: testAccount.pass, 
        },
    });

    console.log(`Test account is ready! User: ${testAccount.user}`);
    return transporter;
};

module.exports = createTestTransporter;