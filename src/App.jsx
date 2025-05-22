import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { initBankData, getAccounts, getAccount, createNewAccount } from "@/lib/bank-data";
import Header from "@/components/Header";
import BankCard from "@/components/BankCard";
import AccountSummary from "@/components/AccountSummary";
import TransactionHistory from "@/components/TransactionHistory";
import TransferForm from "@/components/TransferForm";
import AccountSelector from "@/components/AccountSelector";
import AuthScreen from "@/components/AuthScreen";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Briefcase } from "lucide-react";

const App = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState("personal"); 

  useEffect(() => {
    const storedAuth = localStorage.getItem("rpBankAuth");
    let initialUser = null;
    if (storedAuth) {
      const { user, expiry } = JSON.parse(storedAuth);
      if (new Date().getTime() < expiry) {
        initialUser = user;
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("rpBankAuth");
      }
    }
    // Toujours initialiser les données, même si l'utilisateur n'est pas encore défini (pour le cas où il se connecte)
    initBankData(initialUser ? initialUser.id : "guest"); // Utiliser "guest" ou un placeholder si pas d'utilisateur
    if(initialUser) {
      loadUserAccounts(initialUser.id);
    }
    setIsLoading(false);
  }, []); // Exécuter une seule fois au montage

  useEffect(() => {
    // Ce hook se déclenche si currentUser change (après la connexion)
    if (currentUser) {
      initBankData(currentUser.id);
      loadUserAccounts(currentUser.id);
    } else {
      // Gérer la déconnexion: vider les comptes etc.
      setAccounts([]);
      setSelectedAccount(null);
      setSelectedAccountId("");
    }
  }, [currentUser]);


  useEffect(() => {
    if (selectedAccountId && currentUser) {
      const account = getAccount(selectedAccountId, currentUser.id);
      setSelectedAccount(account);
    } else if (currentUser && accounts.length > 0) {
      // S'assurer que le compte sélectionné par défaut correspond à la vue actuelle
      const firstRelevantAccount = accounts.find(acc => 
        (currentView === "business" && acc.type === "Entreprise") ||
        (currentView === "personal" && acc.type !== "Entreprise")
      ) || accounts.find(acc => currentView === "personal" ? acc.type !== "Entreprise" : true) || accounts[0]; // Fallback plus large
      
      if (firstRelevantAccount) {
        setSelectedAccountId(firstRelevantAccount.id);
      } else {
        // Aucun compte pertinent, désélectionner
        setSelectedAccountId("");
        setSelectedAccount(null);
      }
    } else if (!currentUser) {
        setSelectedAccountId("");
        setSelectedAccount(null);
    }
  }, [selectedAccountId, accounts, currentUser, currentView]);

  const loadUserAccounts = (userId) => {
    const loadedAccounts = getAccounts(userId);
    setAccounts(loadedAccounts);
    // La logique de sélection du compte est maintenant dans le useEffect ci-dessus
  };
  
  const handleLogin = (userData) => {
    const expiry = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 heures
    localStorage.setItem("rpBankAuth", JSON.stringify({ user: userData, expiry }));
    setCurrentUser(userData); // Déclenchera le useEffect pour charger les données utilisateur
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("rpBankAuth");
    setCurrentUser(null); // Déclenchera le useEffect pour vider les données
    setIsAuthenticated(false);
  };

  const handleCreateAccount = (accountName, accountType) => {
    if (currentUser) {
      createNewAccount(currentUser.id, accountName, accountType);
      loadUserAccounts(currentUser.id); // Recharger pour voir le nouveau compte
    }
  };

  const refreshData = () => {
    if (currentUser) {
      loadUserAccounts(currentUser.id); // loadUserAccounts mettra à jour selectedAccount via useEffect
    }
  };
  
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.2 } }
  };
  
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse text-primary font-bold text-xl">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }
  
  const displayedAccounts = accounts.filter(acc => 
    currentView === "business" ? acc.type === "Entreprise" : acc.type !== "Entreprise"
  );

  return (
    <motion.div className="min-h-screen bg-background" variants={pageVariants} initial="hidden" animate="visible">
      <Header user={currentUser} onLogout={handleLogout} />
      
      <main className="container mx-auto py-6 px-4">
        <Tabs value={currentView} onValueChange={(value) => {
          setCurrentView(value);
          // Réinitialiser le compte sélectionné lors du changement de vue pour forcer la re-sélection
          const firstRelevantAccountInNewView = accounts.find(acc => 
            (value === "business" && acc.type === "Entreprise") ||
            (value === "personal" && acc.type !== "Entreprise")
          );
          setSelectedAccountId(firstRelevantAccountInNewView ? firstRelevantAccountInNewView.id : "");
        }} className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Personnel
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Entreprise
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {displayedAccounts.length > 0 && selectedAccount && selectedAccount.id === selectedAccountId ? (
          <>
            <AccountSelector 
              accounts={displayedAccounts}
              selectedAccount={selectedAccountId}
              onSelectAccount={setSelectedAccountId}
            />
            <motion.div className="mt-6" variants={sectionVariants}>
              <BankCard account={selectedAccount} />
            </motion.div>
            <motion.div className="mt-6" variants={sectionVariants}>
              <AccountSummary account={selectedAccount} />
            </motion.div>
            <motion.div className="mt-8 dashboard-grid" variants={sectionVariants}>
              <TransactionHistory transactions={selectedAccount.transactions} />
              <TransferForm accounts={accounts} onTransferComplete={refreshData} currentView={currentView} currentUser={currentUser} />
            </motion.div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] glass-card p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {currentView === "business" ? "Aucun compte entreprise trouvé" : "Aucun compte personnel trouvé"}
            </h2>
            <p className="text-muted-foreground mb-6 text-center">
              {currentView === "business" 
                ? "Créez un compte entreprise pour gérer les finances de votre société."
                : "Créez un compte personnel pour commencer à gérer vos finances."
              }
            </p>
            <Button onClick={() => handleCreateAccount(
                currentView === "business" ? "Compte Entreprise Principal" : "Compte Courant Principal",
                currentView === "business" ? "Entreprise" : "Courant"
              )} 
              className="animated-gradient"
            >
              Créer un compte {currentView === "business" ? "Entreprise" : "Personnel"}
            </Button>
          </div>
        )}
      </main>
      
      <footer className="border-t border-border/40 py-6 px-4 text-center text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} RP Bank - Tous droits réservés</span>
      </footer>
      
      <Toaster />
    </motion.div>
  );
};

export default App;