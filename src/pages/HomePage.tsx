// FILE: src/pages/HomePage.tsx
// PURPOSE: Public landing page with hero, services, FAQ
// API: N/A (static content)

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import PublicHeader from '../components/layout/PublicHeader';

/**
 * PageStructure:
 * - Header (public) with Logo (left), Nav links (center), Auth actions + ThemeToggle (right)
 * - HeroSection with background, H1 tagline, CTAs
 * - ServicesSection with alternating image/text cards
 * - FAQSection with accordion
 * - Footer with multi-column links
 * 
 * APIs: none (static landing content)
 * 
 * Responsive:
 * - Hero: 80vh on desktop, 50-60vh on mobile, tagline centered
 * - Services cards alternate image/text on md+, stack on mobile
 * - Nav collapses to hamburger on sm
 */

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center bg-gradient-to-br from-[var(--brand-50)] to-[var(--surface)]">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--text)] mb-6">
            Manage Your Books <br />
            <span className="text-[var(--brand-500)]">Effortlessly</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--muted)] mb-8 max-w-2xl mx-auto">
            BO Journal helps you track transactions, manage registers, and maintain your financial journal with ease.
          </p>
          {/* TODO-DESIGN: Add hero background image/illustration */}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/signup">
              <Button variant="primary" size="lg">
                Get Started Free
              </Button>
            </Link>
            <Button variant="ghost" size="lg">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="features" className="py-20 bg-[var(--bg)]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--text)] mb-16">
            Features That Work For You
          </h2>
          
          <div className="space-y-16">
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-8 items-center group">
              <div className="transition-transform duration-300 group-hover:scale-105">
                <h3 className="text-2xl font-semibold text-[var(--text)] mb-4">
                  Transaction Management
                </h3>
                <p className="text-[var(--muted)] mb-4">
                  Track all your business transactions in one place. Add receipts, categorize, and filter with ease.
                </p>
                {/* TODO-DESIGN: Add feature image/screenshot */}
              </div>
              <div className="bg-[var(--surface)] rounded-lg p-8 min-h-[300px] flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                <p className="text-[var(--muted)]">[Transaction Screenshot]</p>
              </div>
            </div>

            {/* Feature 2 - Reversed */}
            <div className="grid md:grid-cols-2 gap-8 items-center group">
              <div className="md:order-2 transition-transform duration-300 group-hover:scale-105">
                <h3 className="text-2xl font-semibold text-[var(--text)] mb-4">
                  Journal Entries
                </h3>
                <p className="text-[var(--muted)] mb-4">
                  Auto-generated journal entries with opening and closing balances. Track your financial position daily.
                </p>
                {/* TODO-DESIGN: Add feature image/screenshot */}
              </div>
              <div className="md:order-1 bg-[var(--surface)] rounded-lg p-8 min-h-[300px] flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                <p className="text-[var(--muted)]">[Journal Screenshot]</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid md:grid-cols-2 gap-8 items-center group">
              <div className="transition-transform duration-300 group-hover:scale-105">
                <h3 className="text-2xl font-semibold text-[var(--text)] mb-4">
                  Custom Registers
                </h3>
                <p className="text-[var(--muted)] mb-4">
                  Create custom registers for different categories. Organize your accounting your way.
                </p>
                {/* TODO-DESIGN: Add feature image/screenshot */}
              </div>
              <div className="bg-[var(--surface)] rounded-lg p-8 min-h-[300px] flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                <p className="text-[var(--muted)]">[Register Screenshot]</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-[var(--surface)]">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--text)] mb-12">
            Frequently Asked Questions
          </h2>
          
          {/* TODO: Implement accordion component */}
          <div className="space-y-4">
            {[
              { q: 'How does BO Journal work?', a: 'BO Journal is a double-entry accounting system that automatically maintains your books...' },
              { q: 'Is my data secure?', a: 'Yes, we use industry-standard encryption and secure cloud storage...' },
              { q: 'Can I export my data?', a: 'Yes, you can export your data in various formats...' },
            ].map((faq, i) => (
              <details key={i} className="bg-[var(--bg)] rounded-lg p-6 cursor-pointer">
                <summary className="font-semibold text-[var(--text)] list-none cursor-pointer">
                  {faq.q}
                </summary>
                <p className="text-[var(--muted)] mt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--surface)] border-t border-[var(--border)] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-[var(--text)]">Product</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link to="#features" className="hover:text-[var(--brand-500)] transition-colors">Features</Link></li>
                <li><Link to="#pricing" className="hover:text-[var(--brand-500)] transition-colors">Pricing</Link></li>
                <li><Link to="#faq" className="hover:text-[var(--brand-500)] transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[var(--text)]">Company</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link to="/about" className="hover:text-[var(--brand-500)] transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-[var(--brand-500)] transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[var(--text)]">Legal</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link to="/privacy" className="hover:text-[var(--brand-500)] transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-[var(--brand-500)] transition-colors">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[var(--text)]">Support</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link to="/support" className="hover:text-[var(--brand-500)] transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-[var(--brand-500)] transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--muted)]">
            © 2025 BO Journal Plus. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
