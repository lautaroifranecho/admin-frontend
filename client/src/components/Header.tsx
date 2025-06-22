import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import norrisLogo from "@/assets/images/Norris-legal3-300x97.png";

interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <img
          src={norrisLogo}
          alt="Norris Legal Logo"
          style={{ maxWidth: 200, height: "auto" }}
        />
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="text-gray-600" size={14} />
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 

