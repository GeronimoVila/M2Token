import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-red-200">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <span className="text-4xl">🚫</span>
          </div>
          <CardTitle className="text-center text-red-600 text-2xl">Acceso Denegado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            No tienes permisos suficientes para acceder a esta página.
            Si crees que es un error, contacta al soporte o intenta iniciar sesión nuevamente.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Link href="/auth/login">
            <Button variant="outline">Ir al Login</Button>
          </Link>
          <Link href="/">
            <Button>Volver al Inicio</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}