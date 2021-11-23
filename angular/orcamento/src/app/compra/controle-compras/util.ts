import { CnConfirmacaoCompra, CnConfirmacaoCompraFornecedor } from '../models/cn-confirmacao-compra';
import { CnConfirmacaoCompraGrupo } from '../models/cn-confirmacao-compra-grupo';
import { CnEmitirCc } from '../models/cn-emitir-cc';
import { CnMapa } from '../models/cn-mapa';
import { CnGrupoStatusEnum } from '../models/cn-grupo-status.enum';
import { sumBy } from 'lodash-es';
import { CnConfirmacaoCompraModo, CnGrupo, CnGruposTabsEnum, CnTipoGrupoEnum } from '../models/cn-grupo';
import { compareValues, orderBy } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { orderByCodigoWithoutDefinedNumberOfDots } from '@aw-utils/grupo-item/sort-by-numeracao';
import { ValidatorFn, Validators } from '@angular/forms';
import { isNotNil } from '@aw-utils/util';
import { environment } from '../../../environments/environment';
import { GrupoTransferencia } from '@aw-models/controle-compras/grupo-transferencia';
import { CnMigracaoBudgetGrupoResumo } from '../models/cn-migracao-budget-resumo';

export function mapCnConfirmacaoCompra(cnConfirmacaoCompraGrupo: CnConfirmacaoCompraGrupo): CnConfirmacaoCompra {
  return {
    dadosGrupo: {
      prazoExecucaoObra: cnConfirmacaoCompraGrupo.prazoExecucaoObra,
      prazoEntregaObra: cnConfirmacaoCompraGrupo.prazoEntregaObra,
      condicaoPagamento: cnConfirmacaoCompraGrupo.condicaoPagamento,
    },
    cliente: {
      numeroInterno: cnConfirmacaoCompraGrupo.numeroInternoCliente,
      entregaProdutosServicos: {
        observacao: cnConfirmacaoCompraGrupo.observacao,
        endereco: cnConfirmacaoCompraGrupo.enderecoEntrega,
        complemento: cnConfirmacaoCompraGrupo.complementoEntrega,
        pais: cnConfirmacaoCompraGrupo.idPaisEntrega
          ? {
              nome: cnConfirmacaoCompraGrupo.paisEntrega,
              idPais: cnConfirmacaoCompraGrupo.idPaisEntrega,
            }
          : null,
        uf: cnConfirmacaoCompraGrupo.idEstadoEntrega
          ? {
              idEstado: cnConfirmacaoCompraGrupo.idEstadoEntrega,
              sigla: '',
              idPais: cnConfirmacaoCompraGrupo.idPaisEntrega,
              nome: cnConfirmacaoCompraGrupo.estadoEntrega,
            }
          : null,
        cidade: cnConfirmacaoCompraGrupo.idCidadeEntrega
          ? {
              idEstado: cnConfirmacaoCompraGrupo.idEstadoEntrega,
              idCidade: cnConfirmacaoCompraGrupo.idCidadeEntrega,
              nome: cnConfirmacaoCompraGrupo.cidadeEntrega,
            }
          : null,
        cep: cnConfirmacaoCompraGrupo.cepEntrega,
        bairro: cnConfirmacaoCompraGrupo.bairroEntrega,
      },
      entregaDocumentos: {
        endereco: cnConfirmacaoCompraGrupo.enderecoDocumento,
        complemento: cnConfirmacaoCompraGrupo.complementoDocumento,
        pais: cnConfirmacaoCompraGrupo.idPaisDocumento
          ? {
              nome: cnConfirmacaoCompraGrupo.paisDocumento,
              idPais: cnConfirmacaoCompraGrupo.idPaisDocumento,
            }
          : null,
        uf: cnConfirmacaoCompraGrupo.idEstadoDocumento
          ? {
              idEstado: cnConfirmacaoCompraGrupo.idEstadoDocumento,
              sigla: '',
              idPais: cnConfirmacaoCompraGrupo.idPaisDocumento,
              nome: cnConfirmacaoCompraGrupo.estadoDocumento,
            }
          : null,
        cidade: cnConfirmacaoCompraGrupo.idCidadeDocumento
          ? {
              idEstado: cnConfirmacaoCompraGrupo.idEstadoDocumento,
              idCidade: cnConfirmacaoCompraGrupo.idCidadeDocumento,
              nome: cnConfirmacaoCompraGrupo.cidadeDocumento,
            }
          : null,
        cep: cnConfirmacaoCompraGrupo.cepDocumento,
        bairro: cnConfirmacaoCompraGrupo.bairroDocumento,
      },
    },
  };
}

