// WelcomeLogin.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightCircle, X } from 'lucide-react'
import logo from '../../assets/bbLogo.png'

const WelcomeLogin = () => {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div className="relative h-screen w-screen bg-[#fefce8] flex items-center justify-center px-4">
      {!showLogin ? (
        <div className="text-center ">
          {/* Centered logo */}
          <div className="flex justify-center mb-8">
            <img src={logo} alt="Agile CMS Logo" className="w-32 h-auto" />
          </div>

          {/* Animated welcome text + paragraph */}
          <h1 className="text-6xl md:text-7xl font-extrabold text-[#e75024] tracking-wide leading-tight animate-fade-in">
            <span className="text-black">Welcome to</span> Agile CMS
          </h1>
          <p className="mt-4 text-lg text-black opacity-60 animate-fade-in delay-500">
            Agile Headless CMS empowers content teams to deliver rich, flexible,
            and scalable experiences—decoupling content from presentation so you
            can build faster and iterate continuously.
          </p>

          {/* Login button with arrow icon */}
          <button
            onClick={() => setShowLogin(true)}
            className="mt-8 inline-flex items-center space-x-2 bg-[#e75024] text-white px-6 py-3 rounded-full hover:bg-[#b60323] transition animate-fade-in delay-1000"
          >
            <span>Login</span>
            <ArrowRightCircle size={24} />
          </button>
        </div>
      ) : (
        <LoginForm onClose={() => setShowLogin(false)} />
      )}
    </div>
  )
}

const LoginForm = ({ onClose }) => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'content_admin',
  })

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const onSubmit = (e) => {
    e.preventDefault()
    // Assuming authentication is successful:
    // Redirect both roles to /select-db, passing the role in location.state
    navigate('/select-db', { state: { role: form.role } })
  }

  return (
    <div className="relative flex items-center justify-center px-4 w-full">
      {/* Close ("X") button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
      >
        <X size={28} />
      </button>

      <form
        onSubmit={onSubmit}
        className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-[#1f1f1f] text-center">
          Sign In
        </h2>

        <div>
          <label className="block text-gray-700 mb-1" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e75024]"
          >
            <option value="content_admin">Content Admin</option>
            <option value="content_manager">Content Manager</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e75024]"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            required
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e75024]"
          />
          <div className="mt-1 text-right">
            <a
              href="/forgot-password"
              className="text-sm text-[#e75024] hover:underline"
            >
              Forgot password?
            </a>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            className="h-4 w-4 text-[#e75024] focus:ring-[#e75024] border-gray-300 rounded"
          />
          <label htmlFor="remember" className="ml-2 block text-gray-700">
            Remember me
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#e75024] text-white font-semibold rounded-lg hover:bg-[#b60323] transition"
        >
          Log In
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don’t have an account?{' '}
            <a href="/signup" className="text-[#e75024] hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </form>
    </div>
  )
}

export default WelcomeLogin
