#!/usr/bin/env node

/**
 * BugBountyAgent - Autonomous Security Scanner
 * 
 * Integrates:
 * - SAST tools (Semgrep, Bandit, ESLint)
 * - Cline autonomous exploration
 * - Local LLM analysis (Ollama/DeepSeek-R1)
 * - Kestra workflow orchestration
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BugBountyAgent {
  constructor(targetRepo) {
    this.targetRepo = targetRepo;
    this.findings = [];
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.ollamaModel = process.env.OLLAMA_MODEL || 'deepseek-r1:14b';
  }

  /**
   * Step 1: Run Static Analysis Security Testing (SAST) tools
   */
  async runStaticAnalysis() {
    console.log('🔍 Running static analysis...\n');
    
    const tools = [
      {
        name: 'Semgrep',
        command: `semgrep --config=auto --json ${this.targetRepo} 2>/dev/null || echo '{"results":[]}'`,
        parser: this.parseSemgrepOutput.bind(this)
      },
      {
        name: 'Bandit (Python)',
        command: `bandit -r ${this.targetRepo} -f json 2>/dev/null || echo '{"results":[]}'`,
        parser: this.parseBanditOutput.bind(this)
      },
      {
        name: 'ESLint Security',
        command: `eslint ${this.targetRepo} --format json 2>/dev/null || echo '[]'`,
        parser: this.parseESLintOutput.bind(this)
      }
    ];

    const results = [];
    
    for (const tool of tools) {
      try {
        const { stdout } = await execAsync(tool.command);
        const parsed = tool.parser(stdout);
        results.push(...parsed);
        console.log(`✅ ${tool.name}: ${parsed.length} potential issues found`);
      } catch (error) {
        // Some tools exit with code 1 when findings exist
        if (error.stdout) {
          try {
            const parsed = tool.parser(error.stdout);
            results.push(...parsed);
            console.log(`✅ ${tool.name}: ${parsed.length} potential issues found`);
          } catch (parseError) {
            console.log(`⚠️  ${tool.name}: Could not parse results`);
          }
        } else {
          console.log(`⚠️  ${tool.name}: Not available or failed`);
        }
      }
    }

    return results;
  }

  /**
   * Step 2: Cline autonomous exploration (simulated)
   * In production, this would use Cline CLI programmatically
   */
  async autonomousExploration() {
    console.log('\n🤖 Cline: Autonomous codebase exploration...\n');
    
    // Get security-sensitive files
    const files = await this.getSecuritySensitiveFiles();
    console.log(`   Found ${files.length} security-sensitive files`);
    
    // Read file contents for analysis
    const fileContents = {};
    for (const file of files.slice(0, 10)) { // Limit to first 10 for demo
      try {
        const content = await fs.readFile(file, 'utf-8');
        fileContents[file] = content.slice(0, 2000); // First 2000 chars
      } catch (error) {
        // Skip files we can't read
      }
    }

    const explorationPrompt = `You are a senior security researcher conducting a bug bounty assessment.

Analyze this codebase for security vulnerabilities:

Files examined: ${Object.keys(fileContents).join(', ')}

Sample code from key files:
${JSON.stringify(fileContents, null, 2).slice(0, 3000)}

For each vulnerability found, provide:
1. file: exact filename
2. line_number: estimated line number
3. vulnerability_type: category (SQL Injection, XSS, Auth Bypass, etc.)
4. severity: critical/high/medium/low
5. description: clear explanation
6. exploit_path: how to exploit
7. fix: remediation steps

Return ONLY a JSON array of vulnerabilities. No markdown, no explanation.`;

    try {
      const response = await this.callOllama(explorationPrompt);
      const vulnerabilities = JSON.parse(response);
      
      console.log(`   AI identified ${vulnerabilities.length} potential vulnerabilities`);
      return vulnerabilities;
    } catch (error) {
      console.error('   Cline exploration error:', error.message);
      return [];
    }
  }

  /**
   * Step 3: Generate proof-of-concept exploits
   */
  async generateExploits(vulnerabilities) {
    console.log('\n💥 Generating proof-of-concept exploits...\n');
    
    const exploits = [];
    const criticalVulns = vulnerabilities.filter(v => 
      v.severity === 'critical' || v.severity === 'high'
    ).slice(0, 3); // Top 3
    
    for (const vuln of criticalVulns) {
      const exploitPrompt = `Generate a working proof-of-concept exploit for this vulnerability:

File: ${vuln.file}
Type: ${vuln.vulnerability_type}
Description: ${vuln.description}

Provide a JSON response with:
{
  "exploit_code": "curl command or code snippet",
  "expected_result": "what happens when exploit runs",
  "demo_steps": ["step 1", "step 2", "step 3"]
}`;

      try {
        const response = await this.callOllama(exploitPrompt);
        const poc = JSON.parse(response);
        
        exploits.push({
          vulnerability: vuln,
          poc: poc,
          id: `exp-${exploits.length + 1}`
        });
        
        console.log(`   Generated exploit for: ${vuln.vulnerability_type}`);
      } catch (error) {
        console.error(`   Could not generate exploit for ${vuln.vulnerability_type}`);
      }
    }

    return exploits;
  }

  /**
   * Step 4: AI-powered vulnerability prioritization
   */
  async prioritizeFindings(allFindings) {
    console.log('\n🎯 AI: Prioritizing vulnerabilities...\n');
    
    const prioritizationPrompt = `Analyze these security findings and prioritize them:

${JSON.stringify(allFindings.slice(0, 20), null, 2)}

Rank them by:
1. Actual exploitability
2. Business impact
3. Ease of exploitation
4. False positive likelihood

Return a JSON array of the findings, sorted by priority (highest first), with each item having:
{
  ...original_finding_data,
  "priority_score": 1-100,
  "reasoning": "why this ranking",
  "immediate_action": "what to do"
}`;

    try {
      const response = await this.callOllama(prioritizationPrompt);
      const prioritized = JSON.parse(response);
      
      console.log(`   Prioritized ${prioritized.length} findings`);
      return prioritized;
    } catch (error) {
      console.error('   Prioritization error:', error.message);
      return allFindings; // Return unprioritized if fails
    }
  }

  /**
   * Helper: Get security-sensitive files
   */
  async getSecuritySensitiveFiles() {
    try {
      const { stdout } = await execAsync(
        `find ${this.targetRepo} -type f \\( -name "*.js" -o -name "*.py" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \\) 2>/dev/null | head -50`
      );
      return stdout.split('\n').filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  /**
   * Helper: Call Ollama API
   */
  async callOllama(prompt) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        model: this.ollamaModel,
        prompt: prompt,
        stream: false,
        format: 'json'
      });

      const url = new URL('/api/generate', this.ollamaHost);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 11434,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(body);
            resolve(response.response);
          } catch (error) {
            reject(new Error('Failed to parse Ollama response'));
          }
        });
      });

      req.on('error', (error) => reject(error));
      req.write(data);
      req.end();
    });
  }

  /**
   * SAST Output Parsers
   */
  parseSemgrepOutput(output) {
    try {
      const data = JSON.parse(output);
      if (!data.results || !Array.isArray(data.results)) return [];
      
      return data.results.map(r => ({
        id: `semgrep-${r.check_id}`,
        tool: 'Semgrep',
        file: r.path,
        line: r.start?.line || 0,
        severity: r.extra?.severity || 'medium',
        type: r.check_id,
        description: r.extra?.message || 'Security issue detected'
      }));
    } catch {
      return [];
    }
  }

  parseBanditOutput(output) {
    try {
      const data = JSON.parse(output);
      if (!data.results || !Array.isArray(data.results)) return [];
      
      return data.results.map(r => ({
        id: `bandit-${r.test_id}`,
        tool: 'Bandit',
        file: r.filename,
        line: r.line_number,
        severity: (r.issue_severity || 'MEDIUM').toLowerCase(),
        type: r.test_id,
        description: r.issue_text
      }));
    } catch {
      return [];
    }
  }

  parseESLintOutput(output) {
    try {
      const data = JSON.parse(output);
      if (!Array.isArray(data)) return [];
      
      const findings = [];
      data.forEach(file => {
        if (file.messages && Array.isArray(file.messages)) {
          file.messages.forEach(msg => {
            if (msg.ruleId && msg.ruleId.includes('security')) {
              findings.push({
                id: `eslint-${msg.ruleId}`,
                tool: 'ESLint',
                file: file.filePath,
                line: msg.line,
                severity: msg.severity === 2 ? 'high' : 'medium',
                type: msg.ruleId,
                description: msg.message
              });
            }
          });
        }
      });
      return findings;
    } catch {
      return [];
    }
  }

  /**
   * Main scan orchestration
   */
  async scan() {
    console.log('🚀 BugBountyAgent starting scan...\n');
    console.log(`Target: ${this.targetRepo}\n`);
    console.log('='.repeat(50));
    
    try {
      // Phase 1: SAST
      const sastFindings = await this.runStaticAnalysis();
      
      // Phase 2: Cline exploration
      const clineFindings = await this.autonomousExploration();
      
      // Phase 3: Combine and deduplicate
      const allFindings = [...sastFindings, ...clineFindings];
      
      // Phase 4: Prioritize with AI
      const prioritized = await this.prioritizeFindings(allFindings);
      
      // Phase 5: Generate exploits for top issues
      const exploits = await this.generateExploits(prioritized);
      
      // Build final report
      const report = {
        timestamp: new Date().toISOString(),
        target: this.targetRepo,
        summary: {
          total_findings: allFindings.length,
          critical: allFindings.filter(f => f.severity === 'critical').length,
          high: allFindings.filter(f => f.severity === 'high').length,
          medium: allFindings.filter(f => f.severity === 'medium').length,
          low: allFindings.filter(f => f.severity === 'low').length,
          risk_score: this.calculateRiskScore(allFindings)
        },
        findings: prioritized.slice(0, 50), // Top 50
        exploits: exploits,
        tools_used: ['Semgrep', 'Bandit', 'ESLint', 'Cline', 'DeepSeek-R1']
      };

      // Save report
      const reportPath = path.join(process.cwd(), 'scan-report.json');
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

      console.log('\n' + '='.repeat(50));
      console.log('\n✅ Scan complete! Report saved to scan-report.json\n');
      console.log(`📊 Summary:`);
      console.log(`   Total findings: ${report.summary.total_findings}`);
      console.log(`   Critical: ${report.summary.critical}`);
      console.log(`   High: ${report.summary.high}`);
      console.log(`   Risk Score: ${report.summary.risk_score}/10`);
      console.log(`   Exploits generated: ${exploits.length}\n`);
      
      return report;
      
    } catch (error) {
      console.error('\n❌ Scan failed:', error.message);
      throw error;
    }
  }

  calculateRiskScore(findings) {
    let score = 0;
    findings.forEach(f => {
      switch (f.severity) {
        case 'critical': score += 3; break;
        case 'high': score += 2; break;
        case 'medium': score += 1; break;
        case 'low': score += 0.5; break;
      }
    });
    return Math.min(10, (score / 3).toFixed(1));
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}` || 
    fileURLToPath(import.meta.url) === process.argv[1]) {
  const targetRepo = process.argv[2] || './demo-repos/vulnerable-express';
  const agent = new BugBountyAgent(targetRepo);
  
  agent.scan()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default BugBountyAgent;
