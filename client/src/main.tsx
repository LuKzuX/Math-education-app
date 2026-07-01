import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import PathTopics from './pages/PathTopics.tsx'
import TopicChallenges from './pages/TopicChallenges.tsx'
import ChallengePlay from './pages/ChallengePlay.tsx'
import Signup from './pages/Signup.tsx'
import Signin from './pages/Signin.tsx'
import VerifyEmail from './pages/VerifyEmail.tsx'
import ForgotPassword from './pages/ForgotPassword.tsx'
import ResetPassword from './pages/ResetPassword.tsx'
import Profile from './pages/Profile.tsx'
import Leaderboard from './pages/Leaderboard.tsx'
import Achievements from './pages/Achievements.tsx'
import NotFound from './pages/NotFound.tsx'
import AdminPaths from './pages/admin/AdminPaths.tsx'
import AdminTopics from './pages/admin/AdminTopics.tsx'
import AdminChallenges from './pages/admin/AdminChallenges.tsx'
import AdminAchievements from './pages/admin/AdminAchievements.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Paths -> Topics -> Challenges (GET /paths, /paths/:path_id/topics, /topics/:topic_id/challenges)
      { index: true, element: <Home /> },
      { path: 'paths/:pathId', element: <PathTopics /> },
      { path: 'topics/:topicId', element: <TopicChallenges /> },

      // Challenge (GET /challenges/:challenge_id, POST /challenges/:challenge_id/submit)
      { path: 'challenges/:challengeId', element: <ChallengePlay /> },

      // Auth (POST /signup, /signin, /verify-email, /forgot-password, /reset-password)
      { path: 'signup', element: <Signup /> },
      { path: 'signin', element: <Signin /> },
      { path: 'verify-email', element: <VerifyEmail /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'password-reset', element: <ResetPassword /> },

      // User (GET /user, /user-attempts, PATCH /user/update)
      { path: 'profile', element: <Profile /> },

      // Leaderboard (GET /leaderboard)
      { path: 'leaderboard', element: <Leaderboard /> },

      // Achievements (GET /achievements, /user/achievements)
      { path: 'achievements', element: <Achievements /> },

      // Admin (path/topic/challenge/achievement CRUD gated by isAdmin)
      { path: 'admin/paths', element: <AdminPaths /> },
      { path: 'admin/paths/:pathId/topics', element: <AdminTopics /> },
      { path: 'admin/topics/:topicId/challenges', element: <AdminChallenges /> },
      { path: 'admin/achievements', element: <AdminAchievements /> },

      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
