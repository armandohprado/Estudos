import { GrupoItem } from '../../grupo/definicao-escopo/model/grupo-item';
import { compareValues } from '@aw-components/aw-utils/aw-order-by/aw-order-by';
import { isNil } from 'lodash-es';

export const getNumeracao = (numeracao: string): [number | string, number] => {
  const numeracaoArray = numeracao.split('.');
  const beforeDot = +numeracaoArray[0];
  const afterDot = +(numeracaoArray[1] ?? 0);
  return [isNaN(beforeDot) ? numeracaoArray[0] : beforeDot, afterDot];
};

export const orderByNumeracao = (tag?: boolean) => (valueA: GrupoItem, valueB: GrupoItem) => {
  const tagA = valueA.tag;
  const tagB = valueB.tag;
  const numeracaoA = getNumeracao(valueA.numeracao ?? valueA.numeracaoGrupoItem ?? '');
  const numeracaoB = getNumeracao(valueB.numeracao ?? valueB.numeracaoGrupoItem ?? '');
  const beforeDotA = numeracaoA[0];
  const beforeDotB = numeracaoB[0];
  const afterDotA = numeracaoA[1];
  const afterDotB = numeracaoB[1];
  if (tagA !== tagB && tag) {
    return compareValues(tagA, tagB);
  } else if (beforeDotA !== beforeDotB) {
    return compareValues(beforeDotA, beforeDotB);
  } else if (afterDotA !== afterDotB) {
    return compareValues(afterDotA, afterDotB);
  }
};

export const orderByCodigo = <T>(key: keyof T, fallback?: keyof T) => (valueA: T, valueB: T) => {
  const numeracaoA = getNumeracao(valueA[key as string] ?? valueA?.[fallback]);
  const numeracaoB = getNumeracao(valueB[key as string] ?? valueB?.[fallback]);
  const beforeDotA = numeracaoA[0];
  const beforeDotB = numeracaoB[0];
  const afterDotA = numeracaoA[1];
  const afterDotB = numeracaoB[1];
  if (beforeDotA !== beforeDotB) {
    return compareValues(beforeDotA, beforeDotB);
  } else if (afterDotA !== afterDotB) {
    return compareValues(afterDotA, afterDotB);
  }
};

export const orderByCodigoWithoutDefinedNumberOfDots = <T>(key: keyof T) => (valueA: T, valueB: T) => {
  let numeracoesA: number[] = (valueA[key as string]?.split?.('.') ?? []).map(Number);
  let numeracoesB: number[] = (valueB[key as string]?.split?.('.') ?? []).map(Number);
  const length = Math.max(numeracoesA.length, numeracoesB.length);
  numeracoesA = Array.from({ length }, (item, index) => (isNil(numeracoesA[index]) ? 0 : numeracoesA[index]));
  numeracoesB = Array.from({ length }, (item, index) => (isNil(numeracoesB[index]) ? 0 : numeracoesB[index]));
  for (let i = 0; i < length; i++) {
    const codA = numeracoesA[i];
    const codB = numeracoesB[i];
    if (codA !== codB) {
      return compareValues(codA, codB);
    }
  }
};
