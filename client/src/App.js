import React, { Component } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import PlanList from './routes/PlanList'
import Planner from './components/Planner'

import './App.css'

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={PlanList} />
          <Route path="/plan/:id" component={Planner} />
        </Switch>
      </BrowserRouter>
    )
  }
}

export default App
