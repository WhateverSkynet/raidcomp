import React, { Component } from 'react'
import { planService } from '../feathers'
import PlanList from '../components/plan-list'

class PlanContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      plans: [],
    }

    planService.find().then(data => {
      this.setState({
        plans: data.data,
      })
    })
  }
  render() {
    const { plans } = this.state
    return <PlanList plans={plans} />
  }
}

export default PlanContainer
