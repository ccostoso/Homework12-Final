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
console.log('Welcome supervisor!');
mainMenu();

function mainMenu() {
    inquirer.prompt([
        {
            name: 'mainMenu',
            type: 'list',
            message: 'What would you like to do today?',
            choices: [
                'View Product Sales by Department',
                'Create New Department',
                'Close Program'
            ]
        }
    ]).then(answers => {
        switch (answers.mainMenu) {
            case 'View Product Sales by Department':
                viewProductSales();
                break;
            case 'Create New Department':
                createNewDepartment();
                break;
            default:
                closeProgram();
        }
    })
}

// Function declarations
// View product sales by department
function viewProductSales() {
    connection.query("SELECT departments.department_id AS 'Department ID', departments.department_name AS 'Department Name', departments.over_head_costs AS 'Overhead Costs', products.product_sales AS 'Product Sales', products.product_sales - departments.over_head_costs AS 'Total Profits' FROM departments LEFT JOIN products ON departments.department_name = products.department_name GROUP BY departments.department_id", (err, res) => {
        if (err) throw err;
        console.table(res);
        returnToMainMenu();
    })
};

// Create new department
function createNewDepartment() {
    inquirer.prompt([
        {
            name: 'newDeparment',
            type: 'input',
            message: 'What is the name of this new department you would like to add?'
        }, {
            name: 'newOverHeadCosts',
            type: 'number',
            message: 'What are the overhead costs for this new department?',
            validate: input => isNaN(input) ? 'Please enter a number.' : true
        }
    ]).then(answer => {
        console.log('Updating database...');

        let newDepartmentName = answer.newDeparment;
        let newOverHeadCosts = answer.newOverHeadCosts;
        
        connection.query('INSERT INTO departments ( department_name , over_head_costs ) VALUES ( ? , ? )', [newDepartmentName, newOverHeadCosts], (err, res) => {
            if (err) throw err;
            console.log('Database updated!');
            inquirer.prompt([
                {
                    name: 'promptViewSales',
                    type: 'confirm',
                    message: 'Would you like to view statistics for all departments, including the new department you just entered?'
                }
            ]).then(answer => {
                answer.promptViewSales ? viewProductSales() : returnToMainMenu();
            })
        })

    })
}

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

// Close program
function closeProgram() {
    console.log('OK. Good-buy!');
    connection.end();
};