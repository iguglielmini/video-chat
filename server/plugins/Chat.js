let messages = [];

function Chat(socket) {
    //mostrando as antigas messagens utilizando emit
    socket.emit('PreviousMessages', messages);

    socket.on('SendMessage', data => {
        messages.push(data);
        //esse socket é para enviar para todos  que estão na mesma conexão
        socket.broadcast.emit('ReceivedMessage', data);
    });
}

module.exports = Chat;
