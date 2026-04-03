import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import WelcomePage from './pages/WelcomePage'
import UsersPage from './pages/UsersPage'
import GroupsPage from './pages/GroupsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<WelcomePage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
