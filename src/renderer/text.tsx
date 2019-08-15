import React, { useEffect, useRef } from 'react'
import ctyled from 'ctyled'

import listen from './audio'
import { Template } from './index'

const SVG_NS = 'http://www.w3.org/2000/svg'

function initTextPaths(svg) {
  const paths = svg.querySelectorAll('path, ellipse'),
    text = document.createElementNS(SVG_NS, 'text')
  svg.appendChild(text)
  return Array.prototype.map.call(paths, (path, i) => {
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
      console.log(path, size)
    } catch (e) {}
    if(!size) return null

    const textPath = document.createElementNS(SVG_NS, 'textPath')
    textPath.setAttribute('href', '#' + path.id)
    textPath.style.fontSize = size+'px'
    path.setAttributeNS(null, 'stroke', 'none')
    text.appendChild(textPath)

    return {
      path,
      textPath,
      length: path.getTotalLength(),
    }
  }).filter(a => a)
}

function layTextOntoPath(lpath, text) {
  const { textPath, length, filled, fcount = 0 } = lpath,
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
  }
  return text.substr(textPath.innerHTML.length + 1)
}

function layoutAllPaths(lpaths, text) {
  let tail = text
  lpaths.forEach(lpath => {
    tail = layTextOntoPath(lpath, tail)
  })
}

const TemplateSVGPreview = ctyled.div.styles({
  column: true,
  align: 'center',
  justify: 'center',
  bg: true,
  color: c => c.contrast(0.2),
}).extendSheet`
  position:absolute;
  width:100%;
  height:100%;

  & svg {
    max-width:90%;
    max-height:90%;
    fill:none;
  }

  & svg path {
    stroke:none;
  }

  & svg textPath {
    fill:black;
  }
`

export interface TextProps {
  template: Template
  deviceId: string
}

export default function Text(props: TextProps) {
  const wrapperRef = useRef<any>(null)
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
      layoutAllPaths(lpaths, output + tempOutput)
    })
    return stop
  }, [props.template])
  return (
    <TemplateSVGPreview
      inRef={wrapperRef}
      dangerouslySetInnerHTML={{ __html: props.template.data }}
    />
  )
}
