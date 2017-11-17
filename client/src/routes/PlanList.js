import React, { Component } from 'react'
import { planService, guildService } from '../feathers'

import PlanList from '../components/PlanList'
import PlanForm from '../components/plan/PlanForm'

class PlanContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      plans: [],
      guilds: [],
    }

    planService
      .find({
        limit: 0,
      })
      .then(data => {
        this.setState({
          plans: data.data,
        })
      })

    guildService
      .find({
        limit: 0,
      })
      .then(data => {
        this.setState({
          guilds: data.data.map(guild => ({
            label: guild.name,
            value: guild.id,
          })),
        })
      })

    planService.on('created', plan => {
      const { plans } = this.state
      this.setState({
        plans: [...plans, plan],
      })
    })
  }

  onCreate() {}

  render() {
    const { plans, guilds } = this.state
    return [
      <PlanList plans={plans} key="list" />,
      <PlanForm
        title="Create New Plan"
        key="form"
        guilds={guilds}
        onSubmit={value => planService.create(value)}
      />,
    ]
  }
}

export default PlanContainer