export function mapCnPavimentosEmitirCc(emitirCc: CnEmitirCc): CnEmitirCc {
  return {
    ...emitirCc,
    pavimentos: emitirCc.pavimentos
      .map(pavimento => ({
        ...pavimento,
        centrosCustos: pavimento.centrosCustos
          .map(centroCusto => ({ ...centroCusto, itens: centroCusto.itens.filter(item => item.valorTotal) }))
          .filter(centroCusto => centroCusto.itens.length),
      }))
      .filter(pavimento => pavimento.centrosCustos.length),
    contato: {
      nome: emitirCc.nomeContato,
      idContato: emitirCc.idContato,
    },
    emitirNF: (emitirCc.emitirNF ?? []).filter(nf => nf),
    valorSaldoComTransferencias: emitirCc.valorSaldo,
  };
}

export function mapCnMapaTotais(percentualImposto: number, mapa?: CnMapa): CnMapa {
  const limiteCompras = mapa?.valorLimiteCompra ?? 0;
  const compraNegociacaoGrupoMapaFornecedor = (mapa?.compraNegociacaoGrupoMapaFornecedor ?? [])
    .map(fornecedor => {
      if (mapa?.idCompraNegociacaoStatus !== CnGrupoStatusEnum.MapaRetornado) {
        fornecedor = { ...fornecedor, valorTotalNegociado: 0 };
      }
      const valorTotalImpostoRevenda =
        fornecedor.valorTotalNegociado / ((100 - percentualImposto) / 100) - fornecedor.valorTotalNegociado;
      return {
        ...fornecedor,
        valorTotalImpostoRevenda,
        valorTotalRevenda: valorTotalImpostoRevenda + fornecedor.valorTotalNegociado,
      };
    })
    .filter(fornecedor => fornecedor.valorTotalOrcado > 0 || fornecedor.valorTotalSelecionado > 0);

  const totalSelecionado = {
    enviado: sumBy(mapa?.compraNegociacaoGrupoMapaFornecedor ?? [], 'valorTotalSelecionado'),
    negociado: sumBy(mapa?.compraNegociacaoGrupoMapaFornecedor ?? [], 'valorTotalNegociado'),
    impostoRevenda: sumBy(mapa?.compraNegociacaoGrupoMapaFornecedor ?? [], 'valorTotalImpostoRevenda'),
    revenda: sumBy(mapa?.compraNegociacaoGrupoMapaFornecedor ?? [], 'valorTotalRevenda'),
  };

  const dmEnviado = limiteCompras - totalSelecionado.enviado;
  const dmNegociado = !totalSelecionado.negociado ? 0 : limiteCompras - totalSelecionado.negociado;
  const dmImposto = dmNegociado / ((100 - percentualImposto) / 100) - dmNegociado;
  const dmRevenda = dmNegociado + dmImposto;

  const totalDiferencaMargem = {
    enviado: dmEnviado,
    negociado: dmNegociado,
    impostoRevenda: dmImposto,
    revenda: dmRevenda,
  };

  const tscrgEnviado = limiteCompras - (totalSelecionado.enviado + dmEnviado);
  const tscrgNegociado = limiteCompras - (totalSelecionado.negociado + dmNegociado);
  const tscrgImposto = tscrgNegociado / ((100 - percentualImposto) / 100) - tscrgNegociado;
  const tscrgRevenda = tscrgNegociado + tscrgImposto;

  const totalSaldoContigenciaRetidoGrupo = {
    enviado: tscrgEnviado,
    negociado: tscrgNegociado,
    impostoRevenda: tscrgImposto,
    revenda: tscrgRevenda,
  };

  const total = {
    enviado: totalSelecionado.enviado + totalSaldoContigenciaRetidoGrupo.enviado,
    negociado: totalSelecionado.negociado + totalSaldoContigenciaRetidoGrupo.negociado,
    impostoRevenda: totalSelecionado.impostoRevenda + totalSaldoContigenciaRetidoGrupo.impostoRevenda,
    revenda: totalSelecionado.revenda + totalSaldoContigenciaRetidoGrupo.revenda,
  };

  const compraNegociacaoGrupoFicha = mapa?.compraNegociacaoGrupoFicha;

  return {
    ...mapa,
    compraNegociacaoGrupoMapaFornecedor,
    totalSelecionado,
    totalSaldoContigenciaRetidoGrupo,
    total,
    totalDiferencaMargem,
    compraNegociacaoGrupoFicha: {
      ...compraNegociacaoGrupoFicha,
      compraNegociacaoGrupoFichaAprovador: compraNegociacaoGrupoFicha?.compraNegociacaoGrupoFichaAprovador ?? [],
      compraNegociacaoGrupoFichaArquivo: compraNegociacaoGrupoFicha?.compraNegociacaoGrupoFichaArquivo ?? [],
      compraNegociacaoGrupoFichaTipoAreaCausa:
        compraNegociacaoGrupoFicha?.compraNegociacaoGrupoFichaTipoAreaCausa ?? [],
      compraNegociacaoGrupoTransacao: compraNegociacaoGrupoFicha?.compraNegociacaoGrupoTransacao ?? [],
      compraNegociacaoGrupoTransacaoCC: compraNegociacaoGrupoFicha?.compraNegociacaoGrupoTransacaoCC ?? [],
    },
  };
}

