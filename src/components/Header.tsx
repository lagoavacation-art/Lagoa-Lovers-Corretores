/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Award, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

export default function Header() {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="relative bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white overflow-hidden rounded-2xl mb-8 shadow-xl">
      {/* Decorative gold circular background glow */}
      <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute left-1/4 bottom-0 w-80 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="px-6 py-8 md:px-10 md:py-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          
          {/* Logo and Branding Container */}
          <div className="flex items-center gap-4">
            <div className="p-1 px-3 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <img 
                src="https://i.postimg.cc/1RjH4j0M/logo-lagoa.png" 
                alt="Lagoa Lovers" 
                className="h-14 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-widest text-[#00aaff] uppercase bg-white border border-[#00aaff]/25 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3 text-amber-500" /> CORRETORES
                </span>
                <span className="text-[10px] font-bold tracking-widest text-pink-500 uppercase bg-pink-50 border border-pink-200 px-2.5 py-0.5 rounded-full shadow-xs">
                  LAGOA LOVERS
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white mb-0.5 font-sans">
                Tabela de Vendas • Título Vitalício
              </h1>
              <p className="text-emerald-100/80 text-xs max-w-xl font-normal leading-relaxed">
                Demonstrativo oficial de preços da Lagoa Parques e Hotéis. Gerador de propostas e fichas cadastrais de venda autorizadas.
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="flex flex-wrap items-center gap-3 md:self-center">
            
            <div className="bg-emerald-900/60 border border-emerald-700/40 px-4 py-2.5 rounded-xl text-center min-w-[120px]">
              <div className="text-[10px] text-emerald-300 font-mono uppercase tracking-wider mb-0.5">Atualização</div>
              <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping"></span>
                <span>Ativo ({currentDate})</span>
              </div>
            </div>

            <div className="bg-amber-950/50 border border-amber-500/20 px-4 py-2.5 rounded-xl text-center min-w-[120px]">
              <div className="text-[10px] text-amber-300 font-mono uppercase tracking-wider mb-0.5">Garantia</div>
              <div className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4.5 h-4.5" />
                <span>Preços Fixos</span>
              </div>
            </div>

            <div className="bg-emerald-900/60 border border-emerald-700/40 px-4 py-2.5 rounded-xl text-center min-w-[110px] hidden sm:block">
              <div className="text-[10px] text-emerald-300 font-mono uppercase tracking-wider mb-0.5">Conversão</div>
              <div className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>Alta</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
