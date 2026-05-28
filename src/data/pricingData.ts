/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PricingPlan } from '../types';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 1,
    peopleCount: 1,
    title: "Título Social Vitalício 1 Pessoa",
    prices: {
      vista: 2526.30,
      cartao_12x: 2666.65,
      recorrente: {
        total: 2807.00,
        entrance: 401.00,
        installments: 30,
        installmentValue: 80.20
      },
      boleto: {
        total: 3087.70,
        entrance: 441.10,
        installments: 30,
        installmentValue: 88.22
      }
    },
    lodgingNights: 4,
    benefits: [
      "1° Ano de carteirinha grátis",
      "02 convites mensais depois do título quitado / não cumulativos",
      "50% de desconto no estacionamento",
      "4 diárias de hospedagem de domingo a quinta exceto em férias e feriados (boas vindas utilização apenas uma vez)"
    ]
  },
  {
    id: 2,
    peopleCount: 2,
    title: "Título Social Vitalício 2 Pessoas",
    prices: {
      vista: 4421.00,
      cartao_12x: 4667.35,
      recorrente: {
        total: 4913.00,
        entrance: 701.86,
        installments: 30,
        installmentValue: 140.37
      },
      boleto: {
        total: 5404.30,
        entrance: 772.04,
        installments: 30,
        installmentValue: 154.41
      }
    },
    lodgingNights: 4,
    benefits: [
      "1° Ano de carteirinha grátis",
      "02 convites mensais após título quitado / não cumulativos",
      "50% de desconto no estacionamento",
      "4 diárias de hospedagem de domingo a quinta exceto em férias e feriados (boas vindas utilização apenas uma vez)"
    ]
  },
  {
    id: 3,
    peopleCount: 3,
    title: "Título Social Vitalício 3 Pessoas",
    prices: {
      vista: 6317.10,
      cartao_12x: 6668.05,
      recorrente: {
        total: 7019.00,
        entrance: 1002.71,
        installments: 30,
        installmentValue: 200.54
      },
      boleto: {
        total: 7720.90,
        entrance: 1102.98,
        installments: 30,
        installmentValue: 220.59
      }
    },
    lodgingNights: 4,
    benefits: [
      "1° Ano de carteirinha grátis",
      "02 convites mensais após a quitação do título / não cumulativos",
      "50% de desconto no estacionamento",
      "4 diárias de hospedagem de domingo a quinta exceto em férias e feriados (boas vindas utilização apenas uma vez)"
    ]
  },
  {
    id: 4,
    peopleCount: 4,
    title: "Título Social Vitalício 4 Pessoas",
    prices: {
      vista: 7520.40,
      cartao_12x: 7958.20,
      recorrente: {
        total: 8356.00,
        entrance: 1193.71,
        installments: 30,
        installmentValue: 238.74
      },
      boleto: {
        total: 9191.60,
        entrance: 1313.08,
        installments: 30,
        installmentValue: 262.61
      }
    },
    lodgingNights: 4,
    benefits: [
      "1° Ano de carteirinha grátis",
      "02 convites mensais após a quitação do título / não cumulativos",
      "50% de desconto no estacionamento",
      "4 diárias de hospedagem de domingo a quinta exceto em férias e feriados (boas vindas utilização apenas uma vez)"
    ]
  },
  {
    id: 5,
    peopleCount: 5,
    title: "Título Social Vitalício 5 Pessoas",
    prices: {
      vista: 8442.20,
      cartao_12x: 8890.10,
      recorrente: {
        total: 9358.00,
        entrance: 1336.86,
        installments: 30,
        installmentValue: 267.37
      },
      boleto: {
        total: 10293.80,
        entrance: 1470.54,
        installments: 30,
        installmentValue: 294.10
      }
    },
    lodgingNights: 6,
    benefits: [
      "1° Ano de carteirinha grátis",
      "02 convites mensais após a quitação do título / não cumulativos",
      "50% de desconto no estacionamento",
      "6 diárias de hospedagem de domingo a quinta exceto em férias e feriados (boas vindas utilização apenas uma vez)"
    ]
  },
  {
    id: 6,
    peopleCount: 6,
    title: "Título Social Vitalício 6 Pessoas",
    prices: {
      vista: 8843.40,
      cartao_12x: 9334.70,
      recorrente: {
        total: 9826.00,
        entrance: 1403.70,
        installments: 30,
        installmentValue: 280.74
      },
      boleto: {
        total: 10808.60,
        entrance: 1544.80,
        installments: 30,
        installmentValue: 308.81
      }
    },
    lodgingNights: 6,
    benefits: [
      "1° Ano de carteirinha grátis",
      "02 convites mensais após a quitação do título / não cumulativos",
      "50% de desconto no estacionamento",
      "6 diárias de hospedagem de domingo a quinta exceto em férias e feriados (boas vindas utilização apenas uma vez)"
    ]
  },
  {
    id: 7,
    peopleCount: 8,
    title: "Título Vitalício Familiar",
    prices: {
      vista: 8640.00,
      cartao_12x: 9120.00,
      recorrente: {
        total: 9600.00,
        entrance: 1371.84,
        installments: 30,
        installmentValue: 274.27
      },
      boleto: {
        total: 9600.00,
        entrance: 1371.84,
        installments: 30,
        installmentValue: 274.27
      }
    },
    lodgingNights: 8,
    benefits: [
      "Título Familiar vitalício (Titular + cônjuge + Pai, Mãe, Sogro, Sogra e filhos até 24 anos)",
      "02 convites mensais após quitação do título / não cumulativos",
      "8 diárias de hospedagem para utilizar com sua família ou convidados (conforme regulamento)",
      "1ª anuidade de carteirinhas grátis para titular e agregados",
      "50% de desconto no estacionamento",
      "10% de desconto no Réveillon"
    ]
  },
  {
    id: 8,
    peopleCount: 8,
    title: "Título Familiar Vitalício Remido",
    prices: {
      vista: 18000.00,
      cartao_12x: 18000.00,
      recorrente: {
        total: 18900.00,
        entrance: 2835.00,
        installments: 30,
        installmentValue: 535.50
      },
      boleto: {
        total: 20700.00,
        entrance: 3105.00,
        installments: 30,
        installmentValue: 586.50
      }
    },
    lodgingNights: 12,
    benefits: [
      "Isento permanentemente de taxa de manutenção mensal",
      "Familiar completo (Titular + Cônjuge + Filhos até 21 anos, ou até 24 cursando faculdade + Pai, Mãe, Sogro, Sogra)",
      "02 convites mensais após quitação do título / não cumulativos",
      "50% de desconto no estacionamento",
      "10% de desconto no Réveillon",
      "12 diárias de hospedagem fracionadas em 3x, de domingo a quinta, exceto férias/feriados (boas-vindas, utilização única conforme regulamento)"
    ]
  }
];

