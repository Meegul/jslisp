let inputEl;
let lineDiv;
let lines = {};
const prefix = '>';
let linesCreated = 0;

//Create a new line with text `text`, returning the line created.
//The line returned contains a 'vid' (virtual id) which is used to keep
//track of it in the virtual dom
const addLine = (text) => {
    const newLine = document.createElement('div');
    newLine.vid = linesCreated++;

    const lineText = document.createElement('a');
    lineText.innerHTML = text;
    newLine.appendChild(lineText);
    
    lines[newLine.vid] = newLine;
    lineDiv.appendChild(newLine);
    
    return newLine;
};

//Delete a provided line from the virtual dom
const deleteLine = (line) => {
    if (lines[line.vid]) {
        line.parentElement.removeChild(line);
        delete lines[line.vid];
    } else {
        console.log("Tried to delete line, but line not found in vdom");
    }
}

//Deletes all lines from the vdom
const deleteAllLines = () => {
    Object.values(lines).forEach((line) => deleteLine(line));
}

const inputHandler = (event) => {
    switch (event.keyCode) {
        case 13:
            processInput(inputEl.value);
            inputEl.value = "";
        default:
            break;
    }
};

window.onload = () => {
    inputEl = document.getElementById('input');
    lineDiv = document.getElementById('lines');
    inputEl.onkeydown = inputHandler;
};

//Add line of the command run, then print the output
const processInput = (input) => {
    addLine(`${prefix} ${input}`);
    try {
        const val = evaluate(input);
        //Print the value with quotes if it's a string.
        if (typeof val === 'string') {
            addLine(`"${val}"`);
        //Print array properly
        } else if (typeof val === 'object') {
            const string = val.reduce((str, on) => {
                if (typeof on === 'string')
                    return `${str} "${on}"`;
                else return `${str} ${on}`;
            }, '');
            addLine(`[ ${string} ]`);
        } else addLine(val);
    } catch (error) {
        addLine(error);
    }
}