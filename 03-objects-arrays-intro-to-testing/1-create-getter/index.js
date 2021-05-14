/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
 export function createGetter(path) {
  const pathSplit = path.split('.');
  return fn => {
    let res = fn;
    for (const item of pathSplit) {
      if (res === undefined) break;
      res = res[item];
    }
    return res; 
  };
}
