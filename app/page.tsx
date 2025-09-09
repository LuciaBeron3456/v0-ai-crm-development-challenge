import { ClientDashboard } from "@/components/client-dashboard"
import { AdminDrawer } from "@/components/admin-drawer"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { getInitialClients, getTotalClientsCount, getAllClientsForStats } from "@/components/clients-server"

export default async function HomePage() {
  // SSR: Load initial clients, total count, and all clients for stats on the server
  const [initialClients, totalCount, allClientsForStats] = await Promise.all([
    getInitialClients(20),
    getTotalClientsCount(),
    getAllClientsForStats()
  ])

  return (
    <div className="min-h-screen bg-background md:mx-8">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">CRM de Clientes</h1>
            <p className="text-muted-foreground">Gestiona tu cartera de clientes con IA</p>
          </div>
          <AdminDrawer>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Administración
            </Button>
          </AdminDrawer>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 pb-20">
        <ClientDashboard 
          initialClients={initialClients as any} 
          initialTotalCount={totalCount}
          initialAllClients={allClientsForStats as any}
        />
      </main>
    </div>
  )
}
