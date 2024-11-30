export const makeComplexId = (length, valueType = 'all') => {
  let result = '';
  let characters;
  if (valueType === 'number') {
    characters = '0123456789';
  } else if (valueType === 'alphabet') {
    characters = 'abcdefghijklmnopqrstuvwxyz';
  } else if (valueType === 'ALPHABET') {
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  } else if (valueType === 'ALPHAbet') {
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  } else {
    characters =
      '~!@#$%^&*()_+ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  }
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};
