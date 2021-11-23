import { Grupao } from '@aw-models/grupao';

export const ToPayload = (grupoes: Grupao[]) => {
  const grupoesCopy = [
    ...grupoes.map(grupao => ({ ...grupao, grupos: [...grupao.grupos.map(grupo => ({ ...grupo }))] })),
  ];
  return grupoesCopy.map(grupao => {
    return {
      ...grupao,
      grupos: grupao.grupos.map(grupo => {
        const {
          porcentagemParcial,
          isSelectable,
          isSelected,
          numeroProjeto,
          nomeProjeto,
          importado,
          idFamilia,
          ...others
        } = grupo as any;
        return {
          ...others,
          valorMetaGrupo: grupo.valorMetaGrupo,
        };
      }),
    };
  });
};
