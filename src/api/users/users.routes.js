const express = require('express');
const { isAuthenticated } = require('../../middlewares');
const { findUserById, findUserByUsername } = require('./users.services');
const { db } = require('../../utils/db');

const router = express.Router();

router.get('/profile', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req.payload;
    const user = await db.user.findUnique({
      where:{
        id:userId
      },
      select:{
        id:true,
        email:true,
        emailVerified: true,
        username:true,
        streamKey:true,
        createdAt:true,
        updatedAt:true,
        pfp:true,
        bans:true,
        bannedOnChannel:true,
        messagesSent:true,
        isLive:true,
        follows:true,
        followedBy:true,
        modOn:true,
        moddedHere:true,
        vipOn:true,
        vipsHere:true,
        description:true,
        Files:true
      }
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});


router.post('/changeDescription', isAuthenticated, async(req,res,next) => {
  const { userId } = req.payload;
  try{
    const {description} = req.body;  
    const user = await db.user.findUnique({
      where:{
        id:userId
      }
    })
    if(!user){
      throw new Error()
    }
    await db.user.update({
      where:{
        id:userId
      },
      data:{
        description:description
      }
    })
    res.send("Success").status(201)
  }catch{
    res.send("Failed to update").status(400)
  }
})

router.get('/fetchUsers', async (req, res) => {
  try{
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        isLive: true,
        bannedOnChannel: true,
        messagesSent: true,
        pfp: true,
        follows:true,
      },     
    })
    res.json(users).status(200)
  }catch(err){
    console.log(err)
    res.json('Fetch failed').status(400)
  }
})

router.get('/getBannedOnChannel/:username/:channel', async (req,res) => {
  try{
    const {username, channel} = req.params
    const banned = await db.ban.findFirst({where: {username, channel}})
    if(banned?.username){
      res.json(true).status(200)
    }else{
      res.json(false).status(200)
    }
  }catch{
    res.json(false).status(500)
  }
})

router.post('/unbanUser',  isAuthenticated, async(req,res,next) => {
  try{
    const {userId} = req.payload;
    const {channel, username} = req.body;
    const user = await findUserById(userId)
    if(!user || user == null ||  !channel || !userId || !username){
      console.log('no data')
      throw new Error('You are not authorized to do that')
    }
    const mods = await db.mod.findMany({
      where:{
        username: user.username,
        channel
      }
    })
    let authorized = false
    for(let i =0; i<mods.length; i++){
      if(mods[i].username == user.username){
        authorized = true
      }
    }
    if(user.username != channel && !authorized){
      console.log('no data')
      throw new Error('You are not authorized to do that')
    }
    const userBanned = await db.user.findUnique({where: {username}})
    if(!userBanned){
      throw new Error('No such user')
    }
    const ban = await db.ban.findFirst({where:{username, channel}})

    if(!ban || !ban?.id || ban == null){
      throw new Error('User not banned')
    }
    await db.ban.delete({
      where: {id: ban.id}
    })
    res.json("User unbanned").status(201)
  }catch(err){
    console.log(err)
    res.json("Request failed").status(400)
  }
})

router.post('/banUser', isAuthenticated, async(req,res, next) => {
  try{
    const {userId} = req.payload;
    const {channel, username} = req.body;

    const user = await findUserById(userId)
    if(!user || user == null ||  !channel || !userId || !username){
      console.log('no data')
      throw new Error('You are not authorized to do that')
    }
    const mods = await db.mod.findMany({
      where:{
        username: user.username,
        channel
      }
    })
    let authorized = false
    for(let i =0; i<mods.length; i++){
      if(mods[i].username == user.username){
        authorized = true
      }
    }
    if(user.username != channel && !authorized){
      console.log('no data')
      throw new Error('You are not authorized to do that')
    }
    
    const userBanned = await db.user.findUnique({where: {username}})
    if(userBanned?.username != username || !userBanned){
      throw new Error('No such user')
    }
    const banned = await db.ban.findFirst({where:{username, channel}})
    if(!banned){
      const ban = await db.ban.create({
      data: {
        username: username,
        channel: channel
      }
    })
    res.json(`User: ${user} banned on channel: ${channel}`).status(201)
    }else{
      res.json("user already banned").status(200)
    }
  }catch(err){
    console.log(err)
    next(err)
  }
})


router.get('/fetchUserByName', async (req, res) => {
  try{
    const users = await db.user.findFirst({
      select: {
        id: true,
        email: true,
        username: true,
        isLive: true,
        bannedOnChannel: true,
        messagesSent: true,
        pfp: true,
        follows:true
      },
      where:{
        username: req.query.username
      }
    })
    res.json(users).status(200)
  }catch(err){
    console.log(err)
    res.json('Fetch failed').status(400)
  }
})


router.get('/alreadyUsed', async (req, res) => {
  try{
    const users = await db.user.findMany({
      select: {
        email: true,
        username: true
      },
    })
    res.json(users).status(200)
  }catch(err){
    console.log(err)
    res.json('Fetch failed').status(400)
  }
})

