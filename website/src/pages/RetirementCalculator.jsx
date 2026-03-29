import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, PiggyBank } from 'lucide-react'
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

export default function RetirementCalculator() {
  const [age, setAge] = useState('')
  const [retireAge, setRetireAge] = useState('')
  const [savings, setSavings] = useState('')
  const [monthly, setMonthly] = useState('')
  const [rate, setRate] = useState('')

  const currentAge = parseFloat(age) || 0
  const targetAge = parseFloat(retireAge) || 0
  const s = parseFloat(savings) || 0
  const m = parseFloat(monthly) || 0
  const r = (parseFloat(rate) || 0) / 100
  const monthlyRate = r / 12
  const yearsToRetire = targetAge - currentAge

  const { chartData, futureValue, totalContributed, interestEarned } = useMemo(() => {
    const maxYears = Math.min(Math.max(Math.ceil(yearsToRetire), 0), 100)
    const data = []

    for (let y = 0; y <= maxYears; y++) {
      const mo = y * 12
      let val = s
      if (monthlyRate > 0) {
        val = s * Math.pow(1 + monthlyRate, mo) +
          m * ((Math.pow(1 + monthlyRate, mo) - 1) / monthlyRate)
      } else {
        val = s + m * mo
      }
      const contributed = s + m * mo
      data.push({
        age: `${Math.round(currentAge + y)}`,
        contributions: Math.round(contributed),
        growth: Math.round(Math.max(val - contributed, 0)),
        total: Math.round(val),
      })
    }

    const last = data[data.length - 1] || { total: 0, contributions: 0, growth: 0 }
    return {
      chartData: data,
      futureValue: last.total,
      totalContributed: last.contributions,
      interestEarned: last.growth,
    }
  }, [s, m, monthlyRate, yearsToRetire, currentAge])

  const hasInput = yearsToRetire > 0 && (s > 0 || m > 0)

  return (
    <section className="calc-page section">
      <div className="container">
        <Link to="/resources" className="calc-back">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to Resources
        </Link>

        <div className="calc-header">
          <h1>Retirement Calculator</h1>
          <p>Plan ahead and see what it takes to retire on your terms.</p>
        </div>

        <div className="calc-layout">
          <div className="calc-card">
            <div className="calc-field">
              <label className="calc-label" htmlFor="ret-age">Current Age</label>
              <input id="ret-age" className="calc-input" type="number" min="0"
                placeholder="e.g. 25" value={age}
                onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="ret-retire">Retirement Age</label>
              <input id="ret-retire" className="calc-input" type="number" min="0"
                placeholder="e.g. 65" value={retireAge}
                onChange={(e) => setRetireAge(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="ret-savings">Current Savings</label>
              <input id="ret-savings" className="calc-input" type="number" min="0"
                placeholder="e.g. 10000" value={savings}
                onChange={(e) => setSavings(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="ret-monthly">Monthly Contribution</label>
              <input id="ret-monthly" className="calc-input" type="number" min="0"
                placeholder="e.g. 500" value={monthly}
                onChange={(e) => setMonthly(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="ret-rate">Expected Annual Return (%)</label>
              <input id="ret-rate" className="calc-input" type="number" min="0" step="0.1"
                placeholder="e.g. 7" value={rate}
                onChange={(e) => setRate(e.target.value)} />
            </div>
          </div>

          <div className="calc-chart-panel">
            {hasInput ? (
              <>
                <div className="calc-chart-card">
                  <h3>Savings Growth by Age</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="gradRetContrib" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="gradRetGrowth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="age" tick={{ fontSize: 12, fill: '#64748B' }}
                        axisLine={{ stroke: '#E2E8F0' }} tickLine={false}
                        label={{ value: 'Age', position: 'insideBottomRight', offset: -5, fontSize: 12, fill: '#64748B' }} />
                      <YAxis tickFormatter={fmtShort} tick={{ fontSize: 12, fill: '#64748B' }}
                        axisLine={false} tickLine={false} width={60} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '2px solid #1E293B', borderRadius: 16, boxShadow: '4px 4px 0px #1E293B' }}
                        formatter={(val) => fmt(val)}
                        labelFormatter={(label) => `Age ${label}`}
                      />
                      <Area type="monotone" dataKey="contributions" stackId="1"
                        stroke="#3B82F6" strokeWidth={2} fill="url(#gradRetContrib)" name="Contributions" />
                      <Area type="monotone" dataKey="growth" stackId="1"
                        stroke="#F59E0B" strokeWidth={2} fill="url(#gradRetGrowth)" name="Growth" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="calc-chart-legend">
                    <span className="calc-legend-item">
                      <span className="calc-legend-dot" style={{ backgroundColor: '#3B82F6' }} />
                      Contributions
                    </span>
                    <span className="calc-legend-item">
                      <span className="calc-legend-dot" style={{ backgroundColor: '#F59E0B' }} />
                      Growth
                    </span>
                  </div>
                </div>

                <div className="calc-result-grid">
                  <div className="calc-result-item calc-result-item--secondary">
                    <div className="calc-result-value">{fmt(futureValue)}</div>
                    <div className="calc-result-label">At Retirement</div>
                  </div>
                  <div className="calc-result-item">
                    <div className="calc-result-value">{fmt(totalContributed)}</div>
                    <div className="calc-result-label">Total Contributed</div>
                  </div>
                  <div className="calc-result-item calc-result-item--tertiary">
                    <div className="calc-result-value">{fmt(interestEarned)}</div>
                    <div className="calc-result-label">Growth from Returns</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="calc-chart-card">
                <div className="calc-chart-empty">
                  <PiggyBank size={40} strokeWidth={1.5} />
                  <p>Enter values on the left to see your<br />retirement projection appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
