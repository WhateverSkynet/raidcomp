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
  const mainItemLevels = characters
    .filter(character => character.main)
    .map(character => character.ilvl)
  const altItemLevels = characters
    .filter(character => !character.main)
    .map(character => character.ilvl)
  const totalItemLevels = characters.map(character => character.ilvl)

  const average = [
    Math.floor(
      mainItemLevels.reduce((sum, ilvl, i) => sum + ilvl, 0) /
        mainItemLevels.length,
    ),
    Math.floor(
      altItemLevels.reduce((sum, ilvl, i) => sum + ilvl, 0) /
        altItemLevels.length,
    ),
    Math.floor(
      totalItemLevels.reduce((sum, ilvl, i) => sum + ilvl, 0) /
        totalItemLevels.length,
    ),
  ]
  return characters.reduce(
    (metrics, character, i) => {
      // [ main, alt]
      const metricIndex = character.main ? 0 : 1
      metrics.roles[character.role][metricIndex]++
      metrics.roles[4][metricIndex]++
      metrics.armorToken[character.armorToken][metricIndex]++
      metrics.armorType[character.armorType][metricIndex]++
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
      ilvl: [
        {
          name: 'min',
          mains: Math.min(...mainItemLevels),
          alts: Math.min(...altItemLevels),
          total: Math.min(...totalItemLevels),
        },
        {
          name: 'average',
          mains: average[0],
          alts: average[1],
          total: average[2],
        },
        {
          name: 'max',
          mains: Math.max(...mainItemLevels),
          alts: Math.max(...altItemLevels),
          total: Math.max(...totalItemLevels),
        },
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
                      main={character.main}
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
        <div className="metrics">
          <table>
            <thead>
              <tr>
                <th />
                <th>T</th>
                <th>M</th>
                <th>A</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="subtitle">Role</th>
              </tr>
              {metrics.roles.map((metric, i) => (
                <tr key={metrics.roles[i][2]}>
                  <td>{metrics.roles[i][2]}</td>
                  <td className="mid">
                    {metrics.roles[i][0] + metrics.roles[i][1]}
                  </td>
                  <td className="mid">{metrics.roles[i][0]}</td>
                  <td className="mid">{metrics.roles[i][1]}</td>
                </tr>
              ))}
              <tr>
                <th className="subtitle">Token</th>
              </tr>
              {metrics.armorToken.map((metric, i) => (
                <tr key={metrics.armorToken[i][2]}>
                  <td>{metrics.armorToken[i][2]}</td>
                  <td className="mid">
                    {metrics.armorToken[i][0] + metrics.armorToken[i][1]}
                  </td>
                  <td className="mid">{metrics.armorToken[i][0]}</td>
                  <td className="mid">{metrics.armorToken[i][1]}</td>
                </tr>
              ))}
              <tr>
                <th className="subtitle">Armor</th>
              </tr>
              {metrics.armorType.map((metric, i) => (
                <tr key={metrics.armorType[i][2]}>
                  <td>{metrics.armorType[i][2]}</td>
                  <td className="mid">
                    {metrics.armorType[i][0] + metrics.armorType[i][1]}
                  </td>
                  <td className="mid">{metrics.armorType[i][0]}</td>
                  <td className="mid">{metrics.armorType[i][1]}</td>
                </tr>
              ))}
              <tr>
                <th className="subtitle">ilvl</th>
              </tr>
              {metrics.ilvl.map((metric, i) => (
                <tr key={metrics.ilvl[i].name}>
                  <td>{metrics.ilvl[i].name}</td>
                  <td className="mid">{metrics.ilvl[i].total}</td>
                  <td className="mid">{metrics.ilvl[i].mains}</td>
                  <td className="mid">{metrics.ilvl[i].alts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="raid">
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
      </div>
    )
  }
}

export default RaidComposition
