// pages/index.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from 'lib/supabase' // ✅ correct import

const Home = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (type, username, password) => {
    if (!username || !password) return alert('Enter email & password')
    try {
      const { error, data: { user } = {} } =
        type === 'LOGIN'
          ? await supabase.auth.signInWithPassword({ email: username, password })
          : await supabase.auth.signUp({ email: username, password })

      if (error) {
        alert('Error with auth: ' + error.message)
      } else if (!user && type === 'SIGNUP') {
        alert('Signup successful! Check your email to confirm.')
      } else {
        // On successful login, redirect
        router.push('/channels/1')
      }
    } catch (err) {
      console.log('error', err)
      alert(err.error_description || err.message || err)
    }
  }

  return (
    <div className="w-full h-full flex justify-center items-center p-4 bg-gray-300">
      <div className="w-full sm:w-1/2 xl:w-1/3">
        <div className="border-teal p-8 border-t-12 bg-white mb-6 rounded-lg shadow-lg">
          <div className="mb-4">
            <label className="font-bold text-grey-darker block mb-2">Email</label>
            <input
              type="text"
              className="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow"
              placeholder="Your email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="font-bold text-grey-darker block mb-2">Password</label>
            <input
              type="password"
              className="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleLogin('SIGNUP', username, password)}
              className="bg-indigo-700 hover:bg-indigo-600 text-white py-2 px-4 rounded text-center transition duration-150"
            >
              Sign up
            </button>
            <button
              onClick={() => handleLogin('LOGIN', username, password)}
              className="border border-indigo-700 text-indigo-700 py-2 px-4 rounded w-full text-center transition duration-150 hover:bg-indigo-700 hover:text-white"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
