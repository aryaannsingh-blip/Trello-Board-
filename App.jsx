import { useState } from 'react'
import './App.css'
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
import BoardView from './components/BoardView.jsx'

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem('trello_token') || '',
  )
  const [username, setUsername] = useState(
    () => localStorage.getItem('trello_username') || '',
  )
  const [boardSession, setBoardSession] = useState(null)

  function handleLogin(newToken, newUsername) {
    localStorage.setItem('trello_token', newToken)
    localStorage.setItem('trello_username', newUsername)
    setToken(newToken)
    setUsername(newUsername)
  }

  function handleSignOut() {
    localStorage.removeItem('trello_token')
    localStorage.removeItem('trello_username')
    setToken('')
    setBoardSession(null)
  }

  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  if (boardSession) {
    return (
      <BoardView
        board={boardSession.board}
        members={boardSession.members}
        organization={boardSession.organization}
        onBack={() => setBoardSession(null)}
      />
    )
  }

  return (
    <Dashboard
      username={username}
      onOpenBoard={(board, ctx) => setBoardSession({ board, ...ctx })}
      onSignOut={handleSignOut}
    />
  )
}

export default App