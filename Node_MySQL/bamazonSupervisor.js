var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require("chalk");
var Table = require("cli-table");

var connection = mysql.createConnection({
    host: "Localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    var runMenu = function () {
        console.log(chalk.magenta.bold("\n===========================================================\n"));
        //  List a set of menu options:
        //  View Product Sales by Department, Create New Department
        inquirer.prompt([
            {
                type: "list",
                name: "menuOptions",
                message: "Menu Options:",
                choices: ["View Product Sales by Department", "Create New Department", "Exit Menu"]
            }
        ]).then(function (answer) {
            if (answer.menuOptions === "View Product Sales by Department") {
                // When a supervisor selects `View Product Sales by Department`,
                // the app should display a summarized table in their terminal/bash window.
                // | department_id | department_name | over_head_costs | product_sales | total_profit |
                // | ------------- | --------------- | --------------- | ------------- | ------------ |
                // | 01            | Electronics     | 10000           | 20000         | 10000        |
                // | 02            | Clothing        | 60000           | 100000        | 40000        |
                connection.query("SELECT departments.department_id, departments.department_name, departments.over_head_costs, products.department_name, SUM(products.product_sales) AS product_sales FROM departments LEFT JOIN products ON departments.department_name = products.department_name GROUP BY departments.department_name ORDER BY departments.department_id ", function (err, res) {
                    if (err) throw err;
                    var table = new Table({
                        head: ["department_id", "department_name", "over_head_costs", "product_sales", "total_profit"],
                        colWidths: [15, 17, 17, 15, 14]
                    });
                    for (var i = 0; i < res.length; i++) {
                        var totalProfit = res[i].product_sales - res[i].over_head_costs
                        table.push([res[i].department_id, res[i].department_name, "$" + res[i].over_head_costs, "$" + res[i].product_sales, "$" + totalProfit]);
                    }
                    console.log(chalk.white.bgMagenta.bold("\n                                                                                    "));
                    console.log(chalk.white.bgMagenta.bold("                              Product Sales by Department                           "));
                    console.log(chalk.white.bgMagenta.bold("                                                                                    "));
                    console.log(chalk.black.bgWhite.bold(table.toString() + "\n"));

                    runMenu();

                });
            } else if (answer.menuOptions === "Create New Department") {
                console.log(chalk.magenta.bold("\n===========================================================\n"));
                //  If a manager selects "Create New Department"
                createDepartment();
                function createDepartment() {
                    inquirer.prompt([
                        {
                            type: "input",
                            name: "departmentName",
                            message: "What is the name of the new department?"
                        },
                        {
                            type: "input",
                            name: "overHeadCost",
                            message: "What is the overhead cost of this department?(ENTER DIGITS ONLY)"
                        }
                    ]).then(function (answer) {
                        connection.query("INSERT INTO products SET item_id = ?, product_name = ?, department_name = ?, price = ?, stock_quantity = ?, product_sales = ?", [null, "none", answer.departmentName, 0.00, 10, 0.00], function (err, res) {
                        });
                        connection.query("INSERT INTO departments SET department_name = ?, over_head_costs = ?", [answer.departmentName, answer.overHeadCost], function (err, res) {
                            console.log(chalk.magenta.bold("\n==========================================================="));
                            console.log("\nDepartments updated!");
                            console.log("\n" + chalk.cyan(answer.departmentName) + " has been created.");
                            runMenu();
                        });
                    });
                }

            } else if (answer.menuOptions === "Exit Menu") {
                console.log(chalk.magenta.bold("\n==========================================================="));
                console.log("\nHave a great day!");
                console.log(chalk.magenta.bold("\n==========================================================="));
                connection.end();
            };
        });
    };
    runMenu();
});