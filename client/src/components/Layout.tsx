import Header from "./Header";
import Sidebar from "./Sidebar";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  activePage: string;
  onLogout: () => void;
  onImportClick?: () => void;
}

export default function Layout({ children, activePage, onLogout, onImportClick }: LayoutProps) {
  return (
    <div className="h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header onLogout={onLogout} />
      </div>

      <div className="flex h-full pt-[100px]">
        <div className="fixed left-0 top-[100px] bottom-0 w-64">
          <Sidebar activePage={activePage} onImportClick={onImportClick} />
        </div>

        <div className="ml-64 flex-1 overflow-y-auto">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 