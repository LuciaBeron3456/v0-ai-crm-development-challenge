import { ClientDashboard } from "@/components/client-dashboard"
import { AdminDrawer } from "@/components/admin-drawer"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
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
      <main className="container mx-auto px-4 py-6">
        <ClientDashboard />
      </main>
    </div>
  )
}
