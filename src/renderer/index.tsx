import React, { useEffect, useRef, useState, useMemo } from 'react'
import ReactDOM from 'react-dom'
import ctyled, { active, inline } from 'ctyled'
import { ipcRenderer } from 'electron'
import _ from 'lodash'

import Text from './text'
import Editor from './editor'
import Icon from './icons'

const Wrapper = ctyled.div.styles({
  bg: true,
  color: c => c.absLum(0.9).contrast(0.1),
}).extendSheet`
  position:absolute;
  width:100%;
  height:100%;
  top:0;
  left:0;
  @media print {
    & {display:block !important;}
  }
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
  bg: true,
  color: c => c.nudge(0.1),
}).extendSheet`
  border-style:dashed;
  cursor:pointer;

  &:hover{
    border-color:${({ color }) => color.nudge(0.3).bq}!important;
  }
`

const TemplateInner = ctyled.div.styles({
  flex: '1',
  scroll: true,
  padd: 2,
  gutter: 2,
  column: true,
  color: c => c.contrast(0.2),
  bg: true,
}).extend`
  position:absolute;
  width:100%;
  height:100%;
  top:0;
  left:0;
  display:block;
`

const TemplateMessage = ctyled.div.styles({
  flex: 1,
  align: 'center',
  justify: 'center',
  color: c => c.contrast(-0.1),
}).extend`
  position:absolute;
  width:100%;
  height:100%;
  top:0;
  left:0;
`

export interface Template {
  data: string
  width: number
  height: number
}

const TemplateSVGPreview = ctyled.div.styles({
  flex: 'none',
  column: true,
  align: 'center',
  justify: 'center',
  border: 1,
  borderColor: c => c.contrast(-0.2),
  rounded: 1,
  bg: true,
  color: c => c.contrast(0.1),
}).extendSheet`
left:15%;
  width:70%;
  height:70%;
  & svg {
    max-width:90%;
    max-height:90%;
    fill:none;
  }

  & svg * {
    stroke:${({ color }) => color.fg};
  }
`

const CornerWrapper = ctyled.div
  .class(active)
  .class(inline)
  .styles({
    hover: true,
    size: s => s * 2,
    width: 0.88,
    bg: false,
  }).extendSheet`
  position:absolute;
  top:0;
  right:0;
`

interface TemplateInputProps {
  value: Template[]
  onChange: (val: Template[]) => any
}

function TemplateInput(props: TemplateInputProps) {
  const input = useRef<any>(null)

  useEffect(() => {
    input.current = document.createElement('input')
    input.current.type = 'file'
    input.current.webkitdirectory = true
    input.current.onchange = e => {
      const { files } = input.current
      const path = files && files[0] && files[0].path
      ipcRenderer.send('getSVG', path)
      ipcRenderer.once('svgRes', (e, res) => {
        if (res && res.length)
          props.onChange(
            res.map(r => ({
              data: r.data,
              width: r.info.width,
              height: r.info.height,
            }))
          )
      })
      input.current.value = ''
    }
  }, [])
  return (
    <TemplateWrapper onClick={() => input.current.click()}>
      <TemplateInner>
        {props.value &&
          props.value.map((template, i) => (
            <TemplateSVGPreview
              key={i}
              dangerouslySetInnerHTML={{ __html: template.data }}
            />
          ))}
      </TemplateInner>
      {!props.value && <TemplateMessage>+ select templates folder</TemplateMessage>}
      {props.value && (
        <CornerWrapper
          onClick={e => {
            e.stopPropagation()
            props.onChange(null)
          }}
        >
          &times;
        </CornerWrapper>
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
    align: 'center',
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

const CredPickerWrapper = ctyled.div.styles({
  gutter: 1,
  align: 'center',
})

const CurrentCred = ctyled.span.styles({
  color: c => c.contrast(0.2),
  size: s => s * 0.9,
})

interface CredPickerProps {
  credentials: string
}

function CredPicker(props: CredPickerProps) {
  const input = useRef<any>(null)

  useEffect(() => {
    input.current = document.createElement('input')
    input.current.type = 'file'
    input.current.onchange = () => {
      const { files } = input.current
      const path = files && files[0] && files[0].path
      ipcRenderer.send('setCred', path)
      input.current.value = ''
    }
  }, [])

  return (
    <CredPickerWrapper>
      <Button onClick={() => input.current.click()}>
        {props.credentials ? 'Change' : 'Add'} Api Key
      </Button>
      <CurrentCred>{props.credentials || 'no api key...'}</CurrentCred>
    </CredPickerWrapper>
  )
}

interface ConfigProps {
  templates: Template[]
  setTemplates: (val: Template[]) => any
  onStart: () => any
  deviceId: string
  setDeviceId: (d: string) => any
  credentials: string
}

function Config(props: ConfigProps) {
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])
  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then(res =>
        setAvailableDevices(res.filter(device => device.kind === 'audioinput'))
      )
  }, [])
  return (
    <ConfigWrapper>
      <TemplateInput value={props.templates} onChange={props.setTemplates} />
      {!!availableDevices.length ? (
        <select
          value={props.deviceId}
          onChange={e => props.setDeviceId(e.currentTarget.value)}
        >
          {availableDevices.map(device => {
            return (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            )
          })}
        </select>
      ) : (
        'loading audio inputs...'
      )}
      <CredPicker credentials={props.credentials} />
      <br />
      <br />
      <Button
        onClick={props.onStart}
        disabled={!props.templates || !props.templates.length || !props.credentials}
        styles={{ size: s => s * 1.3 }}
      >
        <Icon name="mic" />
        start
      </Button>
    </ConfigWrapper>
  )
}

function App() {
  const lastTemplate = useMemo(() => {
    const raw = localStorage.getItem('templates')
    let parsed: Template[] = []
    try {
      parsed = JSON.parse(raw)
    } catch (e) {}
    return parsed
  }, [])

  const [templates, setTemplates] = useState<Template[]>(lastTemplate),
    [running, setRunning] = useState(false),
    [deviceId, setDeviceId] = useState('default'),
    [credentials, setCredentials] = useState(null),
    setTemplatesPersist = (templates: Template[]) => {
      setTemplates(templates)
      localStorage.setItem('templates', JSON.stringify(templates))
    }

  useEffect(() => {
    ipcRenderer.send('connect')

    const handle = e => {
      if (e.key === 'Escape') window.location.reload()
    }
    window.addEventListener('keydown', handle)

    ipcRenderer.on('credentials', (e, cred) => {
      setCredentials(cred || null)
    })

    return () => {
      window.removeEventListener('keydown', handle)
      ipcRenderer.removeAllListeners('credentials')
    }
  })

  return (
    <Wrapper>
      {!running && (
        <Config
          {...{
            templates,
            setTemplates: setTemplatesPersist,
            deviceId,
            setDeviceId,
            credentials,
          }}
          onStart={() => setRunning(true)}
        />
      )}
      {running && (
        <Editor>
          <Text templates={templates} deviceId={deviceId} />{' '}
        </Editor>
      )}
    </Wrapper>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))
