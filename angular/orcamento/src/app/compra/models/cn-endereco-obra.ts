export interface CnEnderecoObra {
  idProjeto: number;
  cepDocumento?: string;
  enderecoDocumento?: string;
  complementoDocumento?: string;
  bairroDocumento?: string;
  idCidadeDocumento?: number;
  cidadeDocumento?: string;
  idEstadoDocumento?: number;
  idPaisDocumento?: number;
  cepEntrega?: string;
  enderecoEntrega?: string;
  complementoEntrega?: string;
  bairroEntrega?: string;
  idCidadeEntrega?: number;
  cidadeEntrega?: string;
  idEstadoEntrega?: number;
  idPaisEntrega?: number;
}

export interface CnEnderecoObraFormGroup {
  documento: {
    cep?: string;
    endereco?: string;
    complemento?: string;
    bairro?: string;
    idCidade?: number;
    idEstado?: number;
    idPais?: number;
    cidade?: string;
  };
  entrega: {
    cep?: string;
    endereco?: string;
    complemento?: string;
    bairro?: string;
    idCidade?: number;
    idEstado?: number;
    idPais?: number;
    cidade?: string;
  };
}

export function cnMapEnderecoObraToFormGroup(cnEnderecoObra: CnEnderecoObra): CnEnderecoObraFormGroup {
  return {
    documento: {
      cep: cnEnderecoObra.cepDocumento,
      idPais: cnEnderecoObra.idPaisDocumento,
      endereco: cnEnderecoObra.enderecoDocumento,
      bairro: cnEnderecoObra.bairroDocumento,
      complemento: cnEnderecoObra.complementoDocumento,
      idCidade: cnEnderecoObra.idCidadeDocumento,
      idEstado: cnEnderecoObra.idEstadoDocumento,
      cidade: cnEnderecoObra.cidadeDocumento,
    },
    entrega: {
      cep: cnEnderecoObra.cepEntrega,
      endereco: cnEnderecoObra.enderecoEntrega,
      bairro: cnEnderecoObra.bairroEntrega,
      complemento: cnEnderecoObra.complementoEntrega,
      idPais: cnEnderecoObra.idPaisEntrega,
      idCidade: cnEnderecoObra.idCidadeEntrega,
      idEstado: cnEnderecoObra.idEstadoEntrega,
      cidade: cnEnderecoObra.cidadeEntrega,
    },
  };
}

export function cnMapEnderecoObraFormGroupToPayload(
  idProjeto: number,
  cnEnderecoObra: CnEnderecoObraFormGroup
): CnEnderecoObra {
  return {
    idProjeto,
    cepDocumento: cnEnderecoObra.documento.cep,
    enderecoDocumento: cnEnderecoObra.documento.endereco,
    complementoDocumento: cnEnderecoObra.documento.complemento,
    bairroDocumento: cnEnderecoObra.documento.bairro,
    idCidadeDocumento: cnEnderecoObra.documento.idCidade,
    cidadeDocumento: cnEnderecoObra.documento.cidade,
    idEstadoDocumento: cnEnderecoObra.documento.idEstado,
    idPaisDocumento: cnEnderecoObra.documento.idPais,
    cepEntrega: cnEnderecoObra.entrega.cep,
    enderecoEntrega: cnEnderecoObra.entrega.endereco,
    complementoEntrega: cnEnderecoObra.entrega.complemento,
    bairroEntrega: cnEnderecoObra.entrega.bairro,
    idCidadeEntrega: cnEnderecoObra.entrega.idCidade,
    cidadeEntrega: cnEnderecoObra.entrega.cidade,
    idEstadoEntrega: cnEnderecoObra.entrega.idEstado,
    idPaisEntrega: cnEnderecoObra.entrega.idPais,
  };
}
