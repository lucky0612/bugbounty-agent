'use client'

import { useEffect, useState } from 'react'

export function LiveScanView() {
  const [scanProgress, setScanProgress] = useState(0)
  const [currentPhase, setCurrentPhase] = useState('Initializing')
  const [logs, setLogs] = useState<string[]>([])

  const phases = [
    { name: 'Initializing', duration: 1000 },
    { name: 'Cloning Repository', duration: 2000 },
    { name: 'Running Semgrep SAST', duration: 3000 },
    { name: 'Running Bandit Security', duration: 2500 },
    { name: 'Cline Autonomous Exploration', duration: 4000 },
    { name: 'AI Vulnerability Analysis', duration: 3500 },
    { name: 'Generating Exploits', duration: 3000 },
    { name: 'Kestra AI Agent Summary', duration: 2000 },
    { name: 'Finalizing Report', duration: 1000 },
  ]

  useEffect(() => {
    let currentIndex = 0
    let totalProgress = 0
    const totalDuration = phases.reduce((sum, p) => sum + p.duration, 0)

    const interval = setInterval(() => {
      if (currentIndex < phases.length) {
        const phase = phases[currentIndex]
        setCurrentPhase(phase.name)
        
        // Add realistic logs
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${phase.name}...`])
        
        totalProgress += phase.duration
        setScanProgress((totalProgress / totalDuration) * 100)
        
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, 2000)

    // Simulate log stream
    const logInterval = setInterval(() => {
      const randomLogs = [
        'Analyzing authentication patterns...',
        'Detected 12 potential SQL injection points',
        'Checking input validation in routes/api.js',
        'Found unvalidated user input on line 47',
        'Cline exploring /models directory',
        'AI: High confidence vulnerability detected',
        'Generating proof-of-concept exploit...',
        'Kestra AI Agent analyzing findings...',
      ]
      setLogs(prev => [...prev.slice(-15), randomLogs[Math.floor(Math.random() * randomLogs.length)]])
    }, 800)

    return () => {
      clearInterval(interval)
      clearInterval(logInterval)
    }
  }, [])

  return (
    <div className="max-w-6xl mx-auto">
      {/* Main Scan Status */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-primary/30 rounded-2xl p-8 mb-6 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/30 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Scan in Progress</h2>
              <p className="text-gray-400 font-mono text-sm">{currentPhase}</p>
            </div>
            
            <div className="text-right">
              <div className="text-4xl font-bold terminal-glow mb-1">
                {Math.round(scanProgress)}%
              </div>
              <div className="text-xs text-gray-500 font-mono">COMPLETION</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden mb-8">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-cyan-500 to-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${scanProgress}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>

          {/* Phase Progress */}
          <div className="grid grid-cols-3 gap-4">
            {phases.slice(0, 9).map((phase, i) => (
              <div 
                key={i}
                className={`p-3 rounded-lg border transition-all duration-300 ${
                  phase.name === currentPhase 
                    ? 'bg-primary/20 border-primary/50 scale-105' 
                    : i < phases.findIndex(p => p.name === currentPhase)
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {i < phases.findIndex(p => p.name === currentPhase) ? (
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : phase.name === currentPhase ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-600 rounded-full" />
                  )}
                  <span className="text-xs font-mono">{phase.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Terminal Output */}
      <div className="bg-black border border-primary/30 rounded-2xl overflow-hidden">
        <div className="bg-gray-900 border-b border-primary/30 px-6 py-3 flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm font-mono text-gray-400 ml-3">Terminal Output</span>
        </div>
        
        <div className="p-6 h-96 overflow-y-auto font-mono text-sm space-y-1">
          {logs.map((log, i) => (
            <div 
              key={i} 
              className="text-green-400 opacity-0 animate-[fade-in_0.3s_ease-out_forwards]"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {log}
            </div>
          ))}
          <div className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1" />
        </div>
      </div>
    </div>
  )
}
