import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Plus, Key, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  client_id: string;
  client_secret: string;
  created_at: string;
}

const Index = () => {
  const [clients, setClients] = useState<Client[]>([
    {
      id: "1",
      name: "Production App",
      client_id: "prod_7h9k2m4n5p",
      client_secret: "sk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      created_at: "2025-01-15",
    },
    {
      id: "2",
      name: "Staging Environment",
      client_id: "stg_x3y4z5a6b7",
      client_secret: "sk_test_q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
      created_at: "2025-01-20",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");

  const generateClientSecret = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let secret = "sk_live_";
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const generateClientId = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "cli_";
    for (let i = 0; i < 12; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  const handleCreateClient = () => {
    if (!newClientName.trim()) {
      toast.error("Por favor, insira um nome para o client");
      return;
    }

    const newClient: Client = {
      id: Date.now().toString(),
      name: newClientName,
      client_id: generateClientId(),
      client_secret: generateClientSecret(),
      created_at: new Date().toISOString().split("T")[0],
    };

    setClients([...clients, newClient]);
    setNewClientName("");
    setIsDialogOpen(false);
    toast.success("Client criado com sucesso!");
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const handleDelete = (id: string) => {
    setClients(clients.filter((client) => client.id !== id));
    toast.success("Client removido com sucesso!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">SCIM Platform</h1>
              <p className="text-muted-foreground mt-1">Gerencie seus clients e credenciais</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Client
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Client</DialogTitle>
                  <DialogDescription>
                    Insira um nome para o client. As credenciais serão geradas automaticamente.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Client</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Production App"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateClient}>Criar Client</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">Clients Registrados</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Total de {clients.length} {clients.length === 1 ? "client" : "clients"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="relative group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <CardDescription className="text-xs">
                      Criado em {new Date(client.created_at).toLocaleDateString("pt-BR")}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(client.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Client ID */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-3 w-3 text-muted-foreground" />
                    <Label className="text-xs font-medium text-muted-foreground">Client ID</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono text-foreground break-all">
                      {client.client_id}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleCopy(client.client_id, "Client ID")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Client Secret */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-3 w-3 text-muted-foreground" />
                    <Label className="text-xs font-medium text-muted-foreground">Client Secret</Label>
                    <Badge variant="secondary" className="text-xs">Confidencial</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono text-foreground break-all">
                      {client.client_secret}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleCopy(client.client_secret, "Client Secret")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {clients.length === 0 && (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum client cadastrado
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Crie seu primeiro client para começar a testar o serviço SCIM
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Primeiro Client
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Index;
