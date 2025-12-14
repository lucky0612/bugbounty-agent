import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Real scan request received')
    const { repoUrl } = await request.json()
    console.log('📍 API: Repository URL:', repoUrl)

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      )
    }

    // Determine target path
    let targetPath: string
    const isDemoRepo = repoUrl.includes('vulnerable-app') || repoUrl.includes('demo')
    
    if (isDemoRepo) {
      // Use local demo repo
      targetPath = path.resolve(process.cwd(), '..', 'demo-repos', 'vulnerable-express')
      console.log('📂 API: Using demo repo:', targetPath)
    } else {
      // Clone the actual GitHub repo
      const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'repo'
      targetPath = path.resolve('/tmp', `scan-${Date.now()}-${repoName}`)
      
      console.log('📥 API: Cloning repo to:', targetPath)
      
      try {
        // Clone the repository
        const { execSync } = require('child_process')
        execSync(`git clone --depth 1 "${repoUrl}" "${targetPath}"`, { 
          stdio: 'inherit',
          timeout: 30000 // 30 second timeout
        })
        console.log('✅ API: Repository cloned successfully')
      } catch (cloneError) {
        console.error('❌ API: Git clone failed:', cloneError)
        return NextResponse.json({
          success: false,
          error: 'Failed to clone repository',
          details: 'Make sure the repository URL is valid and publicly accessible'
        }, { status: 400 })
      }
    }
    
    const scannerPath = path.resolve(process.cwd(), '..', 'scanner', 'security-scanner-simple.js')
    
    console.log('🔍 API: Running scanner at:', scannerPath)
    console.log('🎯 API: Scanning target:', targetPath)
    
    // Try to trigger Kestra workflow (if Kestra is running)
    const kestraHost = process.env.KESTRA_HOST || 'http://localhost:8080';
    let kestraTriggered = false;
    
    try {
      console.log('🔄 API: Attempting to trigger Kestra workflow...');
      const kestraResponse = await fetch(`${kestraHost}/api/v1/executions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namespace: 'security',
          flowId: 'bugbounty-security-scan',
          inputs: {
            repo_url: repoUrl,
            target_path: targetPath,
            scan_depth: 'STANDARD'
          }
        })
      });
      
      if (kestraResponse.ok) {
        const kestraExecution = await kestraResponse.json();
        console.log('✅ API: Kestra workflow triggered:', kestraExecution.id);
        kestraTriggered = true;
      }
    } catch (kestraError) {
      console.log('⚠️  API: Kestra not available (optional - running standalone scanner)');
    }
    
    console.log('🔍 API: Running scanner at:', scannerPath)
    console.log('🎯 API: Scanning target:', targetPath)
    
    // Check if scanner exists
    try {
      await fs.access(scannerPath)
      console.log('✅ API: Scanner found')
    } catch {
      console.error('❌ API: Scanner not found!')
      return NextResponse.json({
        success: false,
        error: 'Scanner not found',
        details: 'Make sure scanner/security-scanner-simple.js exists'
      }, { status: 500 })
    }

    // Run the actual scanner!
    return new Promise((resolve) => {
      console.log('🚀 API: Spawning scanner process...')
      
      const scanProcess = spawn('node', [scannerPath, targetPath])
      let output = ''
      let errorOutput = ''

      scanProcess.stdout?.on('data', (data) => {
        const text = data.toString()
        output += text
        console.log('📤 Scanner:', text.trim())
      })

      scanProcess.stderr?.on('data', (data) => {
        const text = data.toString()
        errorOutput += text
        console.error('⚠️  Scanner error:', text.trim())
      })

      scanProcess.on('close', async (code) => {
        console.log('🏁 API: Scanner process completed with code:', code)
        
        // Cleanup cloned repo if not demo
        if (!isDemoRepo && targetPath.startsWith('/tmp/scan-')) {
          try {
            const { execSync } = require('child_process')
            execSync(`rm -rf "${targetPath}"`)
            console.log('🗑️  API: Cleaned up cloned repo')
          } catch (e) {
            console.warn('⚠️  API: Failed to cleanup:', e)
          }
        }
        
        if (code === 0) {
          try {
            // Wait a moment for file to be written
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Read the scan report
            const reportPath = path.resolve(process.cwd(), '..', 'scanner', 'scan-report.json')
            console.log('📖 API: Reading report from:', reportPath)
            
            // Check if file exists
            try {
              await fs.access(reportPath)
              console.log('✅ API: Report file exists')
            } catch {
              console.error('❌ API: Report file NOT found at:', reportPath)
              // Try alternate path
              const altPath = path.join(__dirname, '..', '..', '..', '..', 'scanner', 'scan-report.json')
              console.log('🔄 API: Trying alternate path:', altPath)
              throw new Error('Report file not found')
            }
            
            const reportData = await fs.readFile(reportPath, 'utf-8')
            console.log('📄 API: Report file read, size:', reportData.length, 'bytes')
            
            const report = JSON.parse(reportData)
            
            console.log('✅ API: Report parsed successfully!')
            console.log(`📊 API: Found ${report.summary?.total_findings || 0} issues`)
            console.log('🔍 API: Findings:', JSON.stringify(report.findings?.slice(0, 2), null, 2))
            
            // Return the real scan results!
            resolve(NextResponse.json({
              success: true,
              scan_id: 'scan-' + Date.now(),
              timestamp: report.timestamp,
              summary: report.summary,
              findings: report.findings,
              exploits: report.exploits,
              ai_analysis: report.ai_analysis,
              terminal_output: report.scan_output || output
            }))
          } catch (error) {
            console.error('❌ API: Failed to read/parse report:', error)
            console.error('❌ API: Error details:', error.message)
            console.error('📤 API: Raw scanner output:', output.substring(0, 500))
            
            // Return scanner output instead
            resolve(NextResponse.json({
              success: true,
              scan_id: 'scan-' + Date.now(),
              timestamp: new Date().toISOString(),
              terminal_output: output,
              message: 'Scanner ran but could not read report file',
              error_details: error.message,
              summary: {
                total_findings: 0,
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
                risk_score: 0
              },
              findings: [],
              exploits: [],
              ai_analysis: {
                overall_risk_score: 0,
                executive_summary: 'Scanner completed but report parsing failed. Check terminal output.',
                decision: {
                  action: 'WARN_AND_CONTINUE',
                  reasoning: 'Unable to parse scan results'
                },
                top_vulnerabilities: [],
                recommended_actions: ['Check scanner logs', 'Verify scanner configuration']
              }
            }))
          }
        } else {
          console.error('❌ API: Scanner failed with code:', code)
          resolve(NextResponse.json({
            success: false,
            error: 'Scanner process failed',
            terminal_output: output + '\n' + errorOutput,
            exit_code: code
          }, { status: 500 }))
        }
      })

      // Timeout after 30 seconds
      setTimeout(() => {
        console.error('⏰ API: Scanner timeout!')
        scanProcess.kill()
        resolve(NextResponse.json({
          success: false,
          error: 'Scanner timeout (30s)',
          terminal_output: output
        }, { status: 500 }))
      }, 30000)
    })

  } catch (error: any) {
    console.error('💥 API: Exception:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'API error', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
