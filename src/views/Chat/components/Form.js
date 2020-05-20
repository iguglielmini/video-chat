import React, { Component, Fragment } from 'react';

import { Socket } from '../../../helpers';

class Form extends Component {
    constructor(props) {
        super(props);

        this.state = {
            author: '',
            message: '',
            messages: [],
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleOnChange = this.handleOnChange.bind(this);
    }

    componentDidMount() {
        const { messages } = this.state;

        Socket.on('PreviousMessages', (data) => {
            data.map(message => messages.push(message));
            this.setState({ messages });
        });

        Socket.on('ReceivedMessage', (message) => {
            messages.push(message);
            this.setState({ messages });
        });
    }

    handleOnChange(name, value) {
        this.setState({
            [name]: value,
        })
    }

    handleSubmit() {
        const { author, message, messages } = this.state;
        if (author && message) {
            const data = {
                author,
                message,
            }

            Socket.emit('SendMessage', data);

            messages.push(data);

            this.setState({
                message: '',
            });
        }
    }

    render() {
        const { author, message, messages } = this.state;

        return (
            <>
                <section className="chat">
                    <input
                        type="text"
                        name="username"
                        value={author}
                        placeholder="Digite seu usuário"
                        onChange={({ target }) => this.handleOnChange('author', target.value)}
                    />
                    <div className="messages">
                        {
                            (messages.length > 0) && messages.map((item, index) => {
                                const key = index;

                                return (
                                    <Fragment key={key}>
                                        <div className="message">
                                            <strong>{item.author}:</strong>
                                            <span>{item.message}</span>
                                        </div>
                                    </Fragment>
                                )
                            })
                        }
                    </div>
                    <input
                        type="text"
                        name="message"
                        value={message}
                        placeholder="Digite sua mensagem..."
                        onChange={({ target }) => this.handleOnChange('message', target.value)}
                    />
                    <button onClick={this.handleSubmit}>Enviar</button>
                </section>
            </>
        )
    }
}

export default Form;