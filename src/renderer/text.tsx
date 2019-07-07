import React, { useEffect, useRef } from 'react'
import ctyled from 'ctyled'

import { onText } from './audio'

const TextWrapper = ctyled.div.styles({})

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
    const textPath = document.createElementNS(SVG_NS, 'textPath')
    textPath.setAttribute('href', '#' + path.id)
    path.setAttributeNS(null, 'stroke', 'none')
    text.appendChild(textPath)
    return {
      path,
      textPath,
      length: path.getTotalLength(),
    }
  })
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

export interface TextProps {
  svgString: string
}

export default function Text(props: TextProps) {
  const wrapperRef = useRef<any>(null)
  useEffect(() => {
    const svg = wrapperRef.current.querySelector('svg'),
      lpaths = initTextPaths(svg)

    let output = '',
      tempOutput = ''
    onText(d => {
      tempOutput = ''
      d.forEach(res => {
        if (res.final) output += res.text + ' '
        else tempOutput += res.text + ' '
      })
      layoutAllPaths(lpaths, output + tempOutput)
    })
  }, [props.svgString])
  return (
    <TextWrapper
      inRef={wrapperRef}
      dangerouslySetInnerHTML={{ __html: props.svgString }}
    />
  )
}
