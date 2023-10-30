const { spawn, exec } = require('child_process');
const { db } = require('../../utils/db');
const express = require('express')
const router = express.Router();
const fs = require('fs');
const { isAuthenticated } = require('../../middlewares');


router.post('/on_publish', async (req, res) => {
    const streamKey = req.body.key;
    const uName = req.body.name;
    const user = await db.user.findFirst({where:{username:uName}});

    if (user && user?.streamKey == streamKey) {
        try{
            if(!user.emailVerified) throw new Error();
            const transcoder = spawn('sh', ['/var/www/transcode.sh', uName], {
                detached: true,
                stdio: 'ignore' 
            });
              const transcoder2 = spawn('sh', ['/var/www/transcodeTosd.sh', uName], {
                detached: true,
                stdio: 'ignore' 
              });
              const liveExists = await db.live.findUnique({where: {
                  channelName: user.username
              }})
              if(!liveExists || !liveExists.channelName){
                await db.live.create({data: {channelName: uName, pid: transcoder.pid, pid2: transcoder2.pid, live:true}})
              }else{
                  await db.live.update({
                    where:{
                        id: liveExists.id
                    },
                    data:{
                        live: true,
                        pid: transcoder.pid, 
                        pid2: transcoder2.pid
                    }
                })
              }
            transcoder.unref();
            transcoder2.unref();
            console.log('Received correct publish request for user:', uName);
            res.sendStatus(200);
        }catch{
            console.error('Failed to start live for:', uName);
            res.sendStatus(403); 
        }
    } else {
        console.error('Invalid stream key or username for:', uName);
        res.sendStatus(403); 
    }
});

router.post('/on_publish_done', async (req, res) => {
    const streamKey = req.body.key;
    const uName = req.body.name;
    const user = await db.user.findFirst({where:{username:uName}});
    console.log(uName)
    if (user && user?.streamKey == streamKey) {
        try{

            const liveInstance = await db.live.findUnique({where: {
                  channelName: user.username
              }})
              if(liveInstance && liveInstance.channelName){
                  try{
                        process.kill(liveInstance.pid, 'SIGTERM');
                    }catch{
                        console.log('process doesnt exist')
                    }
                    try{
                        process.kill(liveInstance.pid2, 'SIGTERM');
                    }catch{
                        console.log('process doesnt exist')
                    }
                  await db.live.update({
                    where:{
                        id: liveInstance.id
                    },
                    data:{
                        live: false,
                        pid: 0, 
                        pid2: 0
                    }
                })
              }
            console.log('Received correct end request for user:', uName);
            res.sendStatus(200);
            try{
                setTimeout(() => {
                    try{
                    fs.rmdir(`/var/www/hls/${uName}`, { recursive: true }, (err) => {
                        if (err) throw err;
                        console.log('Directory has been deleted');
                    });
                    }catch{
                        console.log('files dont exist')
                    }
                }, 30 * 1000);
            }catch{
                console.log('deleteFailed')
            }
        }catch(err){
            console.log(err)
            console.error('Failed to end live for:', uName);
            res.sendStatus(403); 
        }
    } else {
        console.error('Invalid stream key or username for:', uName);
        res.sendStatus(403); 
    }
});

router.get('/getLiveDetails/:channel', async(req,res,next) => {
    const {channel} = req.params;
    console.log(channel)
    try{
        if(!channel){
            throw new Error({content: 'No such channel', code:404})
        }
        const streamData = await db.live.findUnique({
            where: {
                channelName: channel
            },
            select:{
                live:true,
                title:true,
                channelName:true,
                categoryName:true
            }
        })
        const description = await db.user.findUnique({
            where: {
                username: channel
            },
            select:{
                description:true
            }
        })
        let stream = {description:description.description, ...streamData}
        if(!stream){
            throw new Error({content: 'Stream data not found', code:404})
        }
        res.json(stream).status(200)

    }catch(err){
        if(err.code == 404){
            res.json("Not Found").status(404)
        }else{
            console.log(err)
            res.json("Request failed.").status(500)
        }
    }
})