router.get('/isLive', async (req, res) => {
  const {username} = req.query 
  try{
    const users = await db.user.findFirst({
      select: {
        isLive
      },where:{
        username
      }
    })
    res.json(users).status(200)
  }catch(err){
    console.log(err)
    res.json('Fetch failed').status(400)
  }
})

router.get('/getPfp', async (req, res) => {
  const {username} = req.query 
  try{
    const {pfp} = await db.user.findUnique({
      select: {
        pfp:true
      },where:{
        username
      }
    })
    res.json(pfp).status(200)
  }catch(err){
    console.log(err)
    res.json('Fetch failed').status(400)
  }
})

router.post('/follow', isAuthenticated, async(req,res,next) => {
  try{
    const {userId} = req.payload;
    const {channel} = req.body;

    const user = await findUserById(userId)
    if(!user || !channel || !userId){
      console.log('no data')
      throw new Error('YOu are not authorized to do that')
    }
    const username = user.username;
    const followExists = await db.follow.findFirst({
      where: {
        username, channel
      }
    }) 

    if(!followExists){
      await db.follow.create({
        data:{
          username,
          channel
        }
      })
      res.send('Followed').status(200)
    }else{
      await db.follow.delete({
        where:{
          id: followExists.id
        }
      })
      res.send('Follow canceled').status(200)
    }
  }catch(err){
    console.log(err)
    res.status(500)
  }
})

router.get('/getFollowed/:username', async(req,res) => {
  const {username} = req.params;
  try{
    const user = await db.user.findUnique({
      where:{
        username:username
      }
    })
    if(!user || !username){
      throw new Error({code:400, m:"No data"})
    }
    const channels = await db.follow.findMany({
      where:{
        username:user.username
      }
    })
    if(!channels){
      throw new Error({code:400, m:"No data"})
    }
    res.json(channels).status(200)
  }catch(err){
    res.json("Request failed").status(400)
  }
})



router.post('/addMod', isAuthenticated, async(req,res,next) => {
  const {userId} = req.payload;
  const {channel, username} = req.body;
  try{
    const channelUser = await db.user.findUnique({
      where:{
        username:channel
      }
    })
    const newMod = await db.user.findUnique({
      where: {
        username
      }
    })
    if(!channelUser || !username){
      res.json('No such user').status(403)
      return
    }
    const isMod = await db.mod.findFirst({
      where:
      {
        username: newMod.username,
        channel:channelUser.username
      }
    })
    if(isMod){
      res.json("User is already an moderator on this channel").status(200)
      return
    }
    await db.mod.create({
      data:{
        username: newMod.username,
        channel:channelUser.username
      }
    })
    res.json('Mod created').status(201)
  }catch(err){
    res.json("Request failed").status(500)
  }
})

router.get('/getMod/:username',async(req,res)=>{
  const {username} = req.params;
  try{
    const user = await db.user.findUnique({
      where:{
        username:username
      }
    })
    if(!user || !username){
      throw new Error({code:400, m:"No data"})
    }
    const channels = await db.mod.findMany({
      where:{
        username:user.username
      }
    })
    if(!channels){
      throw new Error({code:400, m:"No data"})
    }
    res.json(channels).status(200)
  }catch(err){
    res.json("Request failed").status(400)
  }
} )

router.post('/deleteMod', isAuthenticated, async(req,res,next) => {
  const {userId} = req.payload;
  const {channel, username} = req.body;
  try{
    const channelUser = await db.user.findUnique({
      where:{
        username:channel
      }
    })
    const newMod = await db.user.findUnique({
      where: {
        username
      }
    })
    if(!channelUser || !username){
      res.json('No such user').status(403)
      return
    }
    const isMod = await db.mod.findFirst({
      where:
      {
        username: newMod.username,
        channel:channelUser.username
      }
    })
    if(!isMod){
      res.json("This user is not a moderator on this channel").status(200)
      return
    }
    await db.mod.delete({where:{
      id: isMod.id
    }})
    res.json("Moderator removed").status(200)
  }catch(err){
    res.json("Request failed").status(500)
  }
})

router.post('/checkUsernameAvalibility', async(req,res) => {
  const {username} = req.body;
  try{
    console.log(username)
    const u = await db.user.findUnique({
      where:{
        username:username
      }
    })
    console.log(u)
    if(!u){
     res.json('availible').status(200)   
    }else{
    res.json('unavailible').status(400)  
  } 
  }catch(err){
    console.log(err)
    res.json('unavailible').status(400)  
  }
})
router.post('/updateUsername',isAuthenticated, async(req,res) => {
  const {userId} = req.payload;
  const {username} = req.body;
  try{
    console.log(username, 'update')

      const user = await db.user.update({
        where:{
          id:userId
        },data:{
          username:username
        }
      })
      console.log(user)
     res.json('availible').status(200)

  }catch(err){
    console.log(err)
    res.json('unavailible').status(400)  
  }
})
module.exports = router;
