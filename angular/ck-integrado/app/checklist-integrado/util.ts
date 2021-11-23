import { Cronogramas } from '@aw-models/cronogramas';
import { CheckListColumnType, CheckLists, ColDefKeys, HelperKeys } from '@aw-models/check-list';
import { CheckListParticipante } from '@aw-models/check-list-participante';
import { isFunction } from '@aw-utils/utils';
import { ObraFase } from '@aw-models/obra-fase';
import { CurvaFinanceira, DataCurvaFinanceira } from '@aw-models/curva-financeira';

let uid = 99;

export function getUid(): number {
  return uid++;
}

export function mapCronogramas(cronogramas: Cronogramas): Cronogramas {
  return {
    ...cronogramas,
    cronogramas: (cronogramas.cronogramas ?? []).map(cronograma => {
      const idCronograma = getUid();
      return {
        ...cronograma,
        itens: (cronograma.itens ?? []).map(item => ({
          ...item,
          dataPrevista: item.dataPrevista && new Date(item.dataPrevista),
          dataRealizada: item.dataRealizada && new Date(item.dataRealizada),
          idCheckListCronograma: cronograma.idCheckListCronograma,
          _id: getUid(),
          _idCronograma: idCronograma,
        })),
        _id: idCronograma,
      };
    }),
  };
}

export function mapCheckLists(checkLists: CheckLists): CheckLists {
  return {
    ...checkLists,
    dataSemana: checkLists.dataSemana && new Date(checkLists.dataSemana),
    dataPublicacao: checkLists.dataPublicacao && new Date(checkLists.dataPublicacao),
    agrupadorChecklist: (checkLists.agrupadorChecklist ?? []).map(checkListAgrupador => {
      const idCheckListAgrupador = getUid();
      let columnType: CheckListColumnType;
      switch (checkListAgrupador.descricao) {
        case 'Change Order':
          columnType = CheckListColumnType.ChangeOrder;
          break;
        case 'Metas':
          columnType = CheckListColumnType.Meta;
          break;
        default:
          columnType = CheckListColumnType.Itens;
      }
      const colDefKey = (columnType + 'ColDef') as ColDefKeys;
      const helperKey = (columnType + 'Helper') as HelperKeys;
      return {
        ...checkListAgrupador,
        _id: idCheckListAgrupador,
        columnType,
        colDefKey,
        helperKey,
        collapsed: false,
        checklists: (checkListAgrupador.checklists ?? []).map(checkList => {
          const idCheckList = getUid();
          return {
            ...checkList,
            _id: idCheckList,
            _idCheckListAgrupador: idCheckListAgrupador,
            columnType,
            colDefKey,
            helperKey,
            collapsed: true,
            niveis: (checkList.niveis ?? []).map(nivel => {
              const idCheckListNivel = getUid();
              return {
                ...nivel,
                _id: idCheckListNivel,
                _idCheckList: idCheckList,
                _idCheckListAgrupador: idCheckListAgrupador,
                publicavelDescricao: nivel.publicavelComunicado ? 'Publicável' : 'Não publicável',
                funcao: checkList.funcao,
                columnType,
                colDefKey,
                helperKey,
                collapsed: false,
                maxItens: nivel.idCheckListIntegradoNivel === 42 ? 5 : undefined, // TODO ID CHUMBADO
                itens: (nivel.itens ?? []).map(item => ({
                  ...item,
                  dataPrevista: item.dataPrevista && new Date(item.dataPrevista),
                  _id: getUid(),
                  _idCheckList: idCheckList,
                  _idCheckListNivel: idCheckListNivel,
                  _idCheckListAgrupador: idCheckListAgrupador,
                  bloquearStatus: nivel.bloquearStatus,
                  bloquearAcao: nivel.bloquearAcao,
                  bloquearObservacoes: nivel.bloquearObservacoes,
                  bloquearResponsavel: nivel.bloquearResponsavel,
                  bloquearDataPrevista: nivel.bloquearDataPrevista,
                  bloquearPercentualPrevisto: nivel.bloquearPercentualPrevisto,
                  bloquearPercentualRealizado: nivel.bloquearPercentualRealizado,
                  bloquearValor: nivel.bloquearValor,
                  publicavelComunicado: nivel.publicavelComunicado,
                  publicavelDescricao: nivel.publicavelComunicado ? 'Publicável' : 'Não publicável',
                  idProjetoCheckListIntegrado: nivel.idProjetoCheckListIntegrado,
                  idCheckListIntegradoNivel: nivel.idCheckListIntegradoNivel,
                  funcao: checkList.funcao,
                  tipoHorario: nivel.tipoHorario,
                  columnType,
                  colDefKey,
                  helperKey,
                })),
              };
            }),
          };
        }),
      };
    }),
  };
}

export function mapParticipantes(participantes: CheckListParticipante[]): CheckListParticipante[] {
  return participantes.map(participante => ({ ...participante, _id: getUid() }));
}

export function mapObraFases(obraFases: ObraFase[]): ObraFase[] {
  return obraFases.map(obraFase => {
    const idObraFase = getUid();
    return {
      ...obraFase,
      _id: idObraFase,
      _funcao: obraFase.alteraPercentualCargo ? 'GI' : 'Gerencial',
      obraFasePeriodo: (obraFase.obraFasePeriodo ?? []).map(periodo => ({
        ...periodo,
        _id: getUid(),
        _idObraFase: idObraFase,
      })),
    };
  });
}

export function mapCurvaFinanceira(curvaFinanceiras: CurvaFinanceira[]): CurvaFinanceira[] {
  return curvaFinanceiras.map(curvaFinanceira => ({ ...curvaFinanceira, _id: getUid() }));
}

export function mapDataCurvaFinanceira(dataCurvaFinanceira: DataCurvaFinanceira): DataCurvaFinanceira {
  return {
    ...dataCurvaFinanceira,
    periodos: (dataCurvaFinanceira.periodos ?? []).map(periodo => ({
      ...periodo,
      _id: getUid(),
    })),
  };
}

export function resolvePredicates<T extends { _id: number }>(
  _id: number | ((checkList: T) => boolean),
  partial: Partial<T> | ((checkList: T) => T)
): { predicate: (entity: T) => boolean; update: (entity: T) => T } {
  const predicate = isFunction(_id) ? _id : (checkList: T) => checkList._id === _id;
  const update = isFunction(partial) ? partial : (checkList: T) => ({ ...checkList, ...partial });
  return { predicate, update };
}
