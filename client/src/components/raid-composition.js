import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CharacterType from './character.type'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import Character from './character'

import './raid-composition.css'

const grid = 2

const getItemStyle = (draggableStyle, isDragging) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'grey',

  // styles we need to apply on draggables
  ...draggableStyle,
})

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: grid,
})

const RaidMember = Object.assign(
  {
    raidIndex: PropTypes.number.isRequired,
  },
  CharacterType,
)

const DistributionType = PropTypes.shape({
  main: PropTypes.number,
  alt: PropTypes.number,
})

const generateRaidSpotMap = (groups, characters) => {
  const map = new Map()
  for (const character of characters) {
    map.set(character.raidIndex, character)
  }
  return map
}

const calcualteMetrics = characters => {
  return characters.reduce(
    (metrics, character) => {
      // [ main, alt]
      const index = character.main ? 0 : 1
      metrics.roles[character.role][index]++
      metrics.roles[4][index]++
      metrics.armorToken[character.armorToken][index]++
      metrics.armorType[character.armorType][index]++
      return metrics
    },
    {
      roles: [
        [0, 0, 'Tanks'],
        [0, 0, 'Healers'],
        [0, 0, 'Melee'],
        [0, 0, 'Ranged'],
        [0, 0, 'Total'],
      ],
      armorToken: [
        [0, 0, 'Conqueror'],
        [0, 0, 'Protector'],
        [0, 0, 'Vanquisher'],
      ],
      armorType: [
        [0, 0, 'Cloth'],
        [0, 0, 'Leather'],
        [0, 0, 'Mail'],
        [0, 0, 'Plate'],
      ],
    },
  )
}

class RaidComposition extends Component {
  static propTypes = {
    characters: PropTypes.arrayOf(PropTypes.shape(RaidMember)),
    groups: PropTypes.array,
    armorTypeDistribution: PropTypes.arrayOf(DistributionType),
    armorTokenDistribution: PropTypes.arrayOf(DistributionType),
    roleDistribution: PropTypes.arrayOf(DistributionType),
    classDistribution: PropTypes.arrayOf(DistributionType),
  }

  static defaultProps = {
    groups: [],
    characters: [],
  }

  constructor(props) {
    super(props)
    this._characterRaidSpotMap = generateRaidSpotMap(
      props.groups,
      props.characters,
    )
    this._metrics = calcualteMetrics(props.characters)
    this._renderRaidMember = this._renderRaidMember.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.characters !== this.props.characters ||
      nextProps.groups !== this.props.groups
    ) {
      this._characterRaidSpotMap = generateRaidSpotMap(
        nextProps.groups,
        nextProps.characters,
      )
      this._metrics = calcualteMetrics(nextProps.characters)
    }
  }

  _renderRaidMember({ raidIndex, id }) {
    {
      const character = this._characterRaidSpotMap.has(raidIndex)
        ? this._characterRaidSpotMap.get(raidIndex)
        : undefined
      return (
        <Draggable
          key={id}
          draggableId={`draggable_${id}`}
          isDragDisabled={!character}
        >
          {(provided, snapshot) => (
            <div>
              <div
                ref={provided.innerRef}
                style={getItemStyle(
                  provided.draggableStyle,
                  snapshot.isDragging,
                )}
                {...provided.dragHandleProps}
              >
                <div className="character-tile">
                  {character ? (
                    <Character
                      name={character.name}
                      classId={character.classId}
                      role={character.role}
                      ilvl={character.ilvl}
                      armorToken={character.armorToken}
                      armorType={character.armorType}
                    >
                      {character.name}
                    </Character>
                  ) : (
                    ''
                  )}
                </div>
              </div>
              {provided.placeholder}
            </div>
          )}
        </Draggable>
      )
    }
  }

  render() {
    const { groups = [] } = this.props
    const { _metrics: metrics } = this
    return (
      <div className="raid-container">
        <div className="raid" key="raid">
          {groups.map(group => (
            <Droppable
              key={group.id}
              className="raid-group"
              droppableId={`droppable_${group.id}`}
            >
              {(provided, snapshot) => (
                <div
                  className="raid-group"
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {group.members.map(this._renderRaidMember)}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
        <div className="metrics" key="metrics">
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Total</th>
                <th>Mains</th>
                <th>Alts</th>
              </tr>
            </thead>
            <tbody>
              {metrics.roles.map((metric, i) => (
                <tr key={metrics.roles[i][2]}>
                  <th>{metrics.roles[i][2]}</th>
                  <th>{metrics.roles[i][0] + metrics.roles[i][1]}</th>
                  <th>{metrics.roles[i][0]}</th>
                  <th>{metrics.roles[i][1]}</th>
                </tr>
              ))}
            </tbody>
          </table>
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Total</th>
                <th>Mains</th>
                <th>Alts</th>
              </tr>
            </thead>
            <tbody>
              {metrics.armorToken.map((metric, i) => (
                <tr key={metrics.roles[i][2]}>
                  <th>{metrics.armorToken[i][2]}</th>
                  <th>{metrics.armorToken[i][0] + metrics.armorToken[i][1]}</th>
                  <th>{metrics.armorToken[i][0]}</th>
                  <th>{metrics.armorToken[i][1]}</th>
                </tr>
              ))}
            </tbody>
          </table>
          <table>
            <thead>
              <tr>
                <th>Аrmor</th>
                <th>Total</th>
                <th>Mains</th>
                <th>Alts</th>
              </tr>
            </thead>
            <tbody>
              {metrics.armorType.map((metric, i) => (
                <tr key={metrics.roles[i][2]}>
                  <th>{metrics.armorType[i][2]}</th>
                  <th>{metrics.armorType[i][0] + metrics.armorType[i][1]}</th>
                  <th>{metrics.armorType[i][0]}</th>
                  <th>{metrics.armorType[i][1]}</th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default RaidComposition
