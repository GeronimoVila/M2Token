"use client";

import { useState } from "react";
import { canjesService } from "@/services/canjesService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowRightLeft, AlertTriangle, Building2, Banknote, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

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
      if (!amountNum || amountNum <= 0) throw new Error("La cantidad de tokens debe ser mayor a 0");

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
      const backendError = err.response?.data?.error || err.response?.data?.message;
      
      if (Array.isArray(backendError)) {
        setError(backendError.join(', '));
      } else {
        setError(backendError || err.message || "Error al crear la solicitud de canje");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setError("");
    }}>
      <DialogTrigger asChild>
        <Button className="h-11 rounded-xl bg-brand-dark hover:bg-brand-dark/90 text-white font-bold w-full sm:w-auto shadow-lg shadow-brand-dark/20 transition-transform hover:-translate-y-0.5">
          <ArrowRightLeft className="mr-2 h-4 w-4" /> Solicitar Canje
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] bg-white text-brand-dark rounded-2xl overflow-hidden border-0 shadow-2xl p-0">
        
        <div className="h-1.5 w-full bg-brand-salmon" />

        <div className="px-6 pt-6 pb-2">
            <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-brand-dark flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-brand-salmon" />
                Solicitar Canje de Tokens
            </DialogTitle>
            <DialogDescription className="font-medium text-gray-500 mt-1">
                Tus tokens serán "bloqueados" temporalmente hasta que la empresa apruebe el pago o la entrega del inmueble.
            </DialogDescription>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6 pt-2">
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span className="leading-tight">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo de Retiro</Label>
            <Select 
                value={tipo} 
                onValueChange={(val: any) => setTipo(val)}
            >
              <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:ring-brand-salmon font-medium text-brand-dark">
                <SelectValue placeholder="Selecciona el tipo de canje" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white">
                <SelectItem value="DINERO" className="focus:bg-brand-salmon/10 font-medium cursor-pointer">
                    <div className="flex items-center gap-2 text-brand-dark">
                        <Banknote className="h-4 w-4 text-emerald-600 " />
                        Dinero (Transferencia Fiat)
                    </div>
                </SelectItem>
                <SelectItem value="ACTIVO" className="focus:bg-brand-salmon/10 font-medium cursor-pointer">
                    <div className="flex items-center gap-2 text-brand-dark">
                        <Building2 className="h-4 w-4 text-brand-blue" />
                        Activo (Inmueble / Unidad)
                    </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cantidad de Tokens a Canjear</Label>
            <div className="relative">
                <Flame className="absolute left-3 top-3 h-5 w-5 text-brand-salmon/50" />
                <Input
                    type="number"
                    placeholder="Ej: 500"
                    className="pl-10 h-11 rounded-xl border-gray-200 focus-visible:ring-brand-salmon font-extrabold text-brand-dark text-lg"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    step="0.01"
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Tokens m²
                </span>
            </div>
            
            <div className={cn("p-3 rounded-lg border text-xs font-medium flex items-start gap-2 mt-2", 
                tipo === 'DINERO' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-blue-50 border-blue-100 text-blue-700"
            )}>
                {tipo === 'DINERO' ? (
                   <>
                     <Banknote className="h-4 w-4 shrink-0 mt-0.5" />
                     <p>Recibirás el equivalente en tu cuenta bancaria (Moneda Fiat). Asegúrate de tener tu CBU cargado en tu Perfil.</p>
                   </>
                ) : (
                   <>
                     <Building2 className="h-4 w-4 shrink-0 mt-0.5" />
                     <p>Se requiere que la cantidad de tokens cubra el 100% del valor de la unidad funcional a escriturar.</p>
                   </>
                )}
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-11 rounded-xl border-gray-200 font-bold text-gray-600">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !amount} className="h-11 rounded-xl bg-brand-salmon hover:bg-brand-salmon/90 text-white font-bold shadow-md shadow-brand-salmon/20">
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</>
              ) : (
                <><Flame className="mr-2 h-4 w-4 text-orange-200" /> Confirmar Solicitud</>
              )}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}