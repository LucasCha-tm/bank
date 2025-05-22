
const SITE_SETTINGS_KEY = "rpBankSiteSettings";
const USERS_KEY = "rpBankUsers";

export const getSiteSettings = () => {
  const settings = localStorage.getItem(SITE_SETTINGS_KEY);
  return settings ? JSON.parse(settings) : { siteName: null, adminUser: null };
};

export const saveSiteSettings = (settings) => {
  localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(settings));
};

export const initBankData = (userId) => {
  const userBankAccountsKey = `bankAccounts_${userId}`;
  const userBankContactsKey = `bankContacts_${userId}`;

  if (!localStorage.getItem(userBankAccountsKey)) {
    localStorage.setItem(userBankAccountsKey, JSON.stringify([])); 
  }
  if (!localStorage.getItem(userBankContactsKey)) {
    localStorage.setItem(userBankContactsKey, JSON.stringify([]));
  }
  if (!localStorage.getItem(SITE_SETTINGS_KEY)) {
    localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify({ siteName: null, adminUser: null }));
  }
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify({}));
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

export const getAllUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : {};
};

export const updateUserAccountData = (userId, accountId, updatedData) => {
  const userAccounts = getAccounts(userId);
  const accountIndex = userAccounts.findIndex(acc => acc.id === accountId);
  if (accountIndex !== -1) {
    userAccounts[accountIndex] = { ...userAccounts[accountIndex], ...updatedData };
    localStorage.setItem(`bankAccounts_${userId}`, JSON.stringify(userAccounts));
    return true;
  }
  return false;
};

export const deleteUserAccountAdmin = (userId, accountId) => {
  let userAccounts = getAccounts(userId);
  userAccounts = userAccounts.filter(acc => acc.id !== accountId);
  localStorage.setItem(`bankAccounts_${userId}`, JSON.stringify(userAccounts));
  return true;
};

export const deleteUserTransactionAdmin = (userId, accountId, transactionId) => {
  const userAccounts = getAccounts(userId);
  const accountIndex = userAccounts.findIndex(acc => acc.id === accountId);
  if (accountIndex !== -1) {
    const originalBalanceEffect = userAccounts[accountIndex].transactions.find(tx => tx.id === transactionId)?.amount || 0;
    userAccounts[accountIndex].transactions = userAccounts[accountIndex].transactions.filter(tx => tx.id !== transactionId);
    userAccounts[accountIndex].balance -= originalBalanceEffect; // Ajuster le solde
    localStorage.setItem(`bankAccounts_${userId}`, JSON.stringify(userAccounts));
    return true;
  }
  return false;
};

// API Concept (Not functional with localStorage for external access)
export const getApiUserBalance = (userId, accountId) => {
  // In a real API, you'd have authentication here (API key, token, etc.)
  // This is a conceptual placeholder.
  console.warn("API Call Simulation: getApiUserBalance. This is not a real, secure API endpoint.");
  const account = getAccount(accountId, userId);
  if (account) {
    return { balance: account.balance, currency: account.currency };
  }
  return { error: "Account not found or access denied." };
};

export const makeApiPayment = (fromUserId, fromAccountId, toUserId, toAccountId, amount) => {
  // Conceptual placeholder for an API payment function
  console.warn("API Call Simulation: makeApiPayment. This is not a real, secure API endpoint.");
  try {
    // Simulate debit from sender
    const senderAccounts = getAccounts(fromUserId);
    const senderAccountIndex = senderAccounts.findIndex(acc => acc.id === fromAccountId);
    if (senderAccountIndex === -1) throw new Error("Sender account not found.");
    if (senderAccounts[senderAccountIndex].balance < amount) throw new Error("Insufficient funds in sender account.");
    senderAccounts[senderAccountIndex].balance -= amount;
    // Add debit transaction for sender
    localStorage.setItem(`bankAccounts_${fromUserId}`, JSON.stringify(senderAccounts));

    // Simulate credit to receiver
    const receiverAccounts = getAccounts(toUserId);
    const receiverAccountIndex = receiverAccounts.findIndex(acc => acc.id === toAccountId);
    if (receiverAccountIndex === -1) throw new Error("Receiver account not found.");
    receiverAccounts[receiverAccountIndex].balance += amount;
    // Add credit transaction for receiver
    localStorage.setItem(`bankAccounts_${toUserId}`, JSON.stringify(receiverAccounts));
    
    return { success: true, message: "Payment processed conceptually." };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
