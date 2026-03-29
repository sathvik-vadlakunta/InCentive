import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import './Calculator.css'

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function fmtShort(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export default function CompoundInterest() {
  const [principal, setPrincipal] = useState('')
  const [monthly, setMonthly] = useState('')
  const [rate, setRate] = useState('')
  const [years, setYears] = useState('')

  const p = parseFloat(principal) || 0
  const m = parseFloat(monthly) || 0
  const r = (parseFloat(rate) || 0) / 100
  const t = parseFloat(years) || 0

  const monthlyRate = r / 12

  const { chartData, future, totalContributed, interestEarned } = useMemo(() => {
    const data = []
    const maxYears = Math.min(Math.max(Math.ceil(t), 0), 100)

    for (let y = 0; y <= maxYears; y++) {
      const mo = y * 12
      let val = p
      if (monthlyRate > 0) {
        val = p * Math.pow(1 + monthlyRate, mo) +
          m * ((Math.pow(1 + monthlyRate, mo) - 1) / monthlyRate)
      } else {
        val = p + m * mo
      }
      const contributed = p + m * mo
      data.push({
        year: `Yr ${y}`,
        contributions: Math.round(contributed),
        interest: Math.round(Math.max(val - contributed, 0)),
        total: Math.round(val),
      })
    }

    const last = data[data.length - 1] || { total: 0, contributions: 0, interest: 0 }
    return {
      chartData: data,
      future: last.total,
      totalContributed: last.contributions,
      interestEarned: last.interest,
    }
  }, [p, m, monthlyRate, t])

  const hasInput = (p > 0 || m > 0) && t > 0

  return (
    <section className="calc-page section">
      <div className="container">
        <Link to="/resources" className="calc-back">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to Resources
        </Link>

        <div className="calc-header">
          <h1>Compound Interest Calculator</h1>
          <p>See how your money grows over time with the power of compounding.</p>
        </div>

        <div className="calc-layout">
          <div className="calc-card">
            <div className="calc-field">
              <label className="calc-label" htmlFor="ci-principal">Initial Investment</label>
              <input id="ci-principal" className="calc-input" type="number" min="0"
                placeholder="e.g. 1000" value={principal}
                onChange={(e) => setPrincipal(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="ci-monthly">Monthly Contribution</label>
              <input id="ci-monthly" className="calc-input" type="number" min="0"
                placeholder="e.g. 200" value={monthly}
                onChange={(e) => setMonthly(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="ci-rate">Annual Interest Rate (%)</label>
              <input id="ci-rate" className="calc-input" type="number" min="0" step="0.1"
                placeholder="e.g. 7" value={rate}
                onChange={(e) => setRate(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="ci-years">Time Period (years)</label>
              <input id="ci-years" className="calc-input" type="number" min="0"
                placeholder="e.g. 10" value={years}
                onChange={(e) => setYears(e.target.value)} />
            </div>
          </div>

          <div className="calc-chart-panel">
            {hasInput ? (
              <>
                <div className="calc-chart-card">
                  <h3>Growth Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="gradContrib" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="gradInterest" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0D9488" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#0D9488" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748B' }}
                        axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                      <YAxis tickFormatter={fmtShort} tick={{ fontSize: 12, fill: '#64748B' }}
                        axisLine={false} tickLine={false} width={60} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '2px solid #1E293B', borderRadius: 16, boxShadow: '4px 4px 0px #1E293B' }}
                        formatter={(val) => fmt(val)}
                      />
                      <Area type="monotone" dataKey="contributions" stackId="1"
                        stroke="#3B82F6" strokeWidth={2} fill="url(#gradContrib)" name="Contributions" />
                      <Area type="monotone" dataKey="interest" stackId="1"
                        stroke="#0D9488" strokeWidth={2} fill="url(#gradInterest)" name="Interest" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="calc-chart-legend">
                    <span className="calc-legend-item">
                      <span className="calc-legend-dot" style={{ backgroundColor: '#3B82F6' }} />
                      Contributions
                    </span>
                    <span className="calc-legend-item">
                      <span className="calc-legend-dot" style={{ backgroundColor: '#0D9488' }} />
                      Interest
                    </span>
                  </div>
                </div>

                <div className="calc-result-grid">
                  <div className="calc-result-item calc-result-item--secondary">
                    <div className="calc-result-value">{fmt(future)}</div>
                    <div className="calc-result-label">Future Value</div>
                  </div>
                  <div className="calc-result-item">
                    <div className="calc-result-value">{fmt(totalContributed)}</div>
                    <div className="calc-result-label">Total Contributed</div>
                  </div>
                  <div className="calc-result-item calc-result-item--accent">
                    <div className="calc-result-value">{fmt(interestEarned)}</div>
                    <div className="calc-result-label">Interest Earned</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="calc-chart-card">
                <div className="calc-chart-empty">
                  <TrendingUp size={40} strokeWidth={1.5} />
                  <p>Enter values on the left to see your<br />growth chart appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
