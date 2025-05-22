// Fonction pour initialiser les données bancaires dans localStorage pour un utilisateur spécifique
export const initBankData = (userId) => {
  const userBankAccountsKey = `bankAccounts_${userId}`;
  const userBankContactsKey = `bankContacts_${userId}`;

  if (!localStorage.getItem(userBankAccountsKey)) {
    localStorage.setItem(userBankAccountsKey, JSON.stringify([])); 
  }
  if (!localStorage.getItem(userBankContactsKey)) {
    localStorage.setItem(userBankContactsKey, JSON.stringify([]));
  }
};

export const createNewAccount = (userId, accountName, accountType = "Courant") => {
  const userBankAccountsKey = `bankAccounts_${userId}`;
  const accounts = getAccounts(userId);
  
  const randomNumberPart = () => Math.floor(1000 + Math.random() * 9000);
  const newAccountNumber = `${randomNumberPart()} ${randomNumberPart()} ${randomNumberPart()} ${randomNumberPart()}`;
  
  const newAccount = {
    id: `${accountType.toLowerCase().replace(/\s+/g, '-')}-account-${Date.now()}`,
    accountNumber: newAccountNumber,
    accountName: accountName,
    balance: 0, 
    currency: '€',
    type: accountType, 
    transactions: [] 
  };
  
  accounts.push(newAccount);
  localStorage.setItem(userBankAccountsKey, JSON.stringify(accounts));
  return newAccount;
};


export const getAccounts = (userId) => {
  if (!userId) return [];
  const userBankAccountsKey = `bankAccounts_${userId}`;
  const accounts = localStorage.getItem(userBankAccountsKey);
  return accounts ? JSON.parse(accounts) : [];
};

export const getAccount = (accountId, userId) => {
  if (!userId) return null;
  const accounts = getAccounts(userId);
  return accounts.find(account => account.id === accountId);
};

export const updateAccount = (updatedAccount, userId) => {
  if (!userId) return false;
  const userBankAccountsKey = `bankAccounts_${userId}`;
  const accounts = getAccounts(userId);
  const index = accounts.findIndex(account => account.id === updatedAccount.id);
  
  if (index !== -1) {
    accounts[index] = updatedAccount;
    localStorage.setItem(userBankAccountsKey, JSON.stringify(accounts));
    return true;
  }
  return false;
};

export const makeTransfer = (fromAccountId, toAccountNumberOrInternalId, amount, description, userId) => {
  if (!userId) throw new Error('Utilisateur non identifié pour le virement.');
  if (amount <= 0) throw new Error('Le montant doit être supérieur à 0');
  
  const accounts = getAccounts(userId);
  const fromIndex = accounts.findIndex(account => account.id === fromAccountId);
  
  if (fromIndex === -1) throw new Error('Compte source introuvable');
  if (accounts[fromIndex].balance < amount) throw new Error('Solde insuffisant');

  const transactionDate = new Date().toISOString();
  const debitTransaction = {
    id: `tx-${Date.now()}-out`,
    date: transactionDate,
    description: description || `Virement`,
    amount: -amount,
    type: 'debit',
    category: 'Virement'
  };
  accounts[fromIndex].transactions.unshift(debitTransaction);
  accounts[fromIndex].balance -= amount;

  const toInternalAccount = accounts.find(acc => acc.id === toAccountNumberOrInternalId || acc.accountNumber === toAccountNumberOrInternalId);

  if (toInternalAccount) { 
    const toIndex = accounts.findIndex(acc => acc.id === toInternalAccount.id);
    if (toIndex === -1) throw new Error('Compte destinataire interne introuvable');

    const creditTransaction = {
      id: `tx-${Date.now()}-in`,
      date: transactionDate,
      description: description || `Virement depuis ${accounts[fromIndex].accountName}`,
      amount: amount,
      type: 'credit',
      category: 'Virement'
    };
    accounts[toIndex].transactions.unshift(creditTransaction);
    accounts[toIndex].balance += amount;
    debitTransaction.description = description || `Virement vers ${accounts[toIndex].accountName}`;

  } else { 
     debitTransaction.description = description || `Virement externe vers ${toAccountNumberOrInternalId}`;
  }
  
  localStorage.setItem(`bankAccounts_${userId}`, JSON.stringify(accounts));
  return true;
};


export const getContacts = (userId) => {
  if (!userId) return [];
  const userBankContactsKey = `bankContacts_${userId}`;
  const contacts = localStorage.getItem(userBankContactsKey);
  return contacts ? JSON.parse(contacts) : [];
};

export const addContact = (contact, userId) => {
  if (!userId) throw new Error('Utilisateur non identifié pour ajouter un contact.');
  const userBankContactsKey = `bankContacts_${userId}`;
  const contacts = getContacts(userId);
  const newContact = {
    ...contact,
    id: `contact-${Date.now()}`
  };
  
  contacts.push(newContact);
  localStorage.setItem(userBankContactsKey, JSON.stringify(contacts));
  return newContact;
};