/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PRICING_PLANS } from '../data/pricingData';
import { PricingPlan } from '../types';
import { Eye, Calendar, Sparkles, AlertCircle } from 'lucide-react';

interface FullComparisonTableProps {
  onSelectPlan: (plan: PricingPlan) => void;
  activePlanId: number;
}

export default function FullComparisonTable({
  onSelectPlan,
  activePlanId
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
          <h3 className="text-base font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Matriz Completa de Preços
          </h3>
          <p className="text-xs text-emerald-100/70 mt-1">
            Veja todas as opções e parcelamentos consolidados de uma só vez para facilitar consultas rápidas.
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
              <th className="py-4 px-5">Título / Família</th>
              <th className="py-4 px-4 text-emerald-950 font-extrabold bg-emerald-50/40">R$ À Vista</th>
              <th className="py-4 px-4">Cartão 12x (S/ Juros)</th>
              <th className="py-4 px-4 text-teal-900 bg-teal-50/20">Recorrente (30x)</th>
              <th className="py-4 px-4 text-indigo-900 bg-indigo-50/20">Boleto (30x)</th>
              <th className="py-4 px-4 text-center">Hospedagem</th>
              <th className="py-4 px-5 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150">
            {PRICING_PLANS.map((plan) => {
              const isActive = activePlanId === plan.id;
              
              // Per person cost for A Vista
              const ppVista = plan.prices.vista / plan.peopleCount;

              return (
                <tr 
                  key={plan.id}
                  className={`hover:bg-emerald-50/20 transition-colors group ${
                    isActive ? 'bg-emerald-50/40 font-medium' : ''
                  }`}
                >
                  
                  {/* Title & Badge */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isActive ? 'bg-emerald-900 text-white' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {plan.peopleCount}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          {plan.peopleCount === 1 ? '1 Pessoa' : `${plan.peopleCount} Pessoas`}
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {formatCurrency(ppVista)} por pessoa
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* À Vista */}
                  <td className="py-4 px-4 font-bold text-emerald-900 bg-emerald-50/10">
                    <div className="text-xs font-black">{formatCurrency(plan.prices.vista)}</div>
                    <div className="text-[9px] text-emerald-700 font-medium font-mono">1 Parcela</div>
                  </td>

                  {/* Cartão 12x */}
                  <td className="py-4 px-4 text-gray-900">
                    <div className="text-xs font-bold">{formatCurrency(plan.prices.cartao_12x)}</div>
                    <div className="text-[9px] text-gray-500 font-mono">
                      12x de {formatCurrency(plan.prices.cartao_12x / 12)}
                    </div>
                  </td>

                  {/* Crédito Recorrente */}
                  <td className="py-4 px-4 bg-teal-50/10">
                    <div className="text-xs font-bold text-teal-950">{formatCurrency(plan.prices.recorrente.total)}</div>
                    <div className="text-[9px] text-teal-800 font-mono">
                      Entrada: {formatCurrency(plan.prices.recorrente.entrance)}
                    </div>
                    <div className="text-[9px] font-bold text-emerald-700 font-mono">
                      30x de {formatCurrency(plan.prices.recorrente.installmentValue)}
                    </div>
                  </td>

                  {/* Boleto Direct */}
                  <td className="py-4 px-4 bg-indigo-50/10">
                    <div className="text-xs font-bold text-indigo-950">{formatCurrency(plan.prices.boleto.total)}</div>
                    <div className="text-[9px] text-indigo-800 font-mono">
                      Entrada: {formatCurrency(plan.prices.boleto.entrance)}
                    </div>
                    <div className="text-[9px] font-bold text-indigo-700 font-mono">
                      30x de {formatCurrency(plan.prices.boleto.installmentValue)}
                    </div>
                  </td>

                  {/* Lodging Nights */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{plan.lodgingNights} diárias</span>
                    </span>
                  </td>

                  {/* Quick Select Button */}
                  <td className="py-4 px-5 text-right">
                    <button
                      type="button"
                      id={`table-select-${plan.id}`}
                      onClick={() => onSelectPlan(plan)}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-950 text-white border-emerald-950'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-emerald-700'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Ativo' : 'Visualizar'}</span>
                    </button>
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
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
          <span><strong>Dica do Corretor:</strong> Clique em &quot;Visualizar&quot; para carregar os dados detalhados no simulador e configurar propostas para os clientes.</span>
        </div>
        <div className="text-gray-400 font-mono">
          Nº de títulos disponíveis para venda imediata: Limitados
        </div>
      </div>

    </div>
  );
}
