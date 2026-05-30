/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { PricingPlan } from '../types';
import { 
  Send, 
  Copy, 
  Check, 
  Smartphone, 
  User, 
  HelpCircle, 
  Sparkles, 
  Trash2,
  Share2,
  Database,
  Cloud,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  initAuth, 
  googleSignIn, 
  appendRowToGoogleSheet, 
  getAccessToken, 
  logout as googleLogout 
} from '../lib/googleAuth';
import { User as FirebaseUser } from 'firebase/auth';

interface WhatsappProposalProps {
  selectedPlan: PricingPlan;
  selectedPaymentType: 'vista' | 'cartao_12x' | 'recorrente' | 'boleto';
  brokerName: string;
  setBrokerName: (name: string) => void;
  brokerPhone: string;
}

export default function WhatsappProposal({
  selectedPlan,
  selectedPaymentType,
  brokerName,
  setBrokerName,
  brokerPhone
}: WhatsappProposalProps) {
  const [clientName, setClientName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [customDiscount, setCustomDiscount] = useState<number>(0);

  // Supabase states
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [proposalsHistory, setProposalsHistory] = useState<any[]>([]);

  // Google Sheets states
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [sheetsSyncStatus, setSheetsSyncStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [sheetsMessage, setSheetsMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Auto-save tracking states to prevent duplicates
  const [currentSupabaseId, setCurrentSupabaseId] = useState<number | null>(null);
  const [lastTrackedData, setLastTrackedData] = useState<any>(null);

  // Init Google auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    if (isLoggingIn || googleUser) return;
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        setSheetsSyncStatus('success');
        setSheetsMessage(`Conectado como ${res.user.email}`);
        setTimeout(() => {
          setSheetsSyncStatus('idle');
          setSheetsMessage('');
        }, 3000);
      }
    } catch (err: any) {
      console.error('Falha ao conectar com o Google:', err);
      // Don't show blocking alerts for automatic trigger fails; just fallback to error status
      setSheetsSyncStatus('error');
      setSheetsMessage('Google Sheets pendente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await googleLogout();
      setGoogleUser(null);
      setGoogleToken(null);
      setCurrentSupabaseId(null);
      setLastTrackedData(null);
    } catch (err) {
      console.error('Falha ao desconectar do Google:', err);
    }
  };

  // Trigger automatic login try on input interaction to make connection fully automatic
  const handleInteractionForGoogleAuth = () => {
    if (!googleUser && !isLoggingIn && sheetsSyncStatus !== 'error') {
      handleGoogleLogin();
    }
  };

  const trackProposalToGoogleSheets = async (actionType: string) => {
    if (!googleUser) return; // Silent if not logged in

    setSheetsSyncStatus('sending');
    setSheetsMessage('Enviando rastreio para o Google Sheets...');

    try {
      const finalPrice = selectedPaymentType === 'vista' 
        ? selectedPlan.prices.vista - customDiscount
        : selectedPaymentType === 'cartao_12x'
        ? selectedPlan.prices.cartao_12x - customDiscount
        : selectedPaymentType === 'recorrente'
        ? selectedPlan.prices.recorrente.total
        : selectedPlan.prices.boleto.total;

      const rowValues = [
        new Date().toLocaleString('pt-BR'),
        brokerName || 'Janver Nascimento',
        clientName || 'Cliente não identificado',
        whatsappNumber || 'Sem telefone',
        selectedPlan.title,
        selectedPlan.peopleCount,
        selectedPaymentType.toUpperCase(),
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalPrice),
        customDiscount > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(customDiscount) : 'R$ 0,00',
        brokerPhone || '-',
        actionType
      ];

      await appendRowToGoogleSheet(
        '1hhDHmfmDbZsp0SOGRilRiBEHhrGQZPo_Fqhu3Ll17v0',
        'A:K',
        rowValues
      );

      setSheetsSyncStatus('success');
      setSheetsMessage('Rastreio gravado na planilha do Google!');
      setTimeout(() => {
        setSheetsSyncStatus('idle');
        setSheetsMessage('');
      }, 4000);
    } catch (err: any) {
      console.error('Erro ao salvar no Google Sheets:', err);
      setSheetsSyncStatus('error');
      setSheetsMessage(`Sheets Error: ${err.message || 'Erro ao gravar.'}`);
    }
  };

  // Handle format currency helper inside the template
  const fmt = (v: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(v);
  };

  // Fetch saved proposals from Supabase
  const loadProposalsHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      if (data) {
        setProposalsHistory(data);
      }
    } catch (err: any) {
      console.log('Tabela "proposals" talvez não exista no Supabase ainda:', err.message);
    }
  };

  useEffect(() => {
    loadProposalsHistory();
  }, []);

  // Debounced auto-save & tracker effect for Supabase and Google Sheets row
  useEffect(() => {
    const trimmedClientName = clientName.trim();
    if (!trimmedClientName || trimmedClientName.length < 2) {
      return;
    }

    const currentData = {
      clientName: trimmedClientName,
      whatsappNumber: whatsappNumber.trim(),
      customDiscount,
      planTitle: selectedPlan.title,
      peopleCount: selectedPlan.peopleCount,
      paymentType: selectedPaymentType,
      brokerName: brokerName
    };

    // Prevent duplicate updates if data is identical
    if (
      lastTrackedData &&
      lastTrackedData.clientName === currentData.clientName &&
      lastTrackedData.whatsappNumber === currentData.whatsappNumber &&
      lastTrackedData.customDiscount === currentData.customDiscount &&
      lastTrackedData.planTitle === currentData.planTitle &&
      lastTrackedData.peopleCount === currentData.peopleCount &&
      lastTrackedData.paymentType === currentData.paymentType &&
      lastTrackedData.brokerName === currentData.brokerName
    ) {
      return;
    }

    const timer = setTimeout(async () => {
      setSaving(true);
      setSaveStatus('idle');
      setErrorMessage('');

      try {
        const finalPrice = selectedPaymentType === 'vista' 
          ? selectedPlan.prices.vista - customDiscount
          : selectedPaymentType === 'cartao_12x'
          ? selectedPlan.prices.cartao_12x - customDiscount
          : selectedPaymentType === 'recorrente'
          ? selectedPlan.prices.recorrente.total
          : selectedPlan.prices.boleto.total;

        const payload = {
          client_name: currentData.clientName,
          broker_name: currentData.brokerName,
          plan_title: currentData.planTitle,
          people_count: currentData.peopleCount,
          payment_type: currentData.paymentType,
          total_price: finalPrice,
          custom_discount: currentData.customDiscount,
        };

        // 1. Save or Update in Supabase
        if (currentSupabaseId) {
          const { error } = await supabase
            .from('proposals')
            .update(payload)
            .eq('id', currentSupabaseId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from('proposals')
            .insert([payload])
            .select();
          if (error) throw error;
          if (data && data[0]) {
            setCurrentSupabaseId(data[0].id);
          }
        }

        setSaveStatus('success');
        loadProposalsHistory();
        setTimeout(() => setSaveStatus('idle'), 3000);

        // 2. Automatically sync to Google Sheets if user is connected
        if (googleUser) {
          const rowValues = [
            new Date().toLocaleString('pt-BR'),
            currentData.brokerName || 'Janver Nascimento',
            currentData.clientName,
            currentData.whatsappNumber || 'Sem telefone',
            currentData.planTitle,
            currentData.peopleCount,
            currentData.paymentType.toUpperCase(),
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalPrice),
            currentData.customDiscount > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentData.customDiscount) : 'R$ 0,00',
            brokerPhone || '-',
            'Preenchimento Automático'
          ];

          await appendRowToGoogleSheet(
            '1hhDHmfmDbZsp0SOGRilRiBEHhrGQZPo_Fqhu3Ll17v0',
            'A:K',
            rowValues
          );

          setSheetsSyncStatus('success');
          setSheetsMessage('Sincronizado automaticamente com Google Sheets com sucesso!');
          setTimeout(() => {
            setSheetsSyncStatus('idle');
            setSheetsMessage('');
          }, 3000);
        }

        // Keep track of what we successfully wrote
        setLastTrackedData(currentData);

      } catch (err: any) {
        console.error('Erro de auto-save:', err);
        setSaveStatus('error');
        setErrorMessage(err.message || 'Erro de sincronização.');
      } finally {
        setSaving(false);
      }
    }, 2000); // 2 seconds debounce

    return () => clearTimeout(timer);
  }, [
    clientName,
    whatsappNumber,
    customDiscount,
    selectedPlan,
    selectedPaymentType,
    brokerName,
    googleUser,
    currentSupabaseId,
    lastTrackedData,
    brokerPhone
  ]);

  // Fallback signature for manual save trigger
  const saveProposalToSupabase = async () => {
    if (!clientName.trim()) return;
    setSaving(true);
    try {
      const finalPrice = selectedPaymentType === 'vista' 
        ? selectedPlan.prices.vista - customDiscount
        : selectedPaymentType === 'cartao_12x'
        ? selectedPlan.prices.cartao_12x - customDiscount
        : selectedPaymentType === 'recorrente'
        ? selectedPlan.prices.recorrente.total
        : selectedPlan.prices.boleto.total;

      const payload = {
        client_name: clientName,
        broker_name: brokerName,
        plan_title: selectedPlan.title,
        people_count: selectedPlan.peopleCount,
        payment_type: selectedPaymentType,
        total_price: finalPrice,
        custom_discount: customDiscount,
      };

      if (currentSupabaseId) {
        await supabase.from('proposals').update(payload).eq('id', currentSupabaseId);
      } else {
        const { data } = await supabase.from('proposals').insert([payload]).select();
        if (data && data[0]) setCurrentSupabaseId(data[0].id);
      }
      setSaveStatus('success');
      loadProposalsHistory();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };


  const clearFields = () => {
    setClientName('');
    setWhatsappNumber('');
    setCustomDiscount(0);
  };

  // Generate WhatsApp message string
  const generateMessageText = () => {
    const pCount = selectedPlan.peopleCount;
    const pTitle = selectedPlan.title;
    
    // Determine payment details
    let paymentDetail = '';
    let savingsSection = '';

    if (selectedPaymentType === 'vista') {
      const finalPrice = selectedPlan.prices.vista - customDiscount;
      paymentDetail = `*R$ ${finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} À VISTA*`;
      if (customDiscount > 0) {
        paymentDetail += `\n_(com desconto especial de ${fmt(customDiscount)} aplicado)_`;
      }
      const savings = selectedPlan.prices.boleto.total - finalPrice;
      savingsSection = `\n💡 Você economiza *${fmt(savings)}* em comparação com a tabela em boleto!`;
    } else if (selectedPaymentType === 'cartao_12x') {
      const finalPrice = selectedPlan.prices.cartao_12x - customDiscount;
      const installmentValue = selectedPlan.id === 7 && customDiscount === 0 ? 659.39 : (finalPrice / 12);
      paymentDetail = `*R$ ${finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} no Cartão de Crédito*\n💳 Parcelado em até *12x de ${fmt(installmentValue)} sem juros*`;
    } else if (selectedPaymentType === 'recorrente') {
      const rec = selectedPlan.prices.recorrente;
      if (selectedPlan.id === 7) {
        paymentDetail = `*De: R$ 11.520,00 por R$ 9.600,00 CRÉDITO RECORRENTE*\n➡️ *Entrada de R$ 1.371,84* (parcelada em até *5x de R$ 274,36 sem juros* no cartão de crédito)\n➡️ *Saldo restante de 30x de R$ 274,27* no Cartão Recorrente\n_(🚨 Não compromete seu limite! Apenas o valor da parcela mensal é aprovado mês a mês)_`;
      } else {
        paymentDetail = `*R$ ${rec.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CRÉDITO RECORRENTE*\n➡️ *Entrada de ${fmt(rec.entrance)}*\n➡️ *Saldo de 30x de ${fmt(rec.installmentValue)}* no Cartão Recorrente\n_(🚨 Não bloqueia o limite total do seu cartão! Apenas o valor da parcela mensal é consumido)_`;
      }
    } else {
      const bol = selectedPlan.prices.boleto;
      paymentDetail = `*R$ ${bol.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BOLETO*\n➡️ *Entrada de ${fmt(bol.entrance)}*\n➡️ *Saldo de 30x de ${fmt(bol.installmentValue)}* no Boleto Bancário`;
    }

    let targetDesc = '';
    let benefitsList = '';

    if (selectedPlan.id === 7) {
      targetDesc = `Para Titular, Cônjuge, Filhos de até 24 anos, Pai, Mãe, Sogro e Sogra usufruírem de forma vitalícia e definitiva.`;
      benefitsList = `✅ 1° Ano de carteirinha totalmente grátis!
✅ Titular, Cônjuge, Filhos até 24 anos, Pai, Mãe, Sogro e Sogra.
✅ 02 agregados inclusos com desconto de 50% no valor da adesão, independente do grau de parentesco!
✅ 02 convites mensais após quisição/quitação do título (não cumulativos).
✅ 50% de desconto definitivo no estacionamento do clube.
✅ 10% de desconto definitivo no Réveillon do clube.
✅ 8 diárias de hospedagem inclusas fracionadas em 2x (domingo a quinta, exceto férias/feriados, utilização de boas-vindas única).`;
    } else if (selectedPlan.id === 8) {
      targetDesc = `Isento de taxa de manutenção mensal permanente para Titular, Cônjuge, Pai, Mãe, Sogro, Sogra e filhos.`;
      benefitsList = `✅ ISENTO permanentemente de taxa de manutenção mensal para sempre!
✅ 12 diárias de hospedagem completas fracionadas em até 3x (domingo a quinta).
✅ 02 convites mensais após quitação do título (não cumulativos).
✅ 50% de desconto definitivo no estacionamento do clube.
✅ 10% de desconto definitivo no Réveillon do clube.`;
    } else {
      targetDesc = `Para até *${pCount} ${pCount === 1 ? 'pessoa' : 'pessoas'}* usufruírem de forma vitalícia e definitiva.`;
      const lodgingNights = selectedPlan.lodgingNights;
      benefitsList = `✅ 1° Ano de taxa de carteirinha totalmente grátis!
✅ 02 convites mensais após quitação (não cumulativos) para trazer convidados.
✅ 50% de desconto definitivo no estacionamento do clube.
✅ ${lodgingNights} diárias de hospedagem de domingo a quinta-feira (boas-vindas para utilização única, exceto em férias e feriados).`;
    }

    let planTypeLabel = 'TÍTULO VITALÍCIO SOCIAL';
    if (selectedPlan.id === 7) {
      planTypeLabel = 'TÍTULO VITALÍCIO FAMILIAR';
    } else if (selectedPlan.id === 8) {
      planTypeLabel = 'TÍTULO FAMILIAR VITALÍCIO REMIDO';
    }

    const brokerSignature = brokerName 
      ? `\nQualquer dúvida estou à disposição para ajudar no seu processo de associação!\nAtenciosamente,\n*${brokerName}*${brokerPhone ? `\n📞 Contato: ${brokerPhone}` : ''}`
      : '\nQualquer dúvida estou à inteira disposição para te atender e formalizar o título!';

    const todayStr = new Date().toLocaleDateString('pt-BR');

    return `Olá${clientName ? `, *${clientName}*` : ''}! Tudo bem?

📅 *Data de Envio:* ${todayStr}

Preparei aqui os detalhes do seu orçamento exclusivo para as condições do *${planTypeLabel}* do clube. Veja como ficou fácil se associar:

🏆 *${pTitle.toUpperCase()}*
${targetDesc}

💵 *CONDIÇÃO COMPILADA QUE SELECIONAMOS:*
${paymentDetail}${savingsSection}

🌟 *BENEFÍCIOS EXCLUSIVOS INCLUSOS:*
${benefitsList}

⚠️ *Proposta válida por 24 horas (Sujeito a alterações sem aviso prévio)*

Aproveite essa oportunidade especial para garantir o bem-estar e lazer permanente da sua família.${brokerSignature}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateMessageText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      // Auto-track to Google Sheets if logged in
      if (googleUser) {
        trackProposalToGoogleSheets('Copiado para o WhatsApp (Ação Copiar)');
      }
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const handleSendWhatsapp = () => {
    const text = encodeURIComponent(generateMessageText());
    let cleanNum = whatsappNumber.replace(/\D/g, '');
    
    // Add Brazil country code if not set
    if (cleanNum && cleanNum.length === 11 && !cleanNum.startsWith('55')) {
      cleanNum = '55' + cleanNum;
    }
    
    const url = cleanNum 
      ? `https://api.whatsapp.com/send?phone=${cleanNum}&text=${text}`
      : `https://api.whatsapp.com/send?text=${text}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');

    // Auto-track to Google Sheets if logged in
    if (googleUser) {
      trackProposalToGoogleSheets('Enviado direto para o WhatsApp');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
      
      {/* Container Header */}
      <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Share2 className="text-emerald-700 w-5 h-5 animate-pulse" />
            Gerador de Propostas WhatsApp
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Gere um texto formatado elegante para enviar aos seus contatos no WhatsApp.
          </p>
        </div>
        <button 
          id="btn-clear-proposal"
          type="button" 
          onClick={clearFields}
          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 transition-colors"
          title="Limpar campos do cliente"
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Form elements */}
        <div className="space-y-4">
          
          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-emerald-600 rounded-sm"></span>
            1. Dados do Cliente e Negociação
          </h4>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-gray-400" /> Nome do Cliente
            </label>
            <input
              id="input-client-name"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              onFocus={handleInteractionForGoogleAuth}
              placeholder="Ex: Carlos Albuquerque"
              className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-gray-400" /> WhatsApp do Cliente
              </label>
              <input
                id="input-whatsapp-num"
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                onFocus={handleInteractionForGoogleAuth}
                placeholder="DDD + Numero (Ex: 11999999999)"
                className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                Desconto Adicional (R$)
              </label>
              <input
                id="input-discount"
                type="number"
                value={customDiscount || ''}
                onChange={(e) => setCustomDiscount(Math.max(0, Number(e.target.value)))}
                onFocus={handleInteractionForGoogleAuth}
                placeholder="Ex Plano À Vista: R$ 100"
                className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
              <span className="text-[10px] text-gray-400 block mt-1">Gera cupom simulado para fechar na hora.</span>
            </div>
          </div>

          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1.5 pt-2">
            <span className="w-1.5 h-3 bg-emerald-600 rounded-sm"></span>
            2. Seleção de Corretor Autorizado
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Identificação do Corretor</label>
              <select
                id="select-broker-name"
                value={brokerName}
                onChange={(e) => setBrokerName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                <option value="Janver Nascimento">Janver Nascimento</option>
                <option value="Jonathan Henrique Ramos">Jonathan Henrique Ramos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 font-sans">Telefone Comercial (Fixo)</label>
              <input
                id="input-broker-phone"
                type="text"
                value={brokerPhone}
                readOnly
                className="w-full text-xs px-3.5 py-2.5 bg-gray-100 border border-gray-250 text-gray-500 rounded-lg focus:outline-none font-mono font-bold cursor-not-allowed"
              />
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200/50 rounded-xl space-y-1.5 text-xs text-amber-900/95">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" /> Dica de Abordagem Comercial:
            </div>
            <p className="leading-relaxed">
              O texto da proposta é atualizado automaticamente conforme você altera a quantidade de pessoas ou a modalidade de pagamento desejada nos cards principais. Escolha a melhor estratégia antes de copiar!
            </p>
          </div>

          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1.5 pt-2">
            <span className="w-1.5 h-3 bg-emerald-600 rounded-sm"></span>
            3. Rastreamento Planilha Google 📊
          </h4>

          {/* Google Sheets Sync Card */}
          <div className="space-y-3">
            {!googleUser ? (
              <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 space-y-3 text-xs">
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  Para documentar automaticamente cada proposta gerada e enviada nesta planilha online do Google, conecte sua conta:
                </p>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center gap-2.5 w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold text-xs rounded-xl shadow-xs hover:bg-gray-50 hover:border-gray-450 hover:shadow transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#ea4335" d="M12 5.04c1.78 0 3.37.61 4.63 1.8l3.44-3.44C17.99 1.3 15.22.4 12 .4 7.37.4 3.42 3.09 1.5 6.99l3.99 3.1c1.1-3.3 4.17-5.05 6.51-5.05z" />
                    <path fill="#4285f4" d="M23.49 12.27c0-.78-.07-1.54-.2-2.27H12v4.51h6.45c-.28 1.48-1.11 2.73-2.37 3.58l3.69 2.87c2.16-2 3.72-4.94 3.72-8.69z" />
                    <path fill="#fbbc05" d="M5.49 14.91c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.5 7.19C.55 9.09 0 11.21 0 13.4s.55 4.31 1.5 6.21l3.99-3.1c-.24-.72-.38-1.5-.38-2.31z" />
                    <path fill="#34a853" d="M12 23.6c3.24 0 5.96-1.07 7.95-2.92l-3.69-2.87c-1.02.68-2.32 1.09-3.83 1.09-2.34 0-5.41-1.75-6.51-5.05L1.5 16.95c1.92 3.9 5.87 6.65 10.5 6.65z" />
                  </svg>
                  <span>Conectar com Google</span>
                </button>
                <a 
                  href="https://docs.google.com/spreadsheets/d/1hhDHmfmDbZsp0SOGRilRiBEHhrGQZPo_Fqhu3Ll17v0/edit?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-600 hover:underline text-center block font-semibold"
                >
                  Visualizar Planilha Destino 🔗
                </a>
              </div>
            ) : (
              <div className="bg-emerald-50/75 border border-emerald-200 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-850">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Rastreamento Conectado
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleLogout}
                    className="text-[10px] text-gray-500 hover:text-red-650 hover:underline transition-colors cursor-pointer"
                  >
                    Desconectar
                  </button>
                </div>
                <p className="text-[10px] text-gray-600 font-medium leading-none">
                  Sessão ativa: <span className="font-mono text-gray-900">{googleUser.email}</span>
                </p>
                <div className="text-[10px] bg-white border border-emerald-150 p-2.5 rounded-lg text-emerald-950 space-y-1">
                  <p className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-800">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Sincronização Ativa!
                  </p>
                  <p className="text-gray-500 leading-normal">
                    Seus dados de proposta serão sincronizados com a planilha sempre que você clicar em <span className="font-semibold">Copiar Texto</span> ou <span className="font-semibold">Enviar Whats</span>.
                  </p>
                </div>
                <a 
                  href="https://docs.google.com/spreadsheets/d/1hhDHmfmDbZsp0SOGRilRiBEHhrGQZPo_Fqhu3Ll17v0/edit?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] text-emerald-700 font-bold hover:underline block text-center"
                >
                  Abrir Planilha de Rastreio 📈
                </a>
              </div>
            )}

            {sheetsSyncStatus !== 'idle' && (
              <div className={`p-3 rounded-xl text-[11px] font-medium border flex items-center justify-between ${
                sheetsSyncStatus === 'sending'
                  ? 'bg-sky-50 border-sky-200 text-sky-800 font-semibold'
                  : sheetsSyncStatus === 'success'
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}>
                <div className="flex items-center gap-2">
                  {sheetsSyncStatus === 'sending' && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                    </span>
                  )}
                  <span>{sheetsMessage}</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Generated message preview */}
        <div className="flex flex-col h-full justify-between">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Visualização da Mensagem:
            </label>
            <div className="border border-gray-200 rounded-xl bg-gray-50 p-4 h-64 overflow-y-auto font-sans text-xs text-gray-700 whitespace-pre-wrap leading-relaxed relative">
              <div className="absolute top-2 right-2 flex bg-amber-400 text-emerald-950 font-extrabold px-2 py-0.5 rounded text-[8px] uppercase tracking-wider">
                Preview WhatsApp
              </div>
              {generateMessageText()}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 shrink-0">
            <div className="grid grid-cols-2 gap-3">
              {/* Action 1: Copy to clipboard */}
              <button
                type="button"
                id="btn-copy-proposal"
                onClick={handleCopy}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-500" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>

              {/* Action 2: Send directly */}
              <button
                type="button"
                id="btn-send-whatsapp"
                onClick={handleSendWhatsapp}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl border border-emerald-600 transition-all font-bold text-xs tracking-wide shadow-sm hover:shadow cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Whats</span>
              </button>
            </div>

            {/* Action 3: Save to Supabase */}
            <button
              type="button"
              id="btn-save-supabase"
              onClick={saveProposalToSupabase}
              disabled={saving}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs tracking-wide border transition-all cursor-pointer ${
                saveStatus === 'success'
                  ? 'bg-[#00aaff] border-[#00aaff] text-white shadow-sm'
                  : saveStatus === 'error'
                  ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-xs'
              } disabled:opacity-50`}
            >
              <Database className="w-4 h-4" />
              <span>
                {saving ? 'Gravando no Supabase...' : saveStatus === 'success' ? 'Salvo no Banco!' : 'Salvar Proposta no Banco (Supabase)'}
              </span>
            </button>

            {/* Status alerts */}
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded-lg">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Pronto! Proposta sincronizada na tabela `proposals` com sucesso.</span>
              </div>
            )}

            {saveStatus === 'error' && (
              <div className="p-3.5 bg-amber-50 border border-amber-250 text-amber-900 text-[11px] rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span className="font-bold">Modelagem do Banco de Dados:</span>
                </div>
                <p className="leading-relaxed text-[10px] text-gray-700">
                  Para habilitar o salvamento em tempo real, execute a instrução SQL abaixo no <strong>SQL Editor</strong> do seu painel Supabase para criar sua tabela:
                </p>
                <pre className="p-2.5 bg-gray-900 text-gray-300 rounded-lg font-mono text-[9px] overflow-x-auto select-all leading-normal whitespace-pre">
{`CREATE TABLE IF NOT EXISTS proposals (
  id BIGSERIAL PRIMARY KEY,
  client_name TEXT,
  broker_name TEXT,
  plan_title TEXT,
  people_count INTEGER,
  payment_type TEXT,
  total_price NUMERIC,
  custom_discount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);`}
                </pre>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* HISTORICO DE PROPOSTAS COM SUPABASE */}
      {proposalsHistory.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-150">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
            <Cloud className="w-4.5 h-4.5 text-indigo-600" />
            Histórico Recente na Nuvem (Sincronizado Supabase)
          </h4>
          <div className="overflow-x-auto border border-gray-150 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-[10px] uppercase font-bold text-gray-400">
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Plano</th>
                  <th className="p-3">Pagamento</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3">Corretor</th>
                  <th className="p-3">Sincronizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {proposalsHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="p-3 font-semibold text-gray-900">{item.client_name}</td>
                    <td className="p-3 text-gray-600">{item.plan_title} ({item.people_count}P)</td>
                    <td className="p-3 font-mono text-gray-500 uppercase">{item.payment_type}</td>
                    <td className="p-3 font-bold text-gray-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total_price)}
                    </td>
                    <td className="p-3 text-gray-600">{item.broker_name || 'Janver'}</td>
                    <td className="p-3 text-[10px] text-gray-400 font-mono">
                      {item.created_at ? new Date(item.created_at).toLocaleTimeString('pt-BR') : 'Agora'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


    </div>
  );
}
