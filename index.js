
var app = require('http').createServer();
var io = require('socket.io')(app);

app.listen(4444);

// io.set("transports", ["xhr-polling", "jsonp-polling"]);

console.log('====== running =======')

io.sockets.on("connection", function(socket) {
    var user;
	console.log('=connect')
    socket.on("subscribe", function(data) {
        console.log(' --- subscribe --- ')
        console.log(data.chat_room_id)
        socket.join(data.chat_room_id);
    });

    socket.on("unsubscribe", function(data) {
        console.log(' --- unsubscribe --- ')
        console.log(data.chat_room_id)
        socket.leave(data.chat_room_id);
    });


    socket.on("unsubscribeall", function(data) {
        var allRooms = io.sockets.manager.roomClients[socket.id];
        for (var i in allRooms) {
            if (i != "") {
                socket.leave(i.substring(1));
            }
        }
    });

    socket.on("subscribeChatList", function(data) {
	console.log('subscribeChatList', "F" + data.user_id)
        socket.join("F" + data.user_id);
    });

    socket.on("unsubscribeChatList", function(data) {
	console.log('unsubscribeChatList')
        socket.leave("F" + data.user_id);
    });

    socket.on("updateFriendChatList", function(data) {
	console.log(' ---- updateFriendChatList ---- ')
	console.log('friend_user_id : ', data.friend_user_id)
	console.log('user_id : ', data.user_id)
        io.sockets.in("F" + data.friend_user_id)
          .emit("updateFriendChatList", data.user_id);
    });

    socket.on("call", function(data) {
        console.log('call from F'+ data.sender +' to F'+ data.receiver)
        io.sockets.in("F" + data.receiver)
          .emit("incoming_call", {
              sender: data.sender,
              receiver: data.receiver,
              sender_photo: data.sender_photo,
              sender_name: data.sender_name
          });
    });

    socket.on("hangup", function(data) {
        console.log('hangup from F'+ data.sender +' to F'+ data.receiver)
        io.sockets.in("F" + data.receiver)
          .emit("hangup", {
              sender: data.sender,
              receiver: data.receiver
          });
    });

    socket.on("message", function(data) {
        console.log(' ---- message ---- ')
        console.log(data.chat_room_id)
        console.log(JSON.stringify(data))
        io.sockets.in(data.chat_room_id).emit("message", data);
    });

    socket.on("read_message", function(data) {
        var sendData = {
            last_read: data.last_read,
            user_id: data.user_id
        };
        io.sockets.in(data.chat_room_id).emit("read_message", sendData);
    });

    socket.on("read_all", function(data) {
        console.log(' ---- read_all ---- ')
        console.log(data.chat_room_id)
        console.log(data.user_id)
        io.sockets.in(data.chat_room_id).emit("read_all", data.user_id);
    });
});
