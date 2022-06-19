/**
 * 指定ミリ秒数待つ
 * @param milliseconds wait時間（単位：ミリ秒）
 */

export const wait = (milliseconds = 0) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
