/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return function (obj) {
    let temp = {...obj};
    const arrPath = path.split(".");
    for (let i = 0; i <= arrPath.length - 1; i++) {
      const way = arrPath[i];
      if (temp[way]) {
        temp = temp[way];
      }
      else {
        return temp = undefined;
      }
    }
    return temp;
  };
}
