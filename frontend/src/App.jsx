import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Home from './components/Home'
import { Toaster } from "sonner";

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
])
function App() {

  return (
    <div>
      <RouterProvider router={appRouter} />
      <Toaster position="bottom-right" />
    </div>
  )
}

export default App