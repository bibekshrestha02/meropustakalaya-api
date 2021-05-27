const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
  // 1 create transporter
  var transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '696bd03458bf21',
      pass: '7a9bc1eb85a1e8',
    },
  });
  // 2. Define the email options

  const mailOptions = {
    from: 'Bibek Shrestha <meropustakalya@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3. Actually send the email
  await transport.sendMail(mailOptions);
};
module.exports = sendEmail;
