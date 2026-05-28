/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SALES_TIPS } from '../data/pricingData';
import { 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  Target, 
  Percent, 
  Coins, 
  CreditCard 
} from 'lucide-react';

export default function SalesTips() {
  const iconMap = [
    <Target key="target" className="w-5 h-5 text-emerald-700" />,
    <CreditCard key="card" className="w-5 h-5 text-teal-700" />,
    <Coins key="coins" className="w-5 h-5 text-amber-600" />,
    <ShieldAlert key="shield" className="w-5 h-5 text-indigo-700" />
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
      
      {/* Playbook Header */}
      <div className="mb-6 flex items-center gap-3 border-b border-gray-150 pb-4">
        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-800 border border-emerald-150">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 font-sans uppercase tracking-wider">
            Playbook do Corretor / Guia de Vendas
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Argumentos de ancoragem e estratégias para contornar objeções dos clientes na hora do fechamento.
          </p>
        </div>
      </div>

      {/* Grid of Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SALES_TIPS.map((tip, idx) => (
          <div 
            key={idx} 
            className="p-4 bg-gray-50/50 border border-gray-200 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/10 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 bg-white border border-gray-200/60 rounded-lg group-hover:border-emerald-200 transition-colors">
                {iconMap[idx % iconMap.length]}
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 font-sans mb-1.5 flex items-center gap-1.5">
                  {tip.title}
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {tip.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Quick Objections Handler */}
      <div className="mt-6 border-t border-gray-150 pt-5 space-y-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          FAQ Rápido de Objeções:
        </h4>

        <div className="space-y-3">
          
          <div className="p-3 bg-red-50/40 border border-red-100 rounded-xl">
            <div className="text-xs font-black text-red-950 flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Objeção: &quot;O plano recorrente ou boleto de 30x tem juros muito altos?&quot;
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed pl-3 border-l border-red-200">
              <strong>Como contornar:</strong> Explique que o parcelamento é de longuíssimo prazo (quase 3 anos). Isso viabiliza que a parcela caiba no orçamento mensal. Se o cliente preferir poupar juros, apresente a opção de 12x no cartão de crédito, que tem ótimo equilíbrio e sem juros operacionais adicionais!
            </p>
          </div>

          <div className="p-3 bg-teal-50/40 border border-teal-100 rounded-xl">
            <div className="text-xs font-black text-teal-950 flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
              Objeção: &quot;Quais as restrições das diárias de boas-vindas?&quot;
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed pl-3 border-l border-teal-200">
              <strong>Como contornar:</strong> Enfatize que é um presente exclusivo de boas-vindas de uso único. Pode ser usufruído de domingo a quinta-feira, exceto férias escolares e feriados nacionais prolongados. Essa diária sozinha já paga boa parte do valor investido!
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
