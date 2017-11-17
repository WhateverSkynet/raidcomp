import React, { Component } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import PlanContainer from './routes/PlanContainer'
import Planner from './components/Planner'

import './App.css'

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={PlanContainer} />
          <Route path="/plan/:id" component={Planner} />
        </Switch>
      </BrowserRouter>
    )
  }
}

export default App
