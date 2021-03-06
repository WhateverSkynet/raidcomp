import React, { Component } from 'react'
import CharacterType from './character.type'

import './Character.css'

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
      <div className={['character', CLASS_NAMES[classId]].join(' ')}>
        <div>
          <span>{name}</span>{' '}
          {main ? <span className="main-character">M</span> : ''}
        </div>
        {showRole ? <span>{role} </span> : ''}

        <span>{armorType} </span>
        <span>{armorToken} </span>
        <span>{ilvl} </span>
      </div>
    )
  }
}

Character.propTypes = CharacterType

export default Character
