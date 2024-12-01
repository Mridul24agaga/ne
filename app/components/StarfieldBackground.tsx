'use client'

import React, { useRef, useEffect } from 'react'

export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    class Star {
      x: number
      y: number
      z: number
      size: number
      color: string
      twinkle: number
      twinkleSpeed: number

      constructor(canvas: HTMLCanvasElement) {
        this.x = Math.random() * canvas.width - canvas.width / 2
        this.y = Math.random() * canvas.height - canvas.height / 2
        this.z = Math.random() * canvas.width
        this.size = 0.5 + Math.random() * 2 // Increased size range
        this.color = `rgba(255, 255, 255, ${0.7 + Math.random() * 0.3})` // Increased opacity
        this.twinkle = Math.random() * Math.PI * 2
        this.twinkleSpeed = 0.05 + Math.random() * 0.05
      }

      move(canvas: HTMLCanvasElement) {
        this.z -= 0.3 // Slightly increased speed
        if (this.z <= 0) {
          this.z = canvas.width
          this.x = Math.random() * canvas.width - canvas.width / 2
          this.y = Math.random() * canvas.height - canvas.height / 2
        }
        this.twinkle += this.twinkleSpeed
      }

      draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        const x = this.x / (this.z / canvas.width) + canvas.width / 2
        const y = this.y / (this.z / canvas.width) + canvas.height / 2
        const size = this.size * (canvas.width - this.z) / canvas.width

        const twinkleEffect = Math.sin(this.twinkle) * 0.3 + 0.7
        const adjustedColor = this.color.replace(/[\d.]+\)$/g, `${twinkleEffect})`)

        ctx.beginPath()
        ctx.fillStyle = adjustedColor
        ctx.arc(x, y, size, 0, 2 * Math.PI)
        ctx.fill()

        // Add a subtle glow effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2)
        gradient.addColorStop(0, adjustedColor)
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.beginPath()
        ctx.fillStyle = gradient
        ctx.arc(x, y, size * 2, 0, 2 * Math.PI)
        ctx.fill()
      }
    }

    const setupCanvas = () => {
      const stars: Star[] = []
      const numStars = 400 // Increased number of stars

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      // Create stars
      for (let i = 0; i < numStars; i++) {
        stars.push(new Star(canvas))
      }

      // Animation function
      const animate = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)' // Reduced trail effect for better visibility
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        stars.forEach(star => {
          star.move(canvas)
          star.draw(canvas, ctx)
        })

        animationFrameId = requestAnimationFrame(animate)
      }

      animate()
    }

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      setupCanvas()
    }

    // Initial setup
    setupCanvas()

    // Event listeners
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />
}

