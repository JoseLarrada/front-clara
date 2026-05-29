import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import BentoGrid from '../components/BentoGrid'
import EnterpriseCalculator from '../components/EnterpriseCalculator'
import PayrollConsole from '../components/PayrollConsole'
import HelpWidget from '../components/HelpWidget'
import Footer from '../components/Footer'

function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between relative">
      <div>
        <Navbar />
        <main className="mt-8">
          <Hero />
          <BentoGrid />
          <EnterpriseCalculator />
          <PayrollConsole />
        </main>
      </div>
      <HelpWidget />
      <Footer />
    </div>
  )
}

export default Landing
