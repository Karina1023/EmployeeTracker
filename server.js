//DEPENDENCIES

const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require('console.table');
const { identity } = require("rxjs");
require('dotenv').config()

const connection = mysql.createConnection({
    host:"localhost",
    port: 3306,
    user: process.env.DB_USER, //"root"
    password: process.env.DB_PASSWORD, //"password"
    database: process.env.DB_NAME,  //"employee_trackerDB"
});
// connects to the mysql server and sql database; connection id
connection.connect(function (err){
    if (err) throw err;
    startPrompt();
});
//first prompt will ask user what he/she wants to do; initial prompt
function startPrompt() {
    inquirer.prompt([
    {
        type: "list",
        message: "What would you like to do?",
        name: "choice",
        choices: [
         "View All Employees?",
         "View All Employees By Roles?",
         "View All Employees By Departments?",
         "Update Employee?",
         "Add Employee?",
         "Add Role?",
         "Add Department?"
        ]
    }
]).then(function (val) {
    switch(val.choice) {
        case "View All Employees?":
            viewAllEmployees();
            break;
        case "View All Employees By Roles?":
            viewAllRoles();
            break;
        case "View All Employees By Departments?":
            viewAllDepartments();
            break;
        case "Add Employee?":
            addEmployee();
            break;
        case "Update Employee?":
            updateEmployee();
            break;
        case "Add Role?":
            addRole();
            break;
        case "Add Department?":
            addDepartment();
            break;
    }
})
}
//view all employees
function viewAllEmployees() {
    connection.query("SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, CONCAT(e.first_name, ' ', e.last_name) AS Manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id left join employee e on employee.manager_id = e.id;",
    function(err, res){
        if(err) throw err
        console.table(res)
        startPrompt()
    
    })
}
//view all roles
function viewAllRoles(){
    connection.query("SELECT employee.first_name, employee.last_name, role.title AS Title FROM employee JOIN role ON employee.role_id = role.id;",
    function(err, res) {
        if (err) throw err
        console.table(res)
        startPrompt()
    })
}
//view all employees by departments
function viewAllDepartments(){
    connection.query("SELECT employee.first_name, employee.last_name, department.name AS Department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY employee.id;",
    function(err, res) {
        if (err) throw err
        console.table(res)
        startPrompt()
    })
}
//select role quieries role title for add employee prompt
var roleArr = [];
function selectRole(){
    connection.query("SELECT * FROM role", 
    function(err, res) {
        if (err) throw err
        for (var i = 0; i < res.length; i++){
            roleArr.push(res[i].title);
        }
    })
    return roleArr;
}
//select role quieries the manager for add employee prompt
var managersArr = [];
function selectManager(){
    connection.query("SELECT first_name, last_name FROM employee WHERE manager_id IS NULL",
    function(err,res) {
        if (err) throw err
        for (var i = 0; i < res.length; i++){
            managersArr.push(res[i].first_name);
        }

    })
    return managersArr;
}
var employeeArr = [];
function selectEmployee(){
    connection.query("SELECT * FROM employee",
    function(err,res) {
        if (err) throw err
        console.log(res);
        for (var i = 0; i < res.length; i++){
            employeeArr.push(res[i].last_name);
        }

    })
    return employeeArr;
}

//add employee
function addEmployee() {
    inquirer.prompt([
        {
            name: "firstname",
            type: "input",
            message: "Enter their first name"
        },
        {
            name: "lastname",
            type: "input",
            message: "Enter their last name"
        },
        {
            name: "role",
            type: "list",
            message: "What is their role?",
            choices: selectRole()
        },
        {
            name: "choice",
            type: "rawlist",
            message: "Whats their managers name?",
            choices: selectManager()
        }
    ]).then(function (val){
        var roleId = selectRole().indexOf(val.role) + 1
        var managerId = selectManager().indexOf(val.choice) + 1
        connection.query("INSERT INTO employee SET ?",
        {
            first_name: val.firstName,
            last_name: val.lastName,
            manager_id: managerId,
            role_id: roleId
        }, function(err){
            if(err) throw err
            console.table(val)
            startPrompt()
        })
    })
}
//update employee
function updateEmployee(){
    connection.query("SELECT employee.last_name, role.title FROM employee JOIN role ON employee.role_id = role.id;",
    function(err, res) {
        if(err) throw err
        console.table(res)
        inquirer.prompt([
            {
                name: "lastName",
                type: "list",
                message: "Select an employee to update",
                choices: selectEmployee()
                
            },
            {
                name: "role",
                type: "list",
                message: "What is the Employees new title?",
                choices: selectRole()
            },
        ]).then(function(val) {
            var roleId = selectRole().indexOf(val.role) + 1
            connection.query("UPDATE employee SET ? WHERE ?",
            {
                role_id: roleId
            },
            {
                last_name: val.lastName
            },
            function(err) {
                if(err) throw err
                console.table(val)
                startPrompt();
            })
        });
    }); 
}
//add employee role
function addRole(){
    connection.query("SELECT role.title AS Title, role.salary AS Salary FROM role",
    function(err, res){
       inquirer.prompt([
           {
               name: "Title",
               type: "input",
               message: "What is the roles Title?"
           },
           {
               name: "Salary",
               type: "input",
               message: "What is the Salary?"
           }
       ]).then(function(res) {
           connection.query("INSERT INTO role SET ?",
           {
               title: res.Title,
               salary: res.Salary,
           },
           function(err){
               if(err) throw err
               console.table(res);
               startPrompt();
           }
        )
    }); 
    });
}
// add department
function addDepartment(){
    inquirer.prompt([
        {
            name: "name",
            type: "input",
            message: "What Department would you like to add?"
        }
    ]).then(function(res){
        var query = connection.query("INSERT INTO department SET?",
        {
            name: res.name
        },
        function(err){
            if(err) throw err
            console.table(res);
            startPrompt();
        }
    )
    })
}