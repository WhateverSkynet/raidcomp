import React, { Component } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
// import logo from './logo.svg'
import './App.css'
import PlanList from './routes/plan-list'
import Planner from './components/planner'

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
