/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { PRICING_PLANS } from '../data/pricingData';
import { PricingPlan } from '../types';
import { 
  Users, 
  CreditCard, 
  FileText, 
  PiggyBank, 
  Sparkles, 
  CheckCircle2, 
  TrendingDown, 
  Zap, 
  Percent,
  CalendarDays,
  Info 
} from 'lucide-react';

interface PricingCalculatorProps {
  selectedPlan: PricingPlan;
  onSelectPlan: (plan: PricingPlan) => void;
  selectedPaymentType: 'vista' | 'cartao_12x' | 'recorrente' | 'boleto';
  onSelectPaymentType: (type: 'vista' | 'cartao_12x' | 'recorrente' | 'boleto') => void;
}

export default function PricingCalculator({
  selectedPlan,
  onSelectPlan,
  selectedPaymentType,
  onSelectPaymentType
}: PricingCalculatorProps) {
  const [showInstallmentsDropdown, setShowInstallmentsDropdown] = useState(false);

  // Helper to format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  // Calculations for smart pitch points
  const perPersonVista = selectedPlan.prices.vista / selectedPlan.peopleCount;
  const savingsVsBoleto = selectedPlan.prices.boleto.total - selectedPlan.prices.vista;
  const recurrMonthly = selectedPlan.prices.recorrente.installmentValue;
  const boletoMonthly = selectedPlan.prices.boleto.installmentValue;

  // Relative comparison to 1-person title
  const plan1Vista = PRICING_PLANS[0].prices.vista;
  const costReductionPercentage = selectedPlan.peopleCount > 1 
    ? Math.round((1 - (perPersonVista / plan1Vista)) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
      
      {/* 1. SELETOR DE QUANTIDADE DE PESSOAS */}
      <div className="mb-8">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Users className="w-4.5 h-4.5 text-emerald-600" />
          Selecione o Número de Pessoas do Título:
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {PRICING_PLANS.map((plan) => {
            const isSelected = selectedPlan.id === plan.id;
            const singlePersonCost = plan.prices.vista / plan.peopleCount;
            return (
              <button
                key={plan.id}
                id={`btn-plan-${plan.id}`}
                onClick={() => onSelectPlan(plan)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-900 text-white border-emerald-950 shadow-md transform scale-102 font-medium'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:border-emerald-200'
                }`}
              >
                <span className="text-xl font-bold">{plan.peopleCount}</span>
                <span className="text-[10px] tracking-wide uppercase font-semibold">
                  {plan.peopleCount === 1 ? 'Pessoa' : 'Pessoas'}
                </span>
                <span className={`text-[9px] mt-1 font-mono ${isSelected ? 'text-amber-400' : 'text-gray-400'}`}>
                  {formatCurrency(singlePersonCost)}/p.
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CHIPS DE UPSELL / MÉTRICAS DE IMPACTO COMERCIAL */}
      {selectedPlan.peopleCount > 1 && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-200/50 rounded-lg text-emerald-800">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">Desconto Coletivo Inteligente</h4>
              <p className="text-xs text-emerald-800/90 leading-normal">
                Com o título para <strong className="font-semibold text-emerald-900">{selectedPlan.peopleCount} pessoas</strong>, o custo à vista cai para apenas <strong className="font-bold underline">{formatCurrency(perPersonVista)}</strong> por membro.
              </p>
            </div>
          </div>
          <div className="bg-amber-400 text-emerald-950 font-bold px-3 py-1.5 rounded-lg text-xs tracking-tight flex items-center gap-1 shadow-sm self-stretch sm:self-auto justify-center">
            <TrendingDown className="w-4.5 h-4.5" />
            <span>-{costReductionPercentage}% mais barato por pessoa!</span>
          </div>
        </div>
      )}

      {/* 3. LISTA COMPARATIVA DE PLANOS DE PAGAMENTO */}
      <div className="mb-8">
        <h3 className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap className="w-4.5 h-4.5 text-amber-500" />
          Opções de Pagamento (Selecione um plano para gerar a proposta):
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* CARTÃO À VISTA */}
          <div 
            id="plan-card-vista"
            onClick={() => onSelectPaymentType('vista')}
            className={`relative p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              selectedPaymentType === 'vista'
                ? 'border-emerald-600 bg-emerald-50/25 ring-2 ring-emerald-500/10'
                : 'border-gray-200/80 bg-white hover:border-gray-300'
            }`}
          >
            {selectedPaymentType === 'vista' && (
              <span className="absolute top-3 right-3 text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Selecionado
              </span>
            )}
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-lg bg-amber-500/10 text-amber-700">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold tracking-wider text-amber-700 uppercase">À Vista</span>
                <h4 className="text-2xl font-black text-gray-900 mt-1 font-sans">
                  {formatCurrency(selectedPlan.prices.vista)}
                </h4>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  Melhor opção financeira com desconto imediato de <strong className="text-emerald-700 font-bold">{formatCurrency(savingsVsBoleto)}</strong> em relação ao Boleto.
                </p>
                <div className="mt-3 text-[10px] text-emerald-700 font-mono font-semibold bg-emerald-50 px-2.5 py-1 rounded-md inline-flex items-center gap-1">
                  <span>Equivale a {formatCurrency(perPersonVista)} / p. à vista</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARTÃO DIRETO 12X */}
          <div 
            id="plan-card-cartao_12x"
            onClick={() => onSelectPaymentType('cartao_12x')}
            className={`relative p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              selectedPaymentType === 'cartao_12x'
                ? 'border-emerald-600 bg-emerald-50/25 ring-2 ring-emerald-500/10'
                : 'border-gray-200/80 bg-white hover:border-gray-300'
            }`}
          >
            {selectedPaymentType === 'cartao_12x' && (
              <span className="absolute top-3 right-3 text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Selecionado
              </span>
            )}
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold tracking-wider text-emerald-700 uppercase">Cartão de Crédito</span>
                <h4 className="text-2xl font-black text-gray-900 mt-1 font-sans">
                  {formatCurrency(selectedPlan.prices.cartao_12x)}
                </h4>
                <div className="text-sm font-semibold text-emerald-950 mt-1.5">
                  Até 12x de <strong className="text-base text-emerald-800 font-extrabold">{formatCurrency(selectedPlan.prices.cartao_12x / 12)}</strong> sem juros
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Parcelamento tradicional no cartão de crédito do cliente, quitado direto pela operadora em até 1 ano.
                </p>
                
                <button 
                  id="btn-toggle-installments"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInstallmentsDropdown(!showInstallmentsDropdown);
                  }}
                  className="mt-3.5 text-[10px] text-gray-500 font-semibold hover:text-emerald-700 underline flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  {showInstallmentsDropdown ? 'Ocultar tabela de parcelas' : 'Ver parcelas de 1x a 12x'}
                </button>

                {showInstallmentsDropdown && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-150 grid grid-cols-2 gap-2 text-[10px]">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <div key={m} className="flex justify-between border-b border-gray-200/60 pb-1 font-mono text-gray-600">
                        <span>{m}x:</span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(selectedPlan.prices.cartao_12x / m)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CRÉDITO RECORRENTE (Sem comprometer limite) */}
          <div 
            id="plan-card-recorrente"
            onClick={() => onSelectPaymentType('recorrente')}
            className={`relative p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              selectedPaymentType === 'recorrente'
                ? 'border-emerald-600 bg-emerald-50/25 ring-2 ring-emerald-500/10'
                : 'border-gray-200/80 bg-white hover:border-gray-300'
            }`}
          >
            {selectedPaymentType === 'recorrente' && (
              <span className="absolute top-3 right-3 text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Selecionado
              </span>
            )}
            <div className="absolute top-3 left-44 hidden md:block">
              <span className="bg-amber-400 text-emerald-950 font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                Sem Limite Preso
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-lg bg-teal-100/80 text-teal-700">
                <CreditCard className="w-5 h-5 text-teal-800" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold tracking-wider text-teal-800 uppercase flex items-center gap-1">
                  Crédito Recorrente
                </span>
                <h4 className="text-2xl font-black text-gray-900 mt-1 font-sans">
                  {formatCurrency(selectedPlan.prices.recorrente.total)}
                </h4>
                <div className="mt-2.5 space-y-1 bg-teal-50/80 p-2.5 rounded-lg border border-teal-100">
                  <div className="flex justify-between text-xs text-teal-950">
                    <span>Entrada Facilitada:</span>
                    <strong className="font-extrabold">{formatCurrency(selectedPlan.prices.recorrente.entrance)}</strong>
                  </div>
                  <div className="flex justify-between text-xs text-teal-950 font-medium">
                    <span>Mensalidades:</span>
                    <strong className="text-emerald-800 font-black">
                      30x de {formatCurrency(recurrMonthly)}
                    </strong>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-2.5 leading-relaxed">
                  Sobra de limite inteligente! Só ocupa o valor mensal no cartão do cliente. Ideal para maior fôlego de compra.
                </p>
              </div>
            </div>
          </div>

          {/* BOLETO BANCÁRIO */}
          <div 
            id="plan-card-boleto"
            onClick={() => onSelectPaymentType('boleto')}
            className={`relative p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              selectedPaymentType === 'boleto'
                ? 'border-emerald-600 bg-emerald-50/25 ring-2 ring-emerald-500/10'
                : 'border-gray-200/80 bg-white hover:border-gray-300'
            }`}
          >
            {selectedPaymentType === 'boleto' && (
              <span className="absolute top-3 right-3 text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Selecionado
              </span>
            )}
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-lg bg-indigo-50 text-indigo-700">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold tracking-wider text-indigo-700 uppercase">Boleto Bancário</span>
                <h4 className="text-2xl font-black text-gray-900 mt-1 font-sans">
                  {formatCurrency(selectedPlan.prices.boleto.total)}
                </h4>
                <div className="mt-2.5 space-y-1 bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100">
                  <div className="flex justify-between text-xs text-indigo-950">
                    <span>Entrada Obrigatória:</span>
                    <strong className="font-extrabold">{formatCurrency(selectedPlan.prices.boleto.entrance)}</strong>
                  </div>
                  <div className="flex justify-between text-xs text-indigo-950 font-medium">
                    <span>Mensalidades:</span>
                    <strong className="text-indigo-800 font-bold font-sans">
                      30x de {formatCurrency(boletoMonthly)}
                    </strong>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-2.5 leading-relaxed">
                  Não necessita de cartão de crédito. Envio de boleto bancário mensal após assinatura digital.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. BENEFÍCIOS DO PLANO SELECIONADO */}
      <div className="border-t border-gray-150 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-amber-500" />
            Vantagens Ativas do Plano ({selectedPlan.peopleCount} {selectedPlan.peopleCount === 1 ? 'Pessoa' : 'Pessoas'}):
          </h3>
          
          <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200/50 px-3 py-1 rounded-lg flex items-center gap-1 shadow-xs">
            <CalendarDays className="w-4 h-4 text-amber-500" />
            <strong className="font-extrabold">{selectedPlan.lodgingNights} Diárias</strong> Inclusas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedPlan.benefits.map((benefit, idx) => {
            const isLodging = benefit.includes("diárias de hospedagem") || benefit.includes("diária de hospedagem");
            return (
              <div 
                key={idx} 
                className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                  isLodging 
                    ? 'bg-amber-50/50 border-amber-200/70' 
                    : 'bg-gray-50/50 border-gray-200'
                }`}
              >
                <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${isLodging ? 'text-amber-500' : 'text-emerald-600'}`} />
                <span className="text-xs text-gray-700 leading-relaxed">
                  {benefit}
                </span>
              </div>
            );
          })}
        </div>
        
        <p className="text-[10px] text-center text-red-500 font-bold tracking-wide uppercase mt-5 bg-red-50 py-2 px-3 border border-red-200/60 rounded-lg">
          ⚠️ Preços sujeitos a alteração sem aviso prévio
        </p>
      </div>

    </div>
  );
}
