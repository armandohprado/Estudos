import { Pipe, PipeTransform } from '@angular/core';
import { Funcionario } from '../../models';

@Pipe({ name: 'selectEmployee' })
export class SelectEmployeePipe implements PipeTransform {
  transform(funcionarios: Funcionario[], principal?: boolean): Funcionario {
    if (funcionarios && funcionarios.length) {
      if (principal) {
        return funcionarios.find(funcionario => funcionario.principal);
      }
      return funcionarios.find(funcionario => !funcionario.principal);
    }

    return null;
  }
}
