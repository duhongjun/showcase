import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import Layout from '../components/layout'
import RouterConfig from '../router'

const App: React.FC = () => {
  return (
    <Router basename="/showcase">
      <Layout>
        {RouterConfig}
      </Layout>
    </Router>
  )
}

export default App
