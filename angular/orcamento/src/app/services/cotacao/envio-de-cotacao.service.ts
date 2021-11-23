import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable, of, Subject } from 'rxjs';
import {
  AnexoAvulso,
  Etapa,
  Extensao,
  Fornecedor,
  GrupoAlt,
  isAwReferencia,
  PropostaDetalhada,
  ResponsavelAlt,
  Site,
  SituacaoFornecedor,
} from '../../models';
import { filter, finalize, map, switchMap, switchMapTo } from 'rxjs/operators';
import { OrcamentoService } from '../orcamento/orcamento.service';
import { environment } from '../../../environments/environment';
import { GerenciadorArquivosService } from '../../orcamento/gerenciador-arquivos/gerenciador-arquivos.service';
import { GaEtapa } from '../../orcamento/gerenciador-arquivos/model/etapa';
import { uniqBy } from 'lodash-es';
import { FornecedorService } from '../orcamento/fornecedor.service';
import { EnvioCotacaoPayload, EnvioCotacaoPayloadFornecedorContato } from '@aw-models/envio-cotacao-payload';
import { AwDialogService } from '@aw-components/aw-dialog/aw-dialog.service';
import { refresh, refreshMap } from '@aw-utils/rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ValidacaoGrupoItem } from '../../grupo/definicao-escopo/model/grupo-item';
import { DefinicaoEscopoService } from '../../grupo/definicao-escopo/definicao-escopo.service';
import { OrcamentoGrupoResponsavelService } from '@aw-services/orcamento-grupo-responsavel/orcamento-grupo-responsavel.service';
import { OrcamentoAltService } from '@aw-services/orcamento-alt/orcamento-alt.service';

export interface SitesResponse {
  idProjeto: number;
  sites: Site[];
}

@Injectable({
  providedIn: 'root',
})
export class EnvioDeCotacaoService {
  constructor(
    private http: HttpClient,
    private orcamentoService: OrcamentoService,
    private gerenciadorArquivosService: GerenciadorArquivosService,
    private fornecedorService: FornecedorService,
    private awDialogService: AwDialogService,
    private definicaoEscopoService: DefinicaoEscopoService,
    private orcamentoGrupoResponsavelService: OrcamentoGrupoResponsavelService,
    private orcamentoAltService: OrcamentoAltService
  ) {}

  targets = {
    EnvioCotacaoFornecedores: `${environment.ApiUrl}orcamentos/orcamento-grupo-fornecedor/`,
    getEnvioCotacao: `${environment.ApiUrl}envio-cotacao/orcamento-grupo/`,
    getDisciplinas: `${environment.ApiUrl}disciplinas/`,
    getOrcamentoGrupo: `${environment.AwApiUrl}orcamento-grupo/`,
  };

  private _fornecedoresLoading$ = new BehaviorSubject<boolean>(false);
  fornecedoresLoading$ = this._fornecedoresLoading$.asObservable();

  sitesLoading = false;
  stagesLoading = false;

  retrieveStagesAction$ = new Subject<{
    idProjeto: number;
    idOrcamentoGrupo: number;
  }>();

  public envioStep$ = new BehaviorSubject<number>(0);

  stages$ = this.retrieveStagesAction$.asObservable().pipe(
    filter(payload => !!payload),
    switchMap(({ idOrcamentoGrupo, idProjeto }) => {
      this.stagesLoading = true;
      return this.gerenciadorArquivosService.getEtapasData(idProjeto, idOrcamentoGrupo).pipe(
        map<GaEtapa[], Etapa[]>(etapas =>
          etapas.map(etapa => ({
            apelidoEtapa: etapa.nome,
            ativo: etapa.ativo,
            idEtapa: etapa.id,
            idProjetoTipo: 0,
            nomeEtapa: etapa.nome,
            ordemEtapa: etapa.ordem,
            quantidadeArquivosSelecionados: etapa.selecionados,
            quantidadeTotalArquivos: etapa.publicados,
          }))
        ),
        finalize(() => {
          this.stagesLoading = false;
        })
      );
    })
  );

  fileExtensionsAction$ = new Subject<{
    idOrcamento: number;
    idOrcamentoGrupo: number;
  }>();

  fileExtensionsLoading = false;

