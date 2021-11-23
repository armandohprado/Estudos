export enum QuestionarioStep1 {
  QUESTIONARIO_TIPO = 'informacao-questionario-tipo',
  QUESTIONARIO_TIPO_NOME_PROFISSIONAL = 'informacao-questionario-tipo-nome-profissional',
  QUESTIONARIO_TIPO_JUSTIFICATIVA = 'informacao-questionario-tipo-justificativa',
  QUESTIONARIO_INICIAL_NOME_PROJETO = 'informacao-inicial-nome-projeto',
  QUESTIONARIO_INICIAL_FUNCIONARIO = 'informacao-inicial-funcionario',
  QUESTIONARIO_INICIAL_TIPO = 'informacao-inicial-tipo',
  QUESTIONARIO_INICIAL_DATA = 'informacao-inicial-data',
  QUESTIONARIO_INICIAL_QUESTIONARIO = 'informacao-inicial-questionario',
  QUESTIONARIO_INICIAL_INTERLOCUTOR_NOME = 'informacao-questionario-interlocutor-nome',
  QUESTIONARIO_INICIAL_INTERLOCUTOR_CARGO = 'informacao-questionario-interlocutor-cargo',
  QUESTIONARIO_INICIAL_INTERLOCUTOR_EMAIL = 'informacao-questionario-interlocutor-email',
  QUESTIONARIO_INICIAL_INTERLOCUTOR_TELEFONE = 'informacao-questionario-interlocutor-telefone',
}

export enum QuestionarioStep2 {
  QUESTIONARIO_EMPRESA_ENDERECO_ENTREGA = 'dados-empresa-endereco-entrega',
  QUESTIONARIO_EMPRESA_RAZAO = 'dados-empresa-razao-social',
  QUESTIONARIO_EMPRESA_ENDERECO = 'dados-empresa-endereco',
  QUESTIONARIO_EMPRESA_COMPLEMENTO = 'dados-empresa-complemento',
  QUESTIONARIO_EMPRESA_BAIRRO = 'dados-empresa-bairro',
  QUESTIONARIO_EMPRESA_CNPJ = 'dados-empresa-cnpj',
  QUESTIONARIO_EMPRESA_INSCRICAO = 'dados-empresa-inscricao-estadual',
  QUESTIONARIO_EMPRESA_ESTADO = 'dados-empresa-estado',
  QUESTIONARIO_EMPRESA_CIDADE = 'dados-empresa-cidade',
}

export enum QuestionarioStep3 {
  QUESTIONARIO_CONTRATACAO_FORMA = 'informacoes-contratacao-forma',
  QUESTIONARIO_CONTRATACAO_IMPACTO = 'informacoes-contratacao-impacto',
  QUESTIONARIO_CONTRATACAO_FORNECEDORES = 'informacoes-contratacao-cadastro-fornecedores',
  QUESTIONARIO_CONTRATACAO_FORNECEDORES_OUTROS = 'informacoes-contratacao-cadastro-fornecedores-outros',
  QUESTIONARIO_CONTRATACAO_PROJETOCEI = 'informacoes-contratacao-cadastro-projeto-cei',
  QUESTIONARIO_CONTRATACAO_CADASTROGFIP = 'informacoes-contratacao-cadastro-gfip',
  QUESTIONARIO_CONTRATACAO_OBRASP = 'informacoes-contratacao-obra-sp',
  QUESTIONARIO_CONTRATACAO_OBRASP_ALVARA = 'informacoes-contratacao-obra-sp-alvara',
  QUESTIONARIO_CONTRATACAO_OBRASP_CADASTRO = 'informacoes-contratacao-obra-sp-cadastro-obra',
  QUESTIONARIO_CONTRATACAO_DIFAL = 'informacoes-contratacao-informacoes-difal',
}

export enum QuestionarioStep4 {
  QUESTIONARIO_PAGAMENTO_CONDICAO_MEDICAO = 'condicao-pagamento-medicao',
  QUESTIONARIO_PAGAMENTO_CONDICAO_INSS = 'condicao-pagamento-inss',
  QUESTIONARIO_PAGAMENTO_MEDICAO_ALOCADO = 'condicao-pagamento-medicao-profissional-alocado',
  QUESTIONARIO_PAGAMENTO_MEDICAO_APROVACAO = 'condicao-pagamento-medicao-profissional-aprovacao',
  QUESTIONARIO_PAGAMENTO_MEDICAO_DIAS = 'condicao-pagamento-medicao-profissional-dias',

  QUESTIONARIO_PAGAMENTO_PRAZO_FATURAMENTO = 'condicao-pagamento-prazo',
  QUESTIONARIO_PAGAMENTO_PRAZO_FATURAMENTO_DIAS_TIPO = 'condicao-pagamento-prazo-tipo',
  QUESTIONARIO_PAGAMENTO_PRAZO_FORMADEPAGAMENTO = 'condicao-pagamento-forma-pagamento',

  QUESTIONARIO_PAGAMENTO_CONTRATACAOAW_PRAZO = 'condicao-pagamento-contratacao-aw',
  QUESTIONARIO_PAGAMENTO_CONTRATACAOAW_DIAS_TIPO = 'condicao-pagamento-contratacao-aw-tipo',
  QUESTIONARIO_PAGAMENTO_CONTRATACAOAW_PREFERENCIA = 'condicao-pagamento-preferencia-pagamento',
  QUESTIONARIO_PAGAMENTO_CONTRATACAOAW_OBSERVACAO = 'condicao-pagamento-observacao',

  QUESTIONARIO_PAGAMENTO_DATADECORTE = 'condicao-pagamento-data-corte',
  QUESTIONARIO_PAGAMENTO_DATADECORTE_NF_SERVICO_CLIENTE = 'condicao-pagamento-data-corte-nf-servico-cliente',
  QUESTIONARIO_PAGAMENTO_DATADECORTE_NF_PRODUTO_CLIENTE = 'condicao-pagamento-data-corte-nf-produto-cliente',
  QUESTIONARIO_PAGAMENTO_DATADECORTE_NF_SERVICO_GRUPO = 'condicao-pagamento-data-corte-nf-servico-grupo',
  QUESTIONARIO_PAGAMENTO_DATADECORTE_NF_PRODUTO_GRUPO = 'condicao-pagamento-data-corte-nf-produto-grupo',
  QUESTIONARIO_PAGAMENTO_DATADECORTE_PO = 'condicao-pagamento-data-corte-numero-po',
  QUESTIONARIO_PAGAMENTO_DATADECORTE_ESPELHO = 'condicao-pagamento-data-corte-envio-espelho',
  QUESTIONARIO_PAGAMENTO_DATADECORTE_PO_FATURA = 'condicao-pagamento-data-corte-po-faturada',
  QUESTIONARIO_PAGAMENTO_DATADECORTE_PO_FATURA_OBS = 'condicao-pagamento-data-corte-po-faturada-observacao',

  QUESTIONARIO_PAGAMENTO_DOCUMENTACAO = 'condicao-pagamento-documentacao',
  QUESTIONARIO_PAGAMENTO_DOCUMENTACAO_TIPO = 'condicao-pagamento-documentacao-tipo',
  QUESTIONARIO_PAGAMENTO_DOCUMENTACAO_XML = 'condicao-pagamento-documentacao-xml',
  QUESTIONARIO_PAGAMENTO_DOCUMENTACAO_NOME = 'condicao-pagamento-documentacao-nome',
  QUESTIONARIO_PAGAMENTO_DOCUMENTACAO_EMAIL = 'condicao-pagamento-documentacao-email',
  QUESTIONARIO_PAGAMENTO_DOCUMENTACAO_TELEFONE = 'condicao-pagamento-documentacao-telefone',
  QUESTIONARIO_PAGAMENTO_DOCUMENTACAO_CARGO = 'condicao-pagamento-documentacao-cargo',

  QUESTIONARIO_PAGAMENTO_CONTATOFINANCEIRO_NOME = 'condicao-pagamento-contato-fincanceiro-nome',
  QUESTIONARIO_PAGAMENTO_CONTATOFINANCEIRO_EMAIL = 'condicao-pagamento-contato-fincanceiro-email',
  QUESTIONARIO_PAGAMENTO_CONTATOFINANCEIRO_TELEFONE = 'condicao-pagamento-contato-fincanceiro-telefone',

  QUESTIONARIO_PAGAMENTO_DOCUMENTACAO_NF_VALORTOTAL = 'condicao-pagamento-sinal-valor-total',
  QUESTIONARIO_PAGAMENTO_DOCUMENTACAO_NF_VALORSINAL = 'condicao-pagamento-sinal-valor-sinal',
  QUESTIONARIO_PAGAMENTO_DOCUMENTACAO_RECIBO = 'condicao-pagamento-sinal-recibo',
  QUESTIONARIO_PAGAMENTO_DOCUMENTACAO_OUTRO = 'condicao-pagamento-sinal-outro',
  QUESTIONARIO_PAGAMENTO_CONSIDERACOES_FINAIS = 'condicao-pagamento-consideracoes-finais',
}

export enum QuestionarioModelo {
  FATURAMENTO = 1,
  IMPLANTACAO = 2,
}

export enum QuestionarioUploadType {
  UPLOAD_CNPJ = 'questionario-cartao-cnpj',
  UPLOAD_POLITICA_SEGURANCA = 'questionario-politica-seguranca-trabalho',
  UPLOAD_ISENCAO = 'questionario-isencao-de-responsabilidade',
}

export interface Questionario {
  idQuestionario: number;
  idProjeto: number;
  idQuestionarioModelo: number;
  questionarioRespostas: any[];
}

export interface QuestionarioResposta {
  nomeChave: string;
  valorChave: string;
  ordemChave: number;
}

export interface QuestionarioByStep {
  idQuestionario: number;
  idQuestionarioModelo: number;
  idProjeto: number;
  passos: {
    passo1: any;
    passo2: any;
    passo3: any;
    passo4: any;
  };
}
