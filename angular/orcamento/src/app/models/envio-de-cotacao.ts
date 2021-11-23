import { OrcamentoGrupo } from './orcamentoGrupo';
import { Funcionario } from './funcionario';

export interface EnvioDeCotacao {
  idOrcamento: number;
  idProjeto: number;
  orcamentoGrupo: OrcamentoGrupo;
  funcionarios: Funcionario[];
}
