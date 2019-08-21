import React, { useEffect, useRef, useState } from 'react'
import ctyled from 'ctyled'

import listen from './audio'
import { Template } from './index'
import bebas from './bebasneue-regular.woff'

const SVG_NS = 'http://www.w3.org/2000/svg'

function initTextPaths(svg) {
  const paths = svg.querySelectorAll('path, ellipse'),
    text = document.createElementNS(SVG_NS, 'text')
  svg.appendChild(text)
  return Array.prototype.map
    .call(paths, (path, i) => {
      if (!path.id)
        path.setAttribute(
          'id',
          Math.random()
            .toString(32)
            .substr(2)
        )

      let size = 0
      try {
        size = parseFloat(path.getAttribute('stroke-width'))
      } catch (e) {}
      if (!size) return null

      const textPath = document.createElementNS(SVG_NS, 'textPath')
      textPath.setAttribute('href', '#' + path.id)
      textPath.style.fontSize = size + 'px'
      path.setAttributeNS(null, 'stroke', 'none')
      text.appendChild(textPath)

      return {
        path,
        textPath,
        length: path.getTotalLength(),
      }
    })
    .filter(a => a)
}

function layTextOntoPath(lpath, text) {
  if (!text) return ''

  const { path, textPath, length, filled, fcount = 0 } = lpath,
    split = text.split(' ')

  if (fcount > 2 && text.indexOf(filled) === 0) {
    return text.substr(filled.length + 1)
  }

  textPath.innerHTML = text
  let frac = textPath.textLength.baseVal.value / length,
    lastfrac = frac
  if (frac > 0.95) {
    do {
      const last = split.pop()
      textPath.innerHTML = split.join(' ')
      const nextFrac = textPath.textLength.baseVal.value / length
      lastfrac = frac
      frac = nextFrac
    } while (frac === lastfrac)
    lpath.filled = textPath.innerHTML
    lpath.fcount = fcount + 1
  } else {
    const { x, y } = path.getPointAtLength(textPath.textLength.baseVal.value)
    ;(lpath.x = x), (lpath.y = y)
  }
  return text.substr(textPath.innerHTML.length + 1)
}

function layoutAllPaths(lpaths, text) {
  let tail = text
  for (let i in lpaths) {
    const lpath = lpaths[i]
    tail = layTextOntoPath(lpath, tail)
    if (!tail) {
      return lpath
    }
  }
}

const TemplateSVGPreview = ctyled.div.styles({
  column: true,
  align: 'center',
  bg: true,
  color: c => c.contrast(0.2),
  scroll: true,
}).extendSheet`
  @font-face {
    font-family: Bebas;
    src: url("${bebas}") format('woff');
  }


  position:absolute;
  width:100%;
  height:100%;

  & svg {
    fill:none;
    position:absolute;
    width:100%;
  }

  & svg path {
    stroke:none;
    stroke:;
  }

  & svg textPath {
    fill:black;
    font-family:"Bebas";
  }
`

export interface TextProps {
  template: Template
  deviceId: string
}

export default function Text(props: TextProps) {
  const wrapperRef = useRef<any>(null),
    [targetY, setTargetY] = useState(0),
    [velocity, setVelocity] = useState(0)

  useEffect(() => {
    const svg = wrapperRef.current.querySelector('svg'),
      lpaths = initTextPaths(svg)

    let output = '',
      tempOutput = ''

    const stop = listen(props.deviceId, d => {
      tempOutput = ''
      d.forEach(res => {
        if (res.final) output += res.text + ' '
        else tempOutput += res.text + ' '
      })
      //console.log(output + tempOutput)
      const last = layoutAllPaths(lpaths, output + tempOutput)
      if (last) {
        const width = parseInt(
            svg.getAttribute('width') || svg.getAttribute('viewBox').split(' ')[2]
          ),
          scaleRatio = wrapperRef.current.offsetWidth / width,
          wrapperHeight = wrapperRef.current.offsetHeight,
          actualY = last.y * scaleRatio,
          centerScroll = actualY - wrapperHeight / 2
        
        setTargetY(centerScroll)
      }else{
        setTargetY(null)
      }
    })
    return stop

    // setInterval(() => {
    //   output += 'lorem ipsum '
    //   const last = layoutAllPaths(lpaths, output)

    //   if (last) {
    //     const width = parseInt(
    //         svg.getAttribute('width') || svg.getAttribute('viewBox').split(' ')[2]
    //       ),
    //       scaleRatio = wrapperRef.current.offsetWidth / width,
    //       wrapperHeight = wrapperRef.current.offsetHeight,
    //       actualY = last.y * scaleRatio,
    //       centerScroll = actualY - wrapperHeight / 2
        
    //     setTargetY(centerScroll)
    //     // if(Math.abs(centerScroll - wrapperRef.current.scrollTop) > wrapperHeight/4)
    //     //   wrapperRef.current.scroll({top: centerScroll, behavior:'smooth'})
    //   }else{
    //     setTargetY(null)
    //   }
    // }, 500)

  }, [props.template])

  useEffect(() => {
    const int = setInterval(() => {
      // if(targetY && wrapperRef && targetY !== wrapperRef.current.scrollTop){
      //   const dy = targetY-wrapperRef.current.scrollTop
      //   wrapperRef.current.scrollTop += dy/30
      // }
      wrapperRef.current.scrollTop += velocity
    }, 25)
    return () => clearInterval(int)
  }, [props.template, velocity])

  useEffect(() => {
    if(targetY && wrapperRef && targetY !== wrapperRef.current.scrollTop){
      const dy = targetY-wrapperRef.current.scrollTop
      setVelocity(dy/40)
    }
  }, [targetY])

  return (
    <TemplateSVGPreview
      inRef={wrapperRef}
      dangerouslySetInnerHTML={{ __html: props.template.data }}
    />
  )
}
