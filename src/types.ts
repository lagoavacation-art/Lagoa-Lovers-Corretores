/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PaymentOption {
  type: 'vista' | 'cartao_12x' | 'recorrente' | 'boleto';
  label: string;
  totalPrice: number;
  installmentsCount: number;
  installmentValue?: number;
  entranceValue?: number;
  highlight?: string;
}

export interface PricingPlan {
  id: number;
  peopleCount: number;
  title: string;
  prices: {
    vista: number;
    cartao_12x: number;
    recorrente: {
      total: number;
      entrance: number;
      installments: number;
      installmentValue: number;
    };
    boleto: {
      total: number;
      entrance: number;
      installments: number;
      installmentValue: number;
    };
  };
  benefits: string[];
  lodgingNights: number; // 4 or 6 nights
}

export interface ProposalConfig {
  clientName: string;
  brokerName: string;
  whatsappNumber: string;
  selectedPlanId: number;
  selectedPaymentType: 'vista' | 'cartao_12x' | 'recorrente' | 'boleto';
  additionalObservation: string;
  showLodgingBenefit: boolean;
}
