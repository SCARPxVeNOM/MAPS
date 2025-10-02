import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface WalletSectionProps {
  account: string;
  connecting: boolean;
  error: string;
  info: string;
  onConnectWallet: () => void;
  onRequestSnap: () => void;
}

export function WalletSection({ 
  account, 
  connecting, 
  error, 
  info, 
  onConnectWallet, 
  onRequestSnap 
}: WalletSectionProps) {
  return (
    <div className="mb-8 pb-8 border-b border-white/20">
      <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2>Wallet Connection</h2>
            <p className="text-muted-foreground mt-1">Connect your Massa wallet to manage payments</p>
            {account && (
              <p className="text-sm font-mono mt-2 text-foreground">
                Connected: <code className="bg-white/60 px-2 py-1 rounded">{account}</code>
              </p>
            )}
          </div>
          <Badge 
            variant={account ? "default" : "outline"} 
            className="bg-white/60 backdrop-blur-sm border-white/40"
          >
            {account ? "Connected" : "Not Connected"}
          </Badge>
        </div>
        
        {!account && (
          <div className="flex gap-3">
            <Button onClick={onConnectWallet} disabled={connecting}>
              {connecting ? "Connecting..." : "Connect Massa Wallet"}
            </Button>
            <Button variant="outline" onClick={onRequestSnap}>
              Enable MetaMask Snap
            </Button>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
        
        {info && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{info}</p>
          </div>
        )}
      </div>
    </div>
  );
}