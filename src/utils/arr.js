export const removeDuplicatedRow = (arr) => {
  let values_strs = [];
  const uniqueRows = arr
    .map((el) => {
      // get the key
      const akeys = Object.keys(el);
      // get the values
      const values = akeys.map((key) => {
        return el[key];
      });
      // const values_str = JSON.stringify(values);
      const values_str = JSON.stringify(el);
      if (!values_strs.includes(values_str)) {
        values_strs.push(values_str);
        // return unique element
        return el;
      } else {
        return undefined;
      }
    })
    .filter((el) => el);
  return uniqueRows;
};
