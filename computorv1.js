const log = console.log
const pf = parseFloat
const pi = parseInt

function abs(a) {
    if (a < 0)
        return (-a);
    else
        return (a);
}

function mysqrt(a) {
    let epsilon = 0.000001;
    let guess = a / 2;
    while (abs(guess * guess - a) > epsilon) {
        let r = a / guess;
        guess = (guess + r) / 2;
    }
    return guess;
}

function parseSide(pol) {

    return pol.split("-")
        .map(function(elem, index) {
            return (index > 0 ? "-" : "") + elem
        })
        .filter(function(elem) {
            return (elem != "");
        })
        .map(l => l.split("+"))
        .reduce(function(a, b) {
            return a.concat(b);
        }, [])
        .map(l => l.split("X"))
        .map(function(elem) {
            if (elem.length === 1) {
                elem = [pf(elem), 0];
            } else if (elem.length === 2) {
                elem[0] = elem[0] == "-" ? "-1" : elem[0];
                elem[0] = elem[0] == "" ? 1 : pf(elem[0]);
                elem[1] = elem[1] == "" ? 1 : pi(elem[1][1]);
            }
            return elem;
        })
}
/**
 * 
 * @param {*} pol 
 * @returns "ikhtizal" calculate the similar a*b^x
 */
function simplify(pol) {
    return pol.reduce(function(prev, curr) { //[[curr, index]] => [cur] (index-ordered)
            if (prev[curr[1]] == null)
                prev[curr[1]] = curr[0];
            else
                prev[curr[1]] += curr[0];
            return prev;
        }, [])
        .map(function(item, index) {
            return [item, index];
        })
        .reduce(function(prev, curr) {
            if (Array.isArray(curr))
                prev.push(curr);
            return prev;
        }, []);
}
/**
 * 
 * @param {*} p1 
 * @param {*} p2 
 * @returns p1 = p2 ==> p1-p2=0 ==> return p1-p2
 */
function mergeLandRpols(p1, p2) {
    p2.forEach(function(val) {
        if (val[0] === 0)
            return;
        let pos = p1.findIndex(function(item) {
            return item[1] === val[1];
        });
        if (pos < 0)
            p1.push([-val[0], val[1]]);
        else
            p1[pos][0] -= val[0];
    });

    p1 = p1.filter(function(x) {
        return (x[0] !== 0);
    });
    return p1
}
/**
 * 
 * @param {*} pol 
 * @returns re-write the equation in a clean and clear form
 */
function reduceForm(leftPol) {
    if (leftPol.length == 0)
        return "0 * X^0";
    let str = leftPol[0][0] + " * X^" + leftPol[0][1];
    leftPol.forEach(function(val, index) {
        if (index == 0)
            return;
        str += val[0] < 0 ? " - " : " + ";
        str += val[0] < 0 ? -val[0] : val[0];
        str += " * X^";
        str += val[1];
    });
    return str;
}

function getMax(prev, curr) {
    if (curr[1] > prev)
        return curr[1];
    else
        return prev;
}


