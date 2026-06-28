import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ArrowRight } from 'lucide-react'
import Button from './Button'
import './Navbar.css'

const links = [
  { label: 'About', href: '/about' },
  { label: 'Resources', href: '/resources' },
  { label: 'Presentations', href: '/presentations' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="navbar">
      <nav className="navbar-inner container">
        <Link to="/" className="navbar-brand" aria-label="incentive home">
          in<span className="brand-highlight">cent</span>ive
        </Link>

        <ul className={`navbar-links ${open ? 'navbar-links--open' : ''}`}>
          {links.map(({ label, href }) => (
            <li key={href}>
              {href.startsWith('/') && !href.includes('#') ? (
                <Link to={href} onClick={() => setOpen(false)}>{label}</Link>
              ) : (
                <a href={href} onClick={() => setOpen(false)}>{label}</a>
              )}
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <Button variant="primary" icon={ArrowRight} href="/#cta">
            Get Started
          </Button>
        </div>

        <button
          className="navbar-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
        </button>
      </nav>

      {open && (
        <div className="navbar-mobile">
          <ul>
            {links.map(({ label, href }) => (
              <li key={href}>
                {href.startsWith('/') && !href.includes('#') ? (
                  <Link to={href} onClick={() => setOpen(false)}>{label}</Link>
                ) : (
                  <a href={href} onClick={() => setOpen(false)}>{label}</a>
                )}
              </li>
            ))}
          </ul>
          <Button variant="primary" icon={ArrowRight} href="/#cta" onClick={() => setOpen(false)}>
            Get Started
          </Button>
        </div>
      )}
    </header>
  )
}
