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
        //  View Products for Sale, View Low Inventory, Add to Inventory, Add New Product
        inquirer.prompt([
            {
                type: "list",
                name: "menuOptions",
                message: "Menu Options:",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit Menu"]
            }
        ]).then(function (answer) {
            if (answer.menuOptions === "View Products for Sale") {
                //  If a manager selects `View Products for Sale`, the app should list every available item:
                //  the item IDs, names, prices, and quantities.
                connection.query("SELECT * FROM products", function (err, res) {
                    if (err) throw err;

                    var table = new Table({
                        head: ["Item ID", "Name", "Price", "Quantity"],
                        colWidths: [9, 20, 10, 10]
                    });

                    for (var i = 0; i < res.length; i++) {
                        table.push([res[i].item_id, res[i].product_name, "$" + res[i].price, res[i].stock_quantity]);
                    }
                    console.log(chalk.white.bgMagenta.bold("\n                                                      "));
                    console.log(chalk.white.bgMagenta.bold("                   Products for Sale                  "));
                    console.log(chalk.white.bgMagenta.bold("                                                      "));
                    console.log(chalk.black.bgWhite.bold(table.toString() + "\n"));

                    runMenu();
                });
            } else if (answer.menuOptions === "View Low Inventory") {
                //  If a manager selects `View Low Inventory`, then it should list all items
                //  with an inventory count lower than five.
                connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
                    if (err) throw err;

                    if (!res.length) {
                        console.log(chalk.magenta("\n==========================================================="));
                        console.log(chalk.green("\nAll of the inventory has at least 5 items in stock."));

                    } else {
                        var table = new Table({
                            head: ["Item ID", "Name", "Price", "Quantity"],
                            colWidths: [9, 20, 10, 10]
                        });

                        for (var i = 0; i < res.length; i++) {
                            table.push([res[i].item_id, res[i].product_name, "$" + res[i].price, res[i].stock_quantity]);
                        }
                        console.log(chalk.white.bgMagenta.bold("\n                                                      "));
                        console.log(chalk.white.bgMagenta.bold("            Limited Inventory (<5 items)              "));
                        console.log(chalk.white.bgMagenta.bold("                                                      "));
                        console.log(chalk.black.bgWhite.bold(table.toString()));

                    };
                    runMenu();
                });

            } else if (answer.menuOptions === "Add to Inventory") {
                console.log(chalk.magenta.bold("\n===========================================================\n"));
                //  If a manager selects `Add to Inventory`, your app should display a prompt that will
                //  let the manager "add more" of any item currently in the store.
                connection.query("SELECT * FROM products", function (err, res) {
                    if (err) throw err;

                    var table = new Table({
                        head: ["Item ID", "Name", "Price", "Quantity"],
                        colWidths: [9, 20, 10, 10]
                    });

                    for (var i = 0; i < res.length; i++) {
                        table.push([res[i].item_id, res[i].product_name, "$" + res[i].price, res[i].stock_quantity]);
                    }
                    console.log(chalk.white.bgMagenta.bold("\n                                                      "));
                    console.log(chalk.white.bgMagenta.bold("                   Products for Sale                  "));
                    console.log(chalk.white.bgMagenta.bold("                                                      "));
                    console.log(chalk.black.bgWhite.bold(table.toString() + "\n"));

                });
                setTimeout(restock, 300);
                function restock() {
                    inquirer.prompt([
                        {
                            type: "input",
                            name: "item",
                            message: "What is the ID of the product you would like to restock?"
                        },
                        {
                            type: "input",
                            name: "quantity",
                            message: "How many units would you like to add?"
                        }
                    ]).then(function (answer) {
                        connection.query("SELECT * FROM products WHERE ?", { item_id: answer.item }, function (err, res) {
                            var newAmount = parseInt(res[0].stock_quantity) + parseInt(answer.quantity);
                            var productName = res[0].product_name;
                            connection.query("UPDATE products SET stock_quantity = ? WHERE ?", [newAmount, { item_id: answer.item }], function (err, res) {
                                console.log(chalk.magenta.bold("\n==========================================================="));
                                console.log("\nStock updated! There are now " + chalk.cyan(newAmount) + " " + productName + " items in stock.");
                                runMenu();
                            });
                        });

                    });
                };
            } else if (answer.menuOptions === "Add New Product") {
                //  If a manager selects `Add New Product`, it should allow the manager to add a completely
                //  new product to the store.
                setTimeout(addProduct, 500);
                function addProduct() {
                    inquirer.prompt([
                        {
                            type: "input",
                            name: "productName",
                            message: "What product would you like to sell?"
                        },
                        {
                            type: "input",
                            name: "department",
                            message: "In which department does this product belong?"
                        },
                        {
                            type: "input",
                            name: "price",
                            message: "How much does this product cost?(ENTER DIGITS ONLY)"
                        },
                        {
                            type: "input",
                            name: "stockQuantity",
                            message: "How many of this product are you putting into stock?"
                        }
                    ]).then(function (answer) {
                        connection.query("INSERT INTO products SET product_name = ?, department_name = ?, price = ?, stock_quantity = ?", [answer.productName, answer.department, answer.price, answer.stockQuantity], function (err, res) {
                            console.log(chalk.magenta.bold("\n==========================================================="));
                            console.log("\nProducts updated!");
                            console.log("\n" + chalk.cyan(answer.productName) + " has been added to the inventory.");
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