
import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const Header = ({ user, onLogout, siteName }) => {
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const getInitials = (name) => {
    if (!name) return "RP";
    const names = name.split(' ');
    if (names.length === 1) return name.substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  const displayName = siteName || "RP Bank";

  return (
    <motion.header
      className="w-full py-4 px-6 flex items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-10"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2 lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-2">
            <span className="text-primary-foreground font-bold text-xs">
              {displayName.substring(0,2).toUpperCase()}
            </span>
          </div>
          <h1 className="text-xl font-bold">{displayName}</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src={user?.avatarUrl || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user ? getInitials(user.name) : "RP"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "Utilisateur"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.id || "Non connecté"}
                </p>
                {user?.role === 'admin' && (
                  <p className="text-xs leading-none text-primary flex items-center mt-1">
                    <ShieldCheck className="h-3 w-3 mr-1"/> Administrateur
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
};

export default Header;
