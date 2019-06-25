import React, { Component } from 'react'
import game from './flappy_bird'

class Flappy extends Component {
  render() {
    return <div id="game" />
  }
  componentDidMount() {
    game()
  }
}

export default Flappy
