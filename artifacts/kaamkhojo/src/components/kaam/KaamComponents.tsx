import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowRight, Bell, BriefcaseBusiness, CalendarDays, Check, ChevronDown, CircleHelp,
  FileText, Heart, Home, LogOut, MapPin, Menu, Search, Settings2, SlidersHorizontal,
  Sparkles, Star, UserRound, Wrench, X, Zap,
} from 'lucide-react';

type Category = { id: string; name: string; icon: string; description: string; startingPrice: number };
type Technician = { id: string; name: string; specialty: string; rating: number; reviewCount: number; distance: string; location: string; avatar: string; verified: boolean; availableToday: boolean };
type Request = { id: string; service: string; technicianName: string; customerName: string; schedule: string; status: string; amount: number };

export const fallbackCategories: Category[] = [
  { id: 'electrician', name: 'Electrician', icon: 'bolt', description: 'Switches, fans, wiring and more', startingPrice: 249 },
  { id: 'plumber', name: 'Plumber', icon: 'droplet', description: 'Leaks, taps, pipes and fittings', startingPrice: 199 },
  { id: 'ac-repair', name: 'AC repair', icon: 'snowflake', description: 'Service, gas refill and install', startingPrice: 399 },
  { id: 'bike-service', name: 'Bike service', icon: 'bike', description: 'Pick-up, repair and tune-up', startingPrice: 299 },
  { id: 'appliance', name: 'Appliances', icon: 'refrigerator', description: 'Home appliances, sorted', startingPrice: 299 },
  { id: 'car-care', name: 'Car care', icon: 'car', description: 'At-home checks and fixes', startingPrice: 499 },
];

export const fallbackTechnicians: Technician[] = [
  { id: 'ramesh', name: 'Ramesh Kumar', specialty: 'Electrician', rating: 4.9, reviewCount: 128, distance: '0.8 km', location: 'Indiranagar, Bengaluru', avatar: 'RK', verified: true, availableToday: true },
  { id: 'sana', name: 'Sana Shaikh', specialty: 'AC specialist', rating: 4.8, reviewCount: 86, distance: '1.4 km', location: 'Koramangala, Bengaluru', avatar: 'SS', verified: true, availableToday: true },
  { id: 'arjun', name: 'Arjun Motors', specialty: 'Bike mechanic', rating: 4.7, reviewCount: 204, distance: '2.1 km', location: 'Domlur, Bengaluru', avatar: 'AM', verified: true, availableToday: false },
];

export const fallbackRequests: Request[] = [
  { id: 'KK-2419', service: 'Ceiling fan repair', technicianName: 'Ramesh Kumar', customerName: 'Aarav Mehta', schedule: 'Today, 4:30 PM', status: 'confirmed', amount: 349 },
  { id: 'KK-2388', service: 'Bike general service', technicianName: 'Arjun Motors', customerName: 'Aarav Mehta', schedule: '18 Jun, 11:00 AM', status: 'completed', amount: 599 },
  { id: 'KK-2374', service: 'Kitchen tap replacement', technicianName: 'Vijay Plumbing', customerName: 'Aarav Mehta', schedule: '14 Jun, 2:00 PM', status: 'completed', amount: 280 },
];

export function BrandMark({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group" data-testid="link-brand">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:-rotate-6">
        <Wrench size={19} strokeWidth={2.5} />
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-accent" />
      </span>
      <span className={`font-display text-xl font-bold tracking-tight ${dark ? 'text-sidebar-foreground' : 'text-foreground'}`}>Kaam<span className="text-primary">Khojo</span></span>
    </Link>
  );
}

export function PublicHeader() {
  const [location] = useLocation();
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <BrandMark />
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground" data-testid="link-how-it-works">How it works</a>
          <a href="#services" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground" data-testid="link-services">Services</a>
          <Link href="/technician-dashboard" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground" data-testid="link-for-technicians">For technicians</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-muted sm:inline-flex" data-testid="link-header-login">Sign in</Link>
          <Link href={location === '/' ? '/role-selection' : '/'} className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-secondary-foreground shadow-sm transition-transform hover:-translate-y-0.5" data-testid="link-header-cta">
            Get started <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}

