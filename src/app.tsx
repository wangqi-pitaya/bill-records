import { Component } from 'react'
import { Link, RouterProvider, createMemoryHistory } from '@tarojs/router'
import './app.scss'

const history = createMemoryHistory()

class App extends Component {
  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return (
      <RouterProvider history={history}>
        <Link to="/" />
      </RouterProvider>
    )
  }
}

export default App
