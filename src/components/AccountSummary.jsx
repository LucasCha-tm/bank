
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Wallet, PiggyBank } from "lucide-react";

const AccountSummary = ({ account }) => {
  // Calculer les totaux des transactions
  const calculateTotals = () => {
    const totals = {
      income: 0,
      expenses: 0
    };
    
    account.transactions.forEach(transaction => {
      if (transaction.type === 'credit') {
        totals.income += transaction.amount;
      } else {
        totals.expenses += Math.abs(transaction.amount);
      }
    });
    
    return totals;
  };
  
  const totals = calculateTotals();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div 
      className="stats-grid"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Solde actuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wallet className="mr-2 h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">
                {account.balance.toLocaleString('fr-FR')} {account.currency}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {account.type}
            </p>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowUpRight className="mr-2 h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-500">
                {totals.income.toLocaleString('fr-FR')} {account.currency}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Entrées totales
            </p>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowDownRight className="mr-2 h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold text-red-500">
                {totals.expenses.toLocaleString('fr-FR')} {account.currency}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sorties totales
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AccountSummary;
