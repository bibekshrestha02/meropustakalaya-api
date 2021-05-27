const { User } = require('../../../models/userModel');
const request = require('supertest');
const crypto = require('crypto');
const emailVerficationModel = require('../../../models/emailVerficationModel');
const { generateOTP, createOTPToken } = require('../../../helpers/helperFn');
describe('Auth /api/v1/auths', () => {
  let server, email, password, token;
  beforeEach(async () => {
    server = require('../../../index');
  });

  afterEach(async () => {
    await User.deleteMany({});
    await emailVerficationModel.deleteMany({});
    await server.close();
  });
  beforeEach(async () => {
    email = 'shresthabbk@gmail.com';
    password = 'www@1234';
    let user = new User({ email, password, name: 'Bibek Shrestha' });
    user = await user.save();
    token = user.generateAuthToken();
  });
  describe(' POST SIGNUP  /api/v1/auths/signUp', () => {
    let name;
    let email;
    let password;

    beforeEach(() => {
      name = 'Bibek Shrestha';
      email = 'shresthabbks@gmail.com';
      password = '1234567';
    });

    const exec = () => {
      return request(server).post('/api/v1/auths/signUp').send({
        email: email,
        password: password,
        name: name,
      });
    };

    describe('name', () => {
      it('should retun status 400 if admin not send name ', async () => {
        name = '';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should retun status 400 if admin name is less than 4char ', async () => {
        name = '123';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should retun status 400 if admin name is more  than 50char ', async () => {
        name = new Array(55).join('a');
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    describe('email', () => {
      it('should retun status 400 if client not send email ', async () => {
        email = '';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should retun status 400 if client send invalid email ', async () => {
        email = '1234';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return 400 if user send email that already exists in db', async () => {
        let userData = new User({
          name: 'bibekshre',
          email: email,
          password: '1234567',
        });
        await userData.save();
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    describe('password', () => {
      it('should retun status 400 if client not send password ', async () => {
        password = '';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should retun status 400 if client send password less than 4 char ', async () => {
        password = '123';
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });

    it('should return status 201 if user send valid data', async () => {
      const res = await exec();
      let user = await User.findOne({ email: email });
      let emailVerification = await emailVerficationModel.findOne({
        email: email,
      });

      expect(user).not.toBeNull();

      expect(emailVerification).not.toBeNull();
      expect(res.status).toBe(201);
    });
  });
  describe('Login POST /api/v1/auths/', () => {
    const exec = () => {
      return request(server).post('/api/v1/auths/').send({
        email,
        password,
      });
    };
    beforeEach(async () => {
      email = 'shresth@gmail.com';
      password = 'www@1234';
      let user = new User({
        email,
        password,
        name: 'Bibek Shrestha',
        isVerfied: true,
      });
      user = await user.save();
      token = user.generateAuthToken();
    });
    describe('email', () => {
      it('should return status 400 if user send string as email', async () => {
        email = '1234';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if user send invalid email', async () => {
        email = 'shresthabbksasdf@gmail.com';
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    describe('password', () => {
      it('should return status 400 if user dont  send password', async () => {
        password = '';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if user send invalid password', async () => {
        password = '1234';
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    it('should return status 400 if account is not verified', async () => {
      await User.findOneAndUpdate(
        {
          email,
        },
        { isVerfied: false }
      );
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return status 200 with token and user data if user send valid data', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
    });
  });
  describe('Send token POST /api/v1/auths/email/sendToken', () => {
    const exec = () => {
      return request(server)
        .post('/api/v1/auths/email/sendToken')
        .send({ email });
    };
    it('should return status 400 if email is not send', async () => {
      email = '';
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('should return status 400 if email is not exists', async () => {
      email = 'shresthabbbsks@gmail.com';
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('should update emailVarification date if token is resend', async () => {
      let date = Date.now();
      await emailVerficationModel.create({
        email: email,
        OTPtoken: createOTPToken(generateOTP()),
        createAt: date,
      });
      await exec();
      let emailToken = await emailVerficationModel.findOne({ email: email });
      expect(Date.parse(emailToken.createAt)).not.toBe(Date.parse(date));
    });
    it('should return status 400 if user is verfied', async () => {
      await User.findOneAndUpdate(
        { email },
        {
          isVerfied: true,
        }
      );
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return status 200 ', async () => {
      const res = await exec();
      expect(res.status).toBe(201);
    });
  });
  describe('GET verifyEmail /api/v1/auths/email/verifyEmail', () => {
    let otp;
    beforeEach(async () => {
      otp = generateOTP();
      await emailVerficationModel.create({
        email: email,
        OTPtoken: createOTPToken(otp),
      });
    });
    const exec = () => {
      return request(server)
        .get('/api/v1/auths/email/verifyEmail')
        .send({ email, otp });
    };
    it('should return status 400 if email and otp is not send', async () => {
      otp = '';
      email = '';
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('should return status 400 if email is not exits', async () => {
      email = 'shresthaaaa@gmail.com';
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('should return status 400 if otp is not correct', async () => {
      otp = '5647';
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('should verified email', async () => {
      await exec();
      const user = await User.findOne({ email });
      expect(user.isVerfied).toBeTruthy();
    });
    it('should return status 200 with token and data', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('data');
      expect(res.status).toBe(200);
    });
  });

  describe('resetPassword ', () => {
    describe('GetEmail get /api/v1/auths/resetPassword/email/', () => {
      const exec = () => {
        return request(server).get(
          `/api/v1/auths/resetPassword/email/${email}`
        );
      };
      it('should return status 400 if client send invalid email', async () => {
        email = 'shres@gmail.com';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 200 with client name, email & user', async () => {
        const res = await exec();
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('name');
        expect(res.body.data).toHaveProperty('email');
        expect(res.body.data).toHaveProperty('role');
      });
    });
    describe('Send OTP to client email POST /api/v1/auths/resetPassword/sendOtp/', () => {
      const exec = () => {
        return request(server)
          .post('/api/v1/auths/resetPassword/sendOtp/')
          .send({ email });
      };
      it('should return status 400 if email is not send', async () => {
        email = '';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if client send invalid', async () => {
        email = 'shrestha@gmail.comasd';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should set password reset token', async () => {
        await exec();
        let user = await User.findOne({ email: email });
        expect(user.passwordResetToken).toBeDefined();
        expect(user.passwordResetExpires).toBeDefined();
      });

      it('should return status 200 ', async () => {
        const res = await exec();
        expect(res.status).toBe(200);
      });
    });
    describe('GET /api/v1/auths/resetPassword/forgetVerifyCode/', () => {
      let otp;
      beforeEach(async () => {
        otp = '1234';
        const hashOtp = crypto.createHash('sha256').update(otp).digest('hex');
        let user = await User.findOne({ email: email });
        user.passwordResetToken = hashOtp;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
        user = await user.save();
      });
      const exec = () => {
        return request(server).get(
          `/api/v1/auths/resetPassword/forgetVerifyCode/${email}/${otp}`
        );
      };
      it('should return status 400 if email and otp is not send', async () => {
        otp = '';
        email = '';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if email is invalid', async () => {
        otp = '';
        email = 'shresthasfasd@gamil.com';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if otp is invalid', async () => {
        otp = '2564';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if otp os expired', async () => {
        await User.findOneAndUpdate(
          { email: email },
          { passwordResetExpires: Date.now() }
        );
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 200 ', async () => {
        const res = await exec();
        expect(res.status).toBe(200);
      });
    });
    describe('GET /api/v1/auths/resetPassword/reset/', () => {
      let otp, newPassword;
      beforeEach(async () => {
        otp = '1234';
        newPassword = '12345678';
        let user = await User.findOne({ email: email });
        user.passwordResetToken = crypto
          .createHash('sha256')
          .update(otp)
          .digest('hex');
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
        user = await user.save();
      });
      const exec = () => {
        return request(server).put('/api/v1/auths/resetPassword/reset/').send({
          otp,
          email,
          newPassword,
        });
      };
      it('should return status 400 if email password and otp is not send', async () => {
        otp = '';
        email = '';
        newPassword = '';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if email is invalid', async () => {
        email = 'shresthasfasd@gamil.com';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if otp is invalid', async () => {
        otp = '2564';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if password is lesser than 4char', async () => {
        newPassword = '123';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 200 ', async () => {
        const res = await exec();
        const user = await User.findOne({ email: email });
        expect(await user.comparePassword(newPassword)).toBeTruthy();
        expect(user.passwordResetToken).not.toBeDefined();
        expect(user.passwordResetExpires).not.toBeDefined();
        expect(res.status).toBe(200);
      });
    });
  });
  describe('Change password PUT /api/v1/auths/password', () => {
    let newPassword;
    beforeEach(() => {
      newPassword = '123456';
    });
    const exec = () => {
      return request(server)
        .put('/api/v1/auths/password')
        .set('x-auth-token', token)
        .send({
          password,
          newPassword,
        });
    };
    it('should returns status 401 if token not send', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });
    describe('Password validation', () => {
      it('should return status 400 if password and new Password is not sent', async () => {
        password = '';
        newPassword = '';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if password and new Password is less than 4char', async () => {
        password = '123';
        newPassword = '123';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if password dont matched', async () => {
        password = '12345';
        newPassword = '12345';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if current password and new password matched', async () => {
        password = '12345';
        newPassword = '12345';
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    it('should return status 200 with token and save new password', async () => {
      const res = await exec();
      user = await User.findOne({ email: email });
      expect(await user.comparePassword(newPassword)).toBeTruthy();
      expect(res.body).toHaveProperty('token');
      expect(res.status).toBe(200);
    });
  });
});
