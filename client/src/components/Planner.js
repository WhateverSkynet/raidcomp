import React, { Component } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import { v4 } from 'uuid'

import { planService } from '../feathers'

import Roster from './Roster'
import RaidComposition from './RaidComposition'

import './Planner.css'

const GROUP_SIZE = 5

/**
 *
 * @param {number} groupCount
 */
const generateGroups = groupCount => {
  return Array.from({ length: groupCount }, (v, group) => group).map(group => ({
    id: v4(),
    group,
    members: Array.from({ length: GROUP_SIZE }, (v, partyIndex) => {
      const raidIndex = group * GROUP_SIZE + partyIndex
      return {
        group,
        partyIndex,
        raidIndex,
        id: v4(),
      }
    }),
  }))
}

/**
 *
 * @param {object[]} compositions
 */
const generateCompositions = compositions => {
  return compositions.map(composition =>
    Object.assign({ id: v4() }, composition, {
      groups: generateGroups(composition.size),
    }),
  )
}

const transformCompositions = compositions =>
  compositions.map(composition =>
    Object.assign(
      {},
      composition,
      {
        members: composition.members.map(member => ({
          index: member.raidIndex,
          character: member._id,
          _id: member.memberId,
        })),
      },
      { groups: undefined },
    ),
  )

const SIZE_OPTIONS = [
  { value: 4, label: 'Mythic' },
  { value: 6, label: 'Flex' },
]

class Planner extends Component {
  static defaultProps = {}
  constructor(props) {
    super(props)

    this.state = {
      compositions: [],
      compositionsRaw: [],
      compositionCharacters: [],
      guild: {},
      rosterGroups: [],
      rosterCharacters: [],
    }
    const { id } = props.match.params
    planService
      .get(id, { query: { $populate: 'roster' } })
      .then(data => this.updatePlan(data))
    planService.on('updated', data => this.updatePlan(data))
    this.onDragEnd = this.onDragEnd.bind(this)
    this.onRosterGroupUpdate = this.onRosterGroupUpdate.bind(this)
  }

  updatePlan(data) {
    const rosterCharacters = data.roster
      .map(c => {
        c.classId = c.class
        delete c.class
        return c
      })
      .filter(c => c.role !== -1)
    const compositions = generateCompositions(
      data.compositions.map(composition =>
        Object.assign({}, composition, {
          members: composition.members.map(member =>
            Object.assign(
              { raidIndex: member.index, memberId: member._id },
              data.roster.find(c => c._id === member.character),
            ),
          ),
        }),
      ),
    )
    const roleGroups = [
      { id: v4(), role: 0 },
      { id: v4(), role: 1 },
      { id: v4(), role: 2 },
      { id: v4(), role: 3 },
    ]
    const compositionCharacters = compositions.reduce((total, composition) => {
      return [
        ...total,
        ...composition.members.map(raidMember =>
          Object.assign(
            {
              compositionId: composition.id,
            },
            raidMember,
          ),
        ),
      ]
    }, [])

    this.setState({
      rosterGroups: roleGroups,
      rosterCharacters,
      compositionCharacters,
      compositionsRaw: data.compositions.compositions,
      compositions,
    })
  }

