import { CreditCard, Users, List } from "lucide-react";
import { Button } from "./ui/button";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  contractAddress?: string;
}

export function Sidebar({ activeSection, onSectionChange, contractAddress }: SidebarProps) {
  const navItems = [
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "merchant", label: "Merchant", icon: Users },
    { id: "subscriptions", label: "Subscriptions", icon: List },
  ];

  return (
    <aside className="w-64 border-r border-white/20 bg-white/40 backdrop-blur-xl flex flex-col shadow-lg">
      <div className="h-16 border-b border-white/20 flex items-center px-6">
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-white/20">
        <div className="text-xs text-muted-foreground space-y-1 bg-white/30 p-3 rounded-lg backdrop-blur-sm">
          <p>Contract</p>
          <p className="break-all font-mono">
            {contractAddress ? `${contractAddress.slice(0, 6)}...${contractAddress.slice(-6)}` : 'AS1m...9p14'}
          </p>
        </div>
      </div>
    </aside>
  );
}