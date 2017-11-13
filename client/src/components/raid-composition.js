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
  width: 250,
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
    return (
      <div className="raid">
        {groups.map(group => (
          <Droppable
            key={group.id}
            className="raid-group"
            droppableId={`droppable_${group.id}`}
          >
            {(provided, snapshot) => (
              <div
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
    )
  }
}

export default RaidComposition
