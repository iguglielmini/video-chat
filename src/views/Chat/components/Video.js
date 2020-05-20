import React, { Component, createRef } from 'react';

import SimplePeer from 'simple-peer';

import { Socket } from '../../../helpers';

class Video extends Component {
    constructor(props) {
        super(props);

        this.videoUserRef = createRef();
        this.videoPeerRef = createRef();

        this.state = {
            client: {},
            stream: null,
            mutedPeer: false,
            pausedPeer: false,
        }

        this.getMedia = this.getMedia.bind(this);
        this.initPeer = this.initPeer.bind(this);
        this.makePeer = this.makePeer.bind(this);
        this.removePeer = this.removePeer.bind(this);
        this.frontAnswer = this.frontAnswer.bind(this);
        this.signalAnswer = this.signalAnswer.bind(this);
        this.sessionActive = this.sessionActive.bind(this);
        this.handleMutePeer = this.handleMutePeer.bind(this);
        this.handlePausePeer = this.handlePausePeer.bind(this);
    }

    componentDidMount() {
        const media = this.getMedia();

        Socket.on('CallRejected', function (data) {
            alert(`Usuário: "${data.author}" rejeitou sua ligação`);
        });

        media.then((stream) => {
            Socket.emit('NewClient');
            this.startVideo(stream, this.videoUserRef);

            Socket.on('BackOffer', this.frontAnswer);
            Socket.on('BackAnswer', this.signalAnswer);
            Socket.on('SessionActive', this.sessionActive);
            Socket.on('CreatePeer', this.makePeer);
            Socket.on('Disconnect', this.removePeer);
        })
            .catch(error => {
                alert(error);
            });
    }

    frontAnswer(offer) {
        const { client } = this.state;
        const peer = this.initPeer('notInit');

        peer.on('signal', (data) => {
            Socket.emit('Answer', data);
        });

        peer.signal(offer);
        client.peer = peer;

        this.setState({ client });
    }

    getMedia() {
        const { mediaDevices } = navigator;
        return mediaDevices.getUserMedia({ video: true, audio: true });
    }

    handleMutePeer() {
        let { mutedPeer } = this.state;
        const { current } = this.videoPeerRef;

        if (current.volume !== 0){
            current.volume = 0;
            mutedPeer = true;
        } else {
            current.volume = 1;
            mutedPeer = false;
        }

        this.setState({ mutedPeer });
    }

    handlePausePeer() {
        const { pausedPeer, stream } = this.state;
        this.setState({ pausedPeer: !pausedPeer });

        const paused = this.state.pausedPeer;
        if (!paused)
            stream.getTracks().forEach( (track) => {
                track.stop();
            });
        else
            stream.getTracks().forEach( (track) => {
                track.play();
            });
    }

    initPeer(type) {
        const { stream } = this.state;

        const peer = new SimplePeer({
            initiator: (type === 'init') ? true : false,
            stream: stream,
            trickle: false,
        });

        peer.on('stream', (stream) => {
            this.startVideo(stream, this.videoPeerRef);
        });

        // This isn't working in chrome; works perfectly in firefox.
        peer.on('close', () => {
            peer.destroy();
        })

        return peer;
    }

    makePeer() {
        const { client } = this.state;

        client.gotAnswer = false;
        const peer = this.initPeer('init');

        peer.on('signal', function (data) {
            if (!client.gotAnswer) Socket.emit('Offer', data);
        });

        client.peer = peer;

        this.setState({ client });
    }

    removePeer() {
        const { client } = this.state;
        if (client.peer) client.peer.destroy();
    }

    sessionActive() {
        alert('Session Active. Please come back later');
    }

    signalAnswer(answer) {
        const { client } = this.state;
        client.gotAnswer = true;

        const peer = client.peer;
        peer.signal(answer);
    }

    startVideo(stream, ref) {
        const { current } = ref;

        current.srcObject = stream;
        current.play();

        this.setState({ stream });
    }

    render() {
        const { mutedPeer, pausedPeer } = this.state;

        return (
            <>
                <div className="videochat visit">
                    <video
                        muted={mutedPeer}
                        ref={this.videoPeerRef}
                    >Loading...</video>
                </div>
                <button
                    onClick={this.handleMutePeer}
                >
                    {
                        mutedPeer ? "Unmute" : "Mute"
                    }
                </button>
                <button
                    onClick={this.handlePausePeer}
                >
                    {
                        pausedPeer ? "Play" : "Pause"
                    }
                </button>
                <div className="videochat user">
                    <video
                        muted
                        ref={this.videoUserRef}
                    >Loading...</video>
                </div>
            </>
        )
    }
}

export default Video;
