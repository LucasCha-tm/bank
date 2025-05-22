
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit3, Eye, DollarSign, Users, FileText } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminPanel = ({ allUsers, getAccountsForUser, updateUserAccountData, deleteUserAccountAdmin, deleteUserTransactionAdmin }) => {
  const [usersData, setUsersData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editingBalance, setEditingBalance] = useState(false);
  const [newBalance, setNewBalance] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const usersArray = Object.entries(allUsers).map(([id, data]) => ({
      id,
      ...data,
      accounts: getAccountsForUser(id) || []
    }));
    setUsersData(usersArray);
  }, [allUsers, getAccountsForUser]);

  const handleUserSelect = (userId) => {
    const user = usersData.find(u => u.id === userId);
    setSelectedUser(user);
    setSelectedAccount(null); 
    setEditingBalance(false);
  };

  const handleAccountSelect = (accountId) => {
    const account = selectedUser?.accounts.find(acc => acc.id === accountId);
    setSelectedAccount(account);
    setNewBalance(account?.balance.toString() || "");
    setEditingBalance(false);
  };

  const handleUpdateBalance = () => {
    if (!selectedUser || !selectedAccount || isNaN(parseFloat(newBalance))) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un utilisateur, un compte et entrer un solde valide.", variant: "destructive" });
      return;
    }
    const success = updateUserAccountData(selectedUser.id, selectedAccount.id, { balance: parseFloat(newBalance) });
    if (success) {
      toast({ title: "Succès", description: "Solde du compte mis à jour." });
      refreshUserData();
      setEditingBalance(false);
    } else {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le solde.", variant: "destructive" });
    }
  };
  
  const handleDeleteAccount = (userId, accountId) => {
    deleteUserAccountAdmin(userId, accountId);
    toast({ title: "Compte supprimé", description: "Le compte a été supprimé." });
    refreshUserData();
    setSelectedAccount(null);
  };

  const handleDeleteTransaction = (userId, accountId, transactionId) => {
    deleteUserTransactionAdmin(userId, accountId, transactionId);
    toast({ title: "Transaction supprimée", description: "La transaction a été supprimée et le solde ajusté." });
    refreshUserData();
  };

  const refreshUserData = () => {
     const usersArray = Object.entries(allUsers).map(([id, data]) => ({
      id,
      ...data,
      accounts: getAccountsForUser(id) || []
    }));
    setUsersData(usersArray);
    if (selectedUser) {
      const updatedUser = usersArray.find(u => u.id === selectedUser.id);
      setSelectedUser(updatedUser);
      if (selectedAccount) {
        const updatedAccount = updatedUser?.accounts.find(acc => acc.id === selectedAccount.id);
        setSelectedAccount(updatedAccount);
        if (updatedAccount) setNewBalance(updatedAccount.balance.toString());
      }
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div className="space-y-8" variants={cardVariants} initial="hidden" animate="visible">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="mr-2 h-6 w-6 text-primary" /> Gestion des Utilisateurs</CardTitle>
          <CardDescription>Sélectionnez un utilisateur pour voir et gérer ses comptes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleUserSelect}>
            <SelectTrigger><SelectValue placeholder="Sélectionner un utilisateur" /></SelectTrigger>
            <SelectContent>
              {usersData.map(user => (
                <SelectItem key={user.id} value={user.id}>{user.displayName} ({user.role})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedUser && (
        <motion.div variants={cardVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center"><FileText className="mr-2 h-6 w-6 text-primary" /> Comptes de {selectedUser.displayName}</CardTitle>
              <CardDescription>Sélectionnez un compte pour voir les détails et les transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedUser.accounts.length > 0 ? (
                <Select onValueChange={handleAccountSelect}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un compte" /></SelectTrigger>
                  <SelectContent>
                    {selectedUser.accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.accountName} ({acc.type}) - {acc.balance.toLocaleString('fr-FR')} €</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-muted-foreground">Cet utilisateur n'a pas encore de compte.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {selectedAccount && (
         <motion.div variants={cardVariants} className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center"><DollarSign className="mr-2 h-6 w-6 text-primary" /> Détails du Compte: {selectedAccount.accountName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>Numéro de compte:</strong> {selectedAccount.accountNumber}</p>
              <p><strong>Type:</strong> {selectedAccount.type}</p>
              <div className="flex items-center gap-2">
                <strong>Solde:</strong>
                {editingBalance ? (
                  <>
                    <Input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} className="w-32" />
                    <Button onClick={handleUpdateBalance} size="sm">Sauver</Button>
                    <Button onClick={() => setEditingBalance(false)} variant="outline" size="sm">Annuler</Button>
                  </>
                ) : (
                  <>
                    <span>{selectedAccount.balance.toLocaleString('fr-FR')} €</span>
                    <Button onClick={() => setEditingBalance(true)} variant="ghost" size="icon"><Edit3 className="h-4 w-4" /></Button>
                  </>
                )}
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full mt-4"><Trash2 className="mr-2 h-4 w-4" /> Supprimer ce compte</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible et supprimera définitivement le compte "{selectedAccount.accountName}" de l'utilisateur "{selectedUser.displayName}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteAccount(selectedUser.id, selectedAccount.id)}>Supprimer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center"><Eye className="mr-2 h-6 w-6 text-primary" /> Transactions du Compte</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {selectedAccount.transactions.length > 0 ? (
                <ul className="space-y-3">
                  {selectedAccount.transactions.map(tx => (
                    <li key={tx.id} className="p-3 border rounded-md bg-secondary/30 flex justify-between items-start">
                      <div>
                        <p className={`font-semibold ${tx.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {tx.amount.toLocaleString('fr-FR')} €
                        </p>
                        <p className="text-sm text-muted-foreground">{tx.description}</p>
                        <p className="text-xs text-muted-foreground/70">{new Date(tx.date).toLocaleDateString('fr-FR')} {new Date(tx.date).toLocaleTimeString('fr-FR')}</p>
                      </div>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer cette transaction?</AlertDialogTitle>
                            <AlertDialogDescription>
                              La suppression de cette transaction ajustera le solde du compte. Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTransaction(selectedUser.id, selectedAccount.id, tx.id)}>Supprimer Transaction</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-4">Aucune transaction pour ce compte.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
      <Card className="glass-card mt-8">
        <CardHeader>
            <CardTitle>Documentation API (Conceptuelle)</CardTitle>
            <CardDescription>
                Ce qui suit est une représentation conceptuelle de la manière dont une API pourrait être structurée.
                Pour une API fonctionnelle et sécurisée, une solution backend (ex: Supabase) est nécessaire.
                Les "endpoints" ci-dessous sont des simulations et ne sont pas accessibles de l'extérieur.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <h4 className="font-semibold text-lg">Points d'accès (Endpoints) simulés :</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                    <li>
                        <code className="bg-muted p-1 rounded-sm">GET /api/users/{'{userId}'}/accounts/{'{accountId}'}/balance</code> - Obtenir le solde d'un compte.
                        <p className="text-xs pl-4">Nécessite une clé API valide (non implémenté).</p>
                    </li>
                    <li>
                        <code className="bg-muted p-1 rounded-sm">POST /api/transactions/transfer</code> - Effectuer un virement entre comptes.
                        <p className="text-xs pl-4">Corps de la requête attendu (JSON) : {"{ \"fromUserId\": \"string\", \"fromAccountId\": \"string\", \"toUserId\": \"string\", \"toAccountId\": \"string\", \"amount\": number }"}</p>
                        <p className="text-xs pl-4">Nécessite une clé API valide (non implémenté).</p>
                    </li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-lg mt-4">Authentification (Concept) :</h4>
                <p className="text-muted-foreground">
                    Dans un système réel, chaque requête API devrait inclure un token d'authentification (par exemple, une clé API) dans les en-têtes HTTP.
                    Exemple: <code className="bg-muted p-1 rounded-sm">Authorization: Bearer VOTRE_CLE_API</code>.
                    Ce token serait vérifié par le serveur backend.
                </p>
            </div>
             <div>
                <h4 className="font-semibold text-lg mt-4">Exemple d'utilisation (Conceptuel avec cURL) :</h4>
                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                    <code>
                        {`# Obtenir le solde (simulation)\n`}
                        {`curl -H "Authorization: Bearer SIMULATED_API_KEY" \\\n`}
                        {`  https://VOTRE_DOMAINE_ICI/api/users/user-123/accounts/account-abc/balance\n\n`}
                        {`# Effectuer un virement (simulation)\n`}
                        {`curl -X POST -H "Authorization: Bearer SIMULATED_API_KEY" \\\n`}
                        {`  -H "Content-Type: application/json" \\\n`}
                        {`  -d '{ \n`}
                        {`    "fromUserId": "user-123", \n`}
                        {`    "fromAccountId": "account-abc", \n`}
                        {`    "toUserId": "user-456", \n`}
                        {`    "toAccountId": "account-xyz", \n`}
                        {`    "amount": 100 \n`}
                        {`  }' \\\n`}
                        {`  https://VOTRE_DOMAINE_ICI/api/transactions/transfer`}
                    </code>
                </pre>
            </div>
            <p className="text-sm text-destructive mt-4">
                <strong>Rappel important :</strong> Les exemples ci-dessus sont purement illustratifs.
                L'application actuelle ne dispose pas d'un backend ni d'une API sécurisée accessible de l'extérieur.
                Toute interaction avec les données se fait via les fonctions JavaScript dans `lib/bank-data.js` et `localStorage`.
            </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminPanel;
