import React from 'react'
import { Route } from 'react-router-dom'
import FlappyBird from '../modules/flappyBird'

export const routeConfig = [
  { path: '/bird', name: 'flappyBird', exact: true, component: FlappyBird }
]

const Routes = routeConfig.map((route, index) => (
  <Route key={index} path={route.path} exact={route.exact} component={route.component} />
))

export default Routes
