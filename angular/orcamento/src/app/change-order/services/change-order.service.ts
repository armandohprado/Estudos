import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeOrder, ResponseCreateChangeOrder } from '../models/change-order';
import { BehaviorSubject, Observable, OperatorFunction } from 'rxjs';
import { PayloadChangeOrder } from '../models/payload-change-order';
import { switchMap, tap } from 'rxjs/operators';
import { GerenciadorArquivosMinIOService } from '@aw-services/gerenciador-arquivos-minio/gerenciador-arquivos-min-io.service';
import { refresh } from '@aw-utils/rxjs/operators';
import { Cenario, CenarioStatusEnum } from '@aw-models/index';
import { CenariosService } from '@aw-services/orcamento/cenarios.service';
import { ChangeOrderHeader } from '../models/change-order-header';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChangeOrderService {
  constructor(
    private http: HttpClient,
    private gerenciadorArquivosMinIOService: GerenciadorArquivosMinIOService,
    private cenariosService: CenariosService
  ) {}

  private _target = `${environment.AwApiUrl}change-order`;

  changeOrders$ = new BehaviorSubject<ChangeOrder[]>([]);
  header$ = new BehaviorSubject<ChangeOrderHeader>(null);

  getHeaderChangeOrder(idOrcamentoCenario: number): Observable<ChangeOrderHeader> {
    return this.http.get<ChangeOrderHeader>(`${this._target}/resumo/orcamento-cenarios/${idOrcamentoCenario}`).pipe(
      tap(header => {
        this.header$.next({ ...this.header$.value, ...header });
      })
    );
  }

  getChangeOrdersLista(idOrcamento: number): Observable<ChangeOrder[]> {
    return this.http.get<ChangeOrder[]>(`${this._target}/listar/${idOrcamento}`).pipe(
      tap(changeOrders => {
        this.changeOrders$.next(changeOrders);
      })
    );
  }

  private refreshChangeOrders<T>(idOrcamento: number): OperatorFunction<T, T> {
    return refresh(this.getChangeOrdersLista(idOrcamento));
  }

  aprovarChangeOrder(changeOrder: ChangeOrder, file: FileList): Observable<void> {
    const uploadFile$ = this.gerenciadorArquivosMinIOService.uploadArquivo('change-order', file[0]);
    const aprovar$ = (idUpload?: number) => {
      let params = new HttpParams();
      if (idUpload) {
        params = params.set('idUpload', '' + idUpload);
      }
      return this.http
        .put<void>(`${this._target}/aprovar/${changeOrder.idOrcamentoChangeOrder}`, undefined, {
          params,
        })
        .pipe(
          this.updateStatusOperator(
            CenarioStatusEnum.propostaAprovada,
            changeOrder.idOrcamentoCenario,
            changeOrder.idOrcamentoChangeOrder
          )
        );
    };
    return uploadFile$.pipe(switchMap(fileUpload => aprovar$(fileUpload.idUpload)));
  }

  private updateStatusOperator<T>(
    newStatus: number,
    idOrcamentoCenario: number,
    idOrcamentoChangeOrder?: number
  ): OperatorFunction<T, T> {
    return refresh(this.updateChageOrderStatus(idOrcamentoCenario, newStatus, idOrcamentoChangeOrder));
  }

  updateChageOrderStatus(
    idOrcamentoCenario: number,
    status: number,
    idOrcamentoChangeOrder?: number
  ): Observable<void> {
    const payload = {
      idCenarioStatus: status,
      idOrcamentoCenarioStatus: 0,
      idOrcamentoCenario,
      data: new Date(),
    };
    return this.http.put<void>(`${environment.AwApiUrl}orcamento-cenario/atualizarstatus`, payload).pipe(
      tap(() => {
        if (idOrcamentoChangeOrder) {
          this.changeOrders$.next(
            this.changeOrders$.value.map(changeOrder => ({
              ...changeOrder,
              idCenarioStatus:
                changeOrder.idOrcamentoChangeOrder === idOrcamentoChangeOrder ? status : changeOrder.idCenarioStatus,
            }))
          );
        }
      })
    );
  }

  createChangeOrder(payloadAddChangeOrder: PayloadChangeOrder): Observable<ResponseCreateChangeOrder> {
    return this.http.post<ResponseCreateChangeOrder>(this._target, payloadAddChangeOrder);
  }

  editarChangeOrder(payloadEditChangeOrder: PayloadChangeOrder): Observable<ResponseCreateChangeOrder> {
    return this.http.put<ResponseCreateChangeOrder>(this._target, payloadEditChangeOrder);
  }

  revisar(idOrcamento: number, changeOrder: ChangeOrder): Observable<Cenario[]> {
    return this.cenariosService
      .revisarCenario(idOrcamento, changeOrder.idOrcamentoCenario, {
        idCenarioStatus: changeOrder.idCenarioStatus,
        nome: changeOrder.nome,
      })
      .pipe(this.refreshChangeOrders(idOrcamento));
  }

  reprovar(idOrcamento: number, idOrcamentoCenario: number, idOrcamentoChangeOrder: number): Observable<void> {
    return this.http
      .put<void>(`${this._target}/${idOrcamentoChangeOrder}/reprovacao`, undefined)
      .pipe(this.refreshChangeOrders(idOrcamento));
  }
}
