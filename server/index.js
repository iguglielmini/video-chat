const express = require('express')

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 8000;

/** PLUGINS */
const Chat = require('./plugins/Chat');
const Video = require('./plugins/Video');
/** END PLUGINS */

/** Inicia Socket */
io.on('connection', (socket) => {
    console.log(`Socket Connectado: ${socket.id}`);

    /** Chamada Plugins */
    Chat(socket);
    Video(socket);
})

server.listen(port);