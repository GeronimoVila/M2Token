import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/admin/UserNav";
import { LayoutDashboard, Building2, FileText, Users } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">M2Token</h1>
          <p className="text-sm text-slate-400">Panel de Administración</p>
        </div>

        <nav className="flex-1 space-y-2">
          {/* Dashboard */}
          <Link href="/admin" className="block">
            <Button variant="ghost" className="w-full justify-start hover:bg-slate-800 hover:text-white">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>

          {/* Proyectos */}
          <Link href="/admin/projects" className="block">
            <Button variant="ghost" className="w-full justify-start hover:bg-slate-800 hover:text-white">
              <Building2 className="mr-2 h-4 w-4" />
              Proyectos
            </Button>
          </Link>

          {/* Remitos */}
          <Link href="/admin/remitos" className="block">
            <Button variant="ghost" className="w-full justify-start hover:bg-slate-800 hover:text-white">
              <FileText className="mr-2 h-4 w-4" />
              Remitos
            </Button>
          </Link>

          {/* Usuarios (Solo visible para admin eventualmente) */}
          <Link href="/admin/users" className="block">
            <Button variant="ghost" className="w-full justify-start hover:bg-slate-800 hover:text-white">
              <Users className="mr-2 h-4 w-4" />
              Usuarios
            </Button>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-700">
           <UserNav />
        </div>
      </aside>

      <main className="flex-1 bg-background p-8">
        {children}
      </main>
    </div>
  );
}