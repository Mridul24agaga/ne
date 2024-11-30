'use client'

import { useState, FormEvent, useEffect } from 'react'
import Image from 'next/image'
import { StarfieldBackground } from './StarfieldBackground'
import { X } from 'lucide-react'

export function NewsletterSignup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [showPopup, setShowPopup] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Please check your email to confirm your subscription.')
        setName('')
        setEmail('')
        setShowPopup(true)
      } else {
        setStatus('error')
        setMessage(data.message)
        setShowPopup(true)
      }
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'An error occurred')
      setShowPopup(true)
    }
  }

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showPopup])

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center overflow-hidden">
      <StarfieldBackground />
      
      <div className="w-full max-w-[1200px] h-screen flex flex-col items-center justify-center px-4 relative z-10">
        {/* Profile Image */}
        <div className="mb-8 relative group">
          <div className="w-24 h-24 rounded-full border-4 border-white/80 overflow-hidden relative z-10 transition-transform duration-300 group-hover:scale-110">
            <Image
              src="/mridul.jpg"
              alt="Profile picture"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Glow effect behind profile image */}
          <div 
            className="absolute inset-0 rounded-full transition-opacity duration-300 opacity-75 group-hover:opacity-100"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)',
              filter: 'blur(10px)',
              transform: 'scale(1.5)',
              zIndex: 1
            }}
          />
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white text-center mb-4 sm:mb-6 leading-tight relative z-10">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white">
            Grow Your Agency or SaaS
            <br className="hidden sm:inline" />
            with Organic Tactics
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-gray-200 text-center mb-8 sm:mb-12 max-w-2xl mx-auto px-4 relative z-10 leading-relaxed">
          A newsletter for anyone looking to master the art of client acquisition, outreach scripts, and audience growth for your agency or SaaS. Learn actionable tips and strategies to scale through LinkedIn, Reddit, and more!
        </p>

        {/* Form Card */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-[24px] p-8 shadow-2xl mb-8 relative z-10 transition-transform duration-300 hover:scale-105">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              required
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg transition-all duration-300"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg transition-all duration-300"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg flex items-center justify-between hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-lg font-medium group"
            >
              <span>{status === 'loading' ? 'Subscribing...' : 'Subscribe'}</span>
              <span className="text-xl transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
          </form>
        </div>

        {/* Signature */}
        <div className="relative z-10 mt-8">
          <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full">
            <div className="text-white text-lg font-medium relative overflow-hidden">
              <div className="relative z-10">Mridul Thareja</div>
              <div 
                className="absolute inset-0"
                style={{
                  transform: 'perspective(500px) rotateX(45deg)',
                  transformOrigin: 'center bottom',
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup for subscription messages */}
      {showPopup && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center ${
          status === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <span>{message}</span>
          <button 
            onClick={() => setShowPopup(false)}
            className="ml-4 text-white hover:text-gray-200 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

