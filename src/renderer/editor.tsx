import React, { useEffect, useRef, useState } from 'react'
import ctyled, { active, inline } from 'ctyled'
import _ from 'lodash'

import Icon from './icons'
import Ruler from './ruler'

const EditorWrapper = ctyled.div.styles({
  column: true,
  lined: true,
  bg: true,
  bgColor: c => c.nudge(0.05),
}).extendSheet`
  position:absolute;
  width:100%;
  height:100%;
  @media print {
    & {display:block !important;}
  }
`

const EditorHeader = ctyled.div.styles({
  color: c => c.contrast(0.1),
  bg: true,
  lined: true,
  size: s => s * 1.2,
}).extendSheet`
  @media print {
    & {display:none;}
  }
`

const EditorRow = ctyled.div.styles({
  justify: 'space-between',
  padd: 1,
}).extend`
  width:100%;
`

const EditorGroupWrapper = ctyled.div.styles({
  lined: true,
  gutter: true,
  align: 'center',
}).extend`
  overflow:hidden;
`

const Group = ctyled.div.styles({
  gutter: 0.3,
})

const Button = ctyled.div
  .class(active)
  .class(inline)
  .styles({
    bg: true,
    hover: 1,
    rounded: 1,
    padd: 0.2,
  }).extend`
    font-size:${({ size }) => size * 0.8}px;
  `

const Eicon = ({ name, onClick }: { name: string, onClick?: any }) => (
  <Button onClick={onClick}>
    <Icon name={name} />
  </Button>
)

const Edropdown = ({ children }) => (
  <Button>
    {children} &nbsp;
    <Icon name="arrow_drop_down" />
  </Button>
)

const EditorBody = ctyled.div.styles({
  flex: 1,
  align: 'center',
  column: true,
}).extendSheet`
  width:100%;
  @media print {
    & {margin-top:-18px;display:block !important;}
  }
`

const EditorBodyInner = ctyled.div.styles({
  column: true,
  flex: 1,
}).extendSheet`
  width:70%;
  @media print {
    & {
      display:block !important;
      width:100%;
    }
  }
`

const MicWrapper = ctyled.div.styles({
  bg: true,
  align: 'center',
  justify: 'center',
  color: c => c.as(['red', 'white']).contrast(0.15),
}).extendSheet`
  position:absolute;
  top:5%;
  left:5%;
  width:5vw;
  height:5vw;
  font-size:4vw;
  border-radius:50%;
  border:0.3vw solid ${({ color }) => color.fg};

  & svg{
    width:3vw !important;
    height:3vw !important;
  }

  @media print {
    & {display:none;}
  }
`

export interface EditorProps {
  children: any
}

export default function Editor(props: EditorProps) {
  return (
    <EditorWrapper>
      <EditorHeader>
        <EditorRow>
          <EditorGroupWrapper styles={{ flex: '0 1 auto' }}>
            <Group>
              <Eicon name="undo" />
              <Eicon name="redo" />
              <Eicon name="print" onClick={() => window.print()}/>
              <Eicon name="spellcheck" />
              <Eicon name="format_paint" />
            </Group>
            <Group>
              <Edropdown>100% </Edropdown>
            </Group>
            <Group>
              <Edropdown>Normal Text</Edropdown>
            </Group>
            <Group>
              <Edropdown>Bebas Neue</Edropdown>
            </Group>
            <Group>
              <Edropdown>&nbsp;&nbsp;&nbsp;&nbsp;</Edropdown>
            </Group>
            <Group>
              <Eicon name="format_bold" />
              <Eicon name="format_underlined" />
              <Eicon name="format_italic" />
              <Eicon name="format_color_text" />
            </Group>
            <Group>
              <Eicon name="link" />
              <Eicon name="comment" />
            </Group>
            <Group>
              <Eicon name="format_align_left" />
              <Eicon name="format_align_center" />
              <Eicon name="format_align_right" />
              <Eicon name="format_align_justify" />
            </Group>
            <Group>
              <Eicon name="format_line_spacing" />
            </Group>
            <Group>
              <Edropdown>
                <Icon name="format_list_numbered" />
              </Edropdown>
              <Edropdown>
                <Icon name="format_list_bulleted" />
              </Edropdown>
              <Eicon name="format_indent_decrease" />
              <Eicon name="format_indent_increase" />
            </Group>
            <Group>
              <Eicon name="format_clear" />
            </Group>
          </EditorGroupWrapper>
          <EditorGroupWrapper>
            <Group>
              <Edropdown>
                <Icon name="edit" /> &nbsp; Editing &nbsp;
              </Edropdown>
            </Group>
            <Group>
              <Eicon name="expand_less" />
            </Group>
          </EditorGroupWrapper>
        </EditorRow>
      </EditorHeader>
      <Ruler />
      <EditorBody>
        <EditorBodyInner>
        {props.children}
        </EditorBodyInner>
        <MicWrapper>
          <Icon name="mic" />
        </MicWrapper>
      </EditorBody>
    </EditorWrapper>
  )
}
