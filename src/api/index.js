const express = require('express');



const auth = require('./auth/auth.routes');
const users = require('./users/users.routes');
const streams = require('./stream/stream.routes')
const files = require('./files/files.routes')

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});
router.use('/stream', streams)
router.use('/auth', auth);
router.use('/users', users);
router.use('/file', files)


module.exports = router;
