let clients = 0;

function Disconnect() {
    if (clients > 0) {
        if (clients <= 2)
            this.broadcast.emit("Disconnect");
        clients--;
    }
}

function SendOffer(offer) {
    this.broadcast.emit("BackOffer", offer);
}

function SendAnswer(data) {
    this.broadcast.emit("BackAnswer", data);
}

function Video(socket) {
    const { id } = socket;

    socket.on("RejectCall", (data) => {
        const { form } = data; 

        socket.to(form).emit("CallRejected", {
            socket: id,
        });
    });

    socket.on("NewClient", function () {
        if (clients < 2) {
            if (clients == 1) {
                this.emit('CreatePeer');
            }
        }
        else {
            this.emit('SessionActive');
        }

        clients++;
    })
    socket.on('Offer', SendOffer);
    socket.on('Answer', SendAnswer);
    socket.on('Disconnect', Disconnect);
}

module.exports = Video;
