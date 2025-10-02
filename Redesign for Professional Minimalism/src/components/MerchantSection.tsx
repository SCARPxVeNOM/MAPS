import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function MerchantSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2>Merchant Dashboard</h2>
        <p className="text-muted-foreground mt-1">Create and manage subscription plans</p>
      </div>

      <Card className="bg-white/50 backdrop-blur-xl border-white/40 shadow-xl">
        <CardHeader>
          <CardTitle>Create Subscription Plan</CardTitle>
          <CardDescription>
            Define a new subscription plan for your customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="merchant-address">Merchant Address</Label>
            <Input 
              id="merchant-address" 
              placeholder="AS1234..." 
              className="font-mono"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="token-address">Token Contract Address</Label>
            <Input 
              id="token-address" 
              placeholder="AS5678..." 
              className="font-mono"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plan-amount">Subscription Amount</Label>
            <div className="flex gap-2 items-center">
              <Input 
                id="plan-amount" 
                type="number" 
                placeholder="0.00"
              />
              <span className="text-muted-foreground px-3 whitespace-nowrap">USDC</span>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-white/20">
            <Button>
              Create Plan
            </Button>
            <Button variant="outline">
              Create On-Chain
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}