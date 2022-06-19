/**
 * オブジェクトをソート済み配列に変換する
 */
const objToSortedArray = (obj) => Object.entries(obj).sort();

/**
 * ソート済み配列を文字列に変換して比較する
 */
const isEqualOneDimentionalArray = (obj1, obj2) => {
  return (
    JSON.stringify(objToSortedArray(obj1)).replace(/\"/g, '') ===
    JSON.stringify(objToSortedArray(obj2)).replace(/\"/g, '')
  );
};

/**
 * 再帰処理を行い、ネストされたオブジェクトまで比較する
 * (どちらかがnull又はundefinedのときは不一致とする)
 * @param obj1
 * @param obj2
 * @return boolean
 */
export const isEqual = (obj1, obj2) => {
  if (obj1 == null || obj2 == null) {
    return false;
  }
  return (
    isEqualOneDimentionalArray(obj1, obj2) &&
    objToSortedArray(obj1).map(([key, val]) =>
      typeof val === 'object' ? isEqual(val, obj2[key]) : true,
    )
  );
};
