import React from 'react'
import ReactDOM from 'react-dom'
import ctyled from 'ctyled'

import Text from './text'

const Wrapper = ctyled.div.styles({
  bg: true,
  padd: true,
  border: 1
})

function App(){
  return <Wrapper>www</Wrapper>
}

const testsvg = `<svg width="580" height="580"><g><path d="M14.5 26.438L512 25c.5.438 28.5-4.563 36.5 18.438" stroke-width="1.5" stroke="#000" fill="#fff"/><path d="M15.5 54.438L515 52c.5.438 34.5 4.438 43.5 45.438" stroke-width="1.5" stroke="#000" fill="#fff"/><path d="M12.5 145.438L92 71c.5.438 81.5.438 144.5.438" stroke-width="1.5" stroke="#000" fill="#fff"/><path d="M14.5 180.438L99 95h155" stroke-width="1.5" stroke="#000" fill="#fff"/><path d="M18.5 227.438L108 128l189-3" stroke-width="1.5" stroke="#000" fill="#fff"/><path d="M17.5 278.438L85 199c.5.438 18.5-44.563 112.5-44.563s188 3 187.5 2.563" stroke-width="1.5" stroke="#000" fill="#fff"/><path d="M19.5 327.438L141 381c.5.438 56.5 23.438 119.5-1.563 63-25 76-111 75.5-111.437.5.438-13.5-46.563 31.5-50.563s144-5 143.5-5.437" stroke-opacity="null" stroke-width="1.5" stroke="#000" fill="none"/><path d="M13.5 358.438L156 427c.5.438 12.5 10.438 64.5 10.438s107-56 106.5-56.438c.5.438.5-12.563 40.5-15.563s85-4 117 33 38 87 17 121" stroke-opacity="null" stroke-width="1.5" stroke="#000" fill="none"/><path d="M105.5 496.438L265 467l-151 58 161-29-158 58" stroke-opacity="null" stroke-width="1.5" stroke="#000" fill="none"/><path d="M146.5 564.438L143 458l35 106-4-113 39 111c.5.438 2.5-110.563 2.5-110.563" stroke-opacity="null" stroke-width="1.5" stroke="#000" fill="none"/><ellipse cy="267.438" cx="195.5" fill-opacity="null" stroke-opacity="null" stroke-width="1.5" stroke="#000" fill="#fff"/><path d="M66.5 289.438c-10 24 37-64 37-64s65-31 64.5-31.438c.5.438 68.5-.563 68-1 .5.438 26.5-2.563 26.5 29.438 0 32-27 52-27.5 51.562.5.438-117.5 34.438-117.5 34.438s-47-12-47.5-12.438" fill-opacity="null" stroke-opacity="null" stroke-width="1.5" stroke="#000" fill="#fff"/></g></svg>`

ReactDOM.render(<Text svgString={testsvg}/>, document.getElementById('app'))