const navItems = [
  { label: 'Overview', href: '/customer-dashboard', icon: Home },
  { label: 'Find a technician', href: '/customer-dashboard#find', icon: Search },
  { label: 'My requests', href: '/customer-dashboard#requests', icon: FileText },
  { label: 'Saved technicians', href: '/customer-dashboard#saved', icon: Heart },
];
const techNavItems = [
  { label: 'Overview', href: '/technician-dashboard', icon: Home },
  { label: 'Upcoming jobs', href: '/technician-dashboard#jobs', icon: CalendarDays },
  { label: 'Earnings', href: '/technician-dashboard#earnings', icon: BriefcaseBusiness },
  { label: 'Profile', href: '/profile', icon: UserRound },
];

export function AppSidebar({ role = 'customer' }: { role?: 'customer' | 'technician' }) {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const items = role === 'technician' ? techNavItems : navItems;
  const isActive = (href: string) => location === href || (href !== '/' && location.startsWith(href.split('#')[0]) && !href.includes('#'));
  const content = (
    <aside className="flex h-full w-[260px] flex-col bg-sidebar px-4 py-5 text-sidebar-foreground">
      <div className="mb-9 flex items-center justify-between px-2">
        <BrandMark dark />
        <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden" aria-label="Close menu" data-testid="button-close-menu"><X size={18} /></button>
      </div>
      <div className="mb-6 rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-display font-bold text-primary-foreground">{role === 'technician' ? 'RK' : 'AM'}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{role === 'technician' ? 'Ravi Kumar' : 'Aarav Mehta'}</p>
            <p className="truncate text-xs text-sidebar-foreground/55">{role === 'technician' ? 'Verified technician' : 'Customer account'}</p>
          </div>
          <ChevronDown size={15} className="ml-auto text-sidebar-foreground/50" />
        </div>
      </div>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-sidebar-foreground/40">Workspace</p>
      <nav className="space-y-1" aria-label="App navigation">
        {items.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${isActive(href) ? 'bg-primary text-primary-foreground shadow-sm' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`} data-testid={`link-sidebar-${label.toLowerCase().replaceAll(' ', '-')}`}>
            <Icon size={18} strokeWidth={isActive(href) ? 2.5 : 2} /><span>{label}</span>
            {label === 'My requests' && <span className="ml-auto rounded-full bg-sidebar-foreground/10 px-2 py-0.5 text-[10px]">2</span>}
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-1">
        <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground" data-testid="link-sidebar-settings"><Settings2 size={18} /> Settings</Link>
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground" data-testid="link-sidebar-sign-out"><LogOut size={18} /> Sign out</Link>
        <div className="mt-5 border-t border-sidebar-border px-3 pt-5 text-xs text-sidebar-foreground/40">KaamKhojo <span className="mx-1">•</span> Made for your mohalla</div>
      </div>
    </aside>
  );
  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed left-4 top-4 z-30 rounded-xl border border-border bg-card p-2.5 text-foreground shadow-sm md:hidden" aria-label="Open menu" data-testid="button-open-menu"><Menu size={20} /></button>
      <div className={`fixed inset-0 z-50 md:hidden ${open ? 'visible' : 'invisible'}`}>
        <button onClick={() => setOpen(false)} className={`absolute inset-0 bg-foreground/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} aria-label="Close navigation overlay" data-testid="button-menu-overlay" />
        <div className={`relative h-full w-[280px] transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>{content}</div>
      </div>
      <div className="fixed inset-y-0 left-0 z-20 hidden md:block">{content}</div>
    </>
  );
}

export function AppTopbar({ role = 'customer', title }: { role?: 'customer' | 'technician'; title: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-border/70 bg-background/85 px-5 backdrop-blur-xl md:px-10">
      <div className="pl-12 md:pl-0">
        <p className="text-[11px] font-bold uppercase tracking-[.16em] text-muted-foreground">KaamKhojo / {role === 'technician' ? 'Technician desk' : 'My home'}</p>
        <h1 className="mt-0.5 font-display text-xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full bg-accent/60 px-3 py-2 text-xs font-bold text-accent-foreground sm:flex"><span className="animate-pulse-dot h-2 w-2 rounded-full bg-teal-600" /> {role === 'technician' ? 'You are available' : 'Bengaluru, 560038'}</div>
        <button className="relative rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Notifications" data-testid="button-notifications"><Bell size={19} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" /></button>
        <Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-display font-bold text-primary-foreground transition-transform hover:-rotate-3" data-testid="link-topbar-profile">{role === 'technician' ? 'RK' : 'AM'}</Link>
      </div>
    </header>
  );
}

export function MobileBottomNav({ role = 'customer' }: { role?: 'customer' | 'technician' }) {
  const [location] = useLocation();
  const items = role === 'technician'
    ? [
        { label: 'Home', href: '/technician-dashboard', icon: Home },
        { label: 'Jobs', href: '/technician-dashboard#jobs', icon: CalendarDays },
        { label: 'Earnings', href: '/technician-dashboard#earnings', icon: BriefcaseBusiness },
        { label: 'Profile', href: '/profile', icon: UserRound },
      ]
    : [
        { label: 'Home', href: '/customer-dashboard', icon: Home },
        { label: 'Find', href: '/customer-dashboard#find', icon: Search },
        { label: 'Requests', href: '/customer-dashboard#requests', icon: FileText },
        { label: 'Profile', href: '/profile', icon: UserRound },
      ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map(({ label, href, icon: Icon }) => {
          const isActive = location === href || (href.includes('#') && location === href.split('#')[0]);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition-colors ${isActive ? 'bg-primary/15 text-[#96670b]' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              data-testid={`link-mobile-${label.toLowerCase()}`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Shell({ children, role = 'customer', title }: { children: ReactNode; role?: 'customer' | 'technician'; title: string }) {
  return <div className="min-h-[100dvh] bg-background"><AppSidebar role={role} /><div className="md:pl-[260px]"><AppTopbar role={role} title={title} /><main className="mx-auto max-w-[1480px] px-5 pb-24 pt-7 md:px-10 md:py-9">{children}</main></div><MobileBottomNav role={role} /></div>;
}

export function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-primary">{eyebrow}</p><h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></div>{action}</div>;
}

export function Skeleton({ className = '' }: { className?: string }) { return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />; }

export function QueryState({ loading, error, empty, onRetry, children }: { loading: boolean; error: boolean; empty?: boolean; onRetry: () => void; children: ReactNode }) {
  if (loading) return <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div>;
  if (error) return <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center"><CircleHelp className="mx-auto mb-3 text-destructive" size={26} /><h3 className="font-display text-xl font-bold">That didn’t load</h3><p className="mt-1 text-sm text-muted-foreground">Please try again. Your place in the app is safe.</p><button onClick={onRetry} className="mt-5 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-secondary-foreground" data-testid="button-retry">Try again</button></div>;
  if (empty) return <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center"><Sparkles className="mx-auto mb-3 text-primary" size={26} /><h3 className="font-display text-xl font-bold">Nothing here yet</h3><p className="mt-1 text-sm text-muted-foreground">The right local expert will show up here soon.</p></div>;
  return <>{children}</>;
}

export function StatCard({ label, value, detail, icon: Icon, tone = 'yellow' }: { label: string; value: string | number; detail: string; icon: typeof Zap; tone?: 'yellow' | 'teal' | 'ink' | 'coral' }) {
  const colors = { yellow: 'bg-primary/15 text-primary-foreground', teal: 'bg-accent text-accent-foreground', ink: 'bg-secondary text-secondary-foreground', coral: 'bg-[#f5d8d2] text-[#9b4036]' };
  return <div className="rounded-2xl border border-card-border bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5"><div className="flex items-start justify-between"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[tone]}`}><Icon size={18} /></span><span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">This month</span></div><p className="mt-5 font-display text-3xl font-bold">{value}</p><p className="mt-1 text-sm font-semibold">{label}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const style = key.includes('complete') ? 'bg-accent text-accent-foreground' : key.includes('confirm') || key.includes('accept') ? 'bg-primary/25 text-[#79510b]' : key.includes('pending') ? 'bg-muted text-muted-foreground' : 'bg-[#f5d8d2] text-[#9b4036]';
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${style}`} data-testid={`status-${status}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>;
}

export function TechnicianCard({ technician, onSave }: { technician: Technician; onSave: (id: string) => void }) {
  return <article className="group rounded-2xl border border-card-border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md" data-testid={`card-technician-${technician.id}`}>
    <div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary font-display font-bold text-secondary-foreground">{technician.avatar || technician.name.slice(0, 2)}</div><div><h3 className="font-bold">{technician.name}</h3><p className="text-xs text-muted-foreground">{technician.specialty}</p></div></div><button onClick={() => onSave(technician.id)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-[#f5d8d2] hover:text-[#9b4036]" aria-label={`Save ${technician.name}`} data-testid={`button-save-technician-${technician.id}`}><Heart size={17} /></button></div>
    <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1 font-bold text-foreground"><Star size={14} fill="currentColor" className="text-primary" /> {technician.rating}</span><span>({technician.reviewCount} reviews)</span><span className="ml-auto inline-flex items-center gap-1"><MapPin size={13} /> {technician.distance}</span></div>
    <div className="mt-4 flex items-center justify-between border-t border-border pt-3"><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><span className={`h-1.5 w-1.5 rounded-full ${technician.availableToday ? 'bg-teal-600' : 'bg-muted-foreground'}`} />{technician.availableToday ? 'Available today' : 'Next slot tomorrow'}</span><button className="inline-flex items-center gap-1 text-xs font-bold text-foreground transition-colors hover:text-[#9b6b0a]" onClick={() => alert(`Requesting ${technician.name}`)} data-testid={`button-request-technician-${technician.id}`}>View & request <ArrowRight size={13} /></button></div>
  </article>;
}

export function RequestRow({ request, compact = false }: { request: Request; compact?: boolean }) {
  return <div className={`flex flex-col gap-3 ${compact ? 'py-3' : 'rounded-2xl border border-card-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between'}`} data-testid={`row-request-${request.id}`}><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><Wrench size={17} /></div><div><p className="text-sm font-bold">{request.service}</p><p className="mt-0.5 text-xs text-muted-foreground">{request.technicianName} <span className="mx-1">•</span> {request.schedule}</p></div></div><div className="flex items-center justify-between gap-5 pl-[52px] sm:pl-0"><span className="font-display font-bold">₹{request.amount.toLocaleString('en-IN')}</span><StatusBadge status={request.status} /></div></div>;
}

export function CategoryTile({ category, onClick }: { category: Category; onClick: () => void }) {
  const icons: Record<string, typeof Zap> = { bolt: Zap, droplet: Wrench, snowflake: Sparkles, bike: BriefcaseBusiness, refrigerator: SlidersHorizontal, car: Wrench };
  const Icon = icons[category.icon] || Wrench;
  return <button onClick={onClick} className="group rounded-2xl border border-card-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md" data-testid={`button-category-${category.id}`}><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-[#96670b] transition-transform group-hover:rotate-6"><Icon size={20} /></span><p className="mt-4 font-bold">{category.name}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{category.description}</p><p className="mt-3 text-xs font-bold text-[#96670b]">From ₹{category.startingPrice}</p></button>;
}

export function SearchField({ value, onChange, onSubmit }: { value: string; onChange: (value: string) => void; onSubmit: () => void }) {
  return <div className="flex max-w-2xl items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"><Search className="ml-3 text-muted-foreground" size={19} /><input value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSubmit()} placeholder="What needs fixing at home?" className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-sm font-medium outline-none placeholder:text-muted-foreground/70" data-testid="input-service-search" /><button onClick={onSubmit} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5" data-testid="button-search-services">Search</button></div>;
}

export function ToastNote({ message, onClose }: { message: string; onClose: () => void }) {
  return <div className="fixed bottom-5 right-5 z-[60] flex max-w-[calc(100vw-40px)] items-center gap-3 rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-xl animate-rise-in"><Check size={17} className="text-primary" />{message}<button onClick={onClose} className="ml-2 rounded-lg p-1 hover:bg-secondary-foreground/10" aria-label="Close message" data-testid="button-close-toast"><X size={15} /></button></div>;
}