router.post('/changeTitle', isAuthenticated, async(req,res,next) => {
    try {
        console.log("body", req.body)
        let {channel, title} = req.body;
        const { userId } = req.payload;
        console.log(1)
        const user = await db.user.findUnique({
            where:{
                id: userId
            }
        })
        if(!user || user == null ||  !channel || !userId || !title){
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
        const stream = await db.live.findFirst({where: {channelName: channel}})
        console.log(stream, title)
        if(!stream ){
            res.status(404)
            throw new Error('No active stream found')
        }
        await db.live.update({
            where:{
                id: stream.id
            },
            data:{
                title:title
            }
        })
        delete user;
        console.log(`Changed Title to: ${title} on channel: ${stream.channelName}`)
        res.json(`Changed Title to: ${title} on channel: ${stream.channelName}`).status(201);
    } catch (err) {
        console.log('err', err)
        next(err);
    }
})


router.post('/changeCategory', isAuthenticated, async(req,res,next) => {
    try {
        // let {category} = req.params;
        let {channel, category} = req.body;
        const { userId } = req.payload;
        console.log(1)
        const user = await db.user.findUnique({
            where:{
                id: userId
            }
        })
        if(!user || user == null ||  !channel || !userId || !category){
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
        console.log(user)
        const stream = await db.live.findFirst({where: {channelName: channel}})
        console.log(stream, category)
        if(!stream || !category){
            res.status(404)
            throw new Error('No active stream found')
        } 
        category = category.toLowerCase()
        category = category.charAt(0).toUpperCase() + category.slice(1);
        category = category.slice(0, -1);
        console.log(category, stream.id)
        await db.live.update({
            where:{
                id: stream.id
            },
            data:{
                categoryName: category
            }
        })
        delete user;
        console.log(`Changed to: ${category} on channel: ${stream.channelName}`)
        res.json(`Changed to: ${category} on channel: ${stream.channelName}`).status(201);
    } catch (err) {
        console.log('err', err)
        next(err);
    }
})





router.get('/hlsout/:username/playlist.m3u8', async (req, res) => {
    const { username } = req.params;
    const user = await db.user.findFirst({where: {username}})
    if (user) {
        res.status(200).sendFile('index.m3u8', { root: `/var/www/hls/native/${username}/` });
    } else {
        res.status(404).send('User not found or not currently online');
    }
});

router.get('/hlsout/:username/:segment', async (req, res) => {
    const { username, segment } = req.params;
    const user = await db.user.findFirst({where: {username}})
    if (user) {
        res.status(200).sendFile(segment, { root: `/var/www/hls/native/${username}/` });
    } else {
        res.status(404).send('Username not found');
    }
});
router.get('/hlsout/:username/720/playlist.m3u8', async (req, res) => {
    const { username } = req.params;
    const user = await db.user.findFirst({where: {username}})
    if (user) {
        res.status(200).sendFile('index.m3u8', { root: `/var/www/hls/${username}/720/` });
    } else {
        res.status(404).send('User not found or not currently online');
    }
});

router.get('/hlsout/:username/720/:segment', async (req, res) => {
    const { username, segment } = req.params;
    const user = await db.user.findFirst({where: {username}})
    if (user) {
        res.status(200).sendFile(segment, { root: `/var/www/hls/${username}/720/` });
    } else {
        res.status(404).send('Username not found');
    }
});
router.get('/hlsout/:username/480/playlist.m3u8', async (req, res) => {
    const { username } = req.params;
    const user = await db.user.findFirst({where: {username}})
    if (user) {
        res.status(200).sendFile('index.m3u8', { root: `/var/www/hls/${username}/480/` });
    } else {
        res.status(404).send('User not found or not currently online');
    }
});

router.get('/hlsout/:username/480/:segment', async (req, res) => {
    const { username, segment } = req.params;
    const user = await db.user.findFirst({where: {username}})
    if (user) {
        res.status(200).sendFile(segment, { root: `/var/www/hls/${username}/480/` });
    } else {
        res.status(404).send('Username not found');
    }
});

module.exports = router;


// router.post('/live/:username', async (req, res) => {
//     const { streamKey } = req.query;
//     const {username} = req.params
//     const user = await db.user.findFirst({ where: { streamKey: streamKey } });
//     console.log(1, username)
//     if ( user && user.username == username ) { 
//         const username = user.username;        
//         res.status(200).send('RTMP stream started for username: '  + username);
//     } else {
//         res.status(403).send('Invalid stream key');
//     }

// });

            // const liveInstances = await db.live.findMany({where: {channelName: uName}})
            // for(let i =0; i<liveInstances.length; i++){
            //     try{
            //     process.kill(liveInstances[i].pid, 'SIGTERM');
            //     }catch{
            //         console.log('process doesnt exist')
            //     }
            //     try{
            //     process.kill(liveInstances[i].pid2, 'SIGTERM');
            //     }catch{
            //         console.log('process doesnt exist')
            //     }
            //     await db.live.delete({where: {id: liveInstances[i].id}})
            // }