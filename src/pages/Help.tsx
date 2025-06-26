
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, MessageCircle, Mail, FileText, Shield, Send } from 'lucide-react';

const Help = () => {
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Support form submitted:', supportForm);
    setSupportForm({ subject: '', message: '' });
  };

  const faqs = [
    {
      question: "How do AI calls work?",
      answer: "Our AI system initiates phone calls to candidates using advanced natural language processing. The AI conducts structured interviews based on your job requirements and provides detailed evaluations and transcripts."
    },
    {
      question: "How are credits calculated?",
      answer: "Credits are consumed based on the actions you perform: AI calls typically cost 5 credits, candidate searches cost 2 credits, and bulk processing varies based on the number of candidates processed."
    },
    {
      question: "Can I customize the AI interview questions?",
      answer: "Yes! You can provide custom questions when setting up a search process. The AI will incorporate these questions into the interview flow while maintaining a natural conversation."
    },
    {
      question: "How accurate is the candidate matching?",
      answer: "Our AI uses advanced algorithms to analyze resumes, skills, and experience to provide match scores. The accuracy improves over time as the system learns from your hiring preferences."
    },
    {
      question: "What happens if a call fails?",
      answer: "Failed calls can be automatically rescheduled based on your settings. You can also manually retry calls or mark candidates for follow-up through the dashboard."
    },
    {
      question: "How do I export candidate data?",
      answer: "You can export shortlists, candidate profiles, and call transcripts in various formats (PDF, CSV, Excel) from the respective pages using the export buttons."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <HelpCircle className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQ Section */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5" />
                <span>Frequently Asked Questions</span>
              </CardTitle>
              <CardDescription>Find answers to common questions about using the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-foreground hover:text-primary transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Support Form */}
        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Contact Support</span>
              </CardTitle>
              <CardDescription>Send us a message and we'll help you out</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Briefly describe your issue"
                    className="bg-background/50 border-border/50 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={supportForm.message}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your issue in detail..."
                    rows={6}
                    className="bg-background/50 border-border/50 focus:ring-primary focus:border-primary resize-none"
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 glow-primary">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Other Ways to Reach Us</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-foreground font-medium">Email Support</p>
                  <p className="text-primary text-sm">support@hyperx.ai</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg opacity-60">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-foreground font-medium">Live Chat</p>
                  <span className="px-2 py-1 bg-accent/20 text-accent rounded-full text-xs">Coming Soon</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Links */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Legal & Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start hover:bg-secondary/50 transition-all">
                <Shield className="w-4 h-4 mr-2" />
                Terms of Service
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-secondary/50 transition-all">
                <Shield className="w-4 h-4 mr-2" />
                Privacy Policy
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;
