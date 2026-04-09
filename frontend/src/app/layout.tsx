import "@/app/globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import AuthProvider from "@/components/proveedor/AuthProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "M2Token",
  description: "Plataforma para tokenización de proyectos inmobiliarios",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className="dark"> 
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased",
          inter.className
        )}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}