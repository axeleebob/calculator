//used to know how much information is currently being displayed on the screen
let calculationPosition = 0;

const add = function(x, y) {
    return x + y;
};

const subtract = function(x, y) {
    return x - y;
};

const multiply = function(x, y) {
    return x * y;
};

const divide = function(x, y) {
    return x / y
};

const operate = function(x, y, operation) {
    switch(operation) {
        case "+": return add(x, y); break;
        case "-": return subtract(x, y); break;
        case "x": return multiply(x, y); break;
        case "*": return multiply(x, y); break;
        case "/": return divide(x, y); break;
    }
};

const revertCalculation = function() {
    let rowOneText = document.querySelector("#row-1-text");
    let rowTwoText = document.querySelector("#row-2-text");
    let rowThreeText = document.querySelector("#row-3-text");
    let rowFourText = document.querySelector("#row-4-text");

    rowFourText.textContent = rowThreeText.textContent;
    rowThreeText.textContent = rowTwoText.textContent;
    rowTwoText.textContent = rowOneText.textContent;
    rowOneText.textContent = "";

    if (calculationPosition > 0) calculationPosition--;
};

const shiftScreenContent = function() {
    let rowOneText = document.querySelector("#row-1-text");
    let rowTwoText = document.querySelector("#row-2-text");
    let rowThreeText = document.querySelector("#row-3-text");
    let rowFourText = document.querySelector("#row-4-text");

    rowOneText.textContent = rowTwoText.textContent;
    rowTwoText.textContent = rowThreeText.textContent;
    rowThreeText.textContent = rowFourText.textContent;
    rowFourText.textContent = "";
}

const fitsOnScreen = function (num) {
    return num.replace(".", "").length < 13
};

const updateScreenNumber = function(input) {
    let rowFourText = document.querySelector("#row-4-text");
    //escape screen text update if user is trying to add a decimal point to a decimal number
    if (input === ".") {
        if (rowFourText.textContent.includes(".")) return;
    }
    //limit the input number to 13 numeric digits so that it stays on the screen
    if (fitsOnScreen(rowFourText.textContent)) {
        rowFourText.textContent = rowFourText.textContent.concat(input);
    }
};

const updateScreenOperator = function(input) {
    let rowFourText = document.querySelector("#row-4-text");
    rowFourText.textContent = input;
};

const trimForScreen = function (num) {
    numLength = num.toString().replace(".","").length;

    let absNum = Math.abs(num)

    return (absNum >= 9999999999999) ? num.toPrecision(9) :
           (absNum >= 0 && absNum < 1) ? Math.round(num*Math.pow(10, 12))/Math.pow(10, 12) :
           numLength > 13 ? num.toPrecision(13):
           num;
}

const calculateScreen = function() {
    shiftScreenContent();

    let rowOneText = document.querySelector("#row-1-text");
    let rowTwoText = document.querySelector("#row-2-text");
    let rowThreeText = document.querySelector("#row-3-text");
    let rowFourText = document.querySelector("#row-4-text");

    let x = parseFloat(rowOneText.textContent);
    let y = parseFloat(rowThreeText.textContent);
    let operator = rowTwoText.textContent;

    //The only circumstance where x will be NaN is if x was Infinity due to a user dividing by 0
    if (isNaN(x)) {
        rowFourText.textContent = "Infinity";
    } else {
        let solution = operate(x, y, operator);
        rowFourText.textContent = trimForScreen(solution);
    }
}

const prepareNextCalculation = function() {
    let screenTextRows = document.querySelectorAll(".screen-text.history");
    screenTextRows.forEach(screenTextRow => screenTextRow.textContent = "");

    shiftScreenContent();
}

const reset = function () {
    let screenTextRows = document.querySelectorAll(".screen-text");
    screenTextRows.forEach(screenTextRow => screenTextRow.textContent = "");

    calculationPosition = 0;
}

const keyPress = function (key) {
    if (key.keyCode === 13) {
        key.preventDefault();
        document.querySelector("#test").focus();
    }

    let numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."];
    let operators = ["+", "-", "*", "x", "/"];
    let equalsArray = ["=", "Enter"];
    let clears = ["Delete"]
    
    let operationLookup = {};
    numbers.forEach(number => operationLookup[number] = "number");
    operators.forEach(operator => operationLookup[operator] = "operator");
    equalsArray.forEach(equals => operationLookup[equals] = "equals");
    clears.forEach(clear => operationLookup[clear] = "clear");

    if (key.key in operationLookup) {
        console.log(key.key);
        console.log(operationLookup[key.key])
        operateCalculator(key.key, operationLookup[key.key])
    }
}

const buttonPress = function(buttonClick) {
    //clears the calculator if AC (all clear) is pushed
    if (buttonClick.target.innerText === "AC") operateCalculator("NA", "full-clear");

    operateCalculator(buttonClick.target.textContent, buttonClick.target.classList[0])
};

const operateCalculator = function(calculationInput, calculationType) {
    if (calculationType === "full-clear") {
        reset();
        return;
    }
    switch(calculationPosition) {
        case 0: //calculator is clear
            switch(calculationType) {
                case "number": 
                    updateScreenNumber(calculationInput);
                    calculationPosition = 1;
                    break;
                case "operator":
                    if (calculationInput === "+" || calculationInput === "-") {
                        updateScreenOperator(calculationInput);
                    };
                    break;
                case "clear": revertCalculation(); break;
            } break;
        case 1: //first number is partially or fully entered with no operator
            switch(calculationType) {
                case "number": updateScreenNumber(calculationInput); break;
                case "operator":
                    shiftScreenContent();
                    updateScreenOperator(calculationInput); 
                    calculationPosition = 2;
                    break;
                case "clear": revertCalculation(); break;
            } break;
        case 2: //first number has been stored on screen, operator has been selected
            switch(calculationType) {
                case "number":
                    shiftScreenContent();
                    updateScreenNumber(calculationInput);
                    calculationPosition = 3;
                    break;
                case "operator": updateScreenOperator(calculationInput); break;
                case "clear": revertCalculation(); break;
            } break;
        case 3: //first number has been stored on screen, operator has been selected, third number is
                //being entered on the screen
            switch(calculationType) {
                case "number": updateScreenNumber(calculationInput); break;
                case "operator": 
                    calculateScreen();
                    prepareNextCalculation();
                    updateScreenOperator(calculationInput);
                    calculationPosition = 2;
                    break;
                case "clear": revertCalculation(); break;
                case "equals":
                    calculateScreen();
                    calculationPosition = 4;
                    break;
            } break;
        case 4: //calculation is showing on the screen
        switch(calculationType) {
            case "number": 
                reset();
                operateCalculator(calculationInput, calculationType);
                break;
            case "operator": 
                prepareNextCalculation();
                updateScreenOperator(calculationInput);
                calculationPosition = 2;
                break;
            case "clear": revertCalculation(); break;
        } break;
    }
};

const buttons = document.querySelectorAll("button");
buttons.forEach(button => button.addEventListener("click", e => buttonPress(e)))

document.addEventListener("keypress", e => keyPress(e));