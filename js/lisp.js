/*
** A lisp-like language. It's not intended to follow any lisp or functional programming rules/guidelines
** and it's similarity to lisp is just a side-effect of what I intended to create.
** There's a self-built lexer, as well as parser.
*/

class TokenType {
    constructor(regex, name, castFunc = (a) => a) {
        this.regex = regex;
        this.name = name;
        this.cast = castFunc;
    }

    //See where 'val' matches this token, and cast the value using the provided function
    match(val) {
        let matches = [];
        let res;
        while ((res = this.regex.exec(val)) !== null) {
            matches.push(res);
        } 
        return matches;
    }
}

//Token types. Precedence matters.
//If a letter is matched multiple times, only the first match is used.
//Therefore, whichever type comes first here has precedence over preceeding ones.
//TokenTypes without cast functions 
tokenTypes = [
    new TokenType(/\"[^"]*\"/g, 'string', (a) => a.substring(1, a.length - 1)),
    new TokenType(/\s+/g, 'whitespace'),
    new TokenType(/[(]/g, 'openPar'),
    new TokenType(/[)]/g, 'closePar'),
    new TokenType(/\[/g, 'openBrack'),
    new TokenType(/\]/g, 'closeBrack'),
    new TokenType(/([0-9]+[.][0-9]*)|([0-9]*[.][0-9]+)/g, 'float', (a) => parseFloat(a)),
    new TokenType(/[0-9]+/g, 'int', (a) => parseInt(a)),
    new TokenType(/(true)|(false)/g, 'boolean', (a) => a === 'true'),
    new TokenType(/[a-zA-Z]+/g, 'id')
];

//Token value types
tokenValueTypes = ['int', 'float', 'string', 'boolean', 'array'];

class Token {
    constructor(tokenType, value, index) {
        this.tokenType = tokenType;
        this.value = value;
        this.index = index;
    }
}

//flatten polyfill
Array.prototype.flatten = function() {
    return this.reduce((a, b) => a.concat(b));
};

//peek polyfill
Array.prototype.peek = function() {
    return this[this.length - 1];
};

//Get tokens from input
const lex = (input) => {
    //Match the input to all tokens.
    let tokens = tokenTypes.map((type) => {
        return type.match(input).map((value) => {
            return new Token(type, value[0], value.index);
        });
    }).flatten();

    //Remove duplicate matches, where the first match
    //is what's kept.
    let str = [];
    tokens = tokens.filter((token) => {
        const startIndex = token.index;
        let shouldKeep = true;
        (token.value + '').split('').forEach((letter, index) => {
            if (str[startIndex + index]) {
                shouldKeep = false;
            } else {
                str[startIndex + index] = letter;
            }
        });
        return shouldKeep;
    });
    
    //Sort the tokens, where the first value is the first token in the string.
    tokens.sort((a, b) => {
        if (a.index < b.index)
            return -1;
        if (a.index > b.index)
            return 1;
        return 0;
    });
    
    //Cast the tokens to their desired types.
    tokens = tokens.map((token) => {
        return new Token(token.tokenType, token.tokenType.cast(token.value), token.index);
    });

    //There was no lexing error, return the tokens.
    return tokens;
};

const builtins = {
    //Add two numbers
    'plus' : {
        args: ['number', 'number'],
        func: (a, b) => a + b,
    },
    //Subtract two numbers
    'minus' : {
        args: ['number', 'number'],
        func: (a, b) => a - b,
    },
    //Concatenate two strings
    'concat' : {
        args: ['string', 'string'],
        func: (a, b) => a + b,
    },
    //Cast string to int
    'int' : {
        args: ['string'],
        func: (a) => {
            const result = parseInt(a);
            if (isNaN(result)) {
                if (typeof a === 'string')
                    throw new Error(`"${a}" cannot be cast to an integer.`)
                else throw new Error(`${a} cannot be cast to an integer.`)
            }
            return result;
        },
    },
    //Cast string to float
    'float' : {
        args: ['string'],
        func: (a) => {
            const result = parseFloat(a);
            if (isNaN(result)) {
                if (typeof a === 'string')
                    throw new Error(`"${a}" cannot be cast to an float.`);
                else throw new Error(`${a} cannot be cast to an float.`);
            }
            return result;
        },
    },
    //Cast anything to string
    'string' : {
        args: ['anything'],
        func: (a) => '' + a,
    },
    //Gets the length of an array or string
    'length' : {
        args: ['anything'],
        func: (a) => {
            if (typeof a !== 'string' && typeof a !== 'object')
                throw new Error(`Cannot get length of ${a} as it is neither a string nor array.`);
            return a.length;
        },
    },
    //Check equality of values
    'equals' : {
        args: ['anything', 'anything'],
        func: (a, b) => {
            if (typeof a === 'object' && typeof b === 'object') {
                return JSON.stringify(a) === JSON.stringify(b);
            } else return a === b;
        },
    },
    //if 0 then 1 else 2
    'if' : {
        args: ['boolean', 'anything', 'anything'],
        func: (a, b, c) => {
            if (a)
                return b;
            else return c;
        },
    },
};

