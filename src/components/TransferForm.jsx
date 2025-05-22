import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { makeTransfer, getContacts as apiGetContacts, addContact as apiAddContact } from "@/lib/bank-data";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, Plus } from "lucide-react";
import NewContactDialog from "@/components/NewContactDialog";

const TransferForm = ({ accounts, onTransferComplete, currentView, currentUser }) => {
  const { toast } = useToast();
  
  const getInitialFromAccount = () => {
    if (!currentUser) return "";
    const relevantUserAccounts = accounts.filter(acc => 
      (currentView === "business" ? acc.type === "Entreprise" : acc.type !== "Entreprise")
    );
    return relevantUserAccounts[0]?.id || "";
  };

  const [fromAccount, setFromAccount] = useState(getInitialFromAccount());
  const [toAccount, setToAccount] = useState(""); // Peut être un ID de compte interne ou un numéro de compte pour externe
  const [toAccountInput, setToAccountInput] = useState(""); // Pour la saisie manuelle du numéro de compte externe
  const [transferType, setTransferType] = useState("internal"); // 'internal', 'contact', 'external_new'
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNewContactDialog, setShowNewContactDialog] = useState(false);
  const [contacts, setContacts] = useState(currentUser ? apiGetContacts(currentUser.id) : []);

  useEffect(() => {
    if (currentUser) {
      setContacts(apiGetContacts(currentUser.id));
      setFromAccount(getInitialFromAccount());
    } else {
      setContacts([]);
      setFromAccount("");
    }
  }, [currentUser, accounts, currentView]);


  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast({ title: "Erreur", description: "Utilisateur non connecté.", variant: "destructive" });
      return;
    }
    if (!fromAccount) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un compte source.", variant: "destructive" });
      return;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast({ title: "Erreur", description: "Veuillez entrer un montant valide.", variant: "destructive" });
      return;
    }

    let finalToAccountIdentifier = toAccount;
    if (transferType === "external_new" && !toAccountInput.trim()) {
        toast({ title: "Erreur", description: "Veuillez entrer un numéro de compte destinataire.", variant: "destructive" });
        return;
    }
    if (transferType === "external_new") {
        finalToAccountIdentifier = toAccountInput.trim();
    }


    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simuler délai réseau
      makeTransfer(fromAccount, finalToAccountIdentifier, parseFloat(amount), description, currentUser.id);
      toast({ title: "Virement effectué", description: "Votre virement a été traité avec succès." });
      setToAccount("");
      setToAccountInput("");
      setAmount("");
      setDescription("");
      setTransferType("internal");
      if (onTransferComplete) onTransferComplete();
    } catch (error) {
      toast({ title: "Erreur de virement", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = (newContactData) => {
    if (!currentUser) return;
    try {
      const addedContact = apiAddContact(newContactData, currentUser.id);
      setContacts(prevContacts => [...prevContacts, addedContact]);
      toast({ title: "Contact ajouté", description: `${addedContact.name} a été ajouté à vos contacts.` });
      setShowNewContactDialog(false);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible d'ajouter le contact.", variant: "destructive" });
    }
  };
  
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const filteredSourceAccounts = currentUser ? accounts.filter(acc => 
    (currentView === "business" ? acc.type === "Entreprise" : acc.type !== "Entreprise")
  ) : [];

  const internalDestinationAccounts = currentUser ? accounts.filter(acc => acc.id !== fromAccount) : [];


  return (
    <>
      <motion.div variants={formVariants} initial="hidden" animate="visible">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Effectuer un virement</CardTitle>
            <CardDescription>Transférez de l'argent facilement et en toute sécurité.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <Label htmlFor="fromAccount">Compte source</Label>
                <Select value={fromAccount} onValueChange={setFromAccount} disabled={!currentUser}>
                  <SelectTrigger id="fromAccount"><SelectValue placeholder="Sélectionnez un compte source" /></SelectTrigger>
                  <SelectContent>
                    {filteredSourceAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountName} - {account.balance.toLocaleString('fr-FR')} €
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="transferType">Type de destinataire</Label>
                <Select value={transferType} onValueChange={(value) => { setTransferType(value); setToAccount(""); setToAccountInput(""); }} disabled={!currentUser}>
                    <SelectTrigger id="transferType"><SelectValue placeholder="Type de destinataire" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="internal">Vers un de mes comptes</SelectItem>
                        <SelectItem value="contact">Vers un bénéficiaire enregistré</SelectItem>
                        <SelectItem value="external_new">Vers un nouveau bénéficiaire externe</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              {transferType === "internal" && (
                <div>
                  <Label htmlFor="toAccountInternal">Compte destinataire (Interne)</Label>
                  <Select value={toAccount} onValueChange={setToAccount} disabled={!currentUser}>
                    <SelectTrigger id="toAccountInternal"><SelectValue placeholder="Sélectionnez un compte destinataire" /></SelectTrigger>
                    <SelectContent>
                      {internalDestinationAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {transferType === "contact" && (
                <div>
                  <Label htmlFor="toAccountContact">Bénéficiaire enregistré</Label>
                  <Select value={toAccount} onValueChange={setToAccount} disabled={!currentUser || contacts.length === 0}>
                    <SelectTrigger id="toAccountContact"><SelectValue placeholder="Sélectionnez un bénéficiaire" /></SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.accountNumber}>
                          {contact.name} ({contact.accountNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {transferType === "external_new" && (
                 <div>
                    <Label htmlFor="toAccountExternalNew">Numéro de compte du nouveau bénéficiaire</Label>
                    <Input 
                        id="toAccountExternalNew" 
                        placeholder="Entrez le numéro de compte" 
                        value={toAccountInput}
                        onChange={(e) => setToAccountInput(e.target.value)}
                        disabled={!currentUser}
                    />
                </div>
              )}
              
              <Button type="button" variant="outline" size="sm" className="mt-1 w-full" onClick={() => setShowNewContactDialog(true)} disabled={!currentUser}>
                <Plus className="h-4 w-4 mr-2" /> Gérer les bénéficiaires
              </Button>
              
              <div>
                <Label htmlFor="amount">Montant</Label>
                <div className="relative">
                  <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-8" step="0.01" min="0.01" disabled={!currentUser} />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description (optionnel)</Label>
                <Input id="description" placeholder="Motif du virement" value={description} onChange={(e) => setDescription(e.target.value)} disabled={!currentUser} />
              </div>
              
              <Button type="submit" className="w-full animated-gradient" disabled={isLoading || !currentUser}>
                {isLoading ? "Traitement..." : (<>Effectuer le virement <ArrowRight className="ml-2 h-4 w-4" /></>)}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
      
      <NewContactDialog 
        isOpen={showNewContactDialog} 
        onClose={() => setShowNewContactDialog(false)} 
        onAddContact={handleAddContact} 
        userId={currentUser?.id}
      />
    </>
  );
};

export default TransferForm;