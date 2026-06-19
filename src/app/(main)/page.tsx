import Link from 'next/link'
import { Car, Shield, Wrench, CheckCircle, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-red-400 font-semibold text-sm uppercase tracking-widest mb-4">
            Spécialiste depuis 1987
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Votre prochain véhicule,<br />
            <span className="text-red-400">acheté ou loué</span>
          </h1>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Plus d'un million de clients nous font confiance. Découvrez notre catalogue de véhicules d'occasion
            de qualité avec achat direct ou location longue durée avec option d'achat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/vehicules?type=achat" className="btn-primary inline-flex items-center gap-2">
              Acheter un véhicule <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/vehicules?type=location" className="btn-secondary bg-transparent text-white border-white hover:bg-white/10 inline-flex items-center gap-2">
              Location LDA <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services inclus */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            Services inclus avec la location
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Assurance tous risques', desc: 'Couverture complète incluse dans votre abonnement' },
              { icon: Car, title: 'Assistance dépannage', desc: 'Disponible 24h/24, 7j/7 où que vous soyez' },
              { icon: Wrench, title: 'Entretien & SAV', desc: 'Maintenance et réparations prises en charge' },
              { icon: CheckCircle, title: 'Contrôle technique', desc: 'Contrôles périodiques inclus et gérés pour vous' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-blue-800" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-blue-800 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-bold mb-4">Prêt à trouver votre véhicule ?</h2>
          <p className="text-blue-200 mb-8">Parcourez notre catalogue et déposez votre dossier 100% en ligne.</p>
          <Link href="/vehicules" className="bg-white text-blue-800 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
            Voir tous les véhicules <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