  fileExtensions$ = this.fileExtensionsAction$.asObservable().pipe(
    filter(v => !!v),
    switchMap(({ idOrcamento, idOrcamentoGrupo }) => {
      this.fileExtensionsLoading = true;
      return this.getExtensoesArquivos(idOrcamento, idOrcamentoGrupo).pipe(
        finalize(() => (this.fileExtensionsLoading = false))
      );
    })
  );

  filesSelected$ = new BehaviorSubject<AnexoAvulso[]>([]);

  setFornecedoresLoading(loading: boolean): void {
    this._fornecedoresLoading$.next(loading);
  }

  getValidacaoGrupoItem(idOrcamentoGrupo): Observable<ValidacaoGrupoItem[]> {
    return this.http.get<ValidacaoGrupoItem[]>(
      `${this.targets.getOrcamentoGrupo}${idOrcamentoGrupo}/validacao-grupo-item`
    );
  }

  sendFile(idOrcamento: number, idOrcamentoGrupo: number, files: any): any {
    const formData = new FormData();
    for (const file of files) {
      formData.append('file', file, file.name);
    }

    const headers = new HttpHeaders().append('Content-Disposition', 'multipart/form-data');
    return this.http.post(
      `${environment.ApiUrl}orcamentos/${idOrcamento}/orcamento-grupo/${idOrcamentoGrupo}/upload-arquivo`,
      formData,
      {
        headers,
      }
    );
  }

  retrieveSites(idProjeto: number, idOrcamento: number): Observable<SitesResponse> {
    this.sitesLoading = true;
    return this.http
      .get<SitesResponse>(`${environment.ApiUrl}projetos/${idProjeto}/projeto-edificio/${idOrcamento}`)
      .pipe(
        finalize(() => {
          this.sitesLoading = false;
        })
        // shareReplay()
      );
  }

  deactivateStage(idEtapa: number, idProjeto: number): any {
    return this.http.put(`${environment.ApiUrl}projetos/${idProjeto}/etapas/${idEtapa}/alternar-status`, {});
  }

  retrieveStages(idProjeto: number, idOrcamentoGrupo: number): void {
    this.retrieveStagesAction$.next({ idProjeto, idOrcamentoGrupo });
  }

  getExtensoesArquivos(idOrcamento?: number, idOrcamentoGrupo?: number): Observable<Extensao[]> {
    let params = new HttpParams();
    if (idOrcamentoGrupo) {
      params = params.set('idOrcamentoGrupo', idOrcamentoGrupo.toString());
    }
    return this.http.get<Extensao[]>(`${environment.ApiUrl}orcamentos/${idOrcamento}/extensoes-arquivos`, { params });
  }

  setFilesSelected(filesArray): any {
    this.filesSelected$.next(filesArray);
  }

  getPropostasDetalhadas(idOrcamento: number, idGrupo: number): Observable<PropostaDetalhada> {
    return this.http.get<PropostaDetalhada>(
      `${environment.AwApiUrl}orcamento/${idOrcamento}/grupos/${idGrupo}/propostas-detalhadas`
    );
  }

  changeStep(step: number): void {
    this.envioStep$.next(step);
  }

  sendFileExtensionStatus(idOrcamento: number, payload: any): Observable<any> {
    const target = `${environment.ApiUrl}orcamentos/${idOrcamento}/extensoes-arquivos`;
    return this.http.put(target, payload);
  }

