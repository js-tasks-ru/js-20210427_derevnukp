/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) {return '';}
  if (size === undefined) {return string;}
  
  const oneSlice = string.slice(0, size);
  const rest = [...string.slice(size)];
  
  return rest.reduce((accum, char) => {
    if (!accum.endsWith(char.repeat(size))) {
      accum += char;
    }
    return accum;
  }, oneSlice);
}
