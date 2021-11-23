import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { ControleComprasService } from '../../state/controle-compras/controle-compras.service';
import { CcCabecalhoQuery } from '../../state/cabecalho/cc-cabecalho.query';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-links-cc',
  templateUrl: './links-cc.component.html',
  styleUrls: ['./links-cc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinksCcComponent {
  constructor(
    private controleComprasService: ControleComprasService,
    private ccCabecalhoQuery: CcCabecalhoQuery,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input() idOrcamento: number;
  @Input() idOrcamentoCenario: number;
  @Input() idProjeto: number;

  loadingAdicionarGrupos = false;
  loadingEnderecoObraModal = false;
  loadingGerenciarGrupos = false;

  urlCentralizacao = `${environment.centralizacao}athiewohnrath/Centralizacao/web/Projetos/RegrasComerciais/old/Q1new.ASP?PRJ_ID=`;
  urlCentralizacaoCc = `${environment.centralizacao}athiewohnrath/Centralizacao/web/Projetos/Orcamento06/old/ConfirmacaoCompraLst.asp?PRJ_ID=`;
  urlCentralizacaoCentralCompras = `${environment.centralizacao}Projetos/Web/Fornecedores/CentralComprasProjetoLista.aspx?idProjeto=`;

  async openAdicionarGrupos(): Promise<void> {
    this.loadingAdicionarGrupos = true;
    await this.controleComprasService.openAdicionarGrupos(
      this.idOrcamento,
      this.idOrcamentoCenario,
      this.ccCabecalhoQuery.getIdPlanoCompra()
    );
    this.loadingAdicionarGrupos = false;
    this.changeDetectorRef.markForCheck();
  }

  async openEnderecoObraModal(): Promise<void> {
    this.loadingEnderecoObraModal = true;
    await this.controleComprasService.openEnderecoObraModal(this.idProjeto);
    this.loadingEnderecoObraModal = false;
    this.changeDetectorRef.markForCheck();
  }

  async openGerenciarGrupos(): Promise<void> {
    this.loadingGerenciarGrupos = true;
    await this.controleComprasService.openGerenciarGrupos(
      this.idOrcamentoCenario,
      this.ccCabecalhoQuery.getIdCompraNegociacao()
    );
    this.loadingGerenciarGrupos = false;
    this.changeDetectorRef.markForCheck();
  }
}
