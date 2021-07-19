function calcAvg(arr: Array<number>) {
  if (arr.length > 0) return arr.reduce((sum: number, val: number) => sum + val) / arr.length;
  return 0;
}

function calcMSE(arr: Array<number>) {
  if (arr.length > 0) {
    const avg = calcAvg(arr);
    return arr.reduce((sum: number, val: number) => sum + (val - avg) ** 2, 0) / arr.length;
  }
  return 0;
}

function calcVariance(arr: Array<number>) {
  if (arr.length > 0) {
    const avg = calcAvg(arr);
    return arr.reduce((acc, val) => acc + (val - avg) ** 2, 0) / (arr.length - 1);
  }
  return 0;
}

module.exports.TextMath = {
  calcAvg,
  calcMSE,
  calcVariance,
};