  getFornecedoresWithContatos(
    idOrcamento: number,
    grupo: GrupoAlt,
    idFornecedorAtual?: number,
    isControleCompras = false
  ): Observable<Fornecedor[]> {
    const fornecedores$ = this.fornecedorService.getFornecedores({
      idGrupo: grupo.idGrupo,
      idOrcamentoGrupo: grupo.idOrcamentoGrupo,
      idOrcamento,
      situacao: SituacaoFornecedor.HOMOLOGADO,
    });
    const contatos$ = this.orcamentoService.getContatosFornecedor(idOrcamento, grupo.idGrupo);
    const fornecedoresSelecionados$ = this.definicaoEscopoService.getFornecedoresSelecionados(grupo.idOrcamentoGrupo);
    return forkJoin([fornecedores$, contatos$, fornecedoresSelecionados$]).pipe(
      map(([fornecedores, contatos, fornecedoresSelecionados]) => {
        if (idFornecedorAtual) {
          fornecedores = fornecedores.filter(fornecedor => fornecedor.idFornecedor === idFornecedorAtual);
        }
        // Verifica se o fornecedor está selecionado, na proposta ou na definicao de escopo
        fornecedores = fornecedores.map(fornecedor => {
          const { propostas } = grupo;
          const propostaFornecedor = propostas.find(
            proposta => proposta.fornecedor?.idFornecedor === fornecedor.idFornecedor
          );
          if (propostaFornecedor) {
            fornecedor = {
              ...fornecedor,
              idContatoFornecedor: propostaFornecedor.idContatoFornecedor ?? fornecedor.contatos[0]?.idContato,
              comentarioProposta: propostaFornecedor.comentarioProposta ?? '',
              idProposta: propostaFornecedor.idProposta,
              possuiConfirmacaoCompra: isControleCompras && propostaFornecedor.possuiConfirmacaoCompra,
              possuiMapaEnviado: isControleCompras && propostaFornecedor.possuiMapaEnviado,
            };
          }
          const naoLiberado =
            (fornecedor.suspenso ||
              fornecedor.desomologado ||
              fornecedor.preHomologado ||
              fornecedor.precoBaixo ||
              fornecedor.volumeContratacao) &&
            !fornecedor.liberaCotacao;
          fornecedor = {
            ...fornecedor,
            fornecedorDisabledEnvioCotacao:
              naoLiberado || fornecedor.possuiConfirmacaoCompra || fornecedor.possuiMapaEnviado,
          };
          const fornecedorSelecionado = fornecedoresSelecionados.find(
            selecionado => selecionado.idFornecedor === fornecedor.idFornecedor
          );
          if (fornecedorSelecionado && !fornecedor.fornecedorDisabledEnvioCotacao) {
            fornecedor = {
              ...fornecedor,
              selected: true,
              idContatoFornecedor: fornecedor.idContatoFornecedor ?? fornecedorSelecionado.contato[0]?.idContato,
            };
          } else {
            fornecedor = { ...fornecedor, selected: false };
          }
          return {
            ...fornecedor,
            contatos: uniqBy(
              [
                ...(fornecedor.contatos ?? []),
                ...contatos.filter(contato => contato.idFornecedor === fornecedor.idFornecedor),
              ],
              'idContato'
            ),
          };
        });
        // Se todos os fornecedores estiverem selecionados por padrão, desselecionar
        const todosFornecedoresSelecionados = fornecedores
          .filter(fornecedor => !fornecedor.suspenso && !fornecedor.desomologado)
          .every(fornecedor => fornecedor.selected);
        if (!idFornecedorAtual && todosFornecedoresSelecionados) {
          fornecedores = fornecedores.map(fornecedor => ({ ...fornecedor, selected: false }));
        }
        return fornecedores;
      })
    );
  }

  private getFornecedoresLoja(
    idOrcamento: number,
    grupo: GrupoAlt,
    idFornecedorAtual?: number
  ): Observable<EnvioCotacaoPayloadFornecedorContato[]> {
    return this.getFornecedoresWithContatos(idOrcamento, grupo, idFornecedorAtual).pipe(
      map(fornecedores => {
        if (!isAwReferencia(grupo.nomeGrupo)) {
          fornecedores = fornecedores.filter(fornecedor => fornecedor.nomeFantasia !== 'AW REFERENCIA');
        }
        return fornecedores.map(({ idProposta, comentarioProposta, idFornecedor, idContatoFornecedor, contatos }) => ({
          idContatoFornecedor: idContatoFornecedor ?? contatos[0].idContato,
          idFornecedor,
          comentarioProposta,
          idProposta,
        }));
      })
    );
  }

  private getContatoLoja(idOrcamento: number, grupo: GrupoAlt, isControleCompras = false): Observable<ResponsavelAlt> {
    return this.orcamentoGrupoResponsavelService.get(idOrcamento, grupo.idGrupo, isControleCompras).pipe(
      map(contatos => {
        if (grupo.idFuncionarioContato) {
          return contatos.find(contato => contato.idFuncionario === grupo.idFuncionarioContato) ?? contatos[0];
        } else {
          return contatos[0];
        }
      })
    );
  }

