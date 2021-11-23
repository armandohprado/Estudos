export interface GaEtapa {
  id: number;
  nome: string;
  ordem: number;
  publicados: number;
  selecionados: number;
  ativo: boolean;
  'qtde-superar': number;

  loading: boolean;
}
