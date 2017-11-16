import React, { Component } from 'react'
import './planner.css'
import { planService, guildService } from '../feathers'
import { DragDropContext } from 'react-beautiful-dnd'

import { v4 } from 'uuid'

import Roster from './roster'
import RaidComposition from './raid-composition'

const GROUP_SIZE = 5
/**
 *
 * @param {number} groupCount
 * @param {number} compositionCount
 * @param {object[]} compositions
 */
const generateCompositions = (groupCount, compositionCount, compositions) => {
  return Array.from(
    { length: compositionCount },
    (v, composition) => composition,
  ).map((composition, i) => ({
    id: v4(),
    members: compositions.length < i ? compositions[i] : [],
    groups: generateGroups(groupCount),
  }))
}
/**
 *
 * @param {number} groupCount
 */
const generateGroups = groupCount => {
  const groups = Array.from({ length: groupCount }, (v, group) => group).map(
    group => ({
      id: v4(),
      group,
      members: Array.from({ length: GROUP_SIZE }, (v, partyIndex) => {
        const raidIndex = group * GROUP_SIZE + partyIndex
        return {
          group,
          partyIndex,
          raidIndex,
          // placeholder: true,
          id: v4(),
        }
      }),
    }),
  )

  return groups
}
// /**
//  *
//  * @param {object[]} members
//  */
// const getRoleGroups = members => {
//   return members.reduce(
//     (roles, character) => {
//       const index = character.role !== -1 ? character.role : 0
//       roles[index].characters.push(character)
//       return roles
//     },
//     [
//       { id: v4(), characters: [], role: 0 },
//       { id: v4(), characters: [], role: 1 },
//       { id: v4(), characters: [], role: 2 },
//       { id: v4(), characters: [], role: 3 },
//     ],
//   )
// }

class Planner extends Component {
  static defaultProps = {
    compositionCount: 1,
  }
  constructor(props) {
    super(props)
    const { compositionCount } = props
    const compositions = generateCompositions(4, compositionCount, [])
    this.state = {
      compositions,
      compositionCharacters: [],
      guild: {},
      rosterGroups: [],
      rosterCharacters: [],
    }
    const { id } = props.match.params
    planService.get(id, { query: { $populate: 'roster' } }).then(data => {
      const rosterCharacters = data.roster
        .map(c => {
          c.classId = c.class
          delete c.class
          return c
        })
        .filter(c => c.role !== -1)
      const roleGroups = [
        { id: v4(), role: 0 },
        { id: v4(), role: 1 },
        { id: v4(), role: 2 },
        { id: v4(), role: 3 },
      ]
      this.setState({
        rosterGroups: roleGroups,
        rosterCharacters,
      })
    })
    this.onDragEnd = this.onDragEnd.bind(this)
    this.onRosterGroupUpdate = this.onRosterGroupUpdate.bind(this)
  }