export function mapCnGrupos(grupos: CnGrupo[], tipo: CnTipoGrupoEnum): CnGrupo[] {
  return grupos.map(grupo => {
    if (grupo.numeracao) {
      grupo = { ...grupo, codigo: grupo.numeracao };
    }
    const gruposDuplicadosIds = cnGrupoFindDuplicadosIdsRecursive(grupo, grupos);
    if (gruposDuplicadosIds.length) {
      grupo = {
        ...grupo,
        gruposDuplicadosIds: [grupo.idCompraNegociacaoGrupo, ...gruposDuplicadosIds],
        isOrigem: true,
      };
    }
    return {
      ...grupo,
      tipo,
      tabAtual: CnGruposTabsEnum.Orcamento,
      gruposTransferencia: [],
      gruposTransferenciaCC: [],
      confirmacaoCompraFornecedores: [],
      confirmacaoCompraMiscellaneous: [],
      confirmacaoCompraRevenda: [],
      collapseMapa: true,
      valorUtilizado: cnGetValorSaldoAtualizado(grupo),
      confirmacaoCompraModo: CnConfirmacaoCompraModo.Fornecedor,
    };
  });
}

const cnOrderByCompare = orderByCodigoWithoutDefinedNumberOfDots<CnGrupo>('codigo');

export function cnOrderGrupos(grupos: CnGrupo[]): CnGrupo[] {
  return [...grupos].sort((grupoA, grupoB) => {
    if (grupoA.grupoNaoPrevisto !== grupoB.grupoNaoPrevisto) {
      return compareValues(grupoA.grupoNaoPrevisto, grupoB.grupoNaoPrevisto);
    }
    return cnOrderByCompare(grupoA, grupoB);
  });
}

export function cnGrupoMerge(grupoA: CnGrupo | undefined, grupoB: CnGrupo | undefined): CnGrupo {
  return {
    ...grupoA,
    ...grupoB,
    tabAtual: grupoA?.tabAtual ?? grupoB?.tabAtual ?? CnGruposTabsEnum.Orcamento,
    gruposTransferencia: grupoA?.gruposTransferencia ?? grupoB?.gruposTransferencia ?? [],
    gruposTransferenciaCC: grupoA?.gruposTransferenciaCC ?? grupoB?.gruposTransferenciaCC ?? [],
    confirmacaoCompraFornecedores: grupoA?.confirmacaoCompraFornecedores ?? grupoB?.confirmacaoCompraFornecedores ?? [],
    confirmacaoCompraMiscellaneous:
      grupoA?.confirmacaoCompraMiscellaneous ?? grupoB?.confirmacaoCompraMiscellaneous ?? [],
    collapseMapa: grupoA?.collapseMapa ?? grupoB?.collapseMapa ?? true,
    confirmacaoCompraModo:
      grupoA?.confirmacaoCompraModo ?? grupoB?.confirmacaoCompraModo ?? CnConfirmacaoCompraModo.Fornecedor,
  };
}

