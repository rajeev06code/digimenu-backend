function reverseString(str) {
  return str.split("").reverse().join("");
}
console.log(reverseString("hello"));

function isStringPalindrome(str) {
  const reversed = str.split("").reverse().join("");
  return str === reversed;
}
// console.log(isStringPalindrome("radar"));
// console.log(isStringPalindrome("hello"));

function areAnagrams(str1, str2) {
  const normalize = (str) => str.toLowerCase().split("").sort().join("");
  console.log(normalize(str1));
  return normalize(str1) === normalize(str2);
}
console.log(areAnagrams("listen", "silent")); // Output: true
console.log(areAnagrams("hello", "world")); // Output: false

function capitalizeWords(sentence) {
  return sentence
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
console.log(capitalizeWords("hello world")); // Output: "Hello World"

function truncateString(str, length) {
  return str.length > length ? str.slice(0, length) + "..." : str;
}
console.log(truncateString("Hello, world!", 5)); // Output: "Hello..."

function isValidString(str) {
  return /^[a-zA-Z0-9]*$/.test(str);
}
console.log(isValidString("Hello123")); // Output: true
console.log(isValidString("Hello@123")); // Output: false

function countOccurrences(str, substring) {
  return str.split(substring).length - 1;
}
console.log(countOccurrences("hello hello world", "hello")); // Output: 2
// =================================================================================
function findMax(arr) {
  return Math.max(...arr);
}
console.log(findMax([1, 2, 3, 4, 5])); // Output: 5

function reverseArray(arr) {
  return arr.reverse();
}
console.log(reverseArray([1, 2, 3, 4, 5])); // Output: [5, 4, 3, 2, 1]

function sumArray(arr) {
  return arr.reduce((sum, num) => sum + num, 0);
}
console.log(sumArray([1, 2, 3, 4, 5])); // Output: 15

function removeDuplicates(arr) {
  return [...new Set(arr)];
}
console.log(removeDuplicates([1, 2, 2, 3, 4, 4, 5])); // Output: [1, 2, 3, 4, 5]

function intersection(arr1, arr2) {
  return arr1.filter((value) => arr2.includes(value));
}
console.log(intersection([1, 2, 3, 4], [3, 4, 5, 6])); // Output: [3, 4]

function rotateArray(arr, k) {
  k = k % arr.length; // Handle rotations greater than array length
  return arr.slice(-k).concat(arr.slice(0, -k));
}
console.log(rotateArray([1, 2, 3, 4, 5], 2)); // Output: [4, 5, 1, 2, 3]

const original = {
  name: "John",
  details: {
    age: 30,
    address: {
      city: "New York",
      zip: "10001",
    },
  },
};

const deepClone = structuredClone(original);
deepClone.details.address.city = "Los Angeles";

console.log(original.details.address.city); // Output: "New York"
console.log(deepClone.details.address.city); // Output: "Los Angeles"

const obj = { name: "Alice", age: 25, city: "New York" };

Object.entries(obj).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});
