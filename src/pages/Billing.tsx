
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Plus, History, DollarSign } from 'lucide-react';

const Billing = () => {
  const [isAddCreditsOpen, setIsAddCreditsOpen] = useState(false);
  
  // Mock data
  const currentCredits = 250;
  const creditUsage = [
    { date: '2024-01-15', action: 'AI Call', creditsUsed: 5 },
    { date: '2024-01-14', action: 'Candidate Search', creditsUsed: 2 },
    { date: '2024-01-14', action: 'AI Call', creditsUsed: 5 },
    { date: '2024-01-13', action: 'Bulk Processing', creditsUsed: 15 },
    { date: '2024-01-12', action: 'AI Call', creditsUsed: 5 },
  ];

  const paymentHistory = [
    { date: '2024-01-01', amount: '$49.99', method: 'Credit Card', status: 'Completed' },
    { date: '2023-12-01', amount: '$49.99', method: 'Credit Card', status: 'Completed' },
    { date: '2023-11-01', amount: '$49.99', method: 'Credit Card', status: 'Completed' },
  ];

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
                <Card className="p-4 cursor-pointer hover:bg-primary/20 transition-all">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">100</p>
                    <p className="text-sm text-muted-foreground">Credits</p>
                    <p className="text-lg font-semibold">$19.99</p>
                  </div>
                </Card>
                <Card className="p-4 cursor-pointer hover:bg-primary/20 transition-all border-primary">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">500</p>
                    <p className="text-sm text-muted-foreground">Credits</p>
                    <p className="text-lg font-semibold">$79.99</p>
                    <p className="text-xs text-accent">Popular</p>
                  </div>
                </Card>
                <Card className="p-4 cursor-pointer hover:bg-primary/20 transition-all">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">1000</p>
                    <p className="text-sm text-muted-foreground">Credits</p>
                    <p className="text-lg font-semibold">$149.99</p>
                  </div>
                </Card>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Continue to Payment
              </Button>
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
                {creditUsage.map((usage, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
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
                {paymentHistory.map((payment, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
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
