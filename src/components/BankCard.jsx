
import React from "react";
import { motion } from "framer-motion";
import { CreditCard, Wifi } from "lucide-react";

const BankCard = ({ account }) => {
  // Format du numéro de carte avec des espaces tous les 4 chiffres
  const formatCardNumber = (number) => {
    return number.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
  };

  // Animation variants
  const cardVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    hover: { 
      scale: 1.02,
      boxShadow: "0 20px 30px -10px rgba(59, 130, 246, 0.5)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className="bank-card relative w-full h-48 p-6 text-white overflow-hidden"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
    >
      <div className="flex justify-between items-start">
        <div className="bank-card-chip" />
        <Wifi className="h-6 w-6 text-white/80" />
      </div>
      
      <div className="mt-6">
        <p className="text-sm text-white/70 mb-1">Numéro de carte</p>
        <p className="text-xl font-mono tracking-wider">
          {formatCardNumber(account.accountNumber)}
        </p>
      </div>
      
      <div className="mt-4 flex justify-between items-end">
        <div>
          <p className="text-sm text-white/70 mb-1">Titulaire</p>
          <p className="font-medium">{account.accountName}</p>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-white/90" />
          <span className="text-lg font-bold">RP BANK</span>
        </div>
      </div>
      
      <div className="bank-card-wave"></div>
      <div className="bank-card-wave" style={{ right: "1rem", bottom: "-2rem" }}></div>
    </motion.div>
  );
};

export default BankCard;
