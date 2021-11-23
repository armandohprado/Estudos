import { CKEditor5 } from '@ckeditor/ckeditor5-angular';

export const ckEditorConfig: CKEditor5.Config = {
  fontSize: {
    options: [8, 9, 10, 11, 12, 'default', 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72],
  },
  placeholder: 'mensagem',
  toolbar: {
    items: [
      'fontFamily',
      '|',
      'fontSize',
      '|',
      'bold',
      '|',
      'italic',
      '|',
      'alignment:left',
      'alignment:center',
      'alignment:right',
      '|',
      'bulletedList',
    ],
  },
  language: 'pt-br',
};
