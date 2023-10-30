const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const {
  findUserByEmail,
  createUserByEmailAndPassword,
  findUserById,
  findUserByUsername
} = require('../users/users.services');
const { generateTokens } = require('../../utils/jwt');
const {
  addRefreshTokenToWhitelist,
  findRefreshTokenById,
  deleteRefreshToken,
  revokeTokens,
  sendVeryficationEmail,
  verifyEmail
} = require('./auth.services');
const { hashToken } = require('../../utils/hashToken');
const { db } = require('../../utils/db');
const { isAuthenticatedByQuery, isAuthenticated } = require('../../middlewares');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, username, pfp } = req.body;
    console.log(email, password, username, pfp)
    if (!email || !password || !username || !pfp) {
      res.status(400);
      throw new Error('You must provide an email and a password.');
    }

    let existingUser = await findUserByEmail(email);
    
    if (existingUser) {
      console.log('exists')
      res.status(400);
      
      throw new Error('Email already in use.');
    }
    existingUser = await findUserByUsername(username)
    if (existingUser) {
      console.log('exists username')
      res.status(400);
      throw new Error('Username already in use.');
    }
    console.log('creating...')
    const user = await createUserByEmailAndPassword({ email, password, username, pfp });
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });
    console.log(user)
    res.json({
      accessToken,
      refreshToken,
      email,
      username,
      pfp,
      follows: user.follows
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('You must provide an email and a password.');
    }

    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: existingUser.id });
    const {pfp} = await findUserByEmail(email)
    res.json({
      accessToken,
      refreshToken,
      email,
      username: existingUser.username,
      pfp,
      follows:existingUser.follows
    });
  } catch (err) {
    next(err);
  }
});

router.post('/refreshToken', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400);
      throw new Error('Missing refresh token.');
    }
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const savedRefreshToken = await findRefreshTokenById(payload.jti);

    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const hashedToken = hashToken(refreshToken);
    if (hashedToken !== savedRefreshToken.hashedToken) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const user = await findUserById(payload.userId);
    if (!user) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    await deleteRefreshToken(savedRefreshToken.id);
    const jti = uuidv4();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken: newRefreshToken, userId: user.id });

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    next(err);
  }
});

router.post('/revokeRefreshTokens', async (req, res, next) => {
  try {
    const { userId } = req.body;
    await revokeTokens(userId);
    res.json({ message: `Tokens revoked for user with id #${userId}` });
  } catch (err) {
    next(err);
  }
});

router.post('/sendVeryficationEmail', isAuthenticated, async (req,res) => {
  try{
    const {userId} = req.payload;
    const user = await findUserById(userId)
    console.log(user)
    if(!user){
      throw new Error()
    }
    const response = await sendVeryficationEmail(user)
    if(response == "Already verified"){
      res.send("Already verified").status(300 )
    }else{
      res.send("Sent").status(200)
    } 
    }catch(err){
      res.send(err).status(500)
      console.error(err)
    }
})
router.post('/verifyEmail', isAuthenticated, async(req,res) => {
  try{
    const {code} = req.body;
    const {userId} = req.payload;
    const user = await db.user.findUnique({
      where:{id:userId}
    })
    if(!user){
      throw new Error({message:"No such user", status:404})
    }
    const email = user.email
    console.log(code, email)
    let response = await verifyEmail(email, code)
    console.log('res', response.status, response.status != 201)
    if(response.status != 201) throw new Error()
    console.log(4)
    res.statusCode = 200
    console.log(3)
    res.statusMessage = {res}
    console.log(2)
    res.json()
    console.log(1)
    }catch(err){
      console.log(err)
      res.statusCode = 500
      res.statusMessage = "Failed"
      res.send()
    }
})

router.get('/verifyEmailByLink',isAuthenticatedByQuery, async(req,res, next) => {
  try{
    const {userId} = req.payload
    const {code} = req.query;
    console.log(userId, code)
    const user = await db.user.findUnique({
      where:{id:userId}
    })
    console.log(user)
    if(!user){
      throw new Error({message:"No such user", status:404})
    }
    let email = user.email
    console.log(code, email)
    let response = await verifyEmail(email, code)
    console.log('res', response)
    if(response.status != 201){
      throw new Error(response)
    }
    console.log('success')
      res.redirect('http://192.168.1.164:3002/')
    }catch(err){
      console.log(err)
      res.redirect('/404')
    }
})
module.exports = router;
