    'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tendersService } from '@/services/tendersService';
import { bidsService } from '@/services/bidsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, DollarSign, Calendar, MapPin, Building2, Send, CheckCircle2 } from 'lucide-react';
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
    return <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-brand-blue h-10 w-10" /></div>;
  }

  if (!tender) {
    return <div className="text-center py-20 text-gray-500">Licitación no encontrada.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      <div className="flex items-center gap-4">
        <Link href="/proveedor/tenders">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-dark">{tender.title}</h2>
          <div className="flex items-center text-sm text-gray-500 mt-1 gap-3">
            <span className="flex items-center"><Building2 className="h-4 w-4 mr-1"/> {tender.company?.name || 'Empresa'}</span>
            <span className="flex items-center text-brand-salmon"><MapPin className="h-4 w-4 mr-1"/> {tender.project?.address || 'Ubicación oculta'}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Detalles del Trabajo</CardTitle>
                <Badge className="bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 border-none">{tender.category?.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Descripción</h3>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{tender.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="text-xs font-semibold text-green-800 mb-1 uppercase tracking-wider">Presupuesto Tope</h3>
                  <div className="flex items-center text-2xl font-bold text-green-700">
                    <DollarSign className="h-6 w-6 mr-1" />
                    {tender.budgetM2?.toLocaleString()} <span className="text-sm font-normal text-green-600 ml-1">/m²</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="text-xs font-semibold text-blue-800 mb-1 uppercase tracking-wider">Fecha Límite</h3>
                  <div className="flex items-center text-xl font-bold text-brand-blue">
                    <Calendar className="h-5 w-5 mr-2" />
                    {new Date(tender.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-lg border-brand-salmon/20 sticky top-24">
            <CardHeader className="bg-brand-salmon text-white rounded-t-xl">
              <CardTitle>Enviar Postulación</CardTitle>
              <CardDescription className="text-brand-salmon-foreground text-white/80">Haz tu mejor oferta para ganar esta obra.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              
              {success ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-green-800">¡Postulación Enviada!</h3>
                  <p className="text-sm text-gray-600">La empresa revisará tu propuesta. Te notificaremos si eres el adjudicado.</p>
                  <Button variant="outline" className="w-full mt-4" onClick={() => router.push('/proveedor/tenders')}>
                    Volver al Mercado
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Tu precio por m²</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 font-bold">$</span>
                      <Input 
                        className="pl-7 text-lg font-bold text-brand-dark"
                        type="number" 
                        placeholder="0.00" 
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        required
                        max={tender.budgetM2}
                      />
                    </div>
                    {amount && amount > tender.budgetM2 && (
                      <p className="text-xs text-red-500 font-medium">⚠️ Tu oferta supera el presupuesto tope de la empresa.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Mensaje de presentación (Opcional)</label>
                    <textarea 
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Cuéntales por qué eres la mejor opción para este trabajo..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white mt-4" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Enviar Propuesta
                  </Button>
                </form>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}