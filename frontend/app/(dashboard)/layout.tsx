import dynamic from 'next/dynamic';
const DashboardNavbar = dynamic(() => import('@/components/layout/Navbar').then(m => m.DashboardNavbar), { ssr: false });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-50">
      <DashboardNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8 page-enter">
        {children}
      </main>
    </div>
  );
}
