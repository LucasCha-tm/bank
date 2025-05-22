
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogIn, UserPlus } from "lucide-react"; 
import { useToast } from "@/components/ui/use-toast";
import { getSiteSettings } from "@/lib/bank-data";

const AuthScreen = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; 
    }
    return `simulated_hash_${hash}`;
  };

  const handleAuthAction = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({ title: "Erreur", description: "Nom d'utilisateur et mot de passe requis.", variant: "destructive" });
      return;
    }

    const usersKey = "rpBankUsers";
    let users = JSON.parse(localStorage.getItem(usersKey)) || {};
    const userId = username.toLowerCase().replace(/\s+/g, '-');
    const siteSettings = getSiteSettings();

    if (isLoginView) {
      if (users[userId] && users[userId].hashedPassword === simpleHash(password)) {
        const userData = { id: userId, name: users[userId].displayName, role: users[userId].role };
        onLogin(userData);
        toast({ title: `Bienvenue ${users[userId].displayName}!`, description: "Connexion réussie." });
      } else {
        toast({ title: "Erreur de connexion", description: "Nom d'utilisateur ou mot de passe incorrect.", variant: "destructive" });
      }
    } else {
      if (users[userId]) {
        toast({ title: "Erreur d'inscription", description: "Ce nom d'utilisateur existe déjà.", variant: "destructive" });
        return;
      }
      
      const isAdmin = Object.keys(users).length === 0; // Le premier utilisateur est admin
      users[userId] = { 
        hashedPassword: simpleHash(password),
        displayName: username,
        role: isAdmin ? 'admin' : 'user'
      };
      localStorage.setItem(usersKey, JSON.stringify(users));
      
      const userData = { id: userId, name: username, role: users[userId].role };
      onLogin(userData); 
      toast({ 
        title: `Compte créé pour ${username}!`, 
        description: `Inscription réussie. Vous êtes maintenant ${isAdmin ? 'administrateur' : 'connecté'}.` 
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, type: "spring" } }
  };
  
  const siteSettings = getSiteSettings();
  const siteName = siteSettings?.siteName || "RP Bank";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-background to-secondary p-4">
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Card className="w-full max-w-md glass-card shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 border-2 border-primary">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">
              {isLoginView ? `Connexion à ${siteName}` : `Créer un compte ${siteName}`}
            </CardTitle>
            <CardDescription>
              {isLoginView ? "Accédez à votre espace bancaire sécurisé." : `Rejoignez ${siteName} et gérez vos finances.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuthAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur (RP)</Label>
                <Input 
                  id="username" 
                  placeholder="Votre pseudo en jeu" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
              </div>
              <Button type="submit" className="w-full animated-gradient text-lg py-3">
                {isLoginView ? <><LogIn className="mr-2 h-5 w-5" /> Se connecter</> : <><UserPlus className="mr-2 h-5 w-5" /> Créer le compte</>}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Button variant="link" onClick={() => setIsLoginView(!isLoginView)} className="text-primary-foreground/80 hover:text-primary">
                {isLoginView ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
