'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PawPrint, Heart, Stethoscope, Shield, ChevronRight, Activity, Calendar, MessageSquare, Menu, X } from 'lucide-react';

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-obsidian-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <PawPrint className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-semibold text-white text-lg">ZOARIA</span>
        </Link>
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/login" className="text-obsidian-300 hover:text-white text-sm transition-colors">Sign In</Link>
          <Link href="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
        </div>
        <button className="sm:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="sm:hidden bg-obsidian-900 border-t border-white/10 px-4 py-4 flex flex-col gap-3">
          <Link href="/login" className="text-obsidian-300 text-sm">Sign In</Link>
          <Link href="/register" className="btn-primary text-sm text-center py-2">Get Started</Link>
        </div>
      )}
    </nav>
  );
}

function FeatureCard({ icon: Icon, title, text, color }: any) {
  return (
    <div className="zoaria-card hover:-translate-y-1 transition-transform duration-200">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-obsidian-900 text-lg mb-2">{title}</h3>
      <p className="text-obsidian-500 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />

      <section className="relative overflow-hidden bg-obsidian-950 min-h-[80vh] flex items-center pt-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sage-500/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm px-4 py-2 rounded-full mb-8 font-medium">
            <PawPrint className="w-4 h-4" /> The complete veterinary ecosystem
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Your pet's health,<br />
            <em className="text-brand-400 not-italic">beautifully organized.</em>
          </h1>
          <p className="text-obsidian-300 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Track health records, consult with verified veterinarians, manage nutrition, and keep your pets thriving — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-2 justify-center">
              Get Started Free <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-4 bg-white/5 text-white border-white/20 hover:bg-white/10">
              Sign In
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
            {[{ label: 'Pet owners', value: '12,000+' }, { label: 'Verified vets', value: '800+' }, { label: 'Consultations', value: '50,000+' }].map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl font-bold text-white">{s.value}</p>
                <p className="text-obsidian-400 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-obsidian-900">Everything your pet needs</h2>
            <p className="text-obsidian-500 mt-4 text-lg max-w-xl mx-auto">From daily feeding logs to emergency vet consultations — ZOARIA has you covered.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Heart} title="Health Tracking" text="Monitor weight, BMI, vaccinations, and medical records for every pet in one beautiful dashboard." color="bg-red-100 text-red-600" />
            <FeatureCard icon={Stethoscope} title="Vet Consultations" text="Connect with verified veterinarians for online consultations, prescriptions, and expert advice." color="bg-brand-100 text-brand-600" />
            <FeatureCard icon={Activity} title="Smart Nutrition" text="Species-specific feeding plans with calorie calculation using veterinary formulas (RER/MER)." color="bg-sage-100 text-sage-600" />
            <FeatureCard icon={Calendar} title="Health Calendar" text="Never miss a vaccination or deworming with intelligent reminders and scheduling." color="bg-purple-100 text-purple-600" />
            <FeatureCard icon={MessageSquare} title="Real-time Chat" text="Chat with your vet instantly. Share photos, medical files, and documents securely." color="bg-blue-100 text-blue-600" />
            <FeatureCard icon={Shield} title="Verified Veterinarians" text="Every veterinarian is manually verified with license checks before joining ZOARIA." color="bg-amber-100 text-amber-600" />
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl font-bold text-obsidian-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-obsidian-500 text-lg mb-12">Start free. Upgrade when you need more.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: 'Basic', price: 'Free', pets: '1 pet', features: ['Deworming reminders', 'Basic hub access'], highlight: false },
              { name: 'Standard', price: '€9.99', pets: '2 pets', features: ['Feeding plans', 'Vaccination reminders', 'Nutrition tracking'], highlight: true },
              { name: 'Premium', price: '€19.99', pets: 'Unlimited pets', features: ['Vet chat', 'GPS tracking', 'Medication tracker', 'Full hub access'], highlight: false },
            ].map((plan) => (
              <div key={plan.name} className={`zoaria-card text-left ${plan.highlight ? 'ring-2 ring-brand-500 relative' : ''}`}>
                {plan.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>}
                <p className="font-semibold text-obsidian-500 text-sm mb-1">{plan.name}</p>
                <p className="font-display text-3xl font-bold text-obsidian-900 mb-1">
                  {plan.price}{plan.price !== 'Free' && <span className="text-sm font-normal text-obsidian-400">/mo</span>}
                </p>
                <p className="text-brand-600 font-medium text-sm mb-4">{plan.pets}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-obsidian-700">
                      <span className="w-5 h-5 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={plan.highlight ? 'btn-primary w-full text-center block text-sm py-2.5' : 'btn-secondary w-full text-center block text-sm py-2.5'}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-obsidian-950 text-obsidian-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <PawPrint className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-semibold text-white">ZOARIA</span>
          </div>
          <p className="text-sm">© 2025 ZOARIA. Veterinary Ecosystem Platform.</p>
        </div>
      </footer>
    </>
  );
}
