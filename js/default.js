//used to know how much information is currently being displayed on the display
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
    return x / y;
};

const operate = function(x, y, operation) {
    switch(operation) {
        case "+": return add(x, y); break;
        case "-": return subtract(x, y); break;
        case "x": return multiply(x, y); break;
        case "*": return multiply(x, y); break;
        case "/": return divide(x, y); break;
    };
};

let display = ["", "", "", ""]

const publishDisplay = function() {
    displayRows = document.querySelectorAll(".display-text");

    Array.from(displayRows).forEach((displayRow, index) => {
        displayRow.textContent = display[index]
    })
}

const revertCalculation = function() {
    display.pop();
    display.unshift("");

    publishDisplay();

    if (calculationPosition > 0) calculationPosition--;
};

const shiftDisplay = function() {
    display.shift();
    display.push("");

    publishDisplay();
};

const fitsOnDisplay = function (num) {
    return num.replace(".", "").length <= 13
};

const updateDisplayBottom = function(input) {
    //escape display text update if user is trying to add a decimal point to a decimal number
    if (input === ".") {
        if (display[3].includes(".")) return;
    };

    let newContent = display[3].concat(input)
    //limit the input number to 13 numeric digits so that it stays on the display
    if (fitsOnDisplay(newContent)) {
        display[3] = newContent;
    };

    publishDisplay();
};

const updateDisplayOperator = function(input) {
    display[3] = input;
    publishDisplay();
};

const trimForDisplay = function (num) {
    numLength = num.toString().replace(".","").length;

    let absNum = Math.abs(num);

    return (absNum >= 9999999999999) ? num.toPrecision(9) :
           (absNum >= 0 && absNum < 1) ? Math.round(num*Math.pow(10, 12))/Math.pow(10, 12) :
           numLength > 13 ? num.toPrecision(13):
           num;
};

const calculateDisplay = function() {
    shiftDisplay();

    let x = parseFloat(display[0]);
    let y = parseFloat(display[2]);
    let operator = display[1];

    //The only circumstance where x will be NaN is if x was Infinity due to a user dividing by 0
    if (isNaN(x)) {
        display[3] = "Infinity";
    } else {
        let solution = operate(x, y, operator);
        display[3] = trimForDisplay(solution);
    };

    publishDisplay();
};

const prepareNextCalculation = function() {
    //delete the history
    display = ["", "", "", display[3]];
    shiftDisplay();
};

const reset = function () {
    display = ["", "", "", ""]
    publishDisplay();

    calculationPosition = 0;
};

const deleteLastInput = function () {
    //action of deleting 1 character from a string of length one is the same as clearing the whole row
    if (display[3].length === 1) {
        operateCalculator("clear");
    } else {
        display[3] = display[3].slice(0, -1);
        publishDisplay();
    };
};

const keyDown = function (key) {
    if (key.key === "Backspace") operateCalculator("clear-one");
};

const keyPress = function (key) {
    //escapes the keyPress function if the user is using enter to push buttons
    if (!(document.querySelector("body") === document.activeElement) && key.keyCode === 13) return;
    
    let numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."];
    let operators = ["+", "-", "*", "x", "/"];
    let equalsArray = ["=", "Enter"];
    let clears = ["Delete"]
    
    let operationLookup = {};
    numbers.forEach(number => operationLookup[number] = "number");
    operators.forEach(operator => operationLookup[operator] = "operator");
    equalsArray.forEach(equals => operationLookup[equals] = "equals");
    clears.forEach(clear => operationLookup[clear] = "clear");

    if (key.key in operationLookup) operateCalculator(operationLookup[key.key], key.key)
}

const buttonPress = function(buttonClick) {
    //clears the calculator if AC (all clear) is pushed
    if (buttonClick.target.innerText === "AC") operateCalculator("full-clear");

    operateCalculator(buttonClick.target.classList[0], buttonClick.target.textContent);

    //clears the active element if the user clicked the button with a mouse. This ensures that the user
    //can use the enter button to use return the calculation if they are not using the enter button
    //to activate buttons
    if (buttonClick.detail === 1) document.activeElement.blur();
};

const operateCalculator = function(calculationType, calculationInput) {
    if (calculationType === "full-clear") {
        reset();
        return;
    };
    switch(calculationPosition) {
        case 0: //calculator is clear
            switch(calculationType) {
                case "number": 
                    updateDisplayBottom(calculationInput);
                    calculationPosition = 1;
                    break;
                case "operator":
                    if (calculationInput === "+" || calculationInput === "-") {
                        updateDisplayOperator(calculationInput);
                    };
                    break;
                case "clear": revertCalculation(); break;
                case "clear-one": deleteLastInput(); break;
            } break;
        case 1: //first number is partially or fully entered with no operator
            switch(calculationType) {
                case "number": updateDisplayBottom(calculationInput); break;
                case "operator":
                    shiftDisplay();
                    updateDisplayOperator(calculationInput); 
                    calculationPosition = 2;
                    break;
                case "clear": revertCalculation(); break;
                case "clear-one": deleteLastInput(); break;
            } break;
        case 2: //first number has been stored on display, operator has been selected
            switch(calculationType) {
                case "number":
                    shiftDisplay();
                    updateDisplayBottom(calculationInput);
                    calculationPosition = 3;
                    break;
                case "operator": updateDisplayOperator(calculationInput); break;
                case "clear": revertCalculation(); break;
                case "clear-one": deleteLastInput(); break;
            } break;
        case 3: //first number has been stored on display, operator has been selected, third number is
                //being entered on the display
            switch(calculationType) {
                case "number": updateDisplayBottom(calculationInput); break;
                case "operator": 
                    calculateDisplay();
                    prepareNextCalculation();
                    updateDisplayOperator(calculationInput);
                    calculationPosition = 2;
                    break;
                case "clear": revertCalculation(); break;
                case "clear-one": deleteLastInput(); break;
                case "equals":
                    calculateDisplay();
                    calculationPosition = 4;
                    break;
            } break;
        case 4: //calculation is showing on the display
        switch(calculationType) {
            case "number": 
                reset();
                operateCalculator(calculationType, calculationInput);
                break;
            case "operator": 
                prepareNextCalculation();
                updateDisplayOperator(calculationInput);
                calculationPosition = 2;
                break;
            case "clear": revertCalculation(); break;
            //you do not want someone to clear one from the answer, so it deletes the whole answer
            case "clear-one": operateCalculator("clear"); break;
        } break;
    }
};

const buttons = document.querySelectorAll("button");
buttons.forEach(button => button.addEventListener("click", e => buttonPress(e)));

document.addEventListener("keypress", e => keyPress(e));

document.addEventListener("keydown", e => keyDown(e));