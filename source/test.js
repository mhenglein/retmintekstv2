let testArray = [
  ["græse", "grase"],
  ["auti", "auto"],
  ["frederiksund", "frederikssund"],
];

let stringify = JSON.stringify(testArray);
// console.log(stringify);

let objAssign = Object.assign({}, testArray);
// console.log(objAssign);

let test2 = ["A", "B", "C"];
test2.forEach((item, index) => {
  test2[item].push([test2[item], "test"]);
});

console.log(test2);
