import { GridOptionsCustom } from '../../compra/plano-compras/util/grid-custom-models';

export function defaultOptions(options: GridOptionsCustom): GridOptionsCustom {
  return {
    localeText: {
      // for filter panel
      page: 'Página',
      more: 'mais',
      to: 'para',
      of: 'de',
      next: 'Próximo',
      last: 'Último',
      first: 'Primeiro',
      previous: 'Anterior',
      loadingOoo: 'Carregando...',
      andCondition: 'E',
      orCondition: 'OU',

      // for set filter
      selectAll: 'Selecionar tudo',
      searchOoo: 'Procurar',
      blanks: 'Vazio',

      // for number filter and text filter
      filterOoo: 'Filtrar',
      applyFilter: 'Aplicar filtro',

      // for number filter
      equals: 'Igual',
      notEqual: 'Não igual',
      notEquals: 'Não igual',
      lessThan: 'Menor que',
      greaterThan: 'Maior que',
      lessThanOrEqual: 'Menor ou igual à',
      greaterThanOrEqual: 'Maior ou igual à',
      inRange: 'Entre',

      // for text filter
      contains: 'Contém',
      notContains: 'Não contém',
      startsWith: 'Começa com',
      endsWith: 'Termina com',

      // the header of the default group column
      group: 'Grupo',

      // tool panel
      columns: 'Colunas',
      rowGroupColumns: 'Colunas do grupo de linhas',
      rowGroupColumnsEmptyMessage: 'Colunas do grupo de linhas vazias',
      valueColumns: 'Valores das colunas',
      pivotMode: 'Modo pivô',
      groups: 'Grupos',
      values: 'Valores',
      pivots: 'Pivôs',
      valueColumnsEmptyMessage: 'Valores de colunas vazias',
      pivotColumnsEmptyMessage: 'Pivôs de colunas vazias',
      toolPanelButton: 'Botão de painel de ferramentas',

      // other
      noRowsToShow: 'Não há registros para mostrar.',

      // enterprise menu
      pinColumn: 'Fixar coluna',
      valueAggregation: 'Agregar valor',
      autosizeThiscolumn: 'Redimensionar esta coluna',
      autosizeAllColumns: 'Redimensionar todas colunas',
      groupBy: 'Agrupar por',
      ungroupBy: 'Desagrupar por',
      resetColumns: 'Resetar colunas',
      expandAll: 'Expandir tudo',
      collapseAll: 'Contrair tudo',
      toolPanel: 'Painel de ferramentas',
      export: 'Exportar',
      csvExport: 'Exportar para CSV',
      excelExport: 'Exportar para Excel',

      // enterprise menu pinning
      pinLeft: 'Fixar <<',
      pinRight: 'Fixar >>',
      noPin: 'Sem fixar',

      // enterprise menu aggregation and status panel
      sum: 'Soma',
      min: 'Mínimo',
      max: 'Máximo',
      none: 'Nenhum',
      count: 'Contagem',
      average: 'Média',

      // standard menu
      copy: 'Copiar',
      copyWithHeaders: 'Copiar com cabeçalho',
      ctrlC: 'Ctrl+C',
      paste: 'Colar',
      ctrlV: 'Ctrl+V',
      // charts
      pivotChartTitle: 'laPivot Chart',
      rangeChartTitle: 'laRange Chart',
      settings: 'laSettings',
      data: 'laData',
      format: 'laFormat',
      categories: 'laCategories',
      series: 'laSeries',
      axis: 'laAxis',
      color: 'laColor',
      thickness: 'laThickness',
      xRotation: 'laX Rotation',
      yRotation: 'laY Rotation',
      ticks: 'laTicks',
      width: 'laWidth',
      length: 'laLength',
      padding: 'laPadding',
      chart: 'laChart',
      title: 'laTitle',
      font: 'laFont',
      top: 'laTop',
      right: 'laRight',
      bottom: 'laBottom',
      left: 'laLeft',
      labels: 'laLabels',
      size: 'laSize',
      legend: 'laLegend',
      position: 'laPosition',
      markerSize: 'laMarker Size',
      markerStroke: 'laMarker Stroke',
      markerPadding: 'laMarker Padding',
      itemPaddingX: 'laItem Padding X',
      itemPaddingY: 'laItem Padding Y',
      strokeWidth: 'laStroke Width',
      offset: 'laOffset',
      tooltips: 'laTooltips',
      offsets: 'laOffsets',
      callout: 'laCallout',
      markers: 'laMarkers',
      shadow: 'laShadow',
      blur: 'laBlur',
      xOffset: 'laX Offset',
      yOffset: 'laY Offset',
      lineWidth: 'laLine Width',
      normal: 'laNormal',
      bold: 'laBold',
      italic: 'laItalic',
      boldItalic: 'laBold Italic',
      fillOpacity: 'laFill Opacity',
      strokeOpacity: 'laLine Opacity',
      columnGroup: 'Column',
      barGroup: 'Bar',
      pieGroup: 'Pie',
      lineGroup: 'Line',
      scatterGroup: 'Scatter',
      areaGroup: 'Area',
      groupedColumnTooltip: 'laGrouped',
      stackedColumnTooltip: 'laStacked',
      normalizedColumnTooltip: 'la100% Stacked',
      groupedBarTooltip: 'laGrouped',
      stackedBarTooltip: 'laStacked',
      normalizedBarTooltip: 'la100% Stacked',
      pieTooltip: 'laPie',
      doughnutTooltip: 'laDoughnut',
      lineTooltip: 'laLine',
      groupedAreaTooltip: 'laGrouped',
      stackedAreaTooltip: 'laStacked',
      normalizedAreaTooltip: 'la100% Stacked',
      scatterTooltip: 'laScatter',
      bubbleTooltip: 'laBubble',
      noDataToChart: 'laNo data available to be charted.',
      pivotChartRequiresPivotMode: 'laPivot Chart requires Pivot Mode enabled.',
    },
    ...options,
  };
}
