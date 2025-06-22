import { Shield, Users, Upload } from "lucide-react";

interface SidebarProps {
  activePage: string;
  onImportClick?: () => void;
}

export default function Sidebar({ activePage, onImportClick }: SidebarProps) {
  return (
    <aside className="bg-white shadow-md border-r border-gray-200 h-full">
      <nav className="p-6">
        <ul className="space-y-2">
          <li>
            <a
              href="/dashboard"
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                activePage === "dashboard"
                  ? "text-primary bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Shield size={16} />
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <button
              type="button"
              onClick={onImportClick}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                activePage === "import-data"
                  ? "text-primary bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Upload size={16} />
              <span>Import Data</span>
            </button>
          </li>
          <li>
            <a
              href="/user-management"
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                activePage === "user-management"
                  ? "text-primary bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Users size={16} />
              <span>User Management</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
} 