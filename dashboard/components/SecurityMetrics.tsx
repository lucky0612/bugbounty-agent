'use client'

export function SecurityMetrics({ data }: { data: any }) {
  const metrics = [
    {
      label: 'Total Findings',
      value: data?.total_findings || 0,
      change: '+12%',
      icon: '🔍',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Critical',
      value: data?.critical || 0,
      change: '-8%',
      icon: '🚨',
      color: 'from-red-500 to-orange-500',
      severity: 'critical'
    },
    {
      label: 'High',
      value: data?.high || 0,
      change: '+3%',
      icon: '⚠️',
      color: 'from-orange-500 to-yellow-500',
      severity: 'high'
    },
    {
      label: 'Risk Score',
      value: data?.risk_score || 0,
      suffix: '/10',
      icon: '📊',
      color: 'from-purple-500 to-pink-500'
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-6">
      {metrics.map((metric, i) => (
        <div 
          key={i}
          className="relative group"
        >
          {/* Glow effect on hover */}
          <div className="absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 from-primary to-cyan-500 rounded-2xl" />
          
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-primary/20 group-hover:border-primary/50 rounded-xl p-6 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{metric.icon}</div>
              {metric.change && (
                <span className={`text-xs px-2 py-1 rounded-full font-mono ${
                  metric.change.startsWith('+') 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {metric.change}
                </span>
              )}
            </div>
            
            <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
              {metric.value}{metric.suffix || ''}
            </div>
            
            <div className="text-sm text-gray-400 font-mono uppercase tracking-wider">
              {metric.label}
            </div>

            {/* Progress bar for risk score */}
            {metric.label === 'Risk Score' && (
              <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${metric.color} transition-all duration-1000`}
                  style={{ width: `${(metric.value / 10) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
