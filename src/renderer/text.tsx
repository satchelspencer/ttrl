import React, { useEffect, useRef, useState, useCallback } from 'react'
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

const PagesOuterWrapper = ctyled.div.styles({
  column: true,
  flex: 1,
}).extendSheet`
  display:block;
  overflow:hidden;
  @media print {
    & {overflow:visible !important;}
  }
`

const PagesWrapper = ctyled.div.styles({
  column: true,
  flex: 1,
  gutter: 4,
  padd: 2,
}).extendSheet`
  display:block;
  @media print {
    & {top:0px !important;}
  }
`

const TemplateSVGPreview = ctyled.div.styles({
  flex: 'none',
  column: true,
  align: 'center',
  bg: true,
  //border: 1,
  borderColor: c => c.contrast(-0.3),
  color: c => c.contrast(0.2),
}).extendSheet`
  @font-face {
    font-family: Bebas;
    src: url("${bebas}") format('woff');
  }

  overflow:hidden;
  width:100%;

  @media screen {
    & {
      box-shadow:0 0 5px rgba(0,0,0,0.2);
    }
  }

  @media print {
    & {
      display:block !important;
      page-break-after: always;
      page-break-inside: avoid;
      -webkit-region-break-inside: avoid;
    }
    svg {
      display:block;
    }
  }

  & svg {
    fill:none;
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
  templates: Template[]
  deviceId: string
}

export default function Text(props: TextProps) {
  const owrapperRef = useRef<any>(null),
    iwrapperRef = useRef<any>(null),
    wrappersRef = useRef<any[]>([]),
    svgsRef = useRef<any[]>([]),
    targetY = useRef(0),
    y = useRef(0),
    velocity = useRef(0),
    [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    let allPaths = []
    wrappersRef.current.forEach((wrapper, i) => {
      const svg = wrapper.querySelector('svg'),
        lpaths = initTextPaths(svg)
      allPaths = allPaths.concat(lpaths.map(p => ({ ...p, wrapper: i })))
      svgsRef.current[i] = svg
    })

    let output = '',
      tempOutput = ''

    const stop = listen(props.deviceId, d => {
      setAutoScroll(true)
      tempOutput = ''
      d.forEach(res => {
        const text = res.text.toLowerCase().replace(/[^A-Za-z0-9 ]/g, '')
        if (res.final) output += text + ' '
        else tempOutput += text + ' '
      })
      //console.log(output + tempOutput)
      const last = layoutAllPaths(allPaths, output + tempOutput)
      if (last) {
        const svg = svgsRef.current[last.wrapper],
          wrapper = wrappersRef.current[last.wrapper],
          width = parseInt(
            svg.getAttribute('width') || svg.getAttribute('viewBox').split(' ')[2]
          ),
          scaleRatio = owrapperRef.current.offsetWidth / width,
          wrapperHeight = owrapperRef.current.offsetHeight,
          actualY = last.y * scaleRatio + wrapper.offsetTop,
          centerScroll = actualY - wrapperHeight / 2
        targetY.current = centerScroll
      }
    })
    return stop
  }, [props.templates])

  useEffect(() => {
    if (!autoScroll) return undefined
    const int = setInterval(() => {
      y.current += velocity.current
      iwrapperRef.current.style.top = Math.min(-y.current, 0) + 'px'
    }, 25)
    return () => clearInterval(int)
  }, [props.templates, autoScroll])

  useEffect(() => {
    if (!autoScroll) return undefined
    const int = setInterval(() => {
      if (targetY.current !== y.current) {
        const dy = targetY.current - y.current,
          targetVel = dy / 10,
          dVel = targetVel - velocity.current
        velocity.current = velocity.current + dVel / 5
      }
    }, 30)
    return () => clearInterval(int)
  }, [autoScroll])

  const handleWheel = useCallback(e => {
    setAutoScroll(false)
    y.current += e.deltaY
    iwrapperRef.current.style.top = Math.min(-y.current, 0) + 'px'
  }, [])

  return (
    <PagesOuterWrapper onWheel={handleWheel} inRef={owrapperRef}>
      <PagesWrapper inRef={iwrapperRef}>
        {props.templates.map((template, i) => (
          <TemplateSVGPreview
            key={i}
            inRef={r => (wrappersRef.current[i] = r)}
            dangerouslySetInnerHTML={{ __html: template.data }}
          />
        ))}
      </PagesWrapper>
    </PagesOuterWrapper>
  )
}
