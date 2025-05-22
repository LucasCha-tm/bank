
import React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, PiggyBank } from "lucide-react";

const AccountSelector = ({ accounts, selectedAccount, onSelectAccount }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex justify-center"
    >
      <Tabs 
        defaultValue={selectedAccount} 
        value={selectedAccount}
        onValueChange={onSelectAccount}
        className="w-full max-w-md"
      >
        <TabsList className="grid grid-cols-2 w-full">
          {accounts.map(account => (
            <TabsTrigger key={account.id} value={account.id} className="flex items-center">
              {account.type === "Courant" ? (
                <CreditCard className="h-4 w-4 mr-2" />
              ) : (
                <PiggyBank className="h-4 w-4 mr-2" />
              )}
              {account.accountName}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </motion.div>
  );
};

export default AccountSelector;
