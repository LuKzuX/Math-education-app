import { Outlet } from 'react-router-dom'
import '../src/App.css'

function App() {
  return (
    <div>
      <nav>
        {/* <Link to="/">Home</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        <Link to="/achievements">Achievements</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/signin">Sign in</Link>
        <Link to="/signup">Sign up</Link> */}
      </nav>
      <Outlet />
    </div>
  )
}

export default App
