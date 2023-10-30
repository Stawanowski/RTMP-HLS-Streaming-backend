const bcrypt = require('bcrypt');
const { db } = require('../../utils/db');

function findUserByEmail(email) {
  return db.user.findUnique({
    where: {
      email,
    },
    include:{
      follows: true
    }
  });
}

function findUserByUsername(username) {
  return db.user.findUnique({
    where: {
      username,
    },
  });
}

function createUserByEmailAndPassword(user) {
  user.password = bcrypt.hashSync(user.password, 12);
  return db.user.create({
    data: user,
    include:{
      follows:true
    }
  });
}

function findUserById(id) {
  return db.user.findUnique({
    where: {
      id,
    },
  });
}

module.exports = {
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createUserByEmailAndPassword
};
