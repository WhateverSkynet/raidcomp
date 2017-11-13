import React, { Component } from 'react'
import CharacterType from './character.type'

// import WarriorIcon from '../assets/warrior-60x60.png'
// import PaladinIcon from '../assets/paladin-60x60.png'
// import HunterIcon from '../assets/hunter-60x60.png'
// import RogueIcon from '../assets/rogue-60x60.png'
// import PriestIcon from '../assets/priest-60x60.png'
// import DeathKnightIcon from '../assets/death-knight-60x60.png'
// import ShamanIcon from '../assets/shaman-60x60.png'
// import MageIcon from '../assets/mage-60x60.png'
// import WarlockIcon from '../assets/warlock-60x60.png'
// import MonkIcon from '../assets/monk-60x60.png'
// import DruidIcon from '../assets/druid-60x60.png'
// import DemonHunterIcon from '../assets/demon-hunter-60x60.png'

import './character.css'

// const icons = [
//   0,
//   WarriorIcon,
//   PaladinIcon,
//   HunterIcon,
//   RogueIcon,
//   PriestIcon,
//   DeathKnightIcon,
//   ShamanIcon,
//   MageIcon,
//   WarlockIcon,
//   MonkIcon,
//   DruidIcon,
//   DemonHunterIcon,
// ]

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
    } = this.props
    return (
      <div
        // className="character"
        className={['character', CLASS_NAMES[classId]].join(' ')}
      >
        {/* <img src={icon} alt="class" /> */}
        <div>{name} </div>
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
