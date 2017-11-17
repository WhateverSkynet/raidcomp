import React, { Component } from 'react'
import CharacterType from './character.type'

import './character.css'

const CLASS_NAMES = [
  0,
  'warrior',
  'paladin',
  'hunter',
  'rogue',
  'priest',
  'death-knight',
  'shaman',
  'mage',
  'warlock',
  'monk',
  'druid',
  'demon-hunter',
]

class Character extends Component {
  static defaultProps = {
    dragHandleProps: {},
    showRole: true,
  }

  render() {
    const {
      name,
      classId,
      role,
      armorType,
      armorToken,
      ilvl,
      showRole,
      main,
    } = this.props
    return (
      <div
        // className="character"
        className={['character', CLASS_NAMES[classId]].join(' ')}
      >
        {/* <img src={icon} alt="class" /> */}
        <div>
          {showRole ? <span>{role} </span> : ''}
          <span>{name}</span>
          <span className="main-character">
            {ilvl}
            {/* {main ? ' M' : ' A'} */}
          </span>
        </div>
        {/* 
        <span>{armorType} </span>
        <span>{armorToken} </span> */}
      </div>
    )
  }
}

Character.propTypes = CharacterType

export default Character
