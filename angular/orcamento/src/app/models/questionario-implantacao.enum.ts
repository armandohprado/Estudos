export enum QuestionarioImplantacaoStep1 {
  QUESTIONARIO_IMPLANTACAO_OBJETIVO_FORMULARIO = 'questionario-implantacao-objetivo-formulario',
  QUESTIONARIO_IMPLANTACAO_FORNECIDA_PELO_CLIENTE = 'questionario-implantacao-fornecida-pelo-cliente',
  QUESTIONARIO_IMPLANTACAO_INFO_NOME_PROFISSIONAL = 'questionario-implantacao-info-nome-profissional',
  QUESTIONARIO_IMPLANTACAO_INTERLOCUTOR_NOME = 'questionario-implantacao-interlocutor-nome',
  QUESTIONARIO_IMPLANTACAO_INTERLOCUTOR_CARGO = 'questionario-implantacao-interlocutor-cargo',
  QUESTIONARIO_IMPLANTACAO_INTERLOCUTOR_EMAIL = 'questionario-implantacao-interlocutor-email',
  QUESTIONARIO_IMPLANTACAO_INTERLOCUTOR_PHONE = 'questionario-implantacao-interlocutor-phone',
  QUESTIONARIO_IMPLANTACAO_EXCLUIR_FORNECEDOR_PREMISSA = 'questionario-implantacao-excluir-fornecedor-premissa',
  QUESTIONARIO_IMPLANTACAO_EXCLUIR_FORNECEDOR = 'questionario-implantacao-excluir-fornecedor',
  QUESTIONARIO_IMPLANTACAO_EXCLUIR_FORNECEDOR_NOME = 'questionario-implantacao-excluir-fornecedor-nome',
  QUESTIONARIO_IMPLANTACAO_RECOMENDAR_FORNECEDOR_PREMISSA = 'questionario-implantacao-recomendar-fornecedor-premissa',
  QUESTIONARIO_IMPLANTACAO_RECOMENDAR_FORNECEDOR = 'questionario-implantacao-recomendar-fornecedor',
  QUESTIONARIO_IMPLANTACAO_RECOMENDAR_FORNECEDOR_NOME = 'questionario-implantacao-recomendar-fornecedor-nome',
}