function computorv1(val, web = false) {
    let eq, solution, logs = []

    eq = validateInput(val)

    if (eq) {
        const parsedS1 = parseSide(eq[0])
        const parsedS2 = parseSide(eq[1])

        let simplifiedSL = simplify(parsedS1)
        let simplifiedSR = simplify(parsedS2)

        simplifiedSL = mergeLandRpols(simplifiedSL, simplifiedSR)
        logs.push(`Equation given : ${eq[0]} = ${eq[1]}`.replace('^0', '⁰')
            .replace('^1', '¹')
            .replace('^2', '²')
            .replace(/(1|) \* X/g, 'X'))
        logs.push(`Reduced form: ${reduceForm(simplifiedSL)} = 0`
            .replace('^0', '⁰')
            .replace('^1', '¹')
            .replace('^2', '²')

        );
        var max = simplifiedSL.reduce(getMax, 0);
        logs.push(`Polynomial degree: ${max}`);
        if (max > 2) {
            if (web)
                alert("The polynomial degree is strictly greater than 2", ", I can't solve");

            else {
                log(logs.join("\n"))
                log("The polynomial degree is strictly greater than 2", ", I can't solve")
                process.exit(0);
            }
            return
        }
        let a = simplifiedSL.find(function(x) { return x[1] == 2; });
        let b = simplifiedSL.find(function(x) { return x[1] == 1; });
        let c = simplifiedSL.find(function(x) { return x[1] == 0; });
        a = a ? a[0] : 0;
        b = b ? b[0] : 0;
        c = c ? c[0] : 0;
        logs.push(`a : ${a} | b : ${b} | c : ${c}`)
        if (max === 0) {
            if (simplifiedSL.length != 0)
                logs.push("There are no solutions");
            else
                logs.push("Every real is a solution");
        }
        if (max === 1) {

            solution = -c / b
            logs.push(`     X1 b * X + c = 0`)
            logs.push(`     X1 X = -c/b`)
            logs.push(`     X1 X = ${-c}/${b}`)
        }
        if (max === 2) {
            // Calculate delta
            const delta = b * b - 4 * a * c;
            logs.push(`Δ is : (b² - 4 * a * c)`)
            logs.push(`Δ is : ${delta}`)
            if (delta > 0) {
                logs.push("Δ is strictly positive, the two solutions are:")
                logs.push(`     X1 (-b - √Δ) / (2 * a)`)
                logs.push(`     X1 (${-b} - √${delta}) / (2 * ${a})`)
                logs.push(`     X1 ${-b - mysqrt(delta)} / ${2 * a}`)

                logs.push(`     X2 (-b + √Δ) / (2 * a)\n`)
                logs.push(`     X2 (${-b} + ${mysqrt(delta)}) / (2 * ${a})\n`)
                logs.push(`     X2 ${-b + mysqrt(delta)} / ${2 * a}\n`)

                solution = [
                    pf(((-b - mysqrt(delta)) / (2 * a)).toFixed(22)),
                    pf(((-b + mysqrt(delta)) / (2 * a)).toFixed(22))
                ]
            } else if (delta === 0) {
                logs.push("Δ is zero, the solution is:")
                logs.push(`     X1 (-b /2 * a)`)
                logs.push(`     X1 (${-b} /2 * ${a})`)
                solution = b == 0 ? b : (-b / (2 * a))

            } else {
                logs.push("Δ is strictly negative, the two solutions are:")
                logs.push(`     X1 (-b / (2 * a)) + i * (√(-Δ) / 2 * a)`)
                logs.push(`     X1 (-b / (2 * a)) - i * (√(-Δ) / 2 * a)\n`)

                logs.push(`     X1 (${-b} / (2 * ${a})) + i * (√${-delta} / 2 * ${a})`)
                logs.push(`     X1 (${-b} / (2 * ${a})) - i * (√${-delta} / 2 * ${a})\n`)
                const tmp1 = b === 0 ? 0 : (pf((-b / (2 * a)).toFixed(6)))
                solution = [
                    (tmp1 === 0 ? "" : tmp1) + " +i * " + pf((mysqrt(-delta) / (2 * a)).toFixed(22)),
                    (tmp1 === 0 ? "" : tmp1) + " -i * " + pf((mysqrt(-delta) / (2 * a)).toFixed(22))
                ]
            }
        }
        if (!web) {
            log(`
###################################################################################
--- second degree equation solving rules :
Δ = b² - 4ac
calculate Δ then check the following the conditions :
if Δ < 0 : there is no solution
if Δ = 0 : there is one solution which is : x= -b/(2a)
if Δ > 0 : there is two solutions which are : x1 = (-b-√Δ)/(2a) et x2= (-b+√Δ)/(2a)
###################################################################################
                    `)
            log(logs.join("\n"))
            if (solution) {

                if (Array.isArray(solution)) {
                    log(`     X1: ${solution[0]}`)
                    log(`     X2: ${solution[1]}`)
                } else
                    log(`     X: ${solution}`)
            }
        }
        return { steps: logs, solution }
    } else {
        alert("Provide an equation!")


        return
    }
}

/**
 * 
 * @param {string|undefined} input 
 * @returns {boolean}
 */
function validateInput(input) {
    // debugger;
    if (input) {


        let formula = input.toUpperCase().split(" ").join("").split("=");
        if (formula.length !== 2) {
            log("Usage: ./computor \"<pol> = <pol>\"");
            process.exit(0);
        } else {
            return formula
        }

    } else {
        if (process.argv.length < 3) {
            console.log("Usage: ./computor \"<pol> = <pol>\"");
            process.exit(0);
        }
        let formula = process.argv.slice(2).join("").toUpperCase().split(" ").join("").split("=");
        if (formula.length !== 2) {
            log("Usage: ./computor \"<pol> = <pol>\"");
            process.exit(0);
        } else {
            return formula
        }
    }
    log("Usage: ./computor \"<pol> = <pol>\"");
    process.exit(0);
}

function equationFormCheck(eq) {
    if (typeof eq == "string") {
        eq = eq.replace(/\s+/g, '')
        if (/(\+[^0-9X])|(\-[^0-9X])|(\*[^0-9X])|(\^[^0-9])|(\=[^0-9X\-])|(\.[^0-9])|(X[^\+\-\^\=])|([^\dX]$)/.test(eq)) { return false } else
            return true
    }
    return false
}
computorv1()