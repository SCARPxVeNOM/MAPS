import { useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { WalletSection } from "./components/WalletSection";
import { PaymentsSection } from "./components/PaymentsSection";
import { MerchantSection } from "./components/MerchantSection";
import { SubscriptionsSection } from "./components/SubscriptionsSection";

export default function App() {
  const [activeSection, setActiveSection] = useState<string>("payments");

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="flex-1 flex flex-col relative">
        <Header />
        
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-8 py-8">
            <WalletSection />
            
            {activeSection === "payments" && <PaymentsSection />}
            {activeSection === "merchant" && <MerchantSection />}
            {activeSection === "subscriptions" && <SubscriptionsSection />}
          </div>
        </main>
      </div>
    </div>
  );
}