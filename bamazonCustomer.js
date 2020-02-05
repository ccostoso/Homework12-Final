// Dependencies
var inquirer = require('inquirer');
var mysql = require('mysql');

// MySQL connection
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "PASSWORD",
    database: "bamazon"
});

// Begin program
console.log('Welcome to Bamazon! Check out our hot new products.');
selectTable();

// Function declarations
// Ask if customer wants to buy a product
function askIfWantToBuy(productList) {
    inquirer.prompt([
        {
            name: 'placeOrder',
            message: 'Would you like to order an item?',
            type: 'confirm'
        }
    ]).then(answer => {
        // If customer wants to buy a product, select which to buy, otherwise close program. Variable "productList" is passed to product selection prompt.
        answer.placeOrder ? selectWhichToBuy(productList) : closeProgram();
    });
}

// Select a product to buy.
function selectWhichToBuy(productList) {

    // Ask which product to buy.
    inquirer.prompt([
        {
            name: 'whichProduct',
            type: 'list',
            choices: productList,
            message: 'Which item would you like to buy?'
        }, {
            name: 'howMany',
            type: 'number',
            message: 'How many would you like to buy?',
            validate: input => isNaN(input) ? 'Please enter a number.' : true
        }
    ]).then(selectAnswer => {
        let productChosen = selectAnswer.whichProduct;
        let amountChosen = selectAnswer.howMany;
        console.log('typeof amountChosen:', typeof amountChosen);
        console.log('Connecting to database...');
        connection.query('SELECT * FROM products WHERE product_name = ?', [productChosen] , (err, res) => {
            if (err) throw err;
            let totalPrice = amountChosen * res[0].price;
            if (amountChosen < res[0].stock_quantity) {
                connection.query("UPDATE products SET stock_quantity = stock_quantity - ?, product_sales = ? WHERE product_name = ?", [amountChosen, totalPrice, productChosen], (err, res) => {
                    if (err) throw err;
                    console.log(`Purchase made! Your total comes to $${totalPrice}. Thank you!`);
                    
                    returnToMainMenu();
                })
            } else {
                console.log('Sorry, we don\'t have that many! Would you like to buy something else?');
                selectTable();
            }
        })
    });
}

function selectTable() {
    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products", (err, res) => {
        if (err) throw err;
        console.table(res);
        let productArr = [];
        res.forEach(ele => productArr.push(ele.product_name));
        askIfWantToBuy(productArr);
    });
}

function closeProgram() {
    console.log('OK. Good-buy!');
    connection.end();
}

function returnToMainMenu() {
    inquirer.prompt([
        {
            name: 'returnToMain',
            type: 'confirm',
            message: 'Would you like to return to the main menu?'
        }
    ]).then(answerOfReturn => {
        answerOfReturn.returnToMain ? selectTable() : closeProgram();
    });
}