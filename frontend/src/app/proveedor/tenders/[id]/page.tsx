'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tendersService } from '@/services/tendersService';
import { bidsService } from '@/services/bidsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Loader2, 
  ArrowLeft, 
  DollarSign, 
  CalendarDays, 
  MapPin, 
  Building2, 
  Send, 
  CheckCircle2,
  LayoutGrid,
  AlertTriangle,
  MessageSquareText
} from 'lucide-react';
import Link from 'next/link';

export default function TenderApplyPage() {
  const params = useParams();
  const router = useRouter();
  const tenderId = params.id as string;
  
  const [tender, setTender] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [amount, setAmount] = useState<number | ''>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const tenderData = await tendersService.getById(tenderId);
        setTender(tenderData.data || tenderData);
      } catch (error) {
        console.error("Error cargando licitación:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tenderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError("Ingresa un monto válido por m².");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await bidsService.create({
        tender: tenderId,
        amount: Number(amount),
        message
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al enviar la postulación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 animate-pulse min-h-screen">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-10 w-10 bg-gray-200 rounded-xl" />
          <div className="space-y-2"><div className="h-8 w-64 bg-gray-200 rounded-md" /><div className="h-4 w-96 bg-gray-100 rounded-md" /></div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-96 bg-gray-100 rounded-2xl border border-gray-200" />
          <div className="h-96 bg-gray-100 rounded-2xl border border-gray-200" />
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-brand-dark">Licitación no encontrada</h2>
        <p className="text-gray-500">Es posible que haya sido eliminada o ya no esté disponible.</p>
        <Button variant="outline" onClick={() => router.push('/proveedor/tenders')}>Volver al Mercado</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-6rem)]">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-start sm:items-center gap-4">
          <Link href="/proveedor/tenders">
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-gray-200 text-gray-500 hover:text-brand-dark hover:bg-gray-100 shrink-0 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-dark line-clamp-1">{tender.title}</h2>
            <div className="flex flex-wrap items-center text-sm font-medium text-gray-500 mt-2 gap-4">
              <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-md text-brand-dark">
                 <Building2 className="h-4 w-4 text-brand-blue"/> {tender.company?.name || tender.company?.razonSocial || 'Empresa Privada'}
              </span>
              <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-md text-brand-dark">
                 <MapPin className="h-4 w-4 text-brand-salmon"/> {tender.project?.address || 'Ubicación oculta'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-2xl border-gray-100 shadow-md shadow-brand-dark/5 overflow-hidden bg-white">
            <div className="h-1.5 w-full bg-brand-blue" />
            <CardHeader className="bg-white border-b border-gray-50 pb-5 pt-6 px-6 sm:px-8">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-brand-dark flex items-center gap-2">
                  Detalles del Trabajo
                </CardTitle>
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-brand-light/20 text-brand-blue px-3 py-1.5 rounded-md border border-brand-light/30">
                    <LayoutGrid className="h-3.5 w-3.5" />
                    {tender.category?.label || 'General'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-8">
              
              <div>
                <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Descripción del Trabajo</h3>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed font-medium bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                  {tender.description || "No hay una descripción detallada disponible."}
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 flex flex-col justify-center">
                  <h3 className="text-[10px] font-bold text-emerald-700/70 mb-1 uppercase tracking-wider">Presupuesto Tope (Referencia)</h3>
                  <div className="flex items-end text-3xl font-extrabold text-emerald-600">
                    <DollarSign className="h-6 w-6 mr-1 mb-1 opacity-70" />
                    {tender.budgetM2?.toLocaleString() || '0'} <span className="text-sm font-bold text-emerald-600/70 ml-1 mb-1">/m²</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 flex flex-col justify-center">
                  <h3 className="text-[10px] font-bold text-blue-700/70 mb-1 uppercase tracking-wider">Fecha Límite Postulación</h3>
                  <div className="flex items-center text-2xl font-extrabold text-brand-blue">
                    <CalendarDays className="h-6 w-6 mr-2 opacity-70" />
                    {tender.deadline ? new Date(tender.deadline).toLocaleDateString() : 'No definida'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="rounded-2xl border-brand-salmon/20 shadow-xl shadow-brand-salmon/5 sticky top-28 overflow-hidden bg-white">
            <div className="h-1.5 w-full bg-brand-salmon" />
            <CardHeader className="bg-gradient-to-b from-red-50/50 to-white pb-5 pt-6 px-6">
              <CardTitle className="text-xl font-extrabold text-brand-dark">Enviar Propuesta</CardTitle>
              <CardDescription className="text-gray-500 font-medium">
                Haz tu mejor oferta económica para adjudicarte esta obra.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              
              {success ? (
                <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-brand-dark mb-1">¡Propuesta Enviada!</h3>
                    <p className="text-sm text-gray-500 font-medium px-4">
                      La empresa revisará tu oferta. Te notificaremos de inmediato si resultas adjudicado.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-6 h-11 rounded-xl border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-all font-bold" 
                    onClick={() => router.push('/proveedor/tenders')}
                  >
                    Volver al Mercado
                  </Button>
                </div>
              ) : (

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tu precio por m² <span className="text-brand-salmon">*</span></label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input 
                        className="pl-10 h-12 rounded-xl border-gray-200 focus-visible:ring-brand-salmon font-extrabold text-brand-dark text-lg"
                        type="number" 
                        placeholder="0.00" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                        min="1"
                        step="0.01"
                      />
                    </div>
                    {amount !== '' && amount > tender.budgetM2 && (
                      <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700 font-bold flex items-start gap-1.5 mt-2 animate-in fade-in">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <p>Tu oferta supera el presupuesto de referencia indicado por la empresa.</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mensaje de presentación (Opcional)</label>
                    <div className="relative">
                      <MessageSquareText className="absolute left-3 top-3.5 h-4.5 w-4.5 text-gray-400" />
                      <textarea 
                        className="flex min-h-[120px] w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:cursor-not-allowed disabled:opacity-50 resize-y font-medium text-brand-dark"
                        placeholder="Cuéntales por qué tu equipo o tú son la mejor opción para ejecutar este trabajo..." 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <Button 
                        type="submit" 
                        className="w-full h-12 rounded-xl bg-brand-dark hover:bg-brand-dark/90 text-white shadow-xl shadow-brand-dark/20 font-bold transition-transform hover:-translate-y-0.5 text-base" 
                        disabled={isSubmitting || amount === ''}
                    >
                      {isSubmitting ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Procesando...</>
                      ) : (
                        <><Send className="mr-2 h-5 w-5 text-brand-salmon" /> Enviar Postulación</>
                      )}
                    </Button>
                  </div>
                </form>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}