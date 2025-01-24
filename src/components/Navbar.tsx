import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';

export default function Navbar() {
  const { user } = useUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            日记本
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">{user.email}</span>
                <Link 
                  href="/new" 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  写日记
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  退出
                </button>
              </>
            ) : (
              <Link 
                href="/" 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}