import { Pipe, PipeTransform } from '@angular/core';
import { SituacaoFornecedor } from '../../models';

@Pipe({ name: 'situacao' })
export class SituacaoPipe implements PipeTransform {
  transform(value: SituacaoFornecedor): string {
    switch (value) {
      case SituacaoFornecedor.HOMOLOGADO:
        return 'Homologado no grupo';
      case SituacaoFornecedor.SIMPLESFORNECEDOR:
        return 'Cadastro';
      case SituacaoFornecedor.OUTROGRUPO:
        return 'Homologado na EAP';
      default:
        return '';
    }
  }
}
