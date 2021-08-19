let buttons = document.getElementsByTagName("button");
let inputs = document.getElementById("inputs");
let prevInputs = document.getElementById("prevInputs");
let cache = [];

function add(firstNum, secondNum) {
  return firstNum + secondNum;
}

function subtract(firstNum, secondNum) {
  return firstNum - secondNum;
}

function multiply(firstNum, secondNum) {
  return firstNum * secondNum;
}

function divide(firstNum, secondNum) {
  return firstNum / secondNum;
}

function operate(firstNum, operator, secondNum) {
  let result;

  switch (operator) {
    case "+":
      result = add(firstNum, secondNum);
      break;
    case "-":
      result = subtract(firstNum, secondNum);
      break;
    case "x":
      result = multiply(firstNum, secondNum);
      break;
    case "÷":
      result = divide(firstNum, secondNum);
      break;
  }

  return result;
}

function getInputs() {
  let str = inputs.value;
  let allValues = str.split(" ");

  return allValues;
}

function orderOfOperations(values) {
  let aCopy = values;
  let answer = 0;

  if (aCopy.length == 0) {
    answer = 0;
  } else if (aCopy.length == 1) {
    answer = Number(aCopy[0]);
  } else {
    // perform normal order of operations
    while (aCopy.length > 1) {
      let multiplyDivide = false;
      let smallAnswer = 0;
      let indexToOperate = 0;

      // check for multiplication or division operators
      if (aCopy.includes("÷") || aCopy.includes("x")) {
        multiplyDivide = true;
      }

      // if array contains x or division operators, do those first, otherwise perform +/- operations
      for (let i = 1; i < aCopy.length; i += 2) {
        if (multiplyDivide) {
          if (aCopy[i] == "x" || aCopy[i] == "÷") {
            smallAnswer = operate(
              Number(aCopy[i - 1]),
              aCopy[i],
              Number(aCopy[i + 1])
            );
            indexToOperate = i;
            break;
          }
        } else {
          smallAnswer = operate(
            Number(aCopy[i - 1]),
            aCopy[i],
            Number(aCopy[i + 1])
          );
          indexToOperate = i;
          break;
        }
      }

      aCopy.splice(indexToOperate - 1, 3, smallAnswer);
    }

    answer = Number(aCopy[0]);
  }

  answer = Math.round((answer + Number.EPSILON) * 10000000000) / 10000000000;

  return answer;
}

function displayResult() {
  let answer = orderOfOperations(getInputs());

  cache.push(inputs.value);

  prevInputs.textContent = inputs.value + " =";
  inputs.value = answer;
}

function hasDecimals() {
  let nums = getInputs();

  if (nums[0] != "") {
    let lastNum = nums[nums.length - 1];
    let decimal = ".";

    if (lastNum.includes(decimal)) {
      return true;
    }
  }

  return false;
}

function convertSign() {
  let nums = getInputs();

  if (nums[0] != "") {
    let lastNum = nums[nums.length - 1];

    nums[nums.length - 1] = Number(nums[nums.length - 1]) * -1;

    inputs.value = nums.join(" ");
  }
}

// handle calculator buttons
for (let i = 0, len = buttons.length; i < len; i++) {
  buttons[i].addEventListener("click", function (e) {
    let toAppend = buttons[i].textContent;
    let lastInput = inputs.value.slice(-1);
    if (toAppend.length == 1 && "+-÷x".includes(toAppend)) {
      toAppend = ` ${toAppend} `;
    }

    switch (toAppend) {
      case "=":
        if (lastInput != " ") {
          displayResult();
        }
        break;
      case "C":
        inputs.value = "";
        prevInputs.textContent = "";
        cache = [];
        break;
      case ".":
        if (!hasDecimals()) {
          inputs.value += toAppend;
        }
        break;
      case ",":
        numToDelete = -1;
        if (lastInput == " ") {
          numToDelete = -3;
        }

        inputs.value = inputs.value.slice(0, numToDelete);
        break;
      case "+/-":
        convertSign();
        break;
      default:
        if ("1234567890".includes(lastInput)) {
          inputs.value += toAppend;
        } else if ("1234567890".includes(toAppend)) {
          inputs.value += toAppend;
        } else if (lastInput != " ") {
          inputs.value += toAppend;
        } else if (lastInput == " ") {
          inputs.value = inputs.value.slice(0, inputs.value.length - 3);
          inputs.value += toAppend;
        }
    }
  });
}

// enable keyboard input
window.onkeydown = function (e) {
  let digits = "1234567890";
  let operators = "-+÷x";
  let altMultiplication = "X*";
  let altDivision = "/";

  let lastInput = inputs.value.slice(-1);

  // prevent user from selecting input field
  if (e.code != "ArrowLeft" && e.code != "ArrowRight") {
    e.preventDefault();
  }

  // numbers
  if (digits.includes(e.key)) {
    inputs.value += e.key;
    // deletion
  } else if (e.key == "Backspace" || e.key == "Delete") {
    numToDelete = -1;
    if (lastInput == " ") {
      numToDelete = -3;
    } else if (lastInput == "N") {
      numToDelete = -3;
    } else if (lastInput == "y") {
      numToDelete = -8;
    }

    inputs.value = inputs.value.slice(0, numToDelete);
  }

  // the last input was not an operator
  if (lastInput != " ") {
    // adds decimal to display if valid
    if (e.key == ".") {
      if (!this.hasDecimals()) {
        inputs.value += ".";
      }
      // answer
    } else if (e.key == "=" || e.key == "Enter") {
      //display result
      this.displayResult();
    }
  } else {
    // add operator to display
    let isOperator = false;
    if (
      operators.includes(e.key) ||
      altMultiplication.includes(e.key) ||
      altDivision == e.key
    ) {
      isOperator = true;
    }

    if (isOperator) {
      inputs.value = inputs.value.slice(0, inputs.value.length - 3);
    }
  }

  if (operators.includes(e.key)) {
    inputs.value += ` ${e.key} `;
  } else if (altMultiplication.includes(e.key)) {
    inputs.value += " x ";
  } else if (altDivision == e.key) {
    inputs.value += " ÷ ";
  }

  inputs.focus();
};

prevInputs.onclick = function (e) {
  if (cache.length > 0) {
    inputs.value = cache.pop();

    prevInputs.textContent = cache[cache.length - 1].toString() + " =";
  } else {
    prevInputs.textContent = "";
  }
};
