/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Header from './components/Header';
import PricingCalculator from './components/PricingCalculator';
import FullComparisonTable from './components/FullComparisonTable';
import WhatsappProposal from './components/WhatsappProposal';
import ContractSheet from './components/ContractSheet';
import SalesTips from './components/SalesTips';
import { PRICING_PLANS } from './data/pricingData';
import { PricingPlan } from './types';
import { 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  HelpCircle, 
  Smartphone, 
  Printer, 
  FileCheck, 
  Users 
} from 'lucide-react';

export default function App() {
  // Shared states for full-suite reactivity
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(PRICING_PLANS[0]);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'vista' | 'cartao_12x' | 'recorrente' | 'boleto'>('vista');
  
  // Lifted broker state - fixed to selection & fixed phone
  const ALLOWED_BROKERS = ['Janver Nascimento', 'Jonathan Henrique Ramos'];
  
  const [brokerName, setBrokerNameState] = useState<string>(() => {
    const saved = localStorage.getItem('broker_name');
    if (saved && ALLOWED_BROKERS.includes(saved)) {
      return saved;
    }
    return 'Janver Nascimento';
  });

  const setBrokerName = (name: string) => {
    if (ALLOWED_BROKERS.includes(name)) {
      localStorage.setItem('broker_name', name);
      setBrokerNameState(name);
    }
  };

  const brokerPhone = '(64)3513-6230';

  // Two-tab navigation model
  const [activeTab, setActiveTab] = useState<'proposta' | 'ficha'>('proposta');

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
  };

  const handleSelectPaymentType = (type: 'vista' | 'cartao_12x' | 'recorrente' | 'boleto') => {
    setSelectedPaymentType(type);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Sleek corporate header */}
        <Header />

        {/* Info Highlights / Quick KPI Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-150 p-4 rounded-xl shadow-xs flex items-center gap-3">
            <div className="p-2 bg-[#00aaff]/10 text-[#00aaff] rounded-lg shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Total de Opções</p>
              <h4 className="text-sm font-extrabold text-gray-900">12 Modalidades</h4>
            </div>
          </div>

          <div className="bg-white border border-gray-150 p-4 rounded-xl shadow-xs flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 font-sans">Facilidade de Crédito</p>
              <h4 className="text-sm font-extrabold text-gray-900 font-mono">Boleta / Recorrente 30x</h4>
            </div>
          </div>

          <div className="bg-white border border-gray-150 p-4 rounded-xl shadow-xs flex items-center gap-3">
            <div className="p-2 bg-pink-50 text-pink-600 rounded-lg shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Suporte Corretores</p>
              <h4 className="text-sm font-extrabold text-gray-900">WhatsApp & PDFs</h4>
            </div>
          </div>
        </div>

        {/* Dynamic Model Switch tabs */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
          <button
            onClick={() => setActiveTab('proposta')}
            id="tab-btn-proposta"
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === 'proposta'
                ? 'bg-[#00aaff] text-white shadow-md font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Modelo 1: Enviar Proposta Comercial (WhatsApp / Copiar)</span>
          </button>
          
          <button
            onClick={() => setActiveTab('ficha')}
            id="tab-btn-ficha"
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === 'ficha'
                ? 'bg-pink-500 text-white shadow-md font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Modelo 2: Ficha de Venda Completa (Gerar Dados & PDF)</span>
          </button>
        </div>

        {/* Tab 1 content container */}
        {activeTab === 'proposta' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left panel (7 cols on desktop): Big side-by-side comparative calculator */}
            <div className="lg:col-span-7 space-y-6">
              <PricingCalculator 
                selectedPlan={selectedPlan}
                onSelectPlan={handleSelectPlan}
                selectedPaymentType={selectedPaymentType}
                onSelectPaymentType={handleSelectPaymentType}
              />
            </div>

            {/* Right panel (5 cols on desktop): Quick WhatsApp quote sender */}
            <div className="lg:col-span-5 space-y-6">
              <WhatsappProposal 
                selectedPlan={selectedPlan}
                selectedPaymentType={selectedPaymentType}
                brokerName={brokerName}
                setBrokerName={setBrokerName}
                brokerPhone={brokerPhone}
              />
            </div>
          </div>
        )}

        {/* Tab 2 content container (Ficha de Venda form) */}
        {activeTab === 'ficha' && (
          <div className="space-y-6">
            <ContractSheet 
              selectedPlan={selectedPlan}
              selectedPaymentType={selectedPaymentType}
              brokerName={brokerName}
              brokerPhone={brokerPhone}
            />
          </div>
        )}

        {/* Global Overview Section: Pricing Table Matrix */}
        <div id="section-comparison-matrix">
          <FullComparisonTable 
            onSelectPlan={handleSelectPlan}
            activePlanId={selectedPlan.id}
          />
        </div>

        {/* Broker Training / Playbook Advice */}
        <div id="section-sales-tips">
          <SalesTips />
        </div>

        {/* Aesthetic footer */}
        <footer className="pt-6 border-t border-gray-200 text-center text-[11px] text-gray-400/95 font-sans pb-4">
          <p>© 2026 Tabela de Vendas - Título Social Vitalício Lagoa Lovers. Lagoa Parques e Hotéis.</p>
          <p className="mt-1 font-mono text-[9px] text-gray-300">Ref: Lagoa-Lovers_v4.61 • Contato Corretagem Fixo: (64) 3513-6230</p>
        </footer>

      </div>
    </div>
  );
}
