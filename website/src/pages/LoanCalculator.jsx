import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Landmark } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
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

export default function LoanCalculator() {
  const [amount, setAmount] = useState('')
  const [rate, setRate] = useState('')
  const [term, setTerm] = useState('')

  const a = parseFloat(amount) || 0
  const annualRate = (parseFloat(rate) || 0) / 100
  const r = annualRate / 12
  const termYears = parseFloat(term) || 0
  const n = termYears * 12

  const { chartData, monthlyPayment, totalPaid, totalInterest } = useMemo(() => {
    if (a <= 0 || n <= 0) return { chartData: [], monthlyPayment: 0, totalPaid: 0, totalInterest: 0 }

    let mp = 0
    if (r > 0) {
      mp = a * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    } else {
      mp = a / n
    }

    const data = []
    let balance = a
    const years = Math.ceil(termYears)

    for (let y = 1; y <= years; y++) {
      let yearPrincipal = 0
      let yearInterest = 0
      const monthsInYear = y === years ? n - (years - 1) * 12 : 12

      for (let mo = 0; mo < monthsInYear; mo++) {
        if (balance <= 0) break
        const intPayment = balance * r
        const prinPayment = Math.min(mp - intPayment, balance)
        yearInterest += intPayment
        yearPrincipal += prinPayment
        balance -= prinPayment
      }

      data.push({
        year: `Yr ${y}`,
        principal: Math.round(yearPrincipal),
        interest: Math.round(yearInterest),
      })
    }

    return {
      chartData: data,
      monthlyPayment: mp,
      totalPaid: mp * n,
      totalInterest: mp * n - a,
    }
  }, [a, r, n, termYears])

  const hasInput = a > 0 && n > 0

  return (
    <section className="calc-page section">
      <div className="container">
        <Link to="/resources" className="calc-back">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to Resources
        </Link>

        <div className="calc-header">
          <h1>Loan Calculator</h1>
          <p>Estimate monthly payments, total interest, and payoff timelines.</p>
        </div>

        <div className="calc-layout">
          <div className="calc-card">
            <div className="calc-field">
              <label className="calc-label" htmlFor="loan-amount">Loan Amount</label>
              <input id="loan-amount" className="calc-input" type="number" min="0"
                placeholder="e.g. 25000" value={amount}
                onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="loan-rate">Annual Interest Rate (%)</label>
              <input id="loan-rate" className="calc-input" type="number" min="0" step="0.1"
                placeholder="e.g. 5.5" value={rate}
                onChange={(e) => setRate(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="loan-term">Loan Term (years)</label>
              <input id="loan-term" className="calc-input" type="number" min="0"
                placeholder="e.g. 5" value={term}
                onChange={(e) => setTerm(e.target.value)} />
            </div>
          </div>

          <div className="calc-chart-panel">
            {hasInput ? (
              <>
                <div className="calc-chart-card">
                  <h3>Payment Breakdown by Year</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748B' }}
                        axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                      <YAxis tickFormatter={fmtShort} tick={{ fontSize: 12, fill: '#64748B' }}
                        axisLine={false} tickLine={false} width={60} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '2px solid #1E293B', borderRadius: 16, boxShadow: '4px 4px 0px #1E293B' }}
                        formatter={(val) => fmt(val)}
                      />
                      <Bar dataKey="principal" stackId="1" fill="#0D9488" radius={[0, 0, 0, 0]} name="Principal" />
                      <Bar dataKey="interest" stackId="1" fill="#FF6F61" radius={[4, 4, 0, 0]} name="Interest" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="calc-chart-legend">
                    <span className="calc-legend-item">
                      <span className="calc-legend-dot" style={{ backgroundColor: '#0D9488' }} />
                      Principal
                    </span>
                    <span className="calc-legend-item">
                      <span className="calc-legend-dot" style={{ backgroundColor: '#FF6F61' }} />
                      Interest
                    </span>
                  </div>
                </div>

                <div className="calc-result-grid">
                  <div className="calc-result-item calc-result-item--secondary">
                    <div className="calc-result-value">{fmt(monthlyPayment)}</div>
                    <div className="calc-result-label">Monthly Payment</div>
                  </div>
                  <div className="calc-result-item">
                    <div className="calc-result-value">{fmt(totalPaid)}</div>
                    <div className="calc-result-label">Total Paid</div>
                  </div>
                  <div className="calc-result-item calc-result-item--accent">
                    <div className="calc-result-value">{fmt(totalInterest)}</div>
                    <div className="calc-result-label">Total Interest</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="calc-chart-card">
                <div className="calc-chart-empty">
                  <Landmark size={40} strokeWidth={1.5} />
                  <p>Enter values on the left to see your<br />payment breakdown appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
