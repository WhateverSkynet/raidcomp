import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import Character from './Character'
import './PlanList.css'

class PlanList extends Component {
  render() {
    const { plans } = this.props
    return (
      <ul className="list plan-list">
        {plans.map(plan => (
          <li key={plan.id} className="list-item">
            <Link to={`/plan/${plan.id}`}>{plan.title}</Link>
          </li>
        ))}
      </ul>
    )
  }
}

Character.propTypes = {
  plans: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
    }),
  ),
}

export default PlanList
