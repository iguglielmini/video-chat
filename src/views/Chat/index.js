import React from 'react';

import './scss/styles.scss';

import Form from './components/Form';
import Video from './components/Video';

function Chat() {
  return (
    <>
      <section className="content-chat">
        <Form />
        <div className="box-video">
          <Video />
        </div>
      </section>
    </>
  );
}

export default Chat;
