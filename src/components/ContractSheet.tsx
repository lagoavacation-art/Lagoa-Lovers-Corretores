/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PricingPlan } from '../types';
import { 
  FileText, 
  User, 
  CreditCard, 
  Users, 
  MapPin, 
  Phone, 
  FileCheck, 
  Printer, 
  Layers, 
  TrendingUp,
  AlertCircle,
  Database,
  Cloud,
  CheckCircle,
  Clock,
  Eye,
  X,
  Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ContractSheetProps {
  selectedPlan: PricingPlan;
  selectedPaymentType: 'vista' | 'cartao_12x' | 'recorrente' | 'boleto';
  brokerName: string;
  brokerPhone: string;
}

export default function ContractSheet({
  selectedPlan,
  selectedPaymentType,
  brokerName,
  brokerPhone
}: ContractSheetProps) {

  // Dependents List State (8 slots)
  const initialDependents = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    nome: '',
    dataNasc: '',
    cpf: '',
    celular: '',
    parentesco: '' // Pai, Mãe, Filho(a), Cônjuge, Sogro, Sogra
  }));

  const [dependents, setDependents] = useState(initialDependents);

  const handleUpdateDependent = (id: number, field: string, value: string) => {
    setDependents(prev => prev.map(dep => dep.id === id ? { ...dep, [field]: value } : dep));
  };

  // Personal Data State
  const [sala, setSala] = useState('');
  const [captador, setCaptador] = useState('');
  const [titular, setTitular] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [org, setOrg] = useState('');
  const [profissao, setProfissao] = useState('');
  const [nacionalidade, setNacionalidade] = useState('Brasileira');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cep, setCep] = useState('');
  const [telefone, setTelefone] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');

  // Card Info State
  const [cardNome, setCardNome] = useState('');
  const [cardNumero, setCardNumero] = useState('');
  const [cardValidade, setCardValidade] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardCpf, setCardCpf] = useState('');

  // General fields and manual overrides
  const [observacoes, setObservacoes] = useState('');

  // Financial States (Reactively initialized but manually overridable)
  const [totalValue, setTotalValue] = useState<number>(0);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [entranceValue, setEntranceValue] = useState<number>(0);
  const [entranceInstallments, setEntranceInstallments] = useState<number>(1);
  const [saldoValue, setSaldoValue] = useState<number>(0);
  const [saldoInstallments, setSaldoInstallments] = useState<number>(30);

  // Synchronize financial states on plan or payment type change
  useEffect(() => {
    let baseTotal = 0;
    let baseEntrance = 0;
    let baseInstallments = 1;

    switch (selectedPaymentType) {
      case 'vista':
        baseTotal = selectedPlan.prices.vista;
        baseEntrance = 0;
        baseInstallments = 1;
        break;
      case 'cartao_12x':
        baseTotal = selectedPlan.prices.cartao_12x;
        baseEntrance = 0;
        baseInstallments = 12;
        break;
      case 'recorrente':
        baseTotal = selectedPlan.prices.recorrente.total;
        baseEntrance = selectedPlan.prices.recorrente.entrance;
        baseInstallments = 30;
        break;
      case 'boleto':
        baseTotal = selectedPlan.prices.boleto.total;
        baseEntrance = selectedPlan.prices.boleto.entrance;
        baseInstallments = 30;
        break;
    }

    setTotalValue(baseTotal);
    setDiscountValue(0);
    setEntranceValue(baseEntrance);
    setEntranceInstallments(baseEntrance > 0 ? 1 : 0);
    setSaldoValue(Math.max(0, baseTotal - baseEntrance));
    setSaldoInstallments(baseInstallments);
  }, [selectedPlan, selectedPaymentType]);

  const handleSaldoChange = (newSaldo: number) => {
    setSaldoValue(newSaldo);
    const newEntrance = Math.max(0, totalValue - discountValue - newSaldo);
    setEntranceValue(newEntrance);
  };

  // 2a entrada
  const [segundaEntradaData, setSegundaEntradaData] = useState('');
  const [primeiraSaldoData, setPrimeiraSaldoData] = useState('');
  const [saleDate, setSaleDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Supabase Sync States
  const [savingContract, setSavingContract] = useState(false);
  const [contractSaveStatus, setContractSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [contractSaveError, setContractSaveError] = useState<string>('');
  const [contractsHistory, setContractsHistory] = useState<any[]>([]);

  // Auto-save tracking states to prevent duplicates
  const [currentContractId, setCurrentContractId] = useState<number | null>(null);
  const [lastSavedContractData, setLastSavedContractData] = useState<any>(null);

  // States to facilitate PDF print and preview
  const [isManualPreviewActive, setIsManualPreviewActive] = useState(false);
  const [showPrintInstructionsModal, setShowPrintInstructionsModal] = useState(false);

  // Load saved contracts history
  const loadContractsHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      if (data) {
        setContractsHistory(data);
      }
    } catch (e: any) {
      console.log('Tabela "contracts" não encontrada ou erro ao listar:', e.message);
    }
  };

  useEffect(() => {
    loadContractsHistory();
  }, []);

  // Debounced auto-save effect for Contract Ficha de Venda
  useEffect(() => {
    const trimmedTitular = titular.trim();
    if (!trimmedTitular || trimmedTitular.length < 3) {
      return;
    }

    const currentData = {
      sala,
      captador,
      titular: trimmedTitular,
      birthDate,
      cpf,
      rg,
      org,
      profissao,
      nacionalidade,
      cidade,
      uf,
      endereco,
      bairro,
      cep,
      telefone,
      celular,
      email,
      cardNome,
      cardCpf,
      cardNumero,
      cardValidade,
      observacoes,
      segundaEntradaData,
      primeiraSaldoData,
      saleDate,
      planTitle: selectedPlan.title,
      paymentType: selectedPaymentType,
      dependents: dependents.filter(d => d.nome.trim() !== ''),
      totalValue,
      discountValue,
      entranceValue,
      entranceInstallments,
      saldoValue,
      saldoInstallments
    };

    // Prevent duplicate updates if data is identical
    if (lastSavedContractData && JSON.stringify(lastSavedContractData) === JSON.stringify(currentData)) {
      return;
    }

    const timer = setTimeout(async () => {
      setSavingContract(true);
      setContractSaveStatus('idle');

      try {
        const payload = {
          sala: currentData.sala,
          captador: currentData.captador,
          titular: currentData.titular,
          birth_date: currentData.birthDate,
          cpf: currentData.cpf,
          rg: currentData.rg,
          org: currentData.org,
          profissao: currentData.profissao,
          nacionalidade: currentData.nacionalidade,
          cidade: currentData.cidade,
          uf: currentData.uf,
          endereco: currentData.endereco,
          bairro: currentData.bairro,
          cep: currentData.cep,
          telefone: currentData.telefone,
          celular: currentData.celular,
          email: currentData.email,
          card_nome: currentData.cardNome,
          card_cpf: currentData.cardCpf,
          card_numero: currentData.cardNumero,
          card_validade: currentData.cardValidade,
          observacoes: currentData.observacoes,
          segunda_entrada_data: currentData.segundaEntradaData,
          primeira_saldo_data: currentData.primeiraSaldoData,
          sale_date: currentData.saleDate,
          plan_title: currentData.planTitle,
          payment_type: currentData.paymentType,
          total_value: currentData.totalValue - currentData.discountValue,
          installments_count: currentData.saldoInstallments,
          installment_value: currentData.saldoInstallments > 0 ? currentData.saldoValue / currentData.saldoInstallments : 0,
          dependents: currentData.dependents
        };

        if (currentContractId) {
          // Update existing contract row
          const { error } = await supabase
            .from('contracts')
            .update(payload)
            .eq('id', currentContractId);
          if (error) throw error;
        } else {
          // Insert new contract row
          const { data, error } = await supabase
            .from('contracts')
            .insert([payload])
            .select();
          if (error) throw error;
          if (data && data[0]) {
            setCurrentContractId(data[0].id);
          }
        }

        setContractSaveStatus('success');
        setContractSaveError('');
        loadContractsHistory();
        setLastSavedContractData(currentData);
        setTimeout(() => setContractSaveStatus('idle'), 3000);
      } catch (err: any) {
        console.error('Erro ao auto-salvar contrato no Supabase:', err);
        setContractSaveError(err.message || err.details || String(err));
        setContractSaveStatus('error');
      } finally {
        setSavingContract(false);
      }
    }, 2500); // 2.5 seconds debounce for the larger contract form

    return () => clearTimeout(timer);
  }, [
    sala,
    captador,
    titular,
    birthDate,
    cpf,
    rg,
    org,
    profissao,
    nacionalidade,
    cidade,
    uf,
    endereco,
    bairro,
    cep,
    telefone,
    celular,
    email,
    cardNome,
    cardCpf,
    cardNumero,
    cardValidade,
    observacoes,
    segundaEntradaData,
    primeiraSaldoData,
    saleDate,
    dependents,
    selectedPlan,
    selectedPaymentType,
    currentContractId,
    lastSavedContractData,
    totalValue,
    discountValue,
    entranceValue,
    entranceInstallments,
    saldoValue,
    saldoInstallments
  ]);

  // Save contract to Supabase
  const saveContractToSupabase = async () => {
    if (!titular.trim()) return;

    setSavingContract(true);
    setContractSaveStatus('idle');

    try {
      const payload = {
        sala,
        captador,
        titular,
        birth_date: birthDate,
        cpf,
        rg,
        org,
        profissao,
        nacionalidade,
        cidade,
        uf,
        endereco,
        bairro,
        cep,
        telefone,
        celular,
        email,
        card_nome: cardNome,
        card_cpf: cardCpf,
        card_numero: cardNumero,
        card_validade: cardValidade,
        observacoes,
        segunda_entrada_data: segundaEntradaData,
        primeira_saldo_data: primeiraSaldoData,
        sale_date: saleDate,
        plan_title: selectedPlan.title,
        payment_type: selectedPaymentType,
        total_value: getProductValue(),
        installments_count: getInstallmentsCount(),
        installment_value: getInstallmentValue(),
        dependents: dependents.filter(d => d.nome.trim() !== '')
      };

      if (currentContractId) {
        const { error } = await supabase.from('contracts').update(payload).eq('id', currentContractId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('contracts').insert([payload]).select();
        if (error) throw error;
        if (data && data[0]) {
          setCurrentContractId(data[0].id);
        }
      }

      setContractSaveStatus('success');
      setContractSaveError('');
      loadContractsHistory();
      setTimeout(() => setContractSaveStatus('idle'), 4000);
    } catch (err: any) {
      console.error('Erro ao salvar contrato no Supabase:', err);
      setContractSaveError(err.message || err.details || String(err));
      setContractSaveStatus('error');
    } finally {
      setSavingContract(false);
    }
  };

  // Manual payment values (initialized from selection but editable)
  const getProductValue = () => totalValue;
  const getEntranceValue = () => entranceValue;
  const getSaldoValue = () => saldoValue;
  const getInstallmentsCount = () => saldoInstallments;
  const getInstallmentValue = () => (saldoInstallments > 0 ? saldoValue / saldoInstallments : 0);

  const getPaymentName = () => {
    switch (selectedPaymentType) {
      case 'vista': return 'À Vista';
      case 'cartao_12x': return 'Cartão de Crédito 12x';
      case 'recorrente': return 'Crédito Recorrente 30x';
      case 'boleto': return 'Boleto Bancário 30x';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  const handlePrint = () => {
    const isIframe = window.self !== window.top;
    if (isIframe) {
      setShowPrintInstructionsModal(true);
    } else {
      try {
        window.print();
      } catch (err) {
        console.error("Print blocked or failed:", err);
        setShowPrintInstructionsModal(true);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-6">
      
      {/* Tab Header banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-gray-150 gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#00aaff]/10 text-[#00aaff] rounded-xl border border-[#00aaff]/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900 font-sans uppercase">
              Ficha de Venda (Autorização de Contrato)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Preencha digitalmente os dados contratuais do cliente para gerar um PDF idêntico ao modelo físico.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          {/* Supabase Save Button */}
          <button
            onClick={saveContractToSupabase}
            disabled={savingContract}
            id="btn-save-contract-supabase"
            className={`font-bold text-xs tracking-wide uppercase px-5 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow cursor-pointer ${
              contractSaveStatus === 'success'
                ? 'bg-[#00aaff] border-[#00aaff] text-white'
                : contractSaveStatus === 'error'
                ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-150'
                : 'bg-[#5046e5] border-[#5046e5] hover:bg-[#4338ca] text-white'
            } disabled:opacity-50`}
          >
            <Database className="w-4 h-4" />
            <span>
              {savingContract ? 'Sincronizando...' : contractSaveStatus === 'success' ? 'Ficha Salva!' : 'Salvar Ficha (Supabase)'}
            </span>
          </button>

          {/* Big Print Button */}
          <button
            onClick={handlePrint}
            id="btn-print-contract-pdf"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide uppercase px-5 py-3 rounded-xl border border-emerald-600 flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Exportar para PDF / Imprimir</span>
          </button>

          {/* On-screen Print Preview Button */}
          <button
            onClick={() => setIsManualPreviewActive(true)}
            id="btn-preview-contract"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 font-bold text-xs tracking-wide uppercase px-5 py-3 rounded-xl border border-gray-200 flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Eye className="w-4 h-4 text-gray-500" />
            <span>Visualizar Folha Cheia</span>
          </button>
        </div>
      </div>

      {/* Guide Info */}
      <div className="bg-emerald-50 border border-emerald-100/60 rounded-xl p-4 flex gap-3 text-xs text-emerald-900 print:hidden">
        <AlertCircle className="w-5 h-5 shrink-0 text-emerald-600" />
        <div className="leading-relaxed">
          <strong>Integração com Simulador:</strong> Os campos financeiros da <strong>Forma de Pagamento</strong> já vêm pré-preenchidos automaticamente com o plano para <strong>{selectedPlan.peopleCount} {selectedPlan.peopleCount === 1 ? 'pessoa' : 'pessoas'}</strong> no formato <strong>{getPaymentName()}</strong>. Você pode digitar os dados pessoais do cliente nos campos abaixo para gerar o PDF completo impresso de forma limpa!
        </div>
      </div>

      {/* Supabase Status Warnings */}
      {contractSaveStatus === 'success' && (
        <div className="bg-emerald-50 border border-emerald-250 rounded-xl p-4 flex gap-3 text-xs text-emerald-900 print:hidden">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          <div className="leading-relaxed font-semibold">
            Sucesso! A ficha de venda foi gravada em tempo real na nuvem securizada do Supabase na tabela `contracts`.
          </div>
        </div>
      )}

      {contractSaveStatus === 'error' && (
        <div className="bg-amber-50 border border-amber-250 rounded-xl p-4 flex flex-col gap-3 text-xs text-amber-900 print:hidden">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
            <div className="leading-relaxed">
              <span className="font-bold">Esquema da Tabela `contracts` inválido ou desatualizado:</span> Para sincronizar as fichas corretamente, verifique o erro abaixo e crie/restaure a tabela com a estrutura correta.
            </div>
          </div>

          {contractSaveError && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-lg font-mono text-[11px] leading-relaxed">
              <span className="font-bold text-red-950 block mb-1">❌ Informação Técnica do Erro (Supabase):</span>
              <div className="break-all whitespace-pre-wrap">{contractSaveError}</div>
              <div className="mt-3 text-red-900 font-sans text-xs border-t border-red-200/60 pt-2 space-y-1.5 font-medium">
                {contractSaveError.includes('column') ? (
                  <p>
                    💡 <strong>Como corrigir (Múltiplas colunas em falta):</strong> Sua tabela atual no Supabase tem colunas antigas ou incompletas. Para resolver esse problema, execute o SQL do bloco cinza abaixo para <strong>remover e criar a tabela limpa</strong> com todas as colunas necessárias.
                  </p>
                ) : null}
                {contractSaveError.includes('row-level security') || contractSaveError.includes('violates row-level security policy') || contractSaveError.includes('policy') ? (
                  <p>
                    💡 <strong>Como corrigir (Política de Segurança):</strong> Desative a proteção de RLS na tabela do seu Supabase rodando o comando: <br />
                    <code className="bg-red-100 font-mono font-bold px-1 py-0.5 rounded text-red-950 select-all shrink-0">ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;</code>
                  </p>
                ) : null}
              </div>
            </div>
          )}

          <div className="text-[11px] font-bold text-gray-700 mt-1">
            Instrução de Correção Rápida no seu Supabase (SQL Editor):
          </div>

          <pre className="p-3 bg-gray-900 text-gray-300 rounded-lg font-mono text-[9px] overflow-x-auto select-all leading-normal whitespace-pre">
{`-- 1. Se a tabela já existia de testes anteriores, remova-a para recriar com a estrutura correta:
DROP TABLE IF EXISTS contracts;

-- 2. Crie a tabela com todas as colunas correspondentes ao formulário:
CREATE TABLE contracts (
  id bigint generated by default as identity primary key,
  sala text,
  captador text,
  titular text,
  birth_date text,
  cpf text,
  rg text,
  org text,
  profissao text,
  nacionalidade text,
  cidade text,
  uf text,
  endereco text,
  bairro text,
  cep text,
  telefone text,
  celular text,
  email text,
  card_nome text,
  card_cpf text,
  card_numero text,
  card_validade text,
  observacoes text,
  segunda_entrada_data text,
  primeira_saldo_data text,
  sale_date text,
  plan_title text,
  payment_type text,
  total_value numeric,
  installments_count integer,
  installment_value numeric,
  dependents jsonb,
  created_at timestamp with time zone default now()
);

-- 3. Desative a RLS (Row Level Security) para permitir que o aplicativo grave dados diretamente:
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;`}
          </pre>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* COL 1: DADOS PESSOAIS */}
        <div className="space-y-4 xl:col-span-2">
          
          <h4 className="text-xs font-bold text-[#00aaff] uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-gray-100">
            <User className="w-4 h-4" />
            1. Dados Pessoais do Titular
          </h4>

          {/* Sala, Captador, Executivo, Data da Venda */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Sala</label>
              <input
                id="form-sala"
                type="text"
                value={sala}
                onChange={(e) => setSala(e.target.value)}
                placeholder="Ex: Sala Imperial"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Captador</label>
              <input
                id="form-captador"
                type="text"
                value={captador}
                onChange={(e) => setCaptador(e.target.value)}
                placeholder="Nome do captador"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Executivo de Vendas</label>
              <input
                id="form-executivo"
                type="text"
                value={brokerName}
                readOnly
                className="w-full text-xs px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none font-semibold text-gray-750"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Data da Venda</label>
              <input
                id="form-saledate"
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff]"
              />
            </div>
          </div>

          {/* Titular, Nascimento, CPF, RG, Org, Profissao */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nome do Titular</label>
              <input
                id="form-titular"
                type="text"
                value={titular}
                onChange={(e) => setTitular(e.target.value)}
                placeholder="Nome completo do titular"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff]"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Data de Nascimento</label>
              <input
                id="form-birthdate"
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="DD/MM/AAAA"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">CPF</label>
              <input
                id="form-cpf"
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff] font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">RG</label>
              <input
                id="form-rg"
                type="text"
                value={rg}
                onChange={(e) => setRg(e.target.value)}
                placeholder="Número do RG"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff] font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Órgão Emissor</label>
              <input
                id="form-org"
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="SSP-GO"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff] uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Profissão</label>
              <input
                id="form-profissao"
                type="text"
                value={profissao}
                onChange={(e) => setProfissao(e.target.value)}
                placeholder="Cargo/Atividade"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff]"
              />
            </div>
          </div>

          {/* Endereço, Bairro, CEP */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Endereço Residencial</label>
              <input
                id="form-endereco"
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, número, apto"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff]"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Bairro</label>
              <input
                id="form-bairro"
                type="text"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Bairro"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">CEP</label>
              <input
                id="form-cep"
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="00000-000"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff] font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cidade / Estado</label>
              <div className="flex gap-2">
                <input
                  id="form-cidade"
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Cidade"
                  className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff]"
                />
                <input
                  id="form-uf"
                  type="text"
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                  placeholder="UF"
                  maxLength={2}
                  className="w-16 text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center uppercase focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff] font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nacionalidade</label>
              <input
                id="form-nacionalidade"
                type="text"
                value={nacionalidade}
                onChange={(e) => setNacionalidade(e.target.value)}
                placeholder="Ex: Brasileira"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Telefone Fixo</label>
              <input
                id="form-telefone"
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 0000-0000"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff] font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Celular / WhatsApp</label>
              <input
                id="form-celular"
                type="text"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                placeholder="(00) 90000-0000"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff] font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">E-mail de Acesso</label>
              <input
                id="form-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff] font-mono"
              />
            </div>
          </div>

          {/* COL 2: CARTÃO DE CRÉDITO E RECORRENTE */}
          <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-1.5 pt-4 pb-2 border-b border-gray-100">
            <CreditCard className="w-4 h-4" />
            2. Informações do Cartão de Crédito e Recorrente (Se houver)
          </h4>

          <div className="p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nome como está no Cartão</label>
                <input
                  id="form-card-nome"
                  type="text"
                  value={cardNome}
                  onChange={(e) => setCardNome(e.target.value)}
                  placeholder="Ex: CARLOS ALBUQUERQUE"
                  className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">CPF do Titular do Cartão</label>
                <input
                  id="form-card-cpf"
                  type="text"
                  value={cardCpf}
                  onChange={(e) => setCardCpf(e.target.value)}
                  placeholder="Se diferente do titular"
                  className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Número do Cartão</label>
                <input
                  id="form-card-num"
                  type="text"
                  value={cardNumero}
                  onChange={(e) => setCardNumero(e.target.value)}
                  placeholder="0000 0000 0000 0000"
                  className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Validade</label>
                <input
                  id="form-card-val"
                  type="text"
                  value={cardValidade}
                  onChange={(e) => setCardValidade(e.target.value)}
                  placeholder="MM/AA"
                  className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-center font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Código de Segurança (CVV)</label>
                <input
                  id="form-card-cvv"
                  type="password"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  placeholder="CVV"
                  maxLength={4}
                  className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-center font-mono"
                />
              </div>
            </div>
          </div>

          {/* OBSERVACÕES */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
              Observações Gerais do Contrato
            </label>
            <textarea
              id="form-observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Digite observações importantes extras (brindes adicionais, carteirinhas, dados do faturamento...)"
              className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff] h-20"
            />
          </div>

        </div>

        {/* COL 2: FINANCEIRO (PRE-FATURADO) & DEPENDENTS BLOCK */}
        <div className="space-y-6">
          
          <div className="bg-gradient-to-br from-gray-50 to-white/70 border border-gray-150 rounded-2xl p-4 space-y-4 shadow-sm">
            <h4 id="title-faturamento-customizado" className="text-xs font-bold text-[#00aaff] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-200">
              <FileCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
              Resumo & Faturamento Customizado
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">Produto Base:</span>
                <strong className="text-gray-900">Lagoa Lovers Título {selectedPlan.peopleCount}P</strong>
              </div>

              {/* Valor do Título/Produto Original */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-0.5">Preço Original do Título (R$)</label>
                <input
                  id="custom-total-value-input"
                  type="number"
                  value={totalValue || ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTotalValue(val);
                    setSaldoValue(Math.max(0, val - discountValue - entranceValue));
                  }}
                  className="w-full text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] font-mono font-semibold"
                />
              </div>

              {/* Desconto Comercial */}
              <div>
                <label className="block text-[10px] font-black text-amber-600 uppercase mb-0.5">Desconto Comercial caso houver (R$)</label>
                <input
                  id="custom-discount-input"
                  type="number"
                  value={discountValue || ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setDiscountValue(val);
                    setSaldoValue(Math.max(0, totalValue - val - entranceValue));
                  }}
                  className="w-full text-xs px-3 py-1.5 bg-amber-50/50 border border-amber-200 rounded-lg text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold"
                  placeholder="Se houver desconto"
                />
              </div>

              {/* Valor Líquido */}
              {discountValue > 0 && (
                <div className="flex justify-between items-center bg-teal-50 border border-teal-150 p-2 rounded-lg text-[11px]">
                  <span className="text-teal-800 font-bold">Valor com Desconto:</span>
                  <strong className="text-teal-950 font-black font-mono">{formatCurrency(Math.max(0, totalValue - discountValue))}</strong>
                </div>
              )}

              {/* Valor de Entrada & Parcelas da Entrada */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-emerald-700 uppercase mb-0.5">Entrada (R$)</label>
                  <input
                    id="custom-entrance-input"
                    type="number"
                    value={entranceValue || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEntranceValue(val);
                      setSaldoValue(Math.max(0, totalValue - discountValue - val));
                    }}
                    className="w-full text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-semibold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-emerald-700 uppercase mb-0.5">Parcelas Entrada</label>
                  <select
                    id="custom-entrance-installments"
                    value={entranceInstallments}
                    onChange={(e) => setEntranceInstallments(Number(e.target.value))}
                    className="w-full text-xs px-2 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  >
                    <option value={0}>Sem entrada</option>
                    <option value={1}>01x (À Vista)</option>
                    <option value={2}>02x (Cartão)</option>
                    <option value={3}>03x (Cartão)</option>
                    <option value={4}>04x (Cartão)</option>
                    <option value={5}>05x (Cartão)</option>
                    <option value={6}>06x (Cartão)</option>
                  </select>
                </div>
              </div>

              {/* Show calculated entrance installments value */}
              {entranceValue > 0 && entranceInstallments > 1 && (
                <div className="text-[10px] text-emerald-800 bg-emerald-50/50 p-1.5 rounded text-right font-semibold">
                  Parcelamento Entrada: {entranceInstallments}x de <strong>{formatCurrency(entranceValue / entranceInstallments)}</strong>
                </div>
              )}

              {/* Saldo Financiado & Número parcelas do Saldo */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-0.5">Saldo Financiado (R$)</label>
                  <input
                    id="custom-saldo-input"
                    type="number"
                    value={saldoValue || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      handleSaldoChange(val);
                    }}
                    className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-semibold text-indigo-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-0.5">Parcelas Saldo</label>
                  <input
                    id="custom-saldo-installments"
                    type="number"
                    value={saldoInstallments || ''}
                    onChange={(e) => setSaldoInstallments(Math.max(1, Number(e.target.value)))}
                    className="w-full text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-semibold text-gray-900"
                  />
                </div>
              </div>

              {/* Valor Parcela Saldo */}
              <div className="pt-2 border-t border-dashed border-gray-200 flex justify-between items-center">
                <span className="text-gray-500 font-semibold flex-grow text-left">Valor da Parcela do Saldo:</span>
                <strong className="text-indigo-600 font-black text-sm font-mono text-right whitespace-nowrap">
                  {formatCurrency(saldoInstallments > 0 ? saldoValue / saldoInstallments : 0)}
                </strong>
              </div>
            </div>

            {/* Manual Date Input Fields */}
            <div className="pt-3.5 space-y-3.5 border-t border-gray-200">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  📅 Data da 2ª Parcela da Entrada (se houver)
                </label>
                <input
                  id="form-entrada-2a"
                  type="date"
                  value={segundaEntradaData}
                  onChange={(e) => setSegundaEntradaData(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  📅 Vencimento da 1ª Parcela do Saldo
                </label>
                <input
                  id="form-saldo-1a"
                  type="date"
                  value={primeiraSaldoData}
                  onChange={(e) => setPrimeiraSaldoData(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] focus:border-[#00aaff]"
                />
              </div>
            </div>

          </div>

          {/* Quick instructions to download */}
          <div className="bg-amber-50/50 p-4 border border-amber-200/50 rounded-xl space-y-2 text-xs">
            <h5 className="font-bold text-amber-800 flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-amber-600" />
              Pronto para Imprimir / PDF?
            </h5>
            <p className="text-gray-600 leading-normal">
              Ao clicar em <strong>&quot;Exportar para PDF / Imprimir&quot;</strong>, o sistema gerará automaticamente o formato de impressão A4 limpo e otimizado contendo as duas folhas do contrato:
            </p>
            <ul className="list-disc pl-4 text-gray-600 space-y-1">
              <li><strong>Folha 1:</strong> Autorização, Dados Pessoais, Cartão e Pagamento compilado.</li>
              <li><strong>Folha 2:</strong> Matriz de Dependentes (com foco especial nos requeridos pelo plano).</li>
            </ul>
          </div>

        </div>

      </div>

      {/* 3. LIST OF DEPENDENTS (IN LINE WITH Model 2) */}
      <div className="border-t border-gray-150 pt-6">
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
          <Users className="w-4.5 h-4.5 text-[#00aaff]" />
          3. Dependentes ({selectedPlan.peopleCount - 1} recomendados para o Plano)
        </h4>
        <p className="text-xs text-gray-500 mb-4">
          Abaixo você pode preencher os dados dos dependentes. Conforme a imagem oficial, a ficha aceita até 8 dependentes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => {
            const depNum = idx + 1;
            const currentDep = dependents[idx];
            const isRecomendado = depNum < selectedPlan.peopleCount; // count excludes owner

            return (
              <div 
                key={depNum} 
                className={`p-4 rounded-xl border transition-colors ${
                  isRecomendado 
                    ? 'bg-amber-50/20 border-amber-200/70' 
                    : 'bg-gray-50/40 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${isRecomendado ? 'bg-amber-500' : 'bg-gray-300'}`}></span>
                    Dependente 0{depNum} {isRecomendado && <span className="text-[10px] text-amber-600 font-semibold">(Recomendado no Plano)</span>}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <input
                      id={`dep-nome-${depNum}`}
                      type="text"
                      placeholder="Nome completo do dependente"
                      value={currentDep.nome}
                      onChange={(e) => handleUpdateDependent(depNum, 'nome', e.target.value)}
                      className="w-full text-xs px-3.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      id={`dep-nasc-${depNum}`}
                      type="text"
                      placeholder="Nasc: DD/MM/AAAA"
                      value={currentDep.dataNasc}
                      onChange={(e) => handleUpdateDependent(depNum, 'dataNasc', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] text-center font-mono"
                    />
                    <input
                      id={`dep-cpf-${depNum}`}
                      type="text"
                      placeholder="CPF do dependente"
                      value={currentDep.cpf}
                      onChange={(e) => handleUpdateDependent(depNum, 'cpf', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] text-center font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      id={`dep-celular-${depNum}`}
                      type="text"
                      placeholder="Celular do dependente"
                      value={currentDep.celular}
                      onChange={(e) => handleUpdateDependent(depNum, 'celular', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff] text-center font-mono"
                    />
                    <select
                      id={`dep-parentesco-${depNum}`}
                      value={currentDep.parentesco}
                      onChange={(e) => handleUpdateDependent(depNum, 'parentesco', e.target.value)}
                      className="w-full text-xs px-2 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00aaff]"
                    >
                      <option value="">Grau de Parentesco...</option>
                      <option value="Filho(a)">Filho(a)</option>
                      <option value="Cônjuge">Cônjuge</option>
                      <option value="Mãe">Mãe</option>
                      <option value="Pai">Pai</option>
                      <option value="Sogro">Sogro</option>
                      <option value="Sogra">Sogra</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HISTÓRICO DE FICHAS DE VENDA SALVAS COM SUPABASE */}
      {contractsHistory.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-150 print:hidden">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
            <Cloud className="w-4.5 h-4.5 text-[#00aaff]" />
            Fichas de Venda Salvas na Nuvem (Sincronizado Supabase)
          </h4>
          <div className="overflow-x-auto border border-gray-150 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-[10px] uppercase font-bold text-gray-400">
                  <th className="p-3">Titular</th>
                  <th className="p-3">Plano</th>
                  <th className="p-3">Pagamento</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3">Vendedor</th>
                  <th className="p-3">Dependentes</th>
                  <th className="p-3">Venc. Saldo</th>
                  <th className="p-3">Data Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {contractsHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="p-3 font-semibold text-gray-900">{item.titular}</td>
                    <td className="p-3 text-gray-600 font-medium">{item.plan_title}</td>
                    <td className="p-3 text-gray-500 font-mono uppercase">{item.payment_type}</td>
                    <td className="p-3 font-bold text-gray-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total_value)}
                    </td>
                    <td className="p-3 text-gray-600">{item.captador || 'Janver'}</td>
                    <td className="p-3 text-center">
                      <span className="bg-sky-50 text-sky-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {Array.isArray(item.dependents) ? item.dependents.length : 0} deps
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 font-mono">
                      {item.primeira_saldo_data ? new Date(item.primeira_saldo_data).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="p-3 text-[10px] text-gray-400 font-mono">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : 'Agora'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {createPortal(
        <div 
          id="printable-contract-blueprint" 
          className={isManualPreviewActive ? "fixed inset-0 z-50 bg-gray-950 overflow-y-auto p-4 md:p-8 flex flex-col items-center gap-6" : "hidden-in-browser"}
        >
          {isManualPreviewActive && (
            <div className="print:hidden w-full max-w-[210mm] bg-gray-905 border border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-5 shadow-2xl mb-3 font-sans">
              <div className="text-left w-full md:max-w-[50%]">
                <h4 className="font-black text-sm uppercase text-[#00aaff] flex items-center gap-2">
                  <Download className="w-4 h-4 animate-pulse text-[#00aaff]" />
                  <span>Modo União de Impressão &amp; PDF</span>
                </h4>
                <p className="text-gray-450 text-xs mt-1 leading-relaxed">
                  Para fazer o download, clique em <strong className="text-emerald-400">Baixar PDF</strong> e escolha a opção <strong>&quot;Salvar como PDF&quot;</strong> no campo Destino do seu navegador.
                </p>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap gap-2.5 shrink-0 w-full md:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.print();
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all shadow-sm shadow-emerald-950/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.print();
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white text-xs font-bold uppercase tracking-wider px-4 py-3 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all border border-gray-750"
                >
                  <Printer className="w-4 h-4 text-gray-400" />
                  <span>Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualPreviewActive(false)}
                  className="w-full sm:w-auto bg-gray-900 hover:bg-gray-850 text-gray-450 hover:text-gray-200 text-xs font-bold uppercase tracking-wider px-4 py-3 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all border border-gray-800"
                >
                  <X className="w-4 h-4" />
                  <span>Fechar</span>
                </button>
              </div>
            </div>
          )}

          {/* PERSISTENT FLOATING ACTIONS IN PREVIEW MODE */}
          {isManualPreviewActive && (
            <div className="print:hidden fixed bottom-6 right-6 z-55 flex items-center gap-3 bg-gray-900/95 backdrop-blur-md border border-gray-800 p-3.5 rounded-2xl shadow-2xl font-sans max-w-[90vw] animate-bounce-short">
              <div className="hidden sm:block text-left pr-3 border-r border-gray-800 mr-1">
                <h5 className="font-extrabold text-[11px] uppercase text-[#00aaff] flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#00aaff]" />
                  <span>Ficha de Venda</span>
                </h5>
                <p className="text-gray-400 text-[10px] leading-tight mt-0.5">Pronta para PDF ou impressão</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.print();
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualPreviewActive(false)}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all border border-rose-700/50 shadow-md active:scale-95"
                >
                  <X className="w-3.5 h-3.5 text-rose-200" />
                  <span>Ir para Sistema</span>
                </button>
              </div>
            </div>
          )}
          
          {/* PAGE 1: CONTRATO AUTORIZAÇÃO */}
          <div className="print-page w-[210mm] min-h-[297mm] pl-[16mm] pr-[16mm] pt-[6mm] pb-[6mm] bg-white text-black relative flex flex-col justify-between" style={{ contentVisibility: 'auto' }}>
            {/* Decorative Side Borders from Uploaded Attachments */}
            <img 
              src="https://i.postimg.cc/g2vF8PKd/Whats-App-Image-2026-05-28-at-12-47-18.jpg" 
              alt="Borda Esquerda" 
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[8mm] h-[120mm] object-contain pointer-events-none" 
              referrerPolicy="no-referrer"
            />
            <img 
              src="https://i.postimg.cc/sxBbXFXr/Whats-App-Image-2026-05-28-at-12-47-23.jpg" 
              alt="Borda Direita" 
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[8mm] h-[120mm] object-contain pointer-events-none" 
              referrerPolicy="no-referrer"
            />

            <div className="relative z-10 w-full">
              {/* Logo and Class Header */}
              <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-300">
                <img 
                  src="https://i.postimg.cc/2SvmGWr9/Whats-App-Image-2026-05-28-at-12-57-51.png" 
                  alt="Lagoa Lovers" 
                  className="h-12 object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="text-right">
                  <div className="text-xs font-mono font-bold">Sala: <span className="underline ml-1 font-sans">{sala || '_________________'}</span></div>
                  <div className="text-[9px] text-gray-400 font-mono mt-0.5">Ref: {selectedPlan.title.toUpperCase()}</div>
                </div>
              </div>

              {/* Sheet Title */}
              <div className="text-center mb-4.5">
                <h2 className="text-[11px] font-black tracking-widest text-gray-950 uppercase border-y py-1 border-gray-300 bg-gray-50/80">
                  AUTORIZAÇÃO PARA EMISSÃO DE CONTRATO LAGOA LOVERS
                </h2>
                <div className="flex justify-between text-[10px] font-semibold mt-2 text-left">
                  <div className="w-1/3 text-left">
                    <span>Captador: <span className="underline ml-1 font-normal">{captador || '_______________________'}</span></span>
                  </div>
                  <div className="w-1/3 text-center">
                    <span>Data da Venda: <span className="underline ml-1 font-black">{saleDate ? new Date(saleDate + 'T12:00:00').toLocaleDateString('pt-BR') : '___/___/_____'}</span></span>
                  </div>
                  <div className="w-1/3 text-right">
                    <span className="flex items-center justify-end gap-1">
                      <span className="inline-block w-3 h-3 border border-black text-center leading-[6px] font-bold text-[8px]">{brokerName ? 'X' : ''}</span>
                      <span>Executivo de vendas: <span className="underline ml-1 font-black">{brokerName || 'Janver Nascimento'}</span></span>
                    </span>
                  </div>
                </div>
              </div>

              {/* BLOCK 1: DADOS PESSOAIS */}
              <div className="mb-3.5 space-y-1.5">
                <h3 className="text-[10px] font-black text-white bg-gray-800 px-2 py-0.5 uppercase tracking-wider rounded-xs">
                  DADOS PESSOAIS
                </h3>
                
                <div className="grid grid-cols-12 gap-x-3 gap-y-1 text-[10.5px] leading-tight">
                  <div className="col-span-8 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">Titular:</span>
                    <span className="font-semibold text-gray-950 uppercase">{titular || '____________________________________________________'}</span>
                  </div>
                  <div className="col-span-4 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">Data de nascimento:</span>
                    <span className="font-mono font-semibold text-gray-950">{birthDate || '___ / ___ / ______'}</span>
                  </div>

                  <div className="col-span-3 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">CPF:</span>
                    <span className="font-mono font-semibold text-gray-950">{cpf || '___ . ___ . ___ - __'}</span>
                  </div>
                  <div className="col-span-3 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">RG:</span>
                    <span className="font-mono font-semibold text-gray-950">{rg || '_____________________'}</span>
                  </div>
                  <div className="col-span-2 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">Org:</span>
                    <span className="font-mono uppercase font-semibold text-gray-950">{org || '______'}</span>
                  </div>
                  <div className="col-span-4 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">Profissão:</span>
                    <span className="font-semibold text-gray-950">{profissao || '_____________________'}</span>
                  </div>

                  <div className="col-span-4 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">Nacionalidade:</span>
                    <span className="font-semibold text-gray-950">{nacionalidade || 'Brasileira'}</span>
                  </div>
                  <div className="col-span-6 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">Cidade:</span>
                    <span className="font-semibold text-gray-950">{cidade || '_____________________'}</span>
                  </div>
                  <div className="col-span-2 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">UF:</span>
                    <span className="font-mono uppercase font-semibold text-gray-950">{uf || '___'}</span>
                  </div>

                  <div className="col-span-8 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">Endereço residencial:</span>
                    <span className="font-semibold text-gray-950">{endereco || '____________________________________________________'}</span>
                  </div>
                  <div className="col-span-4 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">Bairro:</span>
                    <span className="font-semibold text-gray-950">{bairro || '_____________________'}</span>
                  </div>

                  <div className="col-span-3 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">CEP:</span>
                    <span className="font-mono font-semibold text-gray-950">{cep || '_____-___'}</span>
                  </div>
                  <div className="col-span-4 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">Telefone:</span>
                    <span className="font-mono font-semibold text-gray-950">{telefone || '(    ) _________________'}</span>
                  </div>
                  <div className="col-span-5 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">Celular:</span>
                    <span className="font-mono font-semibold text-gray-950">{celular || '(    ) _________________'}</span>
                  </div>

                  <div className="col-span-12 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">E-mail de acesso:</span>
                    <span className="font-mono font-semibold text-gray-950">{email || '____________________________________________________________________'}</span>
                  </div>
                </div>

              </div>

              {/* BLOCK 2: INFORMAÇÕES DO CARTÃO DE CRÉDITO E RECORRENTE */}
              <div className="mb-3.5 space-y-1.5">
                <h3 className="text-[10px] font-black text-white bg-gray-800 px-2 py-0.5 uppercase tracking-wider rounded-xs">
                  INFORMAÇÕES DO CARTÃO DE CRÉDITO E RECORRENTE
                </h3>
                
                <div className="grid grid-cols-12 gap-x-3 gap-y-1 text-[10.5px] leading-tight">
                  <div className="col-span-12 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">Nome Descrito no cartão:</span>
                    <span className="font-semibold text-gray-950 uppercase">{cardNome || '____________________________________________________'}</span>
                  </div>

                  <div className="col-span-6 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">Número do cartão:</span>
                    <span className="font-mono font-semibold text-gray-950">{cardNumero || '____ ____ ____ ____'}</span>
                  </div>
                  <div className="col-span-3 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">Validade:</span>
                    <span className="font-mono font-semibold text-gray-950">{cardValidade || '___ / ___'}</span>
                  </div>
                  <div className="col-span-3 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">Código de segurança:</span>
                    <span className="font-mono font-semibold text-gray-950">{cardCvv ? '***' : '_____'}</span>
                  </div>

                  <div className="col-span-6 border-b">
                    <span className="font-bold text-[8.5px] text-gray-500 block">CPF do titular do cartão:</span>
                    <span className="font-mono font-semibold text-gray-950">{cardCpf || cpf || '___ . ___ . ___ - __'}</span>
                  </div>
                </div>
              </div>

              {/* BLOCK 3: FORMA DE PAGAMENTO */}
              <div className="mb-3.5 space-y-1.5">
                <h3 className="text-[10px] font-black text-white bg-gray-800 px-2 py-0.5 uppercase tracking-wider rounded-xs">
                  FORMA DE PAGAMENTO
                </h3>
                
                <div className="grid grid-cols-12 gap-1.5 text-[10px]">
                  <div className="col-span-6 border p-1 px-2 rounded bg-gray-50/40">
                    <span className="font-bold text-[8.5px] text-gray-500 uppercase block">Produto:</span>
                    <span className="font-extrabold text-[#00aaff] truncate block">LAGOA LOVERS - {selectedPlan.title.toUpperCase()} ({selectedPlan.peopleCount}P)</span>
                  </div>

                  <div className="col-span-6 border p-1 px-2 rounded bg-sky-50/20 flex justify-between gap-1 items-center">
                    <div>
                      <span className="font-bold text-[8px] text-gray-500 uppercase block">Tabela:</span>
                      <span className="font-bold text-gray-700 font-mono text-[9.5px] block">{formatCurrency(totalValue)}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[8px] text-amber-700 uppercase block">Desconto:</span>
                      <span className="font-bold text-amber-800 font-mono text-[9.5px] block">{discountValue > 0 ? formatCurrency(discountValue) : 'R$ 0,00'}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[8.5px] text-emerald-700 uppercase block">Líquido:</span>
                      <span className="font-black text-emerald-800 font-mono text-[10px] block">{formatCurrency(Math.max(0, totalValue - discountValue))}</span>
                    </div>
                  </div>

                  <div className="col-span-6 border p-1 px-2 rounded">
                    <span className="font-bold text-[8.5px] text-gray-500 uppercase block">Valor total da entrada:</span>
                    <span className="font-extrabold text-[#00c853] font-mono">{formatCurrency(entranceValue)}</span>
                  </div>
                  <div className="col-span-6 border p-1 px-2 rounded">
                    <span className="font-bold text-[8.5px] text-gray-500 uppercase block">Quantidade de parcelas da entrada:</span>
                    <span className="font-extrabold text-gray-950">
                      {entranceValue > 0 
                        ? `${entranceInstallments.toString().padStart(2, '0')}x parcelas${entranceInstallments > 1 ? ` (de ${formatCurrency(entranceValue / entranceInstallments)} cada)` : ''}`
                        : 'Sem entrada'
                      }
                    </span>
                  </div>

                  <div className="col-span-12 border p-1 px-2 rounded">
                    <span className="font-bold text-[8.5px] text-gray-500 uppercase block">Forma de pagamento da entrada:</span>
                    <span className="font-extrabold text-gray-950">{entranceValue > 0 ? getPaymentName() : 'Sem entrada'}</span>
                  </div>

                  <div className="col-span-12 border p-1 px-2 rounded">
                    <span className="font-bold text-[8.5px] text-gray-500 uppercase block">2ª Parcela da entrada (data para passar o cartão):</span>
                    <span className="font-extrabold text-gray-900">{segundaEntradaData ? new Date(segundaEntradaData + 'T12:00:00').toLocaleDateString('pt-BR') : '_______________________________'}</span>
                  </div>

                  <div className="col-span-4 border p-1 px-2 rounded bg-gray-50/50">
                    <span className="font-bold text-[8.5px] text-gray-500 uppercase block">Valor total do saldo:</span>
                    <span className="font-extrabold text-gray-950 font-mono">{formatCurrency(saldoValue)}</span>
                  </div>
                  <div className="col-span-4 border p-1 px-2 rounded">
                    <span className="font-bold text-[8.5px] text-gray-500 uppercase block">Dividido em:</span>
                    <span className="font-extrabold text-gray-950 font-mono">{saldoInstallments}x</span>
                  </div>
                  <div className="col-span-4 border p-1 px-2 rounded bg-gray-50">
                    <span className="font-bold text-[8.5px] text-indigo-700 uppercase block">Valor das parcelas:</span>
                    <span className="font-black text-indigo-800 font-mono">{formatCurrency(saldoInstallments > 0 ? saldoValue / saldoInstallments : 0)}</span>
                  </div>

                  <div className="col-span-6 border p-1 px-2 rounded">
                    <span className="font-bold text-[8.5px] text-gray-500 uppercase block">Forma de pagamento do saldo:</span>
                    <span className="font-extrabold text-gray-950">{getPaymentName()}</span>
                  </div>
                  <div className="col-span-6 border p-1 px-2 rounded">
                    <span className="font-bold text-[8.5px] text-gray-500 uppercase block">1º Parcela do saldo para:</span>
                    <span className="font-extrabold text-gray-900">{primeiraSaldoData ? new Date(primeiraSaldoData + 'T12:00:00').toLocaleDateString('pt-BR') : '_______________________________'}</span>
                  </div>
                </div>
              </div>

              {/* BLOCK 4: OBSERVAÇÕES */}
              <div className="border rounded-md p-1.5 px-2 border-gray-300">
                <span className="font-bold text-[8.5px] text-gray-500 uppercase block mb-0.5">Observações:</span>
                <p className="text-[10px] text-gray-700 whitespace-pre-wrap leading-tight">
                  {observacoes || 'Nenhuma observação informada.'}
                </p>
              </div>
            </div>

            {/* Bottom Assinatura */}
            <div className="pt-2 border-t border-gray-200 mt-3 flex justify-between items-end">
              <span className="text-[9px] text-gray-400">Tabela de Preços Lagoa Lovers • Emissão Digital via Corretor {brokerName}</span>
              <div className="text-center w-80">
                <div className="border-t border-black pt-1 text-xs font-bold text-gray-900">
                  Titular Assinatura
                </div>
              </div>
            </div>

          </div>

          {/* EXTRA PAGE BREAK COMPLIANT WITH DESIGN PRINIPLES */}
          <div className="page-break"></div>

          {/* PAGE 2: DEPENDENTES MATRIZ */}
          <div className="print-page w-[210mm] min-h-[297mm] pl-[16mm] pr-[16mm] pt-[6mm] pb-[6mm] bg-white text-black relative flex flex-col justify-between" style={{ contentVisibility: 'auto' }}>
            {/* Decorative Side Borders from Uploaded Attachments */}
            <img 
              src="https://i.postimg.cc/g2vF8PKd/Whats-App-Image-2026-05-28-at-12-47-18.jpg" 
              alt="Borda Esquerda" 
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[8mm] h-[120mm] object-contain pointer-events-none" 
              referrerPolicy="no-referrer"
            />
            <img 
              src="https://i.postimg.cc/sxBbXFXr/Whats-App-Image-2026-05-28-at-12-47-23.jpg" 
              alt="Borda Direita" 
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[8mm] h-[120mm] object-contain pointer-events-none" 
              referrerPolicy="no-referrer"
            />

            <div className="relative z-10 w-full">
              {/* Logo and Class Header */}
              <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-300">
                <img 
                  src="https://i.postimg.cc/2SvmGWr9/Whats-App-Image-2026-05-28-at-12-57-51.png" 
                  alt="Lagoa Lovers" 
                  className="h-12 object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="text-right">
                  <div className="text-xs font-mono font-bold">Sala: <span className="underline ml-1 font-sans">{sala || '_________________'}</span></div>
                  <div className="text-[9px] text-rose-600 font-bold uppercase tracking-wide">Ficha de Dependentes</div>
                </div>
              </div>

              <h2 className="text-xs font-extrabold text-center tracking-widest text-[#00aaff] mb-4 uppercase bg-sky-50 py-1.5 border border-sky-200">
                MATRIZ DE DEPENDENTES BENEFICIÁRIOS - LAGOA LOVERS ({selectedPlan.peopleCount} PESSOAS)
              </h2>

              {/* Dependents list rendering exact replicates */}
              <div className="space-y-3.5">
                {dependents.map((dep, index) => {
                  const isRecomendado = dep.id < selectedPlan.peopleCount;
                  return (
                    <div 
                      key={dep.id} 
                      className={`border rounded-lg p-2.5 ${isRecomendado ? 'bg-gray-50 border-gray-350' : 'border-gray-200 pb-2 bg-white'}`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-800 border-b pb-1 mb-1.5">
                        <span>DEPENDENTE 0{dep.id}: <span className="font-extrabold uppercase ml-2 text-xs text-gray-950">{dep.nome || '____________________________________________________'}</span></span>
                        {isRecomendado && <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.2 rounded">Recomendado Plano</span>}
                      </div>

                      <div className="grid grid-cols-12 gap-3 text-[10px]">
                        <div className="col-span-3">
                          <span className="font-bold text-gray-500">Data Nasc:</span>
                          <span className="underline font-semibold ml-1">{dep.dataNasc || '___ / ___ / ______'}</span>
                        </div>
                        <div className="col-span-4">
                          <span className="font-bold text-gray-500">CPF:</span>
                          <span className="underline font-mono font-semibold ml-1">{dep.cpf || '___ . ___ . ___ - __'}</span>
                        </div>
                        <div className="col-span-5">
                          <span className="font-bold text-gray-500">Celular:</span>
                          <span className="underline font-mono font-semibold ml-1">{dep.celular || '(    ) _________________'}</span>
                        </div>

                        <div className="col-span-12 flex items-center gap-2 mt-1 flex-wrap">
                          <span className="font-bold text-gray-500">Grau de parentesco:</span>
                          {['Pai', 'Mãe', 'Filho(a)', 'Cônjuge', 'Sogro', 'Sogra'].map((rel) => {
                            const isSelected = dep.parentesco === rel;
                            return (
                              <span key={rel} className="flex items-center gap-1">
                                <span className="inline-block w-3 h-3 text-center border border-black leading-2.5 text-[8px] font-bold">
                                  {isSelected ? 'X' : ''}
                                </span>
                                <span className="text-[9px]">{rel}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Signature 2 */}
            <div className="pt-2 border-t border-gray-200 mt-3 flex justify-between items-end">
              <span className="text-[9px] text-gray-400">Lista Geral de Beneficiários - Lagoa Parques e Hotéis</span>
              <div className="text-center w-80">
                <div className="border-t border-black pt-1 text-xs font-bold text-gray-900">
                  Titular Assinatura
                </div>
              </div>
            </div>

          </div>

        </div>,
        document.body
      )}

      {/* 5. IFRAME PRINT INSTRUCTIONS MODAL */}
      {showPrintInstructionsModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-150 max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-gray-150 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-xs uppercase text-gray-900 tracking-wide flex items-center gap-2">
                <Printer className="text-emerald-600 w-5 h-5 animate-pulse" />
                <span>Instruções para Exportar PDF</span>
              </h3>
              <button 
                type="button"
                onClick={() => setShowPrintInstructionsModal(false)}
                className="text-gray-400 hover:text-gray-650 transition-colors p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-100 text-xs flex gap-2.5 leading-relaxed">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <strong>Atenção:</strong> Como você está visualizando o aplicativo dentro do painel integrado do AI Studio, o navegador restringe a abertura direta da janela de impressão por segurança.
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Não se preocupe! Desenvolvemos duas formas alternativas perfeitas para você salvar e imprimir seu PDF sem limitações:
              </p>

              <div className="space-y-3">
                {/* Option 1 */}
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/55 hover:bg-gray-50 transition-all text-left">
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mb-2">
                    Opção 1 (Recomendada)
                  </span>
                  <h5 className="font-bold text-xs text-gray-900">Como abrir em Tela Cheia no Navegador</h5>
                  <p className="text-[11px] text-gray-550 mt-1 leading-relaxed">
                    Clique abaixo para abrir o sistema em uma aba normal do seu navegador. Lá, o botão de exportar funcionará com apenas 1 clique de forma nativa e sem bloqueios!
                  </p>
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-650 font-bold hover:text-emerald-700 mt-2.5 underline"
                  >
                    <span>Abrir em Nova Guia do Navegador ↗️</span>
                  </a>
                </div>

                {/* Option 2 */}
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/55 hover:bg-gray-50 transition-all text-left">
                  <span className="inline-block bg-sky-100 text-sky-850 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mb-2">
                    Opção 2
                  </span>
                  <h5 className="font-bold text-xs text-gray-900">Ativar Visualização Dedicada</h5>
                  <p className="text-[11px] text-gray-550 mt-1 leading-relaxed">
                    Ative a visualização na tela e aperte as teclas do seu teclado <strong>Ctrl + P</strong> (ou <strong>Cmd + P</strong> no Mac) para acionar a gravação do seu PDF!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPrintInstructionsModal(false);
                      setIsManualPreviewActive(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-sky-650 font-bold hover:text-sky-750 mt-2.5 underline cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ativar Visualização de Folha na Tela</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-150 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowPrintInstructionsModal(false);
                  try {
                    window.print();
                  } catch (e) {}
                }}
                className="bg-gray-200 hover:bg-gray-250 text-gray-750 font-bold text-xs uppercase px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Tentar Mesmo Assim
              </button>
              <button
                type="button"
                onClick={() => setShowPrintInstructionsModal(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