  onRosterGroupUpdate(rosterCharacterGroups) {
    this._rosterCharacterGroups = rosterCharacterGroups
  }
  onDragEnd(result) {
    // dropped outside the list
    // console.log(result);
    let didChange = false
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

    const sourceCompositionGroup = compositionDropContainers.find(
      group => group.id === sourceId,
    )
    const sourceRosterGroup = rosterGroups.find(role => role.id === sourceId)

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

      this.setState({
        compositions: newCompositions,
        compositionCharacters: newCompositionCharacters,
      })
      didChange = true
    } else if (sourceCompositionGroup && destinationRosterGroup) {
      const { index: sourceIndex } = result.source
      const raidIndex = sourceCompositionGroup.group * GROUP_SIZE + sourceIndex

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

      this.setState({
        compositions: newCompositions,
        compositionCharacters: newCompositionCharacters,
      })
      didChange = true
    } else if (
      destinationCompositionGroup.compositionId !==
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

      const movedCharacter1 = compositionCharacters.find(
        raidMember =>
          raidMember.compositionId === sourceCompositionGroup.compositionId &&
          raidMember.raidIndex === sourceRaidIndex,
      )
      const movedCharacter2 = compositionCharacters.find(
        raidMember =>
          raidMember.compositionId ===
            destinationCompositionGroup.compositionId &&
          raidMember.raidIndex === raidIndex,
      )

      const raidMember1 = Object.assign({}, movedCharacter1, { raidIndex })
      const raidMember2 = Object.assign({}, movedCharacter2, {
        raidIndex: sourceRaidIndex,
      })
      const raidMembers = movedCharacter2
        ? [raidMember1, raidMember2]
        : [raidMember1]

      const newCompositions = compositions.map(composition => {
        if (composition.id === destinationCompositionGroup.compositionId) {
          const members = [
            ...(movedCharacter2
              ? composition.members.filter(
                  member => member.raidIndex !== sourceRaidIndex,
                )
              : composition.members),
            raidMember1,
          ]
          return Object.assign({}, composition, { members })
        } else if (composition.id === sourceCompositionGroup.compositionId) {
          const members = [
            ...composition.members.filter(
              member => member.raidIndex !== sourceRaidIndex,
            ),
            ...(movedCharacter2 ? [raidMember2] : []),
          ]
          return Object.assign({}, composition, { members })
        }
        return composition
      })

      const newCompositionCharacters = [
        ...compositionCharacters.filter(
          raidMember =>
            (raidMember.compositionId !==
              sourceCompositionGroup.compositionId &&
              raidMember.raidIndex !== sourceRaidIndex) ||
            (raidMember.compositionId !==
              destinationCompositionGroup.compositionId &&
              raidMember.raidIndex !== raidIndex),
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

      this.setState({
        compositions: newCompositions,
        compositionCharacters: newCompositionCharacters,
      })
      didChange = true
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

      const raidMember1 = Object.assign({}, movedCharacter1, { raidIndex })
      const raidMember2 = Object.assign({}, movedCharacter2, {
        raidIndex: sourceRaidIndex,
      })
      const raidMembers = movedCharacter2
        ? [raidMember1, raidMember2]
        : [raidMember1]

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

      this.setState({
        compositions: newCompositions,
        compositionCharacters: newCompositionCharacters,
      })
      didChange = true
    }
    if (didChange) {
      const { id } = this.props.match.params
      planService.update(
        id,
        {
          compositions: transformCompositions(this.state.compositions),
        },
        {
          query: { $populate: 'roster' },
        },
      )
    }
  }

  render() {
    const { id } = this.props.match.params
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
            <div>
              <button
                onClick={() =>
                  planService.update(
                    id,
                    {
                      compositions: [
                        ...transformCompositions(this.state.compositions),
                        {},
                      ],
                    },
                    {
                      query: { $populate: 'roster' },
                    },
                  )
                }
              >
                Add
              </button>
              <button
                onClick={() =>
                  planService.update(
                    id,
                    {
                      syncWithGuild: true,
                    },
                    {
                      query: { $populate: 'roster' },
                    },
                  )
                }
              >
                Sync
              </button>
            </div>
            {compositions.map(composition => (
              <div key={composition.id}>
                <RaidComposition
                  groups={composition.groups}
                  characters={composition.members}
                />
                <select
                  value={SIZE_OPTIONS.findIndex(
                    option => option.value === composition.size,
                  )}
                  onChange={e => {
                    const value = SIZE_OPTIONS[e.target.value].value
                    if (value === composition.size) {
                      return
                    }
                    planService.update(
                      id,
                      {
                        compositions: transformCompositions(
                          this.state.compositions.map(
                            c =>
                              c._id === composition._id
                                ? Object.assign({}, c, {
                                    size: value,
                                    members: c.members.filter(
                                      member =>
                                        member.raidIndex < GROUP_SIZE * value,
                                    ),
                                  })
                                : c,
                          ),
                        ),
                      },
                      {
                        query: { $populate: 'roster' },
                      },
                    )
                  }}
                  onBlur={e => {}}
                >
                  {SIZE_OPTIONS.map((option, i) => (
                    <option
                      key={option.value}
                      value={i}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    planService.update(
                      id,
                      {
                        compositions: transformCompositions(
                          this.state.compositions,
                        ).filter(x => x.id !== composition.id),
                      },
                      {
                        query: { $populate: 'roster' },
                      },
                    )
                  }
                >
                  Remove
                </button>
              </div>
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
