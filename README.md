# jslisp
A lisp implemented in JavaScript. I wrote my own interpreter for it from scratch, including its lexer and parser.

### types
* 'number': Any number, int or float. (0, 1, 1.5, .5, 1., etc.)
* 'string': A string of text. ("Hello world!", "2", "five", etc.)
* 'boolean': A boolean value of either true or false. (true, false)
* 'array': An array of values of any type. ([], [1], [1 "Hello"], etc.)

### built-in functions
* 'plus': Adds two numbers.
* 'minus': Subtracts two numbers.
* 'mult': Multiplies two numbers.
* 'div': Divides two numbers.
* 'concat': Concatenates two strings.
* 'int': Casts a string to an integer.
* 'float': Casts a string to a float.
* 'string': Casts a number to a string.
* 'equals': Evaluates equality of two values.
* 'if': (if a b c) -> if a, then b, else c.
