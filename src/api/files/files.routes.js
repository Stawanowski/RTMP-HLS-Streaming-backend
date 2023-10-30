const { db } = require('../../utils/db');
const express = require('express');
const fs = require('fs');
const Client = require('ftp');
const multer  = require('multer');
const { isAuthenticated } = require('../../middlewares');


const upload = multer({ dest: 'uploads/' })
const router = express.Router();
const ftpClient = new Client();

const ftpConfig = {
  host: 'localhost',
  user: 'ftpuser',
  password: 'ftppassword',
  pasvTimeout: 10000
};

ftpClient.on('connect', (err, list) => {
  console.log('Connected to FTP server ')
})
ftpClient.on('error', (err) => {
  console.error('FTP Connection Error:', err);
});
ftpClient.connect(ftpConfig);



router.post('/changePFP', isAuthenticated, upload.single('file'), async(req,res) => {
  const {userId} = req.payload;
  const file = req.file

    try {
      console.log('change')
      ftpClient.put(file.path, `uploads/${file.originalname}`, async (err) => {
        if(err) res.json('failed').status(500);
        console.log('update')
        const x = await db.user.update({
          where:{
            id:userId
          },data:{
            pfp:file.originalname
          }
        })
        console.log('finish?')
        console.log(x)
        res.json('File created').status(204)
      })
    } catch (error) {

      console.error('FTP Connection Failed:', error);
    }
})

router.post('/uploadAndLog', isAuthenticated, upload.single('file'), async(req,res) => {
  const {userId} = req.payload;
  const file = req.file

    try {
      console.log('change')
      const user = await db.user.findUnique({
        where:{
          id: userId
        }
      })
      ftpClient.put(file.path, `uploads/${file.originalname}`, async (err) => {
        if(err) res.json('failed').status(500);
        console.log('update')
        const x = await db.uploaded.create({
          data:{
            title: file.originalname,
            onChannel: user.username
          }
        })
        console.log('finish?')
        console.log(x)
        res.json('File created').status(204)
      })
    } catch (error) {

      console.error('FTP Connection Failed:', error);
    }
})

router.post('/upload', upload.single('file'), (req,res) => {
  console.log(req.file)
  const file = req.file
  try{
  ftpClient.put(file.path, `uploads/${file.originalname}`, (err) => {
    if(err) res.json('failed').status(500);
    res.json('File created').status(204)
    ftpClient.destroy()
  })
  }catch{
    res.json('failed').status(500)
  }
})

router.get('/get/:filename', (req, res) => {
  console.log('Fetching pfp?')
  try{
    const { filename } = req.params;
    console.log('Fetching pfp: ', filename)
    ftpClient.get(`/uploads/${filename}`, (err, stream) => {
    try{
      if (err) {
        console.error('Error getting file from FTP server:', err);
        throw new Error('Error getting file from FTP server')
        // res.status(500).json('Error getting file from FTP server');
      } else {
        stream.pipe(res);
      }
    }catch(err){
      console.error("Ftp error: ", err)
    }
  });
  console.log('Fetching done?')
  }catch(err){
    console.log('Fetching fail??')

    console.log(err)
    res.status(500)
  }
});

module.exports = router;
