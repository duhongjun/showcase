import React, { useState, useEffect } from 'react'
import game from './flappy_bird'
import { getScript } from '../../util'

const Flappy = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    !loading && game()
  }, [loading])

  getScript('https://cdn.bootcss.com/phaser/2.6.2/phaser.min.js').then(() => {
    setLoading(false)
  })

  return <div id="game">{loading ? 'loading Phaser ......' : ''}</div>
}

export default Flappy
