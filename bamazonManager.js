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
console.log('Welcome manager!');
mainMenu();

// Function declarations
// Initialize program
function mainMenu() {
    inquirer.prompt([
        {
            name: 'main',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                'View Products for Sale',
                'View Low Inventory',
                'Add to Inventory',
                'Add New Product',
                'Close Program'
            ]
        }
    ]).then(answerMain => {
        switch (answerMain.main) {
            case ('View Products for Sale'):
                selectTable();
                break;
            case ('View Low Inventory'):
                viewLowInventory();
                break;
            case ('Add to Inventory'):
                addToInventory();
                break;
            case ('Add New Product'):
                addNewProduct();
                break;
            default:
                closeProgram();
        }
    });    
};

// View all products for sale
function selectTable() {
    connection.query('SELECT * FROM products', (err, res) => {
        if (err) throw err;
        console.table(res);
        returnToMainMenu();
    })
}

// View low inventory
function viewLowInventory() {
    console.log('The following items are running low.');
    connection.query('SELECT * FROM products WHERE stock_quantity < 100', (err, res) => {
        if (err) throw err;
        console.table(res);
        inquirer.prompt([
            {
                name: 'promptOnAdd',
                type: 'confirm',
                message: 'Would you like to add more inventory for an item?'
            }
        ]).then(answerOnAdding => {
            answerOnAdding.promptOnAdd ? addToInventory() : returnToMainMenu();
        });
    });
};

// Add items to inventory
function addToInventory() {
    // Create list of all products to reference in inquirer prompt, initally empty
    let listOfInventory = [];

    // Query MySQL database for a table of all products
    connection.query('SELECT * FROM products', (err, res) => {
        if (err) throw err;

        // Display table of all products
        console.table(res);

        // Populate listOfInventory array with names of all products
        res.forEach(ele => listOfInventory.push(ele.product_name));

        // Prompt user to select an item to update stock of
        inquirer.prompt([
            {
                name: 'selectProduct',
                type: 'list',
                message: 'Which item would you like to update?',
                choices: listOfInventory
            }, {
                name: 'howMuchToAdd',
                type: 'number',
                message: 'How much would you like to add?',
                validate: input => isNaN(input) ? 'Please enter a number.' : true
            }
        ]).then(answerWhichToAdd => {

            // Assign variable of selected product for easy referencing
            let productSelected = answerWhichToAdd.selectProduct;

            // Assign variable of amount to increase product by for easy referencing
            let amountToAdd = answerWhichToAdd.howMuchToAdd;

            // Update selected product using variables "productSelected" and "amountToAdd"
            connection.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_name = ?', [amountToAdd, productSelected], (err, res) => {
                if (err) throw err;
                console.log('Amount updated. Thank you!');

                // Return to main menu
                returnToMainMenu();
            })
        })
    });
};

function addNewProduct() {
    inquirer.prompt([
        {
            name: 'productName',
            type: 'input',
            message: 'What is the name of this product?',
            validate: input => input.length > 50 ? 'Maximum name length is 50 characters.' : true,
        }, {
            name: 'departmentName',
            type: 'input',
            message: 'Which department should this be in?',
            validate: input => input.length > 50 ? 'Maximum name length is 50 characters.' : true,
        }, {
            name: 'price',
            type: 'number',
            message: 'How much will this cost?',
            validate: input => isNaN(input) ? 'Please enter a number.' : true
        }, {
            name: 'stock_quantity',
            type: 'number',
            message: 'How many of this item will be in stock?',
            validate: input => isNaN(input) ? 'Please enter a number.' : true
        }
    ]).then(answerOnNewProduct => {
        let newProductName = answerOnNewProduct.productName;
        let newDepartmentName = answerOnNewProduct.departmentName;
        let newPrice = answerOnNewProduct.price;
        let newStockQuantity = answerOnNewProduct.stock_quantity;

        connection.query('INSERT INTO products ( product_name, department_name, price, stock_quantity ) VALUES ( ?, ?, ?, ? )', [newProductName, newDepartmentName, newPrice, newStockQuantity], (err, res) => {
            if (err) throw err;
            console.log('New item added!');
            promptViewTable();
        })
    })
};

// Return to main menu
function returnToMainMenu() {
    inquirer.prompt([
        {
            name: 'returnToMain',
            type: 'confirm',
            message: 'Would you like to return to the main menu?'
        }
    ]).then(answerOfReturn => {
        answerOfReturn.returnToMain ? mainMenu() : closeProgram();
    });
};

function promptViewTable() {
    inquirer.prompt([
        {
            name: 'viewTable',
            type: 'confirm',
            message: 'Would you like to see the new table of products?'
        }
    ]).then(answer => {
        answer.viewTable ? selectTable() : closeProgram();
    })
}

// Close program
function closeProgram() {
    console.log('OK. Good-buy!');
    connection.end();
};