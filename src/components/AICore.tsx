import React, { useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

interface AICoreProps {
  score: number
}

export const AICore: React.FC<AICoreProps> = ({ score }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Motion values for tilt parallax effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Transform coordinates into subtle 3D tilt angles
  const rotateX = useTransform(mouseY, [-90, 90], [12, -12])
  const rotateY = useTransform(mouseX, [-90, 90], [-12, 12])

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const centerX = rect.left + width / 2
    const centerY = rect.top + height / 2

    // Set relative distance from center
    mouseX.set(event.clientX - centerX)
    mouseY.set(event.clientY - centerY)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseX.set(0)
  }

  // Floating ambient energy particles coordinates/delays
  const particles = [
    { id: 1, x: [-15, 25, -15], y: [-25, -45, -25], size: 3, color: 'bg-primary', delay: 0 },
    { id: 2, x: [20, -15, 20], y: [15, -35, 15], size: 3.5, color: 'bg-secondary', delay: 0.8 },
    { id: 3, x: [-25, 10, -25], y: [10, 30, 10], size: 2, color: 'bg-primary-hover', delay: 1.6 },
    { id: 4, x: [25, -20, 25], y: [-15, 25, -15], size: 3, color: 'bg-secondary', delay: 2.4 },
  ]

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="perspective-[1000px] flex items-center justify-center w-full relative py-6"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          willChange: "transform"
        }}
        className="relative w-56 h-56 flex items-center justify-center"
      >
        {/* Glowing backdrops for holographic lighting */}
        <div className="absolute w-36 h-36 rounded-full bg-primary/10 blur-[35px] pointer-events-none animate-pulse" />
        <div className="absolute w-28 h-28 rounded-full bg-secondary/5 blur-[25px] pointer-events-none animate-pulse delay-75" />

        {/* 3D Tilted Concentric Ring 1: Primary Purple Orbit Ring */}
        <div 
          style={{
            transform: "rotateX(62deg) rotateY(-28deg)",
            transformStyle: "preserve-3d"
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="w-48 h-48 rounded-full border-2 border-transparent border-t-primary border-b-primary/40 filter drop-shadow-[0_0_10px_rgba(179,102,255,0.65)]"
          />
        </div>

        {/* 3D Tilted Concentric Ring 2: Secondary Cyan Orbit Ring */}
        <div 
          style={{
            transform: "rotateX(55deg) rotateY(32deg)",
            transformStyle: "preserve-3d"
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 rounded-full border border-dashed border-secondary/50 filter drop-shadow-[0_0_6px_rgba(0,224,255,0.4)]"
          />
        </div>

        {/* Floating energy particles in 3D space */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            animate={{
              x: p.x,
              y: p.y,
              opacity: [0, 0.8, 0],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut"
            }}
            style={{
              transformStyle: "preserve-3d",
              width: p.size,
              height: p.size,
              transform: "translateZ(10px)"
            }}
            className={`absolute rounded-full pointer-events-none shadow-[0_0_6px_currentColor] text-primary/80 ${p.color}`}
          />
        ))}

        {/* The Central Holographic Card (Displays the Confidence metric) */}
        <motion.div
          style={{
            transform: "translateZ(25px)",
            transformStyle: "preserve-3d"
          }}
          className="w-32 h-32 rounded-2xl bg-[#151221]/95 border border-[#2D243F] flex flex-col items-center justify-center relative shadow-[0_0_30px_rgba(179,102,255,0.2)] hover:border-primary/50 transition-colors duration-300"
        >
          {/* Internal holographic grid layer */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(179,102,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(179,102,255,0.05)_1px,transparent_1px)] bg-[size:8px_8px]" />

          {/* Glowing central orb background */}
          <div 
            style={{
              background: "radial-gradient(circle, rgba(179,102,255,0.2) 0%, rgba(0,224,255,0.08) 60%, rgba(0,0,0,0) 100%)"
            }}
            className="absolute inset-1.5 rounded-xl border border-primary/10 flex flex-col items-center justify-center pointer-events-none"
          >
            <span className="text-4xl font-black font-mono text-foreground leading-none tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.55)]">
              {score}
            </span>
            <span className="text-[7.5px] font-mono text-muted uppercase tracking-widest mt-2.5 font-bold">
              CONFIDENCE
            </span>
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
