import { Instagram, Mail } from 'lucide-react'
import './Footer.css'

const socials = [
  { icon: Instagram, href: 'https://www.instagram.com/incentive.finance/', label: 'Instagram' },
  { icon: Mail, href: 'mailto:incentivefinanceinfo@gmail.com', label: 'Email' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner container">
        <a href="/" className="footer-logo" aria-label="incentive home">
          in<span className="brand-highlight">cent</span>ive
        </a>
        <p className="footer-tagline">
          Making financial literacy accessible, engaging, and fun for everyone.
        </p>
        <div className="footer-socials">
          {socials.map((social) => {
            const SocialIcon = social.icon
            return (
              <a
                key={social.label}
                href={social.href}
                className="footer-social-link"
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SocialIcon size={18} strokeWidth={2.5} />
              </a>
            )
          })}
        </div>
      </div>

      <div className="footer-bottom container">
        <p>&copy; {new Date().getFullYear()} incentive. All rights reserved.</p>
      </div>
    </footer>
  )
}