export function cnGrupoFindDuplicadosIdsRecursive(grupo: CnGrupo, grupos: CnGrupo[]): number[] {
  const duplicados = grupos.filter(
    filho =>
      filho.idCompraNegociacaoGrupo !== grupo.idCompraNegociacaoGrupo &&
      filho.idOrcamentoGrupoOrigem === grupo.idOrcamentoGrupo
  );
  if (!duplicados.length) {
    return [];
  }
  const duplicadosCopy = [...duplicados.map(filho => filho.idCompraNegociacaoGrupo)];
  for (const duplicado of duplicados) {
    duplicadosCopy.push(...cnGrupoFindDuplicadosIdsRecursive(duplicado, grupos));
  }
  return duplicadosCopy;
}

export function cnMapGrupoDuplicadoSum(grupo: CnGrupo): CnGrupo {
  if (!grupo.gruposDuplicados?.length) {
    return grupo;
  }
  grupo = {
    ...grupo,
    valorSaldo: 0,
    valorUtilizado: 0,
    valorSaldoContingenciaReservado: 0,
    valorImposto: 0,
    valorSaldoContingencia: 0,
    valorMetaCompra: 0,
    valorLimiteCompra: 0,
    valorCompraCongelada: 0,
    valorMargemRevenda: 0,
    valorMiscellaneous: 0,
    valorMiscellaneousReservado: 0,
    valorSaldoReservadoChangeOrder: 0,
    valorSaldoTransferido: 0,
    valorSaldoTransferidoChangeOrder: 0,
    valorVendaCongelada: 0,
    valorEmissaoCC: 0,
    valorSaldoAtualizado: 0,
  };
  for (const grupoDuplicado of grupo.gruposDuplicados) {
    grupo = {
      ...grupo,
      valorSaldo: grupo.valorSaldo + grupoDuplicado.valorSaldo ?? 0,
      valorUtilizado: grupo.valorUtilizado + grupoDuplicado.valorUtilizado ?? 0,
      valorSaldoContingenciaReservado:
        grupo.valorSaldoContingenciaReservado + grupoDuplicado.valorSaldoContingenciaReservado ?? 0,
      valorImposto: grupo.valorImposto + grupoDuplicado.valorImposto ?? 0,
      valorSaldoContingencia: grupo.valorSaldoContingencia + grupoDuplicado.valorSaldoContingencia ?? 0,
      valorMetaCompra: grupo.valorMetaCompra + grupoDuplicado.valorMetaCompra ?? 0,
      valorLimiteCompra: grupo.valorLimiteCompra + grupoDuplicado.valorLimiteCompra ?? 0,
      valorCompraCongelada: grupo.valorCompraCongelada + grupoDuplicado.valorCompraCongelada ?? 0,
      valorMargemRevenda: grupo.valorMargemRevenda + grupoDuplicado.valorMargemRevenda ?? 0,
      valorMiscellaneous: grupo.valorMiscellaneous + grupoDuplicado.valorMiscellaneous ?? 0,
      valorMiscellaneousReservado: grupo.valorMiscellaneousReservado + grupoDuplicado.valorMiscellaneousReservado ?? 0,
      valorSaldoReservadoChangeOrder:
        grupo.valorSaldoReservadoChangeOrder + grupoDuplicado.valorSaldoReservadoChangeOrder ?? 0,
      valorSaldoTransferido: grupo.valorSaldoTransferido + grupoDuplicado.valorSaldoTransferido ?? 0,
      valorSaldoTransferidoChangeOrder:
        grupo.valorSaldoTransferidoChangeOrder + grupoDuplicado.valorSaldoTransferidoChangeOrder ?? 0,
      valorVendaCongelada: grupo.valorVendaCongelada + grupoDuplicado.valorVendaCongelada ?? 0,
      valorEmissaoCC: grupo.valorEmissaoCC + grupoDuplicado.valorEmissaoCC ?? 0,
      valorSaldoAtualizado: grupo.valorSaldoAtualizado + cnGetValorSaldoAtualizado(grupoDuplicado),
    };
  }
  return grupo;
}

