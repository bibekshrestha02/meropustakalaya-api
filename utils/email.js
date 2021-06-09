const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
  // 1 create transporter
  var transport = nodemailer.createTransport({
    host:
      process.env.NODE_ENV === 'production'
        ? 'smtp.gmail.com'
        : 'smtp.mailtrap.io',
    port: 465,
    auth: {
      user:
        process.env.NODE_ENV === 'production'
          ? process.env.EMAIL_USERNAME
          : '696bd03458bf21',
      pass:
        process.env.NODE_ENV === 'production'
          ? process.env.EMAIL_PASSWORD
          : '7a9bc1eb85a1e8',
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
