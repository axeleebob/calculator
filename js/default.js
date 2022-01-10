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
    return (numLength > 13) ? (num >= 9999999999999 ? num.toPrecision(9) : num.toPrecision(13)) : num;
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

const buttonPress = function(buttonClick) {
    if (buttonClick.target.innerText === "AC") {
        reset();
        return;
    }
    switch(calculationPosition) {
        case 0: //calculator is clear
            switch(buttonClick.target.classList[0]) {
                case "number": 
                    updateScreenNumber(buttonClick.target.textContent);
                    calculationPosition = 1;
                    break;
                case "operator":
                    if (buttonClick.target.textContent === "+" || buttonClick.target.textContent === "-") {
                        updateScreenOperator(buttonClick.target.textContent);
                    };
                    break;
                case "clear": revertCalculation(); break;
            } break;
        case 1: //first number is partially or fully entered with no operator
            switch(buttonClick.target.classList[0]) {
                case "number": updateScreenNumber(buttonClick.target.textContent); break;
                case "operator":
                    shiftScreenContent();
                    updateScreenOperator(buttonClick.target.textContent); 
                    calculationPosition = 2;
                    break;
                case "clear": revertCalculation(); break;
            } break;
        case 2: //first number has been stored on screen, operator has been selected
            switch(buttonClick.target.classList[0]) {
                case "number":
                    shiftScreenContent();
                    updateScreenNumber(buttonClick.target.textContent);
                    calculationPosition = 3;
                    break;
                case "operator": updateScreenOperator(buttonClick.target.textContent); break;
                case "clear": revertCalculation(); break;
            } break;
        case 3: //first number has been stored on screen, operator has been selected, third number is
                //being entered on the screen
            switch(buttonClick.target.classList[0]) {
                case "number": updateScreenNumber(buttonClick.target.textContent); break;
                case "operator": 
                    calculateScreen();
                    prepareNextCalculation();
                    updateScreenOperator(buttonClick.target.textContent);
                    calculationPosition = 2;
                    break;
                case "clear": revertCalculation(); break;
                case "equals":
                    calculateScreen();
                    calculationPosition = 4;
                    break;
            } break;
        case 4: //calculation is showing on the screen
        switch(buttonClick.target.classList[0]) {
            case "number": 
                reset();
                buttonPress(buttonClick);
                break;
            case "operator": 
                prepareNextCalculation();
                updateScreenOperator(buttonClick.target.textContent);
                calculationPosition = 2;
                break;
            case "clear": revertCalculation(); break;
        } break;
    }
};

const buttons = document.querySelectorAll("button");
buttons.forEach(button => button.addEventListener("click", e => buttonPress(e)))