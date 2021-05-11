/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  const invertObj = {};
  if (obj == null) {
    return undefined;
  } else {
    Object.keys(obj).forEach(function (value) {
      let key = obj[value];
      invertObj[key] = value;
    });
    return invertObj;
  }
}
