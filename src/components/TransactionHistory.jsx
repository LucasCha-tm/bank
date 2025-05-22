
import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ShoppingCart, 
  Home, 
  Utensils, 
  Car, 
  Briefcase,
  PiggyBank,
  CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TransactionHistory = ({ transactions }) => {
  // Icônes par catégorie
  const categoryIcons = {
    'Alimentation': <ShoppingCart className="h-4 w-4" />,
    'Logement': <Home className="h-4 w-4" />,
    'Transport': <Car className="h-4 w-4" />,
    'Revenu': <Briefcase className="h-4 w-4" />,
    'Épargne': <PiggyBank className="h-4 w-4" />,
    'Virement': <CreditCard className="h-4 w-4" />,
    'Restaurant': <Utensils className="h-4 w-4" />
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Historique des transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Aucune transaction à afficher</p>
          ) : (
            transactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                className="transaction-item flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50"
                variants={itemVariants}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${transaction.type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {transaction.type === 'credit' 
                      ? <ArrowUpRight className="h-4 w-4 text-green-500" /> 
                      : <ArrowDownRight className="h-4 w-4 text-red-500" />}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.date), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`font-bold ${transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.type === 'credit' ? '+' : ''}
                    {transaction.amount.toLocaleString('fr-FR')} €
                  </span>
                  {transaction.category && (
                    <div className="ml-3 p-1 rounded bg-secondary flex items-center text-xs">
                      {categoryIcons[transaction.category] || <ShoppingCart className="h-3 w-3 mr-1" />}
                      <span className="ml-1">{transaction.category}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
