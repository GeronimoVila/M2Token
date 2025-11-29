export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <p className="text-muted-foreground">
        Bienvenido al panel de control de M2Token.
      </p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="text-sm font-medium">Tokens Totales</div>
          <div className="text-2xl font-bold">$45,231.89</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="text-sm font-medium">Remitos Pendientes</div>
          <div className="text-2xl font-bold">+2350</div>
        </div>
      </div>
    </div>
  )
}