const express = require('express');
const { db } = require('../../utils/db');

const router = express.Router();

module.exports = (io) => {
  var numClients = {};
  var connectedClients = [];
  var userList = [];
  function getUsersInRoom(usersArray, targetRoom) {
    const usersInRoom = usersArray.filter(userObj => userObj.room === targetRoom);
    const usernamesInRoom = usersInRoom.map(userObj => userObj.user);
    return usernamesInRoom;
  }
  io.on('connection', (socket) => {
    socket.on('join', async({channel, user}) => {
      const isObjectInArray = connectedClients.some((client) => {
        return client.user === socket.id && client.room === channel;
      });
      const userObjectInArray = userList.some((client) => {
        return client.user === user && client.room === channel;
      });
      if(user && !userObjectInArray){
        socket.user = user
        console.log(user, channel,userObjectInArray )
        userList.push({user:user, room:channel})
      }
      if(socket.room && channel != socket.room ){
        console.log('change', socket.room)
        numClients[socket.room]--;
        connectedClients = connectedClients.filter((item) => {
          return item.user !== socket.id || item.room !== socket.room;
        });
        io.to(socket.room).emit('Viewer_update', {count:numClients[socket.room]})
      }
      socket.join(channel);
      socket.room = channel;
      
      console.log('joiinniiing', socket.id, channel, isObjectInArray)
      if(!isObjectInArray){
        
        if (numClients[channel] == undefined) {
          numClients[channel] = 1;
        } else {
          numClients[channel]++;
        }
        connectedClients.push({user:socket.id, room:channel})
      }
      console.log('joiinneeedddd', socket.id, channel, connectedClients, numClients, userList)
      io.to(channel).emit('Viewer_update', { count:numClients[channel]})
      const list = getUsersInRoom(userList, channel)

      io.to(channel).emit('User_list', {list})
    });


    socket.on('send_message', async (data) => {
      try {
        console.log(data)
        const createdMessage = await db.message.create({
          data: {
            username: data.username,
            content: data.content,
            channel: data.channel,
          },
        });
        if(data.channel === data.username){
          data = {...data, color: '#fdf9ce2f'}
        }
        console.log('Message created:', createdMessage);
        const date = new Date
        let response =  {...data, sentOn: `${date.getHours()}:${date.getMinutes()}`}
        console.log(response)
        io.to(data.channel).emit('receive_message', response);
      } catch (err) {
        console.log('Error creating message:', err);
      }
    });

    socket.on('disconnect',async () => {
      console.log("disconnect", socket.room, )
      let i = connectedClients.indexOf({user:socket.id, room:socket.room})
      let i2 = connectedClients.indexOf({user:socket.user, room:socket.room})
      if(i){
        numClients[socket.room]--;
        connectedClients.splice(i,1)
        userList.splice(i2,1)
      }
      io.to(socket.room).emit('Viewer_update', {count:numClients[socket.room]})
      const list = getUsersInRoom(userList, socket.rooom)
      io.to(socket.rooom).emit('User_list', {list})
    });
  });

  return router;
}