'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Definisikan tipe data untuk pengguna
interface User {
  id: number;
  full_name: string;
  is_admin: boolean;
}

// Definisikan tipe untuk konteks
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

// Buat Konteks
const UserContext = createContext<UserContextType | undefined>(undefined);

// Buat Komponen Penyedia (Provider)
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Cek status login saat aplikasi dimuat
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  // Fungsi untuk logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
      router.refresh(); // Memuat ulang state server
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook kustom untuk menggunakan konteks
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
