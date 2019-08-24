import React from 'react'
import ctyled from 'ctyled'
import _ from 'lodash'

const RulerBarWrapper = ctyled.div.styles({
  height: 2,
  justify: 'center',
  align: 'center',
  padd: 0.2,
  bg: true,
  size: s => s*0.6
}).extend`
  z-index:1;
`

const RulerBarInner = ctyled.div.styles({ align: 'center', justify: 'space-between', bg: true })
  .extend`
  width:70%;
`

const Grad = ctyled.div.styles({
  width: 0,
  height: 0.5,
  color: c => c.contrast(0.1)
}).extend`
  border-right:1px solid ${({color}) => color.bq};
`

const Bgrad = Grad.styles({
  height: 0.9,
  color: c => c.contrast(0.2)
})

export default function RulerBar() {
  return (
    <RulerBarWrapper>
      <RulerBarInner>
        {_.range(7).map(i => (
          <React.Fragment key={i}>
            {_.range(3).map(i => <Grad key={i}/>)}
            {i + 1}
            {_.range(3).map(i => <Grad key={i}/>)}
            <Bgrad/>
          </React.Fragment>
        ))}
      </RulerBarInner>
    </RulerBarWrapper>
  )
}