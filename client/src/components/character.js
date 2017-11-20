import React, { Component } from 'react'
import CharacterType from './character.type'
import TankIcon from '../assets/roles/tank.png'
import HealerIcon from '../assets/roles/heal.png'
import MeleeIcon from '../assets/roles/melee.png'
import RangedIcon from '../assets/roles/ranged.png'
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

const RoleIcon = [TankIcon, HealerIcon, MeleeIcon, RangedIcon]

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
        className={[
          main ? 'main-character' : 'character',
          CLASS_NAMES[classId],
        ].join(' ')}
      >
        {/* <img src={icon} alt="class" /> */}
        <div>
          {showRole ? (
            <span>
              <img className="role-img" src={RoleIcon[role]} alt={role} />{' '}
            </span>
          ) : (
            ''
          )}
          <span>{name}</span>
          <span className="right">
            {ilvl}
            {/* {main ? ' M' : ' A'} */}
          </span>
        </div>
        {/* 

        {main ? 'main-character' : 'character'}
        <span>{armorType} </span>
        <span>{armorToken} </span> */}
      </div>
    )
  }
}

Character.propTypes = CharacterType

export default Character
