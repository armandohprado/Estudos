export const numeroEspecial = (numero: string): boolean => {
  if (!!numero) {
    return (
      numero.startsWith('0300') ||
      numero.startsWith('0500') ||
      numero.startsWith('0800') ||
      numero.startsWith('0900') ||
      numero.startsWith('3003') ||
      numero.startsWith('4003') ||
      numero.startsWith('4004')
    );
  }
  return false;
};