  envioCotacaoLoja(
    idProjeto: number,
    idOrcamento: number,
    grupo: GrupoAlt,
    reenvio: boolean,
    idFornecedorAtual?: number,
    isControleCompras = false
  ): Observable<void> {
    const {
      idOrcamentoGrupo,
      idGrupo,
      necessariaVisita,
      contatoVisita,
      telefoneVisita,
      liberarQuantitativo,
      dataFimExecucaoServico,
      dataInicioExecucaoServico,
      dataLimiteEntregaMercadoria,
      dataLimiteRecebimento,
      idFamiliaCustomizada,
      idOrcamentoCenario,
    } = grupo;
    const atualizarMatriz$ = this.orcamentoService.updateMatriz({ idOrcamentoGrupo, idGrupo, idProjeto, idOrcamento });
    const fornecedores$ = this.getFornecedoresLoja(idOrcamento, grupo, idFornecedorAtual);
    const propostaDetalhada$ = this.getPropostasDetalhadas(idOrcamento, idGrupo);
    const contato$ = this.getContatoLoja(idOrcamento, grupo, isControleCompras).pipe(
      map(contato => contato?.idFuncionario)
    );
    const forked$ = forkJoin([fornecedores$, propostaDetalhada$, contato$]);
    return atualizarMatriz$.pipe(
      switchMapTo(forked$),
      switchMap(([fornecedorContato, detalhes, idFuncionarioContato]) => {
        const {
          local: { visita, grupoRestricaoObra },
          faturamento: { tipoFaturamento },
        } = detalhes;
        const payload: EnvioCotacaoPayload = {
          arquivoAnexo: [],
          dataLimiteDefinicao: dataLimiteRecebimento && new Date(dataLimiteRecebimento),
          dataFimExecucaoServico: dataFimExecucaoServico && new Date(dataFimExecucaoServico),
          dataInicioExecucaoServico: dataInicioExecucaoServico && new Date(dataInicioExecucaoServico),
          dataLimiteEntregaMercadoria: dataLimiteEntregaMercadoria && new Date(dataLimiteEntregaMercadoria),
          fornecedorContato,
          idFuncionarioContato,
          idOrcamentoGrupo,
          necessariaVisita: visita?.necessariaVisita ?? necessariaVisita ?? false,
          contatoVisita: visita?.contatoVisita ?? contatoVisita,
          telefoneVisita: visita?.telefoneVisita ?? telefoneVisita,
          grupoRestricaoObra,
          mensagemEnvioCotacao: '<p></p>',
          tipoFaturamento,
          liberarQuantitativo,
          faseDNN: !isControleCompras,
        };
        return this.orcamentoService
          .saveCotacao(payload, idOrcamento, idGrupo, reenvio, !!idFamiliaCustomizada)
          .pipe(refreshMap(() => this.orcamentoAltService.getGrupo(idOrcamento, idOrcamentoCenario, idOrcamentoGrupo)));
      })
    );
  }

  openEnviarCotacaoLoja(
    idProjeto: number,
    idOrcamento: number,
    grupo: GrupoAlt,
    reenvio: boolean,
    idFornecedorAtual?: number,
    aditionalRequests$: Observable<any> = of(null),
    isControleCompras = false
  ): BsModalRef {
    const label = reenvio ? 'Ree' : 'E';
    return this.awDialogService.warning({
      title: `${label}nviar a cotação`,
      content: `Deseja fazer o ${label.toLowerCase()}nvio da cotação?`,
      secondaryBtn: { title: `Não ${label.toLowerCase()}nviar` },
      primaryBtn: {
        title: `${label}nviar`,
        action: bsModalRef =>
          this.envioCotacaoLoja(idProjeto, idOrcamento, grupo, reenvio, idFornecedorAtual, isControleCompras).pipe(
            refresh(aditionalRequests$),
            finalize(() => {
              bsModalRef.hide();
            })
          ),
      },
    });
  }

  hasEscopo(idOrcamentoGrupo: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.targets.getOrcamentoGrupo}${idOrcamentoGrupo}/validacao-definicao-escopo`);
  }
}
