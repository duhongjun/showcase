import React from 'react'
import { NavLink } from 'react-router-dom'
import { routeConfig } from '../../router'
import './index.scss'

const Layout: React.FC = props => (
  <div id="app">
    <div className="header">showcase</div>
    <div className="body">
      <div className="nav">
        {routeConfig.map((route, index) => (
          <NavLink key={index} to={route.path} className="nav__item">
            {route.name}
          </NavLink>
        ))}
      </div>
      <div className="content">{props.children}</div>
    </div>
  </div>
)

export default Layout
