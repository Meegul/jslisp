const lisp = require('../js/lisp.js')

class Test {
    constructor(input, expected, should, func) {
        this.input = input;
        this.expected = expected;
        this.should = should;
        this.func = func;
        this.passed = false;
    }

    run() {
        let actualResult;
        try {
            actualResult = this.func(this.input);
            this.passed = actualResult === this.expected;
            
        } catch (error) {
            actualResult = 'Error';
            this.passed = this.expected instanceof Error;
        }
        if (!this.passed) {
            console.log(`Should: ${this.should}`);
            console.log(`${this.input}->${actualResult}, expected: ${this.expected} | Passed: ${this.passed}`);
        }
        return this.passed;
    }
}

class Tester {
    constructor() {
        this.tests = [];
    }

    addTest(test) {
        this.tests.push(test);
    }

    runTests() {
        return this.tests.map((on) => on.run());
    }
}

const test = () => {

    const tests = new Tester();

    tests.addTest(new Test('1', 1, 'be able to evaluate a constant number', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(plus 123 123)', 246, 'be able to add two numbers', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(plus 1 (plus 2 3))', 6, 'be able to add numbers with expressions', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(minus 4 (plus 1 2))', 1, 'be able to subtract numbers with expressions', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(plus (minus 5 4) 2)', 3, 'be able to have expressions as any argument', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('"Hello world!"', 'Hello world!', 'be able to evaluate a constant string', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(concat "hi " "there")', 'hi there', 'be able to concatenate strings', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(concat "1 " "2")', '1 2', 'be able to concatenate strings of numbers', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(int "123")', 123, 'be able to cast strings into ints', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(int "a")', new Error(), 'throw an error when casting an incompatible value to an int', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('true', true, 'be able to evaluate a constant boolean', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('false', false, 'be able to evaluate a constant boolean', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(equals 1 1)', true, 'be able to compare equality of two numbers', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(equals 0 0)', true, 'be able to compare equality of two numbers', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(equals 1 0)', false, 'be able to compare equality of two numbers', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('.5', 0.5, 'be able to evaluate a constant float', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('0.5', 0.5, 'be able to evaluate a constant float', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('1.', 1.0, 'be able to evaluate a constant float', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(plus 0.5 0.5)', 1, 'be able to add floats', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(float "0.5")', 0.5, 'be able to cast a string to a float', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(float "a")', new Error(), 'throw an error when casting an incompatible value to a float', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(if true 1 2)', 1, 'be able to evaluate if true to the first argument', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(if false 1 2)', 2, 'be able to evaluate if false to the second argument', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(if (equals 1 1) 1 2)', 1, 'be able to evaluate an if statement dependent on an expression', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(if true "hi" 2)', 'hi', 'be able to evaluate if statements with arguments 1 and 2 of any type', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(if false "hi" 2)', 2, 'be able to evaluate if statements with arguments 1 and 2 of any type', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(string 1)', '1', 'be able to cast an int to a string', (input) => lisp.evaluate(input)));
    tests.addTest(new Test('(string 1.5)', '1.5', 'be able to cast a float to a string', (input) => lisp.evaluate(input)));

    const passes = tests.runTests();
    if (passes.indexOf(false) != -1) {
        console.log('Test(s) failed.');
    } else {
        console.log('Test(s) passed.');
    }

};

test();