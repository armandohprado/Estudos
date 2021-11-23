export interface ModalProjetoTecnico {
  idOrcamentoCenarioGrupo: number;
  idOrcamentoGrupo: number;
  idOrcamentoCenario: number;
  ativo: boolean;
  excluido: boolean;
  opcional: boolean;
  classificacao: ClassificacaoEnum;
  nomeGrupo: string;
  codigoGrupo: string;
  loader?: boolean;
}

export enum ClassificacaoEnum {
  obrigatorio = 1,
  sugerido,
  opcional,
}