const parse = (oldTokens) => {
    //Disregard whitespace
    const tokens = oldTokens.filter((token) => token.tokenType.name !== 'whitespace');

    //Parse through expressions, delimited by parenthesis
    let totalDepth = 0;
    let functionStack = [];
    let valueStack = [];
    let func = false; //Used to determine if next token should be a function
    let makingArray = false; //Used to determine if next token should be a value for an array
    let arr = []; //Used to build an array
    let skippingTo = -1; //Used to skip elements if they were used early by a built-in
    let env = {};
    tokens.forEach((token, i) => {
        //See if we want to skip this token, as we've used it in a declaration
        if (i < skippingTo)
            return;

        if (totalDepth < 0)
            throw new Error(`Parsing error: too many close parenthesis`);
        //If we're looking for a function and this is an id
        if (func && token.tokenType.name === 'id') {
            //First see if we're defining something
            if (token.value === 'def') {
                //Make the definition
                const key = tokens[i+1].value;
                const val = tokens[i+2].value;
                env[key] = val;
                //Push the resulting value to the stack
                valueStack.push(val);
                //Skip to the next value
                skippingTo = i + 4;
                totalDepth--;
            } else {
                functionStack.push(token.value);
            }
            func = false;
        } else if (token.tokenType.name === 'id') {
            if ((token.value) in env)
                valueStack.push(env[token.value])
            else throw new Error(`Evaluation error: undefined constant ${token.value}`);
        }
        if (!func && tokenValueTypes.indexOf(token.tokenType.name) !== -1) {
            if (makingArray) {
                arr.push(token.value); //Push the value to the in-progress array
            } else {
                valueStack.push(token.value); //Push the value straight to the valueStack
            }
        }
        if (token.tokenType.name === 'openBrack') {
            if (makingArray) {
                throw new Error('Parsing error: trying to make an array within an array');
            }
            makingArray = true; //Signal that we're making an array
        }
        if (token.tokenType.name === 'closeBrack') {
            if (!makingArray) {
                throw new Error('Parsing error: trying to close a non-existant array');
            }
            makingArray = false; //Signal that we're done making an array
            valueStack.push(arr); //Push the built array onto the value stack
            arr = []; //Reset the value array
        }
        //Build a new expression
        if (token.tokenType.name === 'openPar') {
            if (makingArray) {
                throw new Error('Parsing error: trying to create an expression in an array');
            }
            totalDepth++;
            func = true;
        }
        //Eval the expression
        if (token.tokenType.name === 'closePar') {
            if (makingArray) {
                throw new Error('Parsing error: trying to evaluate an expression in an array');
            }
            totalDepth--;
            func = false;
            if (functionStack.length == 0) {
                throw new Error(`Parsing error: Cannot evaluate without a function`);
            }
            //Lookup the function
            const evaling = functionStack.pop();
            const foundFunc = evaling in builtins ? builtins[evaling] : env[evaling];
            if (!foundFunc)
                throw new Error(`Evaluation error: ${evaling} is not a valid function`);
            //Get the arguments to the function
            const args = []
            for (let argIndex = foundFunc.args.length - 1; argIndex >= 0; argIndex--) {
                if (valueStack.length < 1) {
                    throw new Error(`Evaluation error: ${evaling} expects ${foundFunc.args.length} arguments, but only got ${args.length}`);
                }
                if (typeof valueStack.peek() !== foundFunc.args[argIndex] && foundFunc.args[argIndex] !== 'anything') {
                    throw new Error(`Evaluation error: ${evaling} expects arg ${argIndex} to be a ${foundFunc.args[argIndex]} but it is a ${typeof valueStack.peek()}`)
                }
                args.push(valueStack.pop());
            }
            //Reverse the arguments, as they're backwards.
            args.reverse();
            
            //Call the function, and push the return to the valueStack
            const evaluated = foundFunc.func(...args);
            valueStack.push(evaluated);
        }
    });
    if (totalDepth !== 0)
        throw new Error(`Parsing error: parenthesis mismatch, depth:${totalDepth}, expected:0`);
    return valueStack.pop();
};

const evaluate = (inputText) => {
    const tokens = lex(inputText);
    const returned = parse(tokens);
    return returned;
}

if (module) {
    module.exports.parse = parse;
    module.exports.lex = lex;
    module.exports.evaluate = evaluate;
}