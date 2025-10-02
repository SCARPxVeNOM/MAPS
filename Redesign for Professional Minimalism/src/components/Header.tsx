import { Bell, Settings } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="h-20 border-b border-white/20 bg-white/40 backdrop-blur-xl flex items-center justify-between px-8 shadow-sm relative">
      {/* Left spacer to balance the layout */}
      <div className="flex items-center gap-2 w-24">
      </div>
      
      {/* Centered title */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
       
        <p className="text-xl text-gray-600 text-center font-medium tracking-wider">
          Massa Automated Payments System
        </p>
      </div>
      
      {/* Right side buttons */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}