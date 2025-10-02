import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function PaymentsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2>Payment Methods</h2>
        <p className="text-muted-foreground mt-1">Choose your payment model and manage deposits</p>
      </div>

      <Tabs defaultValue="escrow" className="w-full">
        <TabsList className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-sm">
          <TabsTrigger value="escrow" className="data-[state=active]:bg-white/80 data-[state=active]:shadow-sm">
            Escrow Deposit
          </TabsTrigger>
          <TabsTrigger value="pull" className="data-[state=active]:bg-white/80 data-[state=active]:shadow-sm">
            Pull Payment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="escrow" className="mt-6">
          <Card className="bg-white/50 backdrop-blur-xl border-white/40 shadow-xl">
            <CardHeader>
              <CardTitle>Escrow Deposits</CardTitle>
              <CardDescription>
                Deposit funds into escrow that can be automatically charged for subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Deposit Amount</Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      id="deposit-amount" 
                      type="number" 
                      placeholder="0.00"
                    />
                    <span className="text-muted-foreground px-3 whitespace-nowrap">USDC</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Withdraw Amount</Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      id="withdraw-amount" 
                      type="number" 
                      placeholder="0.00"
                    />
                    <span className="text-muted-foreground px-3 whitespace-nowrap">USDC</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button>
                  Deposit Funds
                </Button>
                <Button variant="outline">
                  Withdraw Funds
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pull" className="mt-6">
          <Card className="bg-white/50 backdrop-blur-xl border-white/40 shadow-xl">
            <CardHeader>
              <CardTitle>Pull Payment Authorization</CardTitle>
              <CardDescription>
                Authorize automatic payments by setting an allowance amount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="allowance">Allowance Amount</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    id="allowance" 
                    type="number" 
                    placeholder="0.00"
                  />
                  <span className="text-muted-foreground px-3 whitespace-nowrap">USDC</span>
                </div>
              </div>
              
              <Button>
                Approve Allowance
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}