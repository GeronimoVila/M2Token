"use client";

import { useState } from "react";
import { canjesService } from "@/services/canjesService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  projectId: string;
  onSuccess: () => void; 
}

export function CreateCanjeModal({ projectId, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [amount, setAmount] = useState("");
  const [tipo, setTipo] = useState<"DINERO" | "ACTIVO">("DINERO");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const amountNum = Number(amount);
      if (!amountNum || amountNum <= 0) throw new Error("La cantidad debe ser mayor a 0");

      await canjesService.createCanje({
        projectId,
        amountTokens: amountNum,
        tipo,
        descripcionActivo: tipo === "ACTIVO" ? "Solicitud de Unidad Funcional" : undefined
      });

      setOpen(false);
      setAmount("");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Error al crear la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Solicitar Retiro
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle>Solicitar Canje de Tokens</DialogTitle>
          <DialogDescription>
            Tus tokens serán "bloqueados" hasta que la empresa apruebe el pago o la entrega del activo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Tipo de Canje</Label>
            <Select 
                value={tipo} 
                onValueChange={(val: any) => setTipo(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="DINERO">Dinero (Transferencia)</SelectItem>
                <SelectItem value="ACTIVO">Activo (Inmueble)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cantidad de Tokens a Quemar</Label>
            <Input
              type="number"
              placeholder="Ej: 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
            />
            <p className="text-xs text-slate-500">
              {tipo === 'DINERO' 
                ? 'Recibirás el equivalente en moneda fiat.' 
                : 'Se requiere el total de tokens de la unidad.'}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Solicitud
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}