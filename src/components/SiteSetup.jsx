
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const SiteSetup = ({ onSetupComplete }) => {
  const [siteName, setSiteName] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!siteName.trim()) {
      toast({ title: "Erreur", description: "Veuillez entrer un nom pour votre banque.", variant: "destructive" });
      return;
    }
    onSetupComplete({ siteName });
    toast({ title: "Configuration terminée!", description: `Le nom de votre banque est maintenant "${siteName}".` });
  };

  const pageVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-background to-secondary p-4"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="w-full max-w-lg glass-card shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 border-2 border-primary">
            <Settings className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Configuration Initiale</CardTitle>
          <CardDescription>Bienvenue ! Veuillez configurer les informations de base de votre banque RP.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nom de votre Banque RP</Label>
              <Input
                id="siteName"
                placeholder="Ex: Los Santos National Bank"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full animated-gradient text-lg py-3">
              Sauvegarder et Continuer
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SiteSetup;