export const SALES_TIPS = [
  {
    title: "Apresentação Pelo Custo/Benefício Individual",
    description: "Sempre destaque o valor por pessoa. Dividir o valor total pelo número de pessoas demonstra um enorme desconto de escala. Para 6 pessoas, o valor à vista cai para cerca de R$ 1.473,90 por pessoa! Ancore isso como argumento familiar."
  },
  {
    title: "A Vantagem do Crédito Recorrente",
    description: "Excelente argumento de fechamento para clientes que gostariam de parcelar, mas não querem comprometer o limite total do cartão de crédito. Com o Recorrente, apenas o valor da parcela mensal (e da entrada) consome espaço no cartão."
  },
  {
    title: "Ancoragem de Preços (Método do Boleto)",
    description: "Apresente primeiro o preço do Boleto em 30x para acostumar o cliente com o patamar cheio de preço. Quando apresentar a opção à vista com desconto de até R$ 1.900,00 ou o parcelamento sem juros em 12x no cartão, o senso de oportunidade será maximizado!"
  },
  {
    title: "Falta de Limite Temporária",
    description: "Se o cliente tem cartão mas limitação de crédito imediata, sugira a entrada reduzida + parcelamento direto no Boleto ou Cartão Recorrente em 30 vezes. É o fechamento garantido na hora."
  }
];
