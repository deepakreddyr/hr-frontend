import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CreditCard,
  Plus,
  History,
  DollarSign
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

const Billing = () => {
  const [isAddCreditsOpen, setIsAddCreditsOpen] = useState(false);
  const [currentCredits, setCurrentCredits] = useState<number>(0);
  const [creditUsage, setCreditUsage] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/billing-data`, { withCredentials: true })
      .then((res) => {
        const data = res.data;
        setCurrentCredits(data.current_credits || 0);

        setCreditUsage(
          (data.credit_logs || []).map((log: any) => ({
            date: new Date(log.created_at).toLocaleDateString(),
            action: log.action,
            creditsUsed: log.deductions,
          }))
        );

        setPaymentHistory(
          (data.payment_history || []).map((payment: any) => ({
            date: new Date(payment.created_at).toLocaleDateString(),
            amount: `$${(payment.amount / 100).toFixed(2)}`, // assuming cents
            method: payment.payment_method,
            status: payment.status,
          }))
        );
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load billing data.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center text-muted-foreground py-10">Loading billing data...</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Billing & Credits</h1>
        </div>

        <Dialog open={isAddCreditsOpen} onOpenChange={setIsAddCreditsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 glow-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Credits
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card/95 backdrop-blur-sm border-border/50">
            <DialogHeader>
              <DialogTitle>Add Credits</DialogTitle>
              <DialogDescription>Choose a credit package to add to your account</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { credits: 100, price: 1999 },
                  { credits: 500, price: 7999, popular: true },
                  { credits: 1000, price: 14999 }
                ].map((pkg, i) => (
                  <Card key={i} className={`p-4 cursor-pointer transition-all ${pkg.popular ? 'border-primary hover:bg-primary/20' : 'hover:bg-primary/20'}`}>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{pkg.credits}</p>
                      <p className="text-sm text-muted-foreground">Credits</p>
                      <p className="text-lg font-semibold">${(pkg.price / 100).toFixed(2)}</p>
                      {pkg.popular && <p className="text-xs text-accent">Popular</p>}
                    </div>
                  </Card>
                ))}
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">Continue to Payment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Credits Counter */}
      <Card className="bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm border-primary/30 glow-primary">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-4">
            <CreditCard className="w-12 h-12 text-primary" />
            <div className="text-center">
              <p className="text-muted-foreground text-lg">Available Credits</p>
              <p className="text-5xl font-bold text-primary">{currentCredits}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit Usage */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="w-5 h-5" />
              <span>Recent Credit Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creditUsage.map((usage, i) => (
                  <TableRow key={i} className="hover:bg-muted/50">
                    <TableCell>{usage.date}</TableCell>
                    <TableCell>{usage.action}</TableCell>
                    <TableCell className="text-right text-primary font-medium">-{usage.creditsUsed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Payment History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment, i) => (
                  <TableRow key={i} className="hover:bg-muted/50">
                    <TableCell>{payment.date}</TableCell>
                    <TableCell className="font-medium">{payment.amount}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                        {payment.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4">
              <Button variant="outline" className="w-full hover:bg-secondary/50 transition-all">
                Manage Payment Methods
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;