export function cnMapGrupoDuplicados(grupos: CnGrupo[]): CnGrupo[] {
  return grupos
    .map(grupo => {
      if (grupo.gruposDuplicadosIds?.length) {
        const gruposDuplicados = grupo.gruposDuplicadosIds
          .map(idCompraNegociacaoGrupo =>
            grupos.find(duplicado => duplicado.idCompraNegociacaoGrupo === idCompraNegociacaoGrupo)
          )
          .filter(isNotNil);
        const codigoArray = grupo.codigo.split('.');
        codigoArray.pop();
        grupo = {
          ...grupo,
          codigo: codigoArray.join('.'),
          gruposDuplicados: cnOrderGrupos(gruposDuplicados),
        };
        grupo = cnMapGrupoDuplicadoSum(grupo);
      }
      return grupo;
    })
    .filter(
      (grupo, _, array) =>
        !grupo.idOrcamentoGrupoOrigem || !array.some(_grupo => grupo.idOrcamentoGrupoOrigem === _grupo.idOrcamentoGrupo)
    );
}

export function cnGetValorSaldoAtualizado(grupo: CnGrupo): number {
  return grupo.valorSaldoContingenciaReservado || grupo.valorSaldo;
}

export function cnCreateValidatorDataFluxoSD(grupo: CnGrupo): ValidatorFn {
  return grupo.flagControleSD ? Validators.required : () => null;
}

export function cnMapConfirmacaoCompraFornecedorFactory(
  miscellaneous = false
): (confirmacaoCompraFornecedores: CnConfirmacaoCompraFornecedor[]) => CnConfirmacaoCompraFornecedor[] {
  return confirmacaoCompraFornecedores =>
    (confirmacaoCompraFornecedores ?? []).map(confirmacaoCompraFornecedor => {
      if (
        confirmacaoCompraFornecedor.numeracao &&
        confirmacaoCompraFornecedor.idCompraNegociacaoGrupoConfirmacaoCompra
      ) {
        const numeracaoSemCC = confirmacaoCompraFornecedor.numeracao.replace(/\D/g, '');
        confirmacaoCompraFornecedor = {
          ...confirmacaoCompraFornecedor,
          urlCentralizacao: `${environment.centralizacao}projetos/web/printpagina/OpenReport.aspx?cce_id=${numeracaoSemCC}`,
        };
      }
      if (miscellaneous) {
        confirmacaoCompraFornecedor = {
          ...confirmacaoCompraFornecedor,
          nomeFantasia:
            confirmacaoCompraFornecedor.emitirMapaEmissaoCompraMensagem ?? confirmacaoCompraFornecedor.nomeFantasia,
          idCompraNegociacaoGrupoMapaFornecedor: -1,
          propertyValor: confirmacaoCompraFornecedor.miscellaneous ? 'valorMargemRevenda' : 'valorSaldoContingencia',
        };
      }
      return confirmacaoCompraFornecedor;
    });
}

export function cnMapGruposTransferencia<T extends GrupoTransferencia>(grupos: T[]): T[] {
  return orderBy(
    grupos.map(grupo => {
      grupo = {
        ...grupo,
        valorSaldoUtilizado:
          grupo.valorSaldoContingenciaReservado === 0 ? grupo.valorSaldo : grupo.valorSaldoContingenciaReservado,
        codigo: grupo.numeracao ?? grupo.codigo,
      };
      return grupo;
    }),
    orderByCodigoWithoutDefinedNumberOfDots<T>('codigo')
  );
}

export function cnMapMigracaoBudgetResumoGrupos(
  grupos: CnMigracaoBudgetGrupoResumo[],
  orderByKey: keyof CnMigracaoBudgetGrupoResumo
): CnMigracaoBudgetGrupoResumo[] {
  return orderBy(
    grupos.map(grupo => ({ ...grupo, data: grupo.data && new Date(grupo.data) })),
    orderByCodigoWithoutDefinedNumberOfDots(orderByKey)
  );
}
