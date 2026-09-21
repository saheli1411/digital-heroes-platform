'use client';

import { useState, useEffect } from 'react';
import Link from 'next/navigation';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Sparkles, 
  Trophy, 
  HeartHandshake, 
  LayoutDashboard, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X,
  User
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('role, full_name, subscription_status')
          .eq('id', user.id)
          .single();
        setProfile(userProfile);
      }
    }

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('role, full_name, subscription_status')
            .eq('id', currentUser.id)
            .single();
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { label: 'Directory', href: '/charities', icon: HeartHandshake },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ...(profile?.role === 'admin'
      ? [{ label: 'Admin Engine', href: '/admin', icon: ShieldAlert }]
      : []),
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <NextLink href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            DH
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              DIGITAL HEROES
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 -mt-1 font-semibold">
              Sport • Impact • Draw
            </span>
          </div>
        </NextLink>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800/80 p-1.5 rounded-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <NextLink
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                {link.label}
              </NextLink>
            );
          })}
        </nav>

        {/* User Account / Membership CTA */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-white leading-tight">
                  {profile?.full_name || user.email?.split('@')[0]}
                </p>
                <span className="text-[10px] font-mono uppercase text-emerald-400">
                  {profile?.role === 'admin' ? 'System Admin' : profile?.subscription_status || 'Subscriber'}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NextLink
                href="/dashboard"
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" /> Sign In
              </NextLink>
              <NextLink
                href="/subscribe"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Join Platform
              </NextLink>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-emerald-400" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-6 py-6 space-y-4">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-sm font-medium text-slate-200"
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  {link.label}
                </NextLink>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-slate-800/80">
            {user ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <p className="text-xs font-bold text-white">{profile?.full_name || user.email}</p>
                  <p className="text-[11px] font-mono text-emerald-400 uppercase mt-0.5">
                    {profile?.role === 'admin' ? 'Administrator' : 'Active Subscriber'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <NextLink
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm font-semibold text-white"
                >
                  Sign In
                </NextLink>
                <NextLink
                  href="/subscribe"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center p-3 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/20"
                >
                  Start Membership
                </NextLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}