export enum QuestionarioImplantacaoStep2 {
  QUESTIONARIO_IMPLANTACAO_SEGURANCA_TRABALHO_PREMISSA = 'questionario-implantacao-seguranca-trabalho-premissa',
  QUESTIONARIO_IMPLANTACAO_SEGURANCA_TRABALHO = 'questionario-implantacao-seguranca-trabalho',
  QUESTIONARIO_IMPLANTACAO_SEGURANCA_TRABALHO_JUSTIFICATIVA = 'questionario-implantacao-seguranca-trabalho-justificativa',
  QUESTIONARIO_IMPLANTACAO_FUNCIONARIOS_INTEGRACAO_PREMISSA = 'questionario-implantacao-funcionarios-integracao-premissa',
  QUESTIONARIO_IMPLANTACAO_FUNCIONARIOS_INTEGRACAO = 'questionario-implantacao-funcionarios-integracao',
  QUESTIONARIO_IMPLANTACAO_FUNCIONARIOS_INTEGRACAO_JUSTIFICATIVA = 'questionario-implantacao-funcionarios-integracao-justificativa',
  QUESTIONARIO_IMPLANTACAO_FUNCIONARIOS_INTEGRACAO_ENDERECO = 'questionario-implantacao-funcionarios-intgracao-endereco',
  QUESTIONARIO_IMPLANTACAO_FUNCIONARIOS_INTEGRACAO_DIA = 'questionario-implantacao-funcionarios-integracao-dia',
  QUESTIONARIO_IMPLANTACAO_FUNCIONARIOS_INTEGRACAO_HORA = 'questionario-implantacao-funcionarios-integracao-hora',
  QUESTIONARIO_IMPLANTACAO_FUNCIONARIOS_INTEGRACAO_DOCS = 'questionario-implantacao-funcionarios-integracao-docs',
  QUESTIONARIO_IMPLANTACAO_LIMITE_JORNADA_PREMISSA = 'questionario-implantacao-limite-jornada-premissa',
  QUESTIONARIO_IMPLANTACAO_LIMITE_JORNADA = 'questionario-implantacao-limite-jornada',
  QUESTIONARIO_IMPLANTACAO_LIMITE_JORNADA_JUSTIFICATIVA = 'questionario-implantacao-limite-jornada-justificativa',
  QUESTIONARIO_IMPLANTACAO_ROTINA_LIBERACAO_PREMISSA = 'questionario-implantacao-rotina-liberacao-premissa',
  QUESTIONARIO_IMPLANTACAO_ROTINA_LIBERACAO = 'questionario-implantacao-rotina-liberacao',
  QUESTIONARIO_IMPLANTACAO_ROTINA_LIBERACAO_JUSTIFICATIVA = 'questionario-implantacao-rotina-liberacao-justificativa',
  QUESTIONARIO_IMPLANTACAO_CRITERIOS_EPI_PREMISSA = 'questionario-implantacao-criterios-epi-premissa',
  QUESTIONARIO_IMPLANTACAO_CRITERIOS_EPI = 'questionario-implantacao-criterios-epi',
  QUESTIONARIO_IMPLANTACAO_CRITERIOS_EPI_JUSTIFICATIVA = 'questionario-implantacao-criterios-epi-justificativa',
  QUESTIONARIO_IMPLANTACAO_CRITERIOS_AMBULATORIO_PREMISSA = 'questionario-implantacao-criterios-ambulatorio-premissa',
  QUESTIONARIO_IMPLANTACAO_CRITERIOS_AMBULATORIO = 'questionario-implantacao-criterios-ambulatorio',
  QUESTIONARIO_IMPLANTACAO_CRITERIOS_AMBULATORIO_JUSTIFICATIVA = 'questionario-implantacao-ambulatorio-justificativa',
  QUESTIONARIO_IMPLANTACAO_CRITERIOS_ALIMENTACAO_PREMISSA = 'questionario-implantacao-criterios-alimentacao-premissa',
  QUESTIONARIO_IMPLANTACAO_CRITERIOS_ALIMENTACAO = 'questionario-implantacao-criterios-alimentacao',
  QUESTIONARIO_IMPLANTACAO_CRITERIOS_ALIMENTACAO_JUSTIFICATIVA = 'questionario-implantacao-alimentacao-justificativa',
}

export enum QuestionarioImplantacaoUploadType {
  UPLOAD_SEG_TRABALHO = 'questionario-politica-seguranca-trabalho',
  UPLOAD_SEG_INTEGRACAO = 'questionario-sessoes-integracao-seguranca',
  UPLOAD_ISENCAO_RESPONSABILIDADE = 'questionario-isencao-de-responsabilidade',
}

export enum QuestionarioImplantacaoStep3 {
  QUESTIONARIO_IMPLANTACAO_LOCAL_DISPONIVEL_PREMISSA = 'questionario-implantacao-local-disponivel-premissa',
  QUESTIONARIO_IMPLANTACAO_LOCAL_DISPONIVEL = 'questionario-implantacao-local-disponivel',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_PREMISSA = 'questionario-implantacao-liberado-premissa',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_SEM_RESTRICAO = 'questionario-implantacao-liberado-sem-restricao',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_SEM_RESTRICAO_INICIO = 'questionario-implantacao-liberado-sem-restricao-inicio',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_SEM_RESTRICAO_FIM = 'questionario-implantacao-liberado-sem-restricao-fim',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_NOITE = 'questionario-implantacao-liberado-noite',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_NOITE_INICIO = 'questionario-implantacao-liberado-noite-inicio',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_NOITE_FIM = 'questionario-implantacao-liberado-noite-fim',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_FDS = 'questionario-implantacao-liberado-fds',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_FDS_INICIO = 'questionario-implantacao-liberado-fds-inicio',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_FDS_FIM = 'questionario-implantacao-liberado-fds-fim',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_NOITE_FDS = 'questionario-implantacao-liberado-noite-fds',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_NOITE_FDS_INICIO = 'questionario-implantacao-liberado-noite-fds-inicio',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_NOITE_FDS_FIM = 'questionario-implantacao-liberado-noite-fds-fim',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_SOMENTE_DIA = 'questionario-implantacao-liberado-somente-dia',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_SOMENTE_DIA_INICIO = 'questionario-implantacao-liberado-somente-dia-inicio',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_SOMENTE_DIA_FIM = 'questionario-implantacao-liberado-somente-dia-fim',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_OUTROS = 'questionario-implantacao-liberado-outros',
  QUESTIONARIO_IMPLANTACAO_LIBERADO_OUTROS_JUSTIFICATIVA = 'questionario-implantacao-liberado-outros-justificativa',
  QUESTIONARIO_IMPLANTACAO_VAGAS_GARAGEM_PREMISSA = 'questionario-implantacao-vagas-garagem-premissa',
  QUESTIONARIO_IMPLANTACAO_VAGAS_GARAGEM = 'questionario-implantacao-vagas-garagem',
  QUESTIONARIO_IMPLANTACAO_VAGAS_GARAGEM_JUSTIFICATIVA = 'questionario-implantacao-vagas-garagem-justificativa',
  QUESTIONARIO_IMPLANTACAO_ENERGIA_PREMISSA = 'questionario-implantacao-energia-premissa',
  QUESTIONARIO_IMPLANTACAO_ENERGIA = 'questionario-implantacao-energia',
  QUESTIONARIO_IMPLANTACAO_ENERGIA_JUSTIFICATIVA = 'questionario-implantacao-energia-justificativa',
  QUESTIONARIO_IMPLANTACAO_CONSUMO_AGUA_PREMISSA = 'questionario-implantacao-consumo-agua-premissa',
  QUESTIONARIO_IMPLANTACAO_CONSUMO_AGUA = 'questionario-implantacao-consumo-agua',
  QUESTIONARIO_IMPLANTACAO_CONSUMO_AGUA_ORGANIZACAO = 'questionario-implantacao-consumo-agua-organizacao',
  QUESTIONARIO_IMPLANTACAO_CONSUMO_AGUA_JUSTIFICATIVA = 'questionario-implantacao-consumo-agua-justificativa',
  QUESTIONARIO_IMPLANTACAO_ACOMPANHAMENTO_BOMBEIRO_PREMISSA = 'questionario-implantacao-acompanhamento-bombeiro-premissa',
  QUESTIONARIO_IMPLANTACAO_ACOMPANHAMENTO_BOMBEIRO = 'questionario-implantacao-acompanhamento-bombeiro',
  QUESTIONARIO_IMPLANTACAO_ACOMPANHAMENTO_BOMBEIRO_JUSTIFICATIVA = 'questionario-implantacao-acompanhamento-bombeiro-justificativa',
  QUESTIONARIO_IMPLANTACAO_APROVACAO_PROJETOS_PREMISSA = 'questionario-implantacao-aprovacao-projetos-premissa',
  QUESTIONARIO_IMPLANTACAO_APROVACAO_PROJETOS = 'questionario-implantacao-aprovacao-projetos',
  QUESTIONARIO_IMPLANTACAO_APROVACAO_PROJETOS_JUSTIFICATIVA = 'questionario-implantacao-aprovacao-projetos-justificativa',
}

export enum QuestionarioImplantacaoStep4 {
  QUESTIONARIO_IMPLANTACAO_DOC_AUMENTO_AREA_PREMISSA = 'questionario-implantacao-doc-aumento-area-premissa',
  QUESTIONARIO_IMPLANTACAO_DOC_AUMENTO_AREA = 'questionario-implantacao-doc-aumento-area',
  QUESTIONARIO_IMPLANTACAO_DOC_HABITESE_PREMISSA = 'questionario-implantacao-doc-habitese-premissa',
  QUESTIONARIO_IMPLANTACAO_DOC_HABITESE = 'questionario-implantacao-doc-habitese',
  QUESTIONARIO_IMPLANTACAO_DOC_HABITESE_ORGANIZACAO = 'questionario-implantacao-doc-habitese-organizacao',
}

export enum QuestionarioImplantacaoStep5 {
  QUESTIONARIO_IMPLANTACAO_AUMENTO_OBRA_PREMISSA = 'questionario-implantacao-aumento-obra-premissa',
  QUESTIONARIO_IMPLANTACAO_AUMENTO_OBRA = 'questionario-implantacao-aumento-obra',
  QUESTIONARIO_IMPLANTACAO_PARCIAL_PORCENTAGEM = 'questionario-implantacao-porcentagem',
  QUESTIONARIO_IMPLANTACAO_PARCIAL_PORCENTAGEM_JUSTIFICATIVA = 'questionario-implantacao-porcentagem-justificativa',
  QUESTIONARIO_IMPLANTACAO_PARCIAL_MINIMO = 'questionario-implantacao-minimo',
  QUESTIONARIO_IMPLANTACAO_PARCIAL_MINIMO_JUSTIFICATIVA = 'questionario-implantacao-minimo-justificativa',
  QUESTIONARIO_IMPLANTACAO_PARCIAL_MAXIMA = 'questionario-implantacao-maxima',
  QUESTIONARIO_IMPLANTACAO_PARCIAL_MAXIMA_JUSTIFICATIVA = 'questionario-implantacao-maxima-justificativa',
  QUESTIONARIO_IMPLANTACAO_PARCIAL_ESPECIFICO = 'questionario-implantacao-especifico',
  QUESTIONARIO_IMPLANTACAO_PARCIAL_ESPECIFICO_JUSTIFICATIVA = 'questionario-implantacao-especifico-justificativa',
  QUESTIONARIO_IMPLANTACAO_DESMEMBRAMENTO_FORNECEDORES_PREMISSA = 'questionario-implantacao-desmembramento-fornecedores-premissa',
  QUESTIONARIO_IMPLANTACAO_DESMEMBRAMENTO_FORNECEDORES = 'questionario-implantacao-desmembramento-fornecedores',
  QUESTIONARIO_IMPLANTACAO_ENVIO_DOCS_PREMISSA = 'questionario-implantacao-envio-docs-premissa',
  QUESTIONARIO_IMPLANTACAO_ENVIO_DOCS = 'questionario-implantacao-envio-docs',
}

export enum QuestionarioImplantacaoStep6 {
  QUESTIONARIO_IMPLANTACAO_QUALIDADE_EXECUCAO_PREMISSA = 'questionario-implantacao-qualidade-execucao-premissa',
  QUESTIONARIO_IMPLANTACAO_QUALIDADE_EXECUCAO = 'questionario-implantacao-qualidade-execucao',
  QUESTIONARIO_IMPLANTACAO_QUALIDADE_EXECUCAO_JUSTIFICATIVA = 'questionario-implantacao-qualidade-execucao-justificativa',
  QUESTIONARIO_IMPLANTACAO_OBJECAO_SINAL_PREMISSA = 'questionario-implantacao-objecao-sinal-premissa',
  QUESTIONARIO_IMPLANTACAO_OBJECAO_SINAL = 'questionario-implantacao-objecao-sinal',
  QUESTIONARIO_IMPLANTACAO_OBJECAO_SINAL_AFIRMATIVO = 'questionario-implantacao-objecao-sinal-afirmativo',
  QUESTIONARIO_IMPLANTACAO_OBJECAO_SINAL_JUSTIFICATIVA = 'questionario-implantacao-objecao-sinal-justificativa',
}

export interface QuestionarioImplantacaoByStep {
  idQuestionario: number;
  idQuestionarioModelo: number;
  idProjeto: number;
  passos: {
    passo1: any;
    passo2: any;
    passo3: any;
    passo4: any;
    passo5: any;
    passo6: any;
  };
}
