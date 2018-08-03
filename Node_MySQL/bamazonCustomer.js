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
    //resetTable();
    resetCart();
    runBamazon();
});

function runBamazon() {
    connection.query("SELECT * FROM products WHERE product_name != ?", ["none"], function (err, res) {
        if (err) throw err;

        //  Running this application will first display all of the items available for sale.
        //  Include the ids, names, and prices of products for sale.
        var table = new Table({
            head: ["Item ID", "Name", "Price"],
            colWidths: [9, 20, 10]
        });

        for (var i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, "$" + res[i].price]);
        }
        console.log(chalk.white.bgMagenta.bold("\n                                           "));
        console.log(chalk.white.bgMagenta.bold("           Welcome to Bamazon!             "));
        console.log(chalk.white.bgMagenta.bold("                                           "));
        console.log(chalk.black.bgWhite.bold(table.toString()));
        console.log("");
        console.log(chalk.magenta.bold("================================================="));
        console.log("");
        //  The app should then prompt users with two messages.
        buyProduct();
    });
};

function buyProduct() {
    inquirer.prompt([
        {
            //  1. The first should ask them the ID of the product they would like to buy.
            type: "input",
            name: "item",
            message: "What is the ID of the product you would like to buy?"
        },
        {
            //  2. The second message should ask how many units of the product they would like to buy.
            type: "input",
            name: "quantity",
            message: "How many units would you like to buy?"
        }
    ]).then(function (answer) {
        //  Once the customer has placed the order, your application should check if your store has enough of the
        //  product to meet the customer's request.
        connection.query("SELECT * FROM products WHERE ?", { item_id: answer.item }, function (err, res) {
            if (err) throw err;

            if (answer.quantity > res[0].stock_quantity) {
                //  If not, the app should log a phrase like `Insufficient quantity!`,
                //  and then prevent the order from going through.
                console.log("");
                console.log(chalk.magenta.bold("================================================="));
                console.log("");
                console.log(chalk.bgWhite.red("\n                                               "));
                console.log(chalk.bgWhite.red(" Insufficient quantity!                        "));
                console.log(chalk.bgWhite.red("                                               "));
                console.log(chalk.bgWhite.red(" Please choose a different item and/or amount. "));
                console.log(chalk.bgWhite.red("                                               \n"));
                buyProduct();
            } else if (answer.quantity <= res[0].stock_quantity) {
                //  However, if your store _does_ have enough of the product, you should fulfill the customer's order.
                //  This means updating the SQL database to reflect the remaining quantity.
                //  Once the update goes through, show the customer the total cost of their purchase.
                console.log(chalk.magenta.bold("\n=================================================\n"));
                console.log(chalk.green("We have enough " + chalk.green(res[0].product_name) + " items!"));
                var newAmount = res[0].stock_quantity - answer.quantity;
                var subtotal = answer.quantity * res[0].price

                connection.query("UPDATE products SET stock_quantity = ? WHERE ?", [newAmount, { item_id: answer.item }], function (err, res) {
                });
                connection.query("UPDATE products SET product_sales = ? WHERE ?", [subtotal + res[0].product_sales, { item_id: answer.item }], function (err, res) {
                });
                if (newAmount > 1) {
                    console.log("\nStock updated! There are now " + chalk.cyan(newAmount) + " " + res[0].product_name + " items in stock.");
                } else if (newAmount === 1) {
                    console.log("\nStock updated! There is now " + chalk.cyan(newAmount) + " " + res[0].product_name + " item in stock.");
                } else if (newAmount === 0) {
                    console.log("\nStock updated! You have bought the last " + res[0].product_name + ".");
                };
                connection.query("INSERT INTO cart SET total_due = ?", subtotal, function (err, res) {

                });
                connection.query("SELECT SUM(total_due) AS totalDue FROM cart", function (err, res) {
                    console.log("\nYour current subtotal is " + chalk.cyan("$") + chalk.cyan(res[0].totalDue));
                    console.log(chalk.magenta.bold("\n=================================================\n"));

                    inquirer.prompt([
                        {
                            type: "list",
                            name: "doNext",
                            message: "What would you like to do now?",
                            choices: ["Buy another item", "End my shopping trip"]
                        }
                    ]).then(function (answer) {
                        if (answer.doNext === "Buy another item") {
                            runBamazon();
                        } else if (answer.doNext === "End my shopping trip") {
                                console.log(chalk.bgWhite.cyan("\n*******************************************************"));
                                console.log(chalk.bgWhite.cyan("                                                       "));
                                console.log(chalk.bgWhite.cyan("          Thank you for shopping with Bamazon.         "));
                                console.log("       " + chalk.bgWhite.cyan("      Your purchase total is $") + chalk.bgWhite.cyan(res[0].totalDue) + chalk.bgWhite.cyan(".       "));
                                console.log(chalk.bgWhite.cyan("                   Have a nice day!                    "));
                                console.log(chalk.bgWhite.cyan("                                                       "));
                                console.log(chalk.bgWhite.cyan("*******************************************************\n"));
                            
                            connection.end();
                        };
                    });
                });
            };
        });
    });
};

function resetTable() {
    var query = "UPDATE products SET stock_quantity = ? WHERE product_name = ?"
    connection.query(query, [10, "piano"], function (err, res) {
    });
    connection.query(query, [10, "coffee maker"], function (err, res) {
    });
    connection.query(query, [10, "rummikub"], function (err, res) {
    });
    connection.query(query, [10, "pet carrier"], function (err, res) {
    });
    connection.query(query, [10, "Aladdin"], function (err, res) {
    });
    connection.query(query, [10, "bicycle"], function (err, res) {
    });
    connection.query(query, [10, "helmet"], function (err, res) {
    });
    connection.query(query, [10, "bottle opener"], function (err, res) {
    });
    connection.query(query, [10, "flute"], function (err, res) {
    });
    connection.query(query, [10, "checkers"], function (err, res) {
    });
};

function resetCart() {
    connection.query("DELETE FROM cart WHERE customer_id is NOT NULL", function(err, res) {
    });
};