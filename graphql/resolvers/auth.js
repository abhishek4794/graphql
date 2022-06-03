'use strict';

const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');

module.exports = {
  users: () => User.find()
    .then((users) => users.map((user) => ({ ...user._doc, _id: user.id }))),
  createUser: (args) =>
    User.findOne({ email: args.userInput.email }).then((user) => {
      if (user) {
        throw new Error('User exists');
      } else {
        return bcrypt.hash(args.userInput.password, 12)
          .then((harshedPassword) => {
            const user = new User({
              email: args.userInput.email,
              password: harshedPassword
            });
            return user.save();
          })
          .then((result) => (
            { ...result._doc, _id: result.id }
          ))
          .catch((err) => {
            throw err;
          });
      }
    }),
  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User does not exist');
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error('Password is incorrect');
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'somesupersecretkey',
      { expiresIn: '1h' });

    return {
      userId: user.id,
      token,
      tokenExpiration: 1
    };
  }
};
