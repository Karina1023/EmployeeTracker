//DEPENDENCIES

const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require('console.table');

var connection = mysql.createConnection({
    host:"localhost",
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    insecureAuth : true
});
// connects to the mysql server and sql database
connection.connect(function (err){
    if (err) throw err;
    startPrompt()
});
//first prompt will ask user what he/she wants to do
function startPrompt(){
    inquirer.prompt([{
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: ["Add", "View", "Update", "Delete"]
    },
    {
        name: "option",
        type: "list",
        message: "Select from the options below",
        choices: ["Employee", "Role", "Department"]
    }
]) 
//switch statement for the next prompt
.then(function (res) {
    console.log(`You chose to ${res.action} a ${res.option}`);

    switch(res.action) {
        case "Add":
            createData(res.option);
            break;
        case "View":
            readData(res.option);
            break;
        case "Update":
            updateData(res.option);
            break;
        case "Delete":
            deleteData(res.option);
            break;
    }
})
.catch(function (err) {
    console.log(err);
})
}
//CREATE DATA FUNCTION
function createData(option){
    switch(option){
        //create employee statement
        case 'Employee':
            //get roles data for list
            connection.query("SELECT * FROM roles", function(err,res){
                if (err) throw err;
                const roles = res.map(object => {
                    return{
                        name: object.role_title,
                        value: object.r_id
                    }
                });
                roles.push("N/A")
                //get employee data for list
                connection.query("S")
            })
    }
}