import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { clientsApi, Client, CreateClientPayload } from "@/lib/api";

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSave: () => void;
}

const ClientDialog = ({ open, onOpenChange, client, onSave }: ClientDialogProps) => {
  const [formData, setFormData] = useState<CreateClientPayload>({
    client_id: "",
    client_name: "",
    client_secret: "",
    grant_types: ["client_credentials"],
    redirect_uris: [],
    scopes: ["scim.read"],
    access_token_ttl: 3600,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        client_id: client.client_id,
        client_name: client.client_name,
        client_secret: client.client_secret || "",
        grant_types: client.grant_types,
        redirect_uris: client.redirect_uris,
        scopes: client.scopes,
        access_token_ttl: client.access_token_ttl,
      });
    } else {
      // Gerar client_secret automaticamente para novos clients
      setFormData({
        client_id: "",
        client_name: "",
        client_secret: crypto.randomUUID(),
        grant_types: ["client_credentials"],
        redirect_uris: [],
        scopes: ["scim.read"],
        access_token_ttl: 3600,
      });
    }
  }, [client, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id.trim() || !formData.client_name.trim()) {
      toast.error("Client ID e nome são obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      if (client) {
        await clientsApi.update(client.id, formData);
        toast.success("Client atualizado com sucesso!");
      } else {
        await clientsApi.create(formData);
        toast.success("Client criado com sucesso!");
      }
      onSave();
    } catch (error) {
      console.error("Erro ao salvar client:", error);
      toast.error("Erro ao salvar client");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArrayChange = (field: "grant_types" | "redirect_uris" | "scopes", value: string) => {
    const array = value.split(",").map((item) => item.trim()).filter((item) => item);
    setFormData({ ...formData, [field]: array });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? "Editar Client" : "Criar Novo Client"}</DialogTitle>
          <DialogDescription>
            {client
              ? "Atualize as informações do client OAuth2"
              : "Preencha as informações para criar um novo client OAuth2"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client ID *</Label>
              <Input
                id="client_id"
                placeholder="my-client"
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                required
                disabled={!!client}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_name">Nome do Client *</Label>
              <Input
                id="client_name"
                placeholder="My Application"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_secret">Client Secret</Label>
            <Input
              id="client_secret"
              placeholder="Auto-gerado"
              value={formData.client_secret}
              onChange={(e) => setFormData({ ...formData, client_secret: e.target.value })}
              disabled
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">Gerado automaticamente</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grant_types">Grant Types (separados por vírgula)</Label>
            <Input
              id="grant_types"
              placeholder="client_credentials, authorization_code"
              value={formData.grant_types.join(", ")}
              onChange={(e) => handleArrayChange("grant_types", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="redirect_uris">Redirect URIs (separados por vírgula)</Label>
            <Textarea
              id="redirect_uris"
              placeholder="https://myapp.com/callback, https://myapp.com/callback2"
              value={formData.redirect_uris.join(", ")}
              onChange={(e) => handleArrayChange("redirect_uris", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scopes">Scopes (separados por vírgula)</Label>
            <Input
              id="scopes"
              placeholder="openid, profile, scim.read, scim.write"
              value={formData.scopes.join(", ")}
              onChange={(e) => handleArrayChange("scopes", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_token_ttl">Access Token TTL (segundos)</Label>
            <Input
              id="access_token_ttl"
              type="number"
              min="60"
              value={formData.access_token_ttl}
              onChange={(e) =>
                setFormData({ ...formData, access_token_ttl: parseInt(e.target.value) })
              }
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : client ? "Atualizar" : "Criar Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDialog;
