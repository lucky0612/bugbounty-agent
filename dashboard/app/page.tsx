'use client'

import { useState } from 'react'
import { LiveScanView } from '@/components/LiveScanView'
import { VulnerabilityList } from '@/components/VulnerabilityList'
import { SecurityMetrics } from '@/components/SecurityMetrics'
import { ExploitViewer } from '@/components/ExploitViewer'
import { AIAgentInsights } from '@/components/AIAgentInsights'

export default function Dashboard() {
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete'>('idle')
  const [scanData, setScanData] = useState<any>(null)
  const [terminalOutput, setTerminalOutput] = useState('')

  const startScan = async (repoUrl: string) => {
    console.log('🎯 Starting scan for:', repoUrl)
    setScanStatus('scanning')
    setTerminalOutput('')
    
    try {
      console.log('📡 Calling API...')
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl })
      })
      
      console.log('📥 API Response received:', response.status)
      const data = await response.json()
      console.log('📊 Data:', data)
      
      if (data.success) {
        console.log('✅ Scan successful! Setting results...')
        setScanData(data)
        setTerminalOutput(data.terminal_output || '')
        setScanStatus('complete')
        console.log('🎉 Status set to complete!')
      } else {
        console.error('❌ Scan failed:', data.error)
        setScanStatus('idle')
        alert('Scan failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('💥 Scan exception:', error)
      setScanStatus('idle')
      alert('Scan failed. Check console for details. Error: ' + error)
    }
  }

  const resetScan = () => {
    setScanStatus('idle')
    setScanData(null)
    setTerminalOutput('')
  }

  return (
    <main className="min-h-screen grid-pattern">
      {/* Data stream overlay */}
      <div className="fixed inset-0 data-stream pointer-events-none" />
      
      {/* Header */}
      <header className="relative border-b border-primary/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-cyan-500 rounded-lg flex items-center justify-center">
                  <svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold terminal-glow">
                  BugBountyAgent
                </h1>
                <p className="text-sm text-gray-400 font-mono">
                  Autonomous Security Research Platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30">
                <div className={`w-2 h-2 rounded-full ${
                  scanStatus === 'scanning' ? 'bg-primary scan-pulse' :
                  scanStatus === 'complete' ? 'bg-green-500' : 'bg-green-500'
                }`} />
                <span className="text-sm font-mono">
                  {scanStatus === 'scanning' ? 'SCANNING' : scanStatus === 'complete' ? 'COMPLETE' : 'ONLINE'}
                </span>
              </div>
              
              <button 
                onClick={resetScan}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-cyan-500 text-black font-semibold hover:opacity-90 transition-opacity"
              >
                New Scan
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {scanStatus === 'idle' ? (
          <ScanInitializer onStartScan={startScan} />
        ) : scanStatus === 'scanning' ? (
          <LiveScanView />
        ) : (
          <ScanResults data={scanData} />
        )}
      </div>
    </main>
  )
}

function ScanInitializer({ onStartScan }: { onStartScan: (url: string) => void }) {
  const [repoUrl, setRepoUrl] = useState('https://github.com/vulnerable-app/demo')
  
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="max-w-2xl w-full stagger-fade-in">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Autonomous Vulnerability Detection
          </h2>
          <p className="text-xl text-gray-400">
            AI-powered security research that finds exploits while you sleep
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-primary/30 rounded-2xl p-8 shadow-2xl shadow-primary/20">
          <label className="block text-sm font-mono text-gray-400 mb-3">
            TARGET REPOSITORY
          </label>
          
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
              className="flex-1 px-4 py-3 bg-black border border-primary/30 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
            />
            
            <button
              onClick={() => onStartScan(repoUrl)}
              className="px-8 py-3 bg-gradient-to-r from-primary to-cyan-500 rounded-lg font-semibold text-black hover:scale-105 transition-transform"
            >
              Launch Scan
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-700">
            {[
              { label: 'SAST Tools', value: '3 engines' },
              { label: 'AI Models', value: 'DeepSeek-R1' },
              { label: 'Detection Rate', value: '99.2%' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500 font-mono">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Quick Start Cards */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { title: 'SQL Injection', icon: '💉', count: 247 },
            { title: 'XSS Vectors', icon: '⚡', count: 189 },
            { title: 'Auth Bypass', icon: '🔓', count: 156 }
          ].map((item, i) => (
            <div key={i} className="stagger-fade-in bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm font-semibold mb-1">{item.title}</div>
              <div className="text-xs text-gray-500 font-mono">{item.count} exploits detected</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScanResults({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400">No scan data available</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Metrics Overview */}
      <div className="stagger-fade-in">
        <SecurityMetrics data={data?.summary} />
      </div>
      
      {/* AI Agent Insights */}
      {data?.ai_analysis && (
        <div className="stagger-fade-in">
          <AIAgentInsights insights={data.ai_analysis} />
        </div>
      )}
      
      {/* Vulnerability List + Exploit Viewer */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 stagger-fade-in">
          <VulnerabilityList vulnerabilities={data?.findings || []} />
        </div>
        
        <div className="stagger-fade-in">
          <ExploitViewer exploits={data?.exploits || []} />
        </div>
      </div>
    </div>
  )
}
