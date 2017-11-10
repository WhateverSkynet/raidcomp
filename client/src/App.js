import io from 'socket.io-client'
import feathers from 'feathers-client'
import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)
    const socket = io('/', { transports: ['websocket'] })
    const client = feathers()
      .configure(feathers.socketio(socket))
    const prefix = client.get('prefix') || '/api'
    const characterService = client.service(prefix + '/character')

    characterService.find().then(data => console.log(data))
  }

  render() {
    return (
      <div className='App'>
        <header className='App-header'>
          <img src={logo} className='App-logo' alt='logo' />
          <h1 className='App-title'>Welcome to React</h1>
        </header>
        <p className='App-intro'>
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    )
  }
}

export default App
