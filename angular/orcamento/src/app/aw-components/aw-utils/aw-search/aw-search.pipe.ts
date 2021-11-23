import { Pipe, PipeTransform } from '@angular/core';
import { get, isArray, isFunction, isString } from 'lodash-es';
import { normalize } from '../../../utils/string';

/*
 * Como usar
 *
 * Use esse pipe somente em arrays, não funciona com strings (mas podemos fazer funcionar, se necessário)
 *
 * @parameter commandOrKeyOrTerm
 * Esse parametro pode ser 4 coisas:
 * 1. Uma função que retorna um boolean
 *   Essa função será executada no filter (value.filter(val => suaFuncaoAqui(val, term)))
 * 2. Uma string com '.'
 *   Será feita a pesquisa nos elementos do array comparando com o termo informado no terceiro parametro,
 *   usado somente para arrays simples (number[], string[], boolean[], etc)
 * 3. keyof T (Key do seu objeto)
 *   Será feita a pesquisa no seu array comparando a key informada com o termo informado no terceiro parametro
 * 4. Array de keyof T (Array com keys do seu objeto)
 *   Será feita a pesquisa no seu array comparando as keys informadas com o termo informado no terceiro parametro
 *
 * @parameter term
 * Termo a ser pesquisado (string)
 *
 * @parameter deep (opcional)
 * Se o dado for uma propriedade aninhada, e.g. [{ id: 1, data: { termPesquisa: 'string' } }] se colocaria 'data' no deep
 * Veja o exemplo do AwSelect (ele usa deep)
 *
 * E.g. 1
 *   **TS**
 *   items = [1, 2, 3];
 *   term = '1';
 *   searchFn = (item, term) => '' + item === term;
 *   **HTML**
 *   <div *ngFor="let item of items | search: searchFn: term">
 *
 * E.g. 2
 *   <div *ngFor="let item of ['string1', 'string2', 'string3'] | search: '.': 'string1' ">
 *
 * E.g. 3
 *   <div *ngFor="let item of [{name: 'Name 1', desc: 'of name1'}, {name: 'Name 2', desc: 'of name2'}] | search: 'name': 'Name 1'"
 *
 * E.g. 4
 *   <div *ngFor="let item of [{name: 'Name 1', desc: 'of name1'}, {name: 'Name 2', desc: 'of name2'}] | search: ['name', 'desc']: 'Name 1'"
 *
 * */

export type SearchType<T> = keyof T | (keyof T)[] | '.' | SearchFn<T>;
export type SearchFn<T> = (value: T, term: any) => boolean;

@Pipe({ name: 'awSearch' })
export class AwSearchPipe implements PipeTransform {
  transform<T = any>(
    value: T[],
    commandOrKey: SearchType<T>,
    term: any,
    deep?: string
  ): T[] {
    return search(value, commandOrKey, term, deep);
  }
}

export function search<T = any>(
  value: T[],
  commandOrKey: SearchType<T>,
  term: any,
  deep?: string
): T[] {
  if (!value?.length || !commandOrKey || !term) {
    return value;
  }
  if (isFunction(commandOrKey)) {
    return value.filter(val => {
      return deep
        ? commandOrKey(get(val, deep), term)
        : commandOrKey(val, term);
    });
  } else if (isString(commandOrKey)) {
    if (commandOrKey === '.') {
      return value.filter(val => {
        return compare(val, term);
      });
    } else {
      return value.filter(val => {
        return compare(val, term, commandOrKey, deep);
      });
    }
  } else if (isArray(commandOrKey)) {
    return value.filter(val => {
      return commandOrKey.some(key => {
        return compare(val, term, key, deep);
      });
    });
  }
}

export const compare = <T = any>(
  value: T,
  term: any,
  key?: keyof T,
  deep?: string
): boolean => {
  let valueANew: any = value;
  if (deep) {
    valueANew = get(valueANew, deep);
  }
  if (key) {
    valueANew = valueANew?.[key];
  }
  return normalize(valueANew)
    .toLowerCase()
    .includes(normalize(term).toLowerCase());
};
