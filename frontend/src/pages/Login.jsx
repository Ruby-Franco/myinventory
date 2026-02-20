import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {

  //const API_URL = "https://stemnetics.pythonanywhere.com";
  //const API_URL = "http://127.0.0.1:5000";
  const API_URL = "myinventory-production.up.railway.app";
  const [instructorName, setInstructorName] = useState('')
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const navigate = useNavigate()

  const handleInstructorLogin = (e) => {
    e.preventDefault()
    
    const trimmedName = instructorName.trim()
    if (trimmedName.length < 2) {
      alert('Please enter a valid name (at least 2 characters)')
      return
    }
    
    if (!/[a-zA-Z]/.test(trimmedName)) {
      alert('Name must contain letters')
      return
    }
    
    localStorage.setItem('userName', trimmedName)
    localStorage.setItem('userRole', 'instructor')
    
    navigate('/instructor')
  }

  const handleAdminLogin = (e) => {
    e.preventDefault()
    
    fetch(`${API_URL}/api/admin-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: adminUsername,
        password: adminPassword
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('userName', data.user.name)
          localStorage.setItem('userRole', data.user.role)
          navigate('/dashboard')
        } else {
          alert('Invalid username or password')
        }
      })
      .catch(err => {
        console.error('Error:', err)
        alert('Login failed')
      })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8">
          Inventory Management
        </h1>
        
        <div className="space-y-6">
          {/* Admin Login */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Admin Access</h2>
            <form onSubmit={handleAdminLogin} className="space-y-2">
              <input
                type="text"
                placeholder="Username"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
              />
              <input
                type="password"
                placeholder="Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
              />
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                Sign in as Admin
              </button>
            </form>
          </div>

          {/* Divider */}
          <div className="border-t"></div>
          
          {/* Instructor Login */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Instructor Access</h2>
            <form onSubmit={handleInstructorLogin}>
              <input
                type="text"
                placeholder="Enter your name"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 mb-2"
              />
              <button 
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                Continue as Instructor
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              View inventory and update quantities
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login