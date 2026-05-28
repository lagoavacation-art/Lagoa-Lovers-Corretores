/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PRICING_PLANS } from '../data/pricingData';
import { PricingPlan } from '../types';
import { Calendar, Sparkles, AlertCircle } from 'lucide-react';

interface FullComparisonTableProps {
  activePlanId: number;
  onSelectPlan?: (plan: PricingPlan) => void;
  onSelectPaymentType?: (type: 'vista' | 'cartao_12x' | 'recorrente' | 'boleto') => void;
}

export default function FullComparisonTable({
  activePlanId,
  onSelectPlan,
  onSelectPaymentType
}: FullComparisonTableProps) {

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      
      {/* Table Header Section with search info */}
      <div className="px-6 py-5 bg-gradient-to-r from-emerald-950 to-emerald-900 border-b border-emerald-800 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2 font-sans">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Matriz Completa de Preços
          </h3>
          <p className="text-xs text-emerald-100/75 mt-1 leading-relaxed">
            Veja as opções consolidadas. <span className="font-bold underline text-amber-300">💡 Dica: Clique em qualquer parcela ou plano para selecioná-lo e atualizar a proposta em tempo real!</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start text-[10px] font-mono tracking-wide text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-md">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>SUJEITO A ALTERAÇÃO</span>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
              <th className="py-4 px-5">Título / Família (clique para selecionar)</th>
              <th className="py-4 px-4 text-emerald-950 font-extrabold bg-emerald-50/40">R$ À Vista</th>
              <th className="py-4 px-4">Cartão 12x (S/ Juros)</th>
              <th className="py-4 px-4 text-teal-900 bg-teal-50/20">Recorrente (30x)</th>
              <th className="py-4 px-4 text-indigo-900 bg-indigo-50/20">Boleto (30x)</th>
              <th className="py-4 px-5 text-center">Hospedagem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150">
            {PRICING_PLANS.map((plan) => {
              const isActive = activePlanId === plan.id;
              
              // Per person cost for A Vista
              const ppVista = plan.prices.vista / plan.peopleCount;

              const handleRowSelect = () => {
                if (onSelectPlan) {
                  onSelectPlan(plan);
                }
              };

              const handleSelectWithPayment = (paymentType: 'vista' | 'cartao_12x' | 'recorrente' | 'boleto') => {
                if (onSelectPlan) onSelectPlan(plan);
                if (onSelectPaymentType) onSelectPaymentType(paymentType);
              };

              return (
                <tr 
                  key={plan.id}
                  className={`hover:bg-emerald-50/20 transition-colors group ${
                    isActive ? 'bg-emerald-50/40 font-medium' : ''
                  }`}
                >
                  
                  {/* Title & Badge */}
                  <td 
                    onClick={handleRowSelect}
                    className="py-4 px-5 cursor-pointer hover:bg-emerald-50 max-w-[200px]"
                    title="Clique para selecionar este produto"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isActive ? 'bg-emerald-950 text-white' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {plan.id === 7 ? 'F' : plan.id === 8 ? 'R' : plan.peopleCount}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 flex flex-wrap items-center gap-1.5">
                          <span>{plan.title}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {plan.id >= 7 ? 'Familiar Completo' : `${formatCurrency(ppVista)} por pessoa`}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* À Vista */}
                  <td 
                    onClick={() => handleSelectWithPayment('vista')}
                    className="py-4 px-4 font-bold text-emerald-900 bg-emerald-50/10 cursor-pointer hover:bg-emerald-100/40 transition-colors"
                    title="Clique para selecionar Plano À Vista"
                  >
                    <div className="text-xs font-black">{formatCurrency(plan.prices.vista)}</div>
                    <div className="text-[9px] text-emerald-700 font-medium font-mono">1 Parcela</div>
                  </td>

                  {/* Cartão 12x */}
                  <td 
                    onClick={() => handleSelectWithPayment('cartao_12x')}
                    className="py-4 px-4 text-gray-900 cursor-pointer hover:bg-emerald-100/20 transition-colors"
                    title="Clique para selecionar Parcelas de Cartão"
                  >
                    <div className="text-xs font-bold">{formatCurrency(plan.prices.cartao_12x)}</div>
                    <div className="text-[9px] text-gray-500 font-mono">
                      12x de {formatCurrency(plan.prices.cartao_12x / 12)}
                    </div>
                  </td>

                  {/* Crédito Recorrente */}
                  <td 
                    onClick={() => handleSelectWithPayment('recorrente')}
                    className="py-4 px-4 bg-teal-50/10 cursor-pointer hover:bg-teal-100/30 transition-colors"
                    title="Clique para selecionar Crédito Recorrente"
                  >
                    <div className="text-xs font-bold text-teal-950">{formatCurrency(plan.prices.recorrente.total)}</div>
                    <div className="text-[9px] text-teal-800 font-mono">
                      Entrada: {formatCurrency(plan.prices.recorrente.entrance)}
                    </div>
                    <div className="text-[9px] font-bold text-emerald-700 font-mono">
                      30x de {formatCurrency(plan.prices.recorrente.installmentValue)}
                    </div>
                  </td>

                  {/* Boleto Direct */}
                  <td 
                    onClick={() => handleSelectWithPayment('boleto')}
                    className="py-4 px-4 bg-indigo-50/10 cursor-pointer hover:bg-indigo-100/30 transition-colors"
                    title="Clique para selecionar Boleto Bancário"
                  >
                    <div className="text-xs font-bold text-indigo-950">{formatCurrency(plan.prices.boleto.total)}</div>
                    <div className="text-[9px] text-indigo-800 font-mono">
                      Entrada: {formatCurrency(plan.prices.boleto.entrance)}
                    </div>
                    <div className="text-[9px] font-bold text-indigo-700 font-mono">
                      30x de {formatCurrency(plan.prices.boleto.installmentValue)}
                    </div>
                  </td>

                  {/* Lodging Nights */}
                  <td className="py-4 px-5 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{plan.lodgingNights} diárias</span>
                    </span>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info panel footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-150 flex flex-col md:flex-row items-center justify-between text-[11px] text-gray-500 gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
          <span><strong>Dica do Corretor:</strong> Clique em qualquer célula da linha para sincronizar a Proposta do WhatsApp imediatamente!</span>
        </div>
        <div className="text-gray-400 font-mono">
          Nº de títulos disponíveis para venda imediata: Limitados
        </div>
      </div>

    </div>
  );
}
