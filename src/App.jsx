
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { 
  initBankData, 
  getAccounts, 
  getAccount, 
  createNewAccount,
  getSiteSettings,
  saveSiteSettings,
  getAllUsers,
  updateUserAccountData,
  deleteUserAccountAdmin,
  deleteUserTransactionAdmin
} from "@/lib/bank-data";
import Header from "@/components/Header";
import BankCard from "@/components/BankCard";
import AccountSummary from "@/components/AccountSummary";
import TransactionHistory from "@/components/TransactionHistory";
import TransferForm from "@/components/TransferForm";
import AccountSelector from "@/components/AccountSelector";
import AuthScreen from "@/components/AuthScreen";
import AdminPanel from "@/components/AdminPanel";
import SiteSetup from "@/components/SiteSetup";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Briefcase, ShieldCheck } from "lucide-react";

const App = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState("personal"); 
  const [siteSettings, setSiteSettings] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    const settings = getSiteSettings();
    setSiteSettings(settings);

    const users = JSON.parse(localStorage.getItem("rpBankUsers")) || {};
    if (Object.keys(users).length === 0 && !settings.siteName) {
      setNeedsSetup(true);
    }

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
    
    initBankData(initialUser ? initialUser.id : "guest");
    if(initialUser) {
      loadUserAccounts(initialUser.id);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (currentUser) {
      initBankData(currentUser.id);
      loadUserAccounts(currentUser.id);
      const users = JSON.parse(localStorage.getItem("rpBankUsers")) || {};
      if (users[currentUser.id] && users[currentUser.id].role === 'admin' && !siteSettings.siteName && Object.keys(users).length === 1) {
        setNeedsSetup(true);
      } else {
        setNeedsSetup(false);
      }
    } else {
      setAccounts([]);
      setSelectedAccount(null);
      setSelectedAccountId("");
    }
  }, [currentUser, siteSettings]);


  useEffect(() => {
    if (selectedAccountId && currentUser) {
      const account = getAccount(selectedAccountId, currentUser.id);
      setSelectedAccount(account);
    } else if (currentUser && accounts.length > 0) {
      const firstRelevantAccount = accounts.find(acc => 
        (currentView === "personal" && acc.type !== "Entreprise" && acc.type !== "AdminView") ||
        (currentView === "business" && acc.type === "Entreprise") ||
        (currentView === "admin" && acc.type === "AdminView") 
      ) || accounts.find(acc => currentView === "personal" ? acc.type !== "Entreprise" : true) || accounts[0];
      
      if (firstRelevantAccount) {
        setSelectedAccountId(firstRelevantAccount.id);
      } else {
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
  };
  
  const handleLogin = (userData) => {
    const expiry = new Date().getTime() + (24 * 60 * 60 * 1000); 
    localStorage.setItem("rpBankAuth", JSON.stringify({ user: userData, expiry }));
    setCurrentUser(userData); 
    setIsAuthenticated(true);
    const users = JSON.parse(localStorage.getItem("rpBankUsers")) || {};
     if (userData.role === 'admin' && !siteSettings.siteName && Object.keys(users).length === 1) {
        setNeedsSetup(true);
      }
  };

  const handleLogout = () => {
    localStorage.removeItem("rpBankAuth");
    setCurrentUser(null); 
    setIsAuthenticated(false);
    setCurrentView("personal");
  };

  const handleCreateAccount = (accountName, accountType) => {
    if (currentUser) {
      createNewAccount(currentUser.id, accountName, accountType);
      loadUserAccounts(currentUser.id); 
    }
  };

  const handleSiteSetupComplete = (newSettings) => {
    saveSiteSettings(newSettings);
    setSiteSettings(newSettings);
    setNeedsSetup(false);
  };

  const refreshData = () => {
    if (currentUser) {
      loadUserAccounts(currentUser.id); 
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

  if (needsSetup && currentUser?.role === 'admin') {
    return <SiteSetup onSetupComplete={handleSiteSetupComplete} />;
  }
  
  const displayedAccounts = accounts.filter(acc => {
    if (currentView === "admin") return true; // L'AdminPanel gère ses propres filtres
    return currentView === "business" ? acc.type === "Entreprise" : acc.type !== "Entreprise";
  });

  const isAdmin = currentUser?.role === 'admin';

  return (
    <motion.div className="min-h-screen bg-background" variants={pageVariants} initial="hidden" animate="visible">
      <Header user={currentUser} onLogout={handleLogout} siteName={siteSettings?.siteName} />
      
      <main className="container mx-auto py-6 px-4">
        <Tabs value={currentView} onValueChange={(value) => {
          setCurrentView(value);
          const firstRelevantAccountInNewView = accounts.find(acc => 
            (value === "personal" && acc.type !== "Entreprise" && acc.type !== "AdminView") ||
            (value === "business" && acc.type === "Entreprise") ||
            (value === "admin" && acc.type === "AdminView") 
          );
          setSelectedAccountId(firstRelevantAccountInNewView ? firstRelevantAccountInNewView.id : "");
        }} className="w-full mb-6">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} max-w-lg mx-auto`}>
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Personnel
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Entreprise
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Admin
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        {currentView === "admin" && isAdmin ? (
          <AdminPanel 
            allUsers={getAllUsers()} 
            getAccountsForUser={getAccounts} 
            updateUserAccountData={updateUserAccountData}
            deleteUserAccountAdmin={deleteUserAccountAdmin}
            deleteUserTransactionAdmin={deleteUserTransactionAdmin}
          />
        ) : displayedAccounts.length > 0 && selectedAccount && selectedAccount.id === selectedAccountId ? (
          <>
            <AccountSelector 
              accounts={displayedAccounts.filter(acc => acc.type !== "AdminView")} // Ne pas montrer les comptes admin dans le sélecteur normal
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
        <span>© {new Date().getFullYear()} {siteSettings?.siteName || "RP Bank"} - Tous droits réservés</span>
      </footer>
      
      <Toaster />
    </motion.div>
  );
};

export default App;
