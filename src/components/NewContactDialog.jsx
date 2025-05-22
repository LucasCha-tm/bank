import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getContacts as apiGetContacts, addContact as apiAddContact } from "@/lib/bank-data"; // Supposons que vous ayez une fonction pour supprimer
import { Trash2 } from "lucide-react";

const NewContactDialog = ({ isOpen, onClose, onAddContact, userId }) => {
  const { toast } = useToast();
  const [newContact, setNewContact] = useState({ name: "", accountNumber: "", bank: "" });
  const [existingContacts, setExistingContacts] = useState([]);

  useEffect(() => {
    if (isOpen && userId) {
      setExistingContacts(apiGetContacts(userId));
    }
  }, [isOpen, userId]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setNewContact(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    if (!userId) {
        toast({ title: "Erreur", description: "Utilisateur non identifié.", variant: "destructive" });
        return;
    }
    if (!newContact.name || !newContact.accountNumber) {
      toast({ title: "Erreur", description: "Nom et numéro de compte requis.", variant: "destructive" });
      return;
    }
    onAddContact({ ...newContact, bank: newContact.bank || "Banque externe" });
    setNewContact({ name: "", accountNumber: "", bank: "" }); 
    // Rafraîchir la liste après ajout
    setExistingContacts(apiGetContacts(userId));
  };

  // La suppression de contact n'est pas implémentée dans bank-data.js, donc cette fonction est illustrative
  const handleDeleteContact = (contactId) => {
    if (!userId) return;
    // Supposons une fonction apiDeleteContact(contactId, userId)
    // apiDeleteContact(contactId, userId); 
    // setExistingContacts(apiGetContacts(userId));
    toast({ title: "Information", description: "Fonction de suppression non implémentée.", variant: "default" });
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gérer les bénéficiaires</DialogTitle>
          <DialogDescription>
            Ajoutez ou consultez vos bénéficiaires enregistrés.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div>
            <h4 className="text-md font-medium mb-2">Ajouter un nouveau bénéficiaire</h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name">Nom du bénéficiaire</Label>
                <Input id="name" placeholder="Nom complet" value={newContact.name} onChange={handleInputChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="accountNumber">Numéro de compte</Label>
                <Input id="accountNumber" placeholder="XXXX XXXX XXXX XXXX" value={newContact.accountNumber} onChange={handleInputChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bank">Nom de la banque (optionnel)</Label>
                <Input id="bank" placeholder="Nom de la banque" value={newContact.bank} onChange={handleInputChange} />
              </div>
              <Button onClick={handleSubmit} className="w-full">Ajouter le bénéficiaire</Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-md font-medium mb-2">Bénéficiaires enregistrés</h4>
            {existingContacts.length > 0 ? (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {existingContacts.map(contact => (
                  <li key={contact.id} className="flex justify-between items-center p-2 border rounded-md bg-secondary/30">
                    <div>
                      <p className="font-semibold">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.accountNumber} - {contact.bank}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)} disabled>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun bénéficiaire enregistré.</p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewContactDialog;