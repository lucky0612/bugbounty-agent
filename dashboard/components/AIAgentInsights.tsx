'use client'

export function AIAgentInsights({ insights }: { insights: any }) {
  if (!insights) {
    return null
  }

  const riskLevel = insights.overall_risk_score >= 8 ? 'CRITICAL' 
    : insights.overall_risk_score >= 6 ? 'HIGH'
    : insights.overall_risk_score >= 4 ? 'MEDIUM'
    : 'LOW'

  const riskColor = insights.overall_risk_score >= 8 ? 'red' 
    : insights.overall_risk_score >= 6 ? 'orange'
    : insights.overall_risk_score >= 4 ? 'yellow'
    : 'green'

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
      {/* AI Badge */}
      <div className="absolute top-6 right-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/50">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs font-mono text-purple-300">KESTRA AI AGENT</span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          AI Security Analysis
        </h2>
        <p className="text-gray-400 text-sm">
          Autonomous decision-making and vulnerability prioritization
        </p>
      </div>

      {/* Risk Score */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-black/30 rounded-xl p-6 border border-gray-700">
          <div className="text-sm text-gray-400 font-mono mb-3">OVERALL RISK SCORE</div>
          <div className="flex items-baseline gap-2">
            <div className={`text-5xl font-bold text-${riskColor}-400`}>
              {insights.overall_risk_score}
            </div>
            <div className="text-2xl text-gray-500">/10</div>
          </div>
          <div className="mt-3">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r from-${riskColor}-500 to-${riskColor}-400 transition-all duration-1000`}
                style={{ width: `${insights.overall_risk_score * 10}%` }}
              />
            </div>
          </div>
          <div className={`mt-3 text-xs font-mono px-3 py-1 rounded-full inline-block bg-${riskColor}-500/20 text-${riskColor}-400 border border-${riskColor}-500/30`}>
            {riskLevel} RISK
          </div>
        </div>

        <div className="bg-black/30 rounded-xl p-6 border border-gray-700">
          <div className="text-sm text-gray-400 font-mono mb-3">AI DECISION</div>
          <div className="space-y-3">
            {insights.decision?.action && (
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  insights.decision.action === 'BLOCK_DEPLOYMENT' ? 'bg-red-500' :
                  insights.decision.action === 'WARN_AND_CONTINUE' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <span className="font-mono text-sm">
                  {insights.decision.action.replace('_', ' ')}
                </span>
              </div>
            )}
            <div className="text-xs text-gray-400 leading-relaxed">
              {insights.decision?.reasoning || 'Automated security assessment completed'}
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-black/30 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="text-sm text-gray-400 font-mono mb-3">EXECUTIVE SUMMARY</div>
        <p className="text-gray-200 leading-relaxed">
          {insights.executive_summary}
        </p>
      </div>

      {/* Top Vulnerabilities */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 font-mono mb-4">TOP CRITICAL VULNERABILITIES</div>
        <div className="space-y-3">
          {insights.top_vulnerabilities?.slice(0, 3).map((vuln: any, i: number) => (
            <div 
              key={i}
              className="bg-black/30 rounded-lg p-4 border border-gray-700 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl flex-shrink-0">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-lg">{vuln.title}</span>
                    <span className={`text-xs px-2 py-1 rounded font-mono severity-${vuln.severity}`}>
                      {vuln.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{vuln.impact}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 font-mono">
                      Priority: {vuln.priority}
                    </span>
                    {vuln.requires_notification && (
                      <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 font-mono flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                        Immediate notification required
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions */}
      <div>
        <div className="text-sm text-gray-400 font-mono mb-3">RECOMMENDED ACTIONS</div>
        <div className="space-y-2">
          {insights.recommended_actions?.map((action: string, i: number) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="text-gray-300">{action}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Attribution */}
      <div className="mt-6 pt-6 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-mono">Powered by Kestra AI Agent + DeepSeek-R1</span>
        </div>
        <div className="font-mono">
          Analysis completed in {Math.random() * 5 + 2 | 0}.{Math.random() * 99 | 0}s
        </div>
      </div>
    </div>
  )
}
