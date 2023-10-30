const { db } = require('../../utils/db');
const { hashToken } = require('../../utils/hashToken');
const bcrypt = require('bcrypt');
var randomstring = require("randomstring");
const Mailjet = require('node-mailjet')
const { generateTokens } = require('../../utils/jwt');
const { v4: uuidv4 } = require('uuid');

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API,
  apiSecret: process.env.MAILJET_SECRET
});
function addRefreshTokenToWhitelist({ jti, refreshToken, userId }) {
  return db.refreshToken.create({
    data: {
      id: jti,
      hashedToken: hashToken(refreshToken),
      userId
    },
  });
}

function addHours(date, hours) {
  date.setTime(date.getTime() + hours * 60 * 60 * 1000);
  return date;
}

async function sendVeryficationEmail (user) {
  const {username, email} = user
  if(user.emailVerified){
    return "Already verified"
  }
  const jti = uuidv4();
  console.log(user, jti)
  const { accessToken } = generateTokens(user, jti);
  console.log(accessToken)
  const code = randomstring.generate(6)
  const expires = addHours(new Date(), 1);
  const link = `http://192.168.1.94:3000/api/v1/auth/verifyEmailByLink?authorization=${encodeURIComponent(accessToken)}&code=${code}`
  console.log(link)
  console.log(accessToken, user.email, link)
  await db.veryficationCode.create({
    data:{
      code:bcrypt.hashSync(code, 12),
      email: email,
      expirationDate:expires
    }
  })
  const request = await mailjet
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: "szadkowski.michal@protonmail.com",
                Name: "No Reply"
              },
              To: [
                {
                  Email: email,
                  Name: username
                }
              ],
              Subject: `Hello, ${username}`,
              TextPart: `Your veryfication code is: ${code}`,
              HTMLPart: `<h2>Code: ${code}</h2><br><a href="${link}">Link</a>`
            }
          ]
        })
}

async function verifyEmail (email, code){
  try{
    const currentDate = new Date()
    const codes = await db.veryficationCode.findMany({
      where:{
        email: email,
        expirationDate:{
          gte: currentDate
        }
      }
    })
    console.log('codes', codes)
    if(!codes){
      throw new Error()
    }
    console.log(1)
    for( let encryptedCode of codes){
      console.log('loop1')
      let matches = await bcrypt.compare(code, encryptedCode.code)
      console.log('match?')
      console.log(code, matches)
      if(matches){
        console.log('match found')
        await db.user.update({
          where:{
            email:email
          },
          data: {
            emailVerified: true,
          }
        })
        console.log('updated')
        await db.veryficationCode.deleteMany({
          where:{email:email}
        })
        return {message: "Email verified", status:201}
      }
    }
    return {message: "No match", status:404}
  }catch{
    return {message: "Failed", status:500}
  }
}

function findRefreshTokenById(id) {
  return db.refreshToken.findUnique({
    where: {
      id,
    },
  });
}

function deleteRefreshToken(id) {
  return db.refreshToken.update({
    where: {
      id,
    },
    data: {
      revoked: true
    }
  });
}

function revokeTokens(userId) {
  return db.refreshToken.updateMany({
    where: {
      userId
    },
    data: {
      revoked: true
    }
  });
}

module.exports = {
  addRefreshTokenToWhitelist,
  findRefreshTokenById,
  deleteRefreshToken,
  revokeTokens,
  sendVeryficationEmail,
  verifyEmail
};
