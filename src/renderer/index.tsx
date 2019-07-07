import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import ctyled, { active, inline } from 'ctyled'
import { ipcRenderer } from 'electron'

import Text from './text'

const Wrapper = ctyled.div.styles({
  bg: true,
  color: c => c.absLum(0.9).contrast(0.1),
}).extend`
  position:absolute;
  width:100%;
  height:100%;
  top:0;
  left:0;
`

const ConfigWrapper = ctyled.div.styles({
  flex: 1,
  justify: 'center',
  align: 'center',
  column: true,
  gutter: 2,
})

const TemplateWrapper = ctyled.div.styles({
  border: 2,
  rounded: 2,
  width: 15,
  height: 15,
  align: 'center',
  justify: 'center',
  bg: true,
  color: c => c.nudge(0.1),
}).extendSheet`
  border-style:dashed;
  cursor:pointer;

  &:hover{
    border-color:${({ color }) => color.nudge(0.3).bq}!important;
  }
`

export interface Template {
  data: string
  width: number
  height: number
}

interface TemplateInputProps {
  value: Template
  onChange: (val: Template) => any
}

const TemplateSVGPreview = ctyled.div.styles({
  flex: 1,
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

  & svg * {
    stroke:${({ color }) => color.fg};
  }
`

const CornerWrapper = ctyled.div.class(active).class(inline).styles({
  hover: true,
  size: s => s*2,
  width: 0.88,
  bg: false
}).extendSheet`
  position:absolute;
  top:0;
  right:0;
`

function TemplateInput(props: TemplateInputProps) {
  const input = useRef<any>(null)

  useEffect(() => {
    input.current = document.createElement('input')
    input.current.type = 'file'
    input.current.onchange = e => {
      const { files } = input.current
      const path = files && files[0] && files[0].path
      ipcRenderer.send('getSVG', path)
      ipcRenderer.once('svgRes', (e, res) => {
        if (res) {
          props.onChange({
            data: res.data,
            width: res.info.width,
            height: res.info.height,
          })
        }
      })
      input.current.value = ''
    }
  }, [])
  return (
    <TemplateWrapper onClick={() => input.current.click()}>
      {!props.value && '+ add template'}
      {props.value && (
        <TemplateSVGPreview dangerouslySetInnerHTML={{ __html: props.value.data }} />
      )}
      {props.value && (
        <CornerWrapper onClick={e => {
          e.stopPropagation()
          props.onChange(null)
        }}>&times;</CornerWrapper>
      )}
    </TemplateWrapper>
  )
}

const Button = ctyled.button
  .class(active)
  .class(inline)
  .attrs<{ disabled?: boolean }>({ disabled: false })
  .styles({
    padd: 1,
    bg: true,
    border: 1,
    rounded: 1,
    color: c => c.nudge(0.1),
  }).extend`
    border-width:1px;
    ${(_, { disabled }) =>
      disabled &&
      `
      opacity:0.5;
      pointer-events:none;
      cursor:not-allowed;
    `}
  `

interface ConfigProps{
  template: Template
  setTemplate: (val: Template) => any
  onStart: () => any
}

function Config(props: ConfigProps) {
  return (
    <ConfigWrapper>
      <TemplateInput value={props.template} onChange={props.setTemplate} />
      <Button onClick={props.onStart} disabled={!props.template} styles={{ size: s => s * 1.1 }}>
        start
      </Button>
    </ConfigWrapper>
  )
}

function App() {
  const [template, setTemplate] = useState<Template>(null),
    [running, setRunning] = useState(false)

  useEffect(() => {
    const handle = (e) => {
      if(e.key === 'Escape') setRunning(false)
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  })

  return (
    <Wrapper>
      <Config {...{template, setTemplate}} onStart={() => setRunning(true)}/>
      {running && <Text template={template}/>}
    </Wrapper>
  )
}


ReactDOM.render(<App />, document.getElementById('app'))
