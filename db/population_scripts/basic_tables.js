/*
Author:     Shaun McCrum
Created:    19 Nov 2019
Since:      19 Nov 2019
Description:  Create table data for database tables
*/

const fs = require('fs');
const path = require('path');

const { Client } = require('pg');

const firstNames = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'firstnames-short.json'), 'utf8'));
const lastNames = JSON.parse(fs.readFileSync(path.resolve(__dirname,'lastnames-short.json'), 'utf8'));
const streetnames = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'streetnames.json'), 'utf8'));


//* ****FUNCTIONS**** */
// Generate random number with a defined maximum.
function randInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

// Generate a random string from defined array
function randNth(array) {
    return array[randInt(array.length)];
}

// Generate Postal Code
function randPostalCode() {
    // TODO: Make pretty.
    // Canadian postal code rules:
    //     Does not include D, F, I, O, Q, U.
    //     W, Z, do not appear in the first letter.
    let firstAlpha = 'ABCEGHJKLMNPRSTVXY';
    let restAlpha = 'ABCEGHJKLMNPRSTVWXYZ';

    return randNth(firstAlpha) +
           randInt(10).toString() +
           randNth(restAlpha) +
           randInt(10).toString() +
           randNth(restAlpha) +
           randInt(10).toString();
}

// Generate Phone Number
function randPhoneNumber() {
    //     --3--3---4           --3--3---4
    return (1000000000 + randInt(8999999999)).toString();
}

// Set an employee wage
function randomWage() {
    // random wage generation
    min = Math.ceil(14);
    max = Math.floor(30);
    //sconsole.log((Math.random() * (max - min) + min).toFixed(2));
    return (Math.random() * (max - min) + min).toFixed(2);
}

// Set availability
function randomAvailability() {
    // random wage generation
    let days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    let availabilityString= "";
    days = shuffle(days);
    // Shuffle referenced from the Fisher–Yates Shuffle method https://bost.ocks.org/mike/shuffle/
    function shuffle(array) {
        var copyArray = [], n = array.length, i;
        
        // While there remain elements to shuffle…
        while (n) {
        
            // Pick a remaining element…
            i = Math.floor(Math.random() * array.length);
        
            // If not already shuffled, move it to the new array.
            if (i in array) {
                copyArray.push(array[i]);
            delete array[i];
            n--;
            }
        }
        return copyArray;
    }
    // ===  Define availability ===
    
    // Trim the array to random availability length
    // We must have some days so max trimmed set to 4.
    let  maxDaysOff = randInt(4);
    for (i=1; i<=maxDaysOff; i++)
    {
        days.pop();
    }
    //sort array alphabetically
    days = days.sort();

    // Set days of availability.
    for (i=0; i<=days.length; i++)
    {
        availabilityString += days[i] + ' ';
    }
    return availabilityString;

}

function randomDate() {
    let minDate = new Date(2015,1,1);
    let maxDate = new Date(2019,12,31);
    let dateGap = (maxDate - minDate);
    let timestamp = Math.round(Math.random() * dateGap);
    timestamp += minDate;
    return new Date(timestamp);
}

// Functions to generate Seed Data
function genStore() {
    let store = [];
    store.push(randInt(9999) +' '+ randNth(streetnames) + ' '
    +  randNth(['St','Blvd','Cres','Rd','Ct']) + '. ' + 
    randNth(['Oshawa', 'Toronto','Scarborough']));
    store.push(randPostalCode());
    store.push('ON');
    store.push(randPhoneNumber());
    return store;
}

function genMember() {
    let member = [];

    // Hardcode password so we can log-in as members for testing.
    member.push('password');
    member.push(1);
    member.push(randNth(firstNames));
    member.push(randNth(lastNames));
    member.push(randPostalCode());
    member.push(randPhoneNumber());
    member.push(`${member[2]}.${member[3]}@example.com`);
    member.push(randNth(['true', 'false']));
    
    return member;
}

function genEmployee() {
    let employee = [];
    // Hardcode password so we can log-in as employees for testing.
    employee.push('password');
    employee.push(randNth(firstNames));
    employee.push(randNth(lastNames));
    employee.push(randNth(['technician', 'manager']));
    employee.push(randPhoneNumber());
    employee.push(`${employee[1]}.${employee[2]}@example.com`);
    employee.push(randInt(9999) +' '+ randNth(streetnames) +' '+  randNth(['St','Blvd','Cres','Rd','Ct']));
    employee.push(randPostalCode());
    employee.push(randomAvailability());
    employee.push(randomWage());
    return employee;
}

function genNews() {
    let newsItem = [];
    newsItem.push(randNth(['Discounted Items', 'Sale']));
    let generatedDate = randomDate();
    //newsItem.push(generatedDate.getFullYear()+'-'+generatedDate.getMonth()+'-'+generatedDate.getDate());
    newsItem.push('2019-02-15');  //hard coded, will be changing
    newsItem.push(randNth(['Low on Stock!', '30% Off', 
        'Buy One Get one of equal value', 'Save the Tax.']));
    newsItem.push(randNth(['true', 'false']));
    return newsItem;
}

// EXPORTED FUNCTION
exports.seedBasicTables = function() {
    let client = new Client({
        user: 'pressstartadmin',
        database: 'pressstartdb'
    });
    console.log("Connecting as "+ client.user + ".");
    // Establish connection
    let queries = client.connect();
    // generate table data
    let insertStoreSql = 'INSERT INTO tbl_stores(store_address, store_postal_code, '+
        'store_province, store_phone_number) '+
        'VALUES($1, $2, $3, $4);';
    let insertMemberSql = 'INSERT INTO tbl_members(member_password, member_preffered_store, '+
        'member_first_name, member_last_name, member_postal_code, '+
        'member_phone, member_email, member_mailing_list) '+
        'VALUES($1, $2, $3, $4, $5, $6, $7, $8);';
    let insertEmployeeSQL = 'INSERT INTO tbl_employees(employee_password, employee_first_name, employee_last_name, '+
        'employee_job_title, employee_phone, employee_email, employee_address, employee_postal_code, employee_availability, employee_wage) '+
        'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);';
    let insertNewsSQL = 'INSERT INTO tbl_news(news_title, news_date_added, news_article, news_front_page)'+
    'VALUES($1, $2, $3, $4);';

    // Generate data -> queue up the queries -> close the connection.
    let stores = Array.from({length: 3}, genStore);
    for (const store of stores) {
        queries = queries.then(() => client.query(insertStoreSql, store));
    }

    let members = Array.from({length: 50}, genMember);
    for (const member of members) {
        queries = queries.then(() => client.query(insertMemberSql, member));
    }

    let employees = Array.from({length: 10}, genEmployee);
    for (const employee of employees) {
        queries = queries.then(() => client.query(insertEmployeeSQL, employee));
    }

    let news = Array.from({length: 10}, genNews);
    for (const newsItem of news) {
        queries = queries.then(() => client.query(insertNewsSQL, newsItem));
    }


    console.log('Closing Connection for table seed');
    queries.then(() => client.end());
}