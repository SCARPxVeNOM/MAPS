import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface SubscriptionsSectionProps {
  account: string;
  planId: string;
  subId: string;
  onPlanIdChange: (value: string) => void;
  onSubIdChange: (value: string) => void;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
  onExecutePayment: () => void;
}

export function SubscriptionsSection({
  account,
  planId,
  subId,
  onPlanIdChange,
  onSubIdChange,
  onSubscribe,
  onUnsubscribe,
  onExecutePayment
}: SubscriptionsSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2>Manage Subscriptions</h2>
        <p className="text-muted-foreground mt-1">Subscribe, unsubscribe, and process payments</p>
      </div>

      <Card className="bg-white/50 backdrop-blur-xl border-white/40 shadow-xl">
        <CardHeader>
          <CardTitle>Subscribe to Plan</CardTitle>
          <CardDescription>
            Enter a plan ID to create a new subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="plan-id">Plan ID</Label>
            <Input 
              id="plan-id" 
              type="number" 
              placeholder="1"
              value={planId}
              onChange={(e) => onPlanIdChange(e.target.value)}
            />
          </div>
          
          <Button onClick={onSubscribe} disabled={!account}>
            Subscribe Now
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/50 backdrop-blur-xl border-white/40 shadow-xl">
        <CardHeader>
          <CardTitle>Subscription Actions</CardTitle>
          <CardDescription>
            Manage existing subscriptions and execute payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sub-id">Subscription ID</Label>
            <Input 
              id="sub-id" 
              type="number" 
              placeholder="1"
              value={subId}
              onChange={(e) => onSubIdChange(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onUnsubscribe} disabled={!account}>
              Unsubscribe
            </Button>
            <Button variant="secondary" onClick={onExecutePayment} disabled={!account}>
              Execute Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}