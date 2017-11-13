import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CharacterType from './character.type'
import { Droppable, Draggable } from 'react-beautiful-dnd'

import Character from './character'

import './roster.css'

const grid = 2

const getItemStyle = (draggableStyle, isDragging, used) => {
  let color = ''
  if (used) {
    color = 'pink'
  }
  if (isDragging) {
    color = 'lightgreen'
  }
  return {
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    cursor: 'grab',
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: color,

    // styles we need to apply on draggables
    ...draggableStyle,
  }
}

const generateRoleGroups = (compositionCharacters, characters, roles) => {
  if (!roles.length) {
    return []
  }
  const groups = roles.map(() => [])
  const availableCharacters = characters.map(c =>
    Object.assign({}, c, {
      used:
        compositionCharacters.find(
          used => used.name === c.name && used.realm === c.realm,
        ) !== undefined,
    }),
  )
  for (const character of availableCharacters) {
    const index = character.role !== -1 ? character.role : 0
    groups[index].push(character)
  }
  return groups
}

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: grid,
  width: 250,
})

class Roster extends Component {
  static propTypes = {
    groups: PropTypes.array,
    onGroupUpdate: PropTypes.func.isRequired,
    groupType: PropTypes.string,
    characters: PropTypes.arrayOf(PropTypes.shape(CharacterType)),
    compositionCharacters: PropTypes.arrayOf(PropTypes.shape(CharacterType)),
  }

  static defaultProps = {
    groups: [],
    groupType: 'role',
    characters: [],
    compositionCharacters: [],
  }

  constructor(props) {
    super(props)
    this._characterGroups = generateRoleGroups(
      props.compositionCharacters,
      props.characters,
      props.groups,
    )
    if (props.onGroupUpdate) {
      props.onGroupUpdate(this._characterGroups)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.characters !== this.props.characters ||
      nextProps.compositionCharacters !== this.props.compositionCharacters ||
      nextProps.groups !== this.props.groups
    ) {
      this._characterGroups = generateRoleGroups(
        nextProps.compositionCharacters,
        nextProps.characters,
        nextProps.groups,
      )
      if (nextProps.onGroupUpdate) {
        nextProps.onGroupUpdate(this._characterGroups)
      }
    }
  }

  _renderGroupCharacters(index) {
    const characters = this._characterGroups[index]
    return characters.map(
      ({ name, realm, classId, role, armorType, armorToken, ilvl, used }) => (
        <Draggable
          key={[name, realm].join('_')}
          draggableId={[name, realm].join('_')}
        >
          {(provided, snapshot) => (
            <div>
              <div
                className="character-tile"
                ref={provided.innerRef}
                style={getItemStyle(
                  provided.draggableStyle,
                  snapshot.isDragging,
                  used,
                )}
                {...provided.dragHandleProps}
              >
                <Character
                  name={name}
                  classId={classId}
                  role={role}
                  showRole={false}
                  armorToken={armorToken}
                  armorType={armorType}
                  ilvl={ilvl}
                >
                  )
                  {name}
                </Character>
              </div>
              {provided.placeholder}
            </div>
          )}
        </Draggable>
      ),
    )
  }

  render() {
    const { groups = [] } = this.props
    return (
      <div className="roster">
        {groups.map((role, i) => (
          <Droppable
            key={role.id}
            droppableId={`droppable_${role.id}`}
            className="character-group-container"
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
              >
                <div className="character-tile">
                  {this._renderGroupCharacters(i)}
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    )
  }
}

export default Roster