  onRosterGroupUpdate(rosterCharacterGroups) {
    this._rosterCharacterGroups = rosterCharacterGroups
  }
  onDragEnd(result) {
    // dropped outside the list
    // console.log(result);
    if (!result.destination) {
      return
    }
    const { compositions, rosterGroups, compositionCharacters } = this.state
    // TODO: This can be optimized
    const compositionDropContainers = compositions.reduce(
      (result, composition, i) => {
        const groups = composition.groups.map(group =>
          Object.assign(
            { compositionId: composition.id, compositionIndex: i },
            group,
          ),
        )
        return [...result, ...groups]
      },
      [],
    )

    const [, destinationId] = result.destination.droppableId.split('_')
    const [, sourceId] = result.source.droppableId.split('_')
    // we need to find in which composition character was dropped
    const destinationCompositionGroup = compositionDropContainers.find(
      group => group.id === destinationId,
    )
    const destinationRosterGroup = rosterGroups.find(
      role => role.id === destinationId,
    )

    // console.log(destinationCompositionGroup)
    // console.log(destinationRosterGroup)

    const sourceCompositionGroup = compositionDropContainers.find(
      group => group.id === sourceId,
    )
    const sourceRosterGroup = rosterGroups.find(role => role.id === sourceId)

    // console.log(sourceCompositionGroup)
    // console.log(sourceRosterGroup)

    // now we have what we need to generate state change
    // roster -> comp - needs roster and comp updates
    // comp -> roster - needs roster and comp updates
    // comp -> comp (diff comp) - update 2 comps
    // comp -> comp (same comp) - single comp change
    // group -> group (diff group) - single comp change
    // group -> group (same group) - single comp change
    if (sourceRosterGroup && destinationRosterGroup) {
      return
    } else if (sourceRosterGroup && destinationCompositionGroup) {
      const { index: sourceIndex } = result.source
      const { index: targetIndex } = result.destination
      if (targetIndex >= GROUP_SIZE) {
        return
      }
      const movedCharacter = this._rosterCharacterGroups.find(
        (x, i) => rosterGroups[i].id === sourceId,
      )[sourceIndex]
      const raidIndex =
        destinationCompositionGroup.group * GROUP_SIZE + targetIndex
      const raidMember = Object.assign({ raidIndex }, movedCharacter)
      const newCompositions = compositions.map(composition => {
        if (composition.id !== destinationCompositionGroup.compositionId) {
          return composition
        }
        // if (
        //   composition.members.find(member => member.raidIndex === raidIndex)
        // ) {
        //   // Dropped on character, do nothing
        //   const members = [...composition.members, raidMember]
        //   return composition
        // }
        const members = [
          ...composition.members.filter(
            member => member.raidIndex !== raidIndex,
          ),
          raidMember,
        ]
        return Object.assign({}, composition, { members })
      })
      const newCompositionCharacters = [
        // If we drop on existing spot we want to move the character out
        ...compositionCharacters.filter(
          compositionCharacter =>
            compositionCharacter.compositionId !==
              destinationCompositionGroup.compositionId ||
            compositionCharacter.raidIndex !== raidIndex,
        ),
        Object.assign(
          {
            compositionId: destinationCompositionGroup.compositionId,
          },
          raidMember,
        ),
      ]
      // console.log(newCompositions, newCompositionCharacters)
      this.setState({
        compositions: newCompositions,
        compositionCharacters: newCompositionCharacters,
      })
    } else if (sourceCompositionGroup && destinationRosterGroup) {
      const { index: sourceIndex } = result.source
      const raidIndex = sourceCompositionGroup.group * GROUP_SIZE + sourceIndex
      // console.log(raidIndex)
      const newCompositions = compositions.map(composition => {
        if (composition.id !== sourceCompositionGroup.compositionId) {
          return composition
        }
        const members = composition.members.filter(
          member => raidIndex !== member.raidIndex,
        )
        return Object.assign({}, composition, { members })
      })

      const newCompositionCharacters = compositionCharacters.filter(
        compositionCharacter =>
          compositionCharacter.compositionId !==
            sourceCompositionGroup.compositionId &&
          compositionCharacter.raidIndex !== raidIndex,
      )
      // console.log(newCompositions, newCompositionCharacters)
      this.setState({
        compositions: newCompositions,
        compositionCharacters: newCompositionCharacters,
      })
    } else if (
      destinationCompositionGroup.compositionId ===
      sourceCompositionGroup.compositionId
    ) {
      const { index: sourceIndex } = result.source
      const { index: targetIndex } = result.destination
      if (targetIndex >= GROUP_SIZE) {
        return
      }
      const sourceRaidIndex =
        sourceCompositionGroup.group * GROUP_SIZE + sourceIndex
      // We need to update the raid index after drop
      const raidIndex =
        destinationCompositionGroup.group * GROUP_SIZE + targetIndex
      // console.log(sourceRaidIndex, raidIndex)
      const movedCharacter1 = compositionCharacters.find(
        raidMember =>
          raidMember.compositionId === sourceCompositionGroup.compositionId &&
          raidMember.raidIndex === sourceRaidIndex,
      )
      const movedCharacter2 = compositionCharacters.find(
        raidMember =>
          raidMember.compositionId === sourceCompositionGroup.compositionId &&
          raidMember.raidIndex === raidIndex,
      )
      // console.log(movedCharacter1, movedCharacter2)
      const raidMember1 = Object.assign({}, movedCharacter1, { raidIndex })
      const raidMember2 = Object.assign({}, movedCharacter2, {
        raidIndex: sourceRaidIndex,
      })
      const raidMembers = movedCharacter2
        ? [raidMember1, raidMember2]
        : [raidMember1]
      // console.log(raidMember1, raidMember2)
      const newCompositions = compositions.map(composition => {
        if (composition.id === destinationCompositionGroup.compositionId) {
          const members = [
            ...composition.members.filter(
              member =>
                member.raidIndex !== sourceRaidIndex &&
                member.raidIndex !== raidIndex,
            ),
            ...raidMembers,
          ]
          return Object.assign({}, composition, { members })
        }
        return composition
      })
      // console.log(raidMember2, raidMember1)

      const newCompositionCharacters = [
        ...compositionCharacters.filter(
          raidMember =>
            raidMember.compositionId !== sourceCompositionGroup.compositionId ||
            (raidMember.raidIndex !== raidIndex &&
              raidMember.raidIndex !== sourceRaidIndex),
        ),
        ...raidMembers.map(raidMember =>
          Object.assign(
            {
              compositionId: destinationCompositionGroup.compositionId,
            },
            raidMember,
          ),
        ),
      ]

      // console.log(newCompositions, newCompositionCharacters)
      this.setState({
        compositions: newCompositions,
        compositionCharacters: newCompositionCharacters,
      })
    }
  }

  render() {
    const {
      rosterGroups,
      compositions,
      rosterCharacters,
      compositionCharacters,
    } = this.state
    return (
      <div className="container">
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div className="column raid-comp">
            {/* <div className="grid" /> */}
            {compositions.map(composition => (
              <RaidComposition
                key={composition.id}
                groups={composition.groups}
                characters={composition.members}
              />
            ))}
          </div>
          <div className="column roster">
            <div className="filters" />
            <Roster
              className="grid"
              groups={rosterGroups}
              characters={rosterCharacters}
              compositionCharacters={compositionCharacters}
              onGroupUpdate={this.onRosterGroupUpdate}
            />
          </div>
        </DragDropContext>
      </div>
    )
  }
}

export default Planner