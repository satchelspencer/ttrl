import React from 'react'
import ReactDOM from 'react-dom'
import ctyled from 'ctyled'

import './audio'

const W = ctyled.div.styles({
  bg: true,
  padd: true,
  border: 1
})

function App(){
  return <W>www</W>
}

ReactDOM.render(<App/>, document.getElementById('app'))
