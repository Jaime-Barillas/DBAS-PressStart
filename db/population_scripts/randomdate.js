/*
Author:     Shaun McCrum
Created:    27 Nov 2019
Since:      27 Nov 2019
Description:  Test-bed for sample date creation
*/

function randomDate() {
    let minDate = new Date(2013,1,1);
    let maxDate = new Date(2018,12,31);  
    // set a minimum date add a random number to it
    // multiply that date by the difference between the min and max date values.  
    // based on documentation from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
    var timeStamp = new Date(minDate.getTime() + Math.random() 
        * (maxDate.getTime() - minDate.getTime()));
    var year = timeStamp.getFullYear();
    var month = timeStamp.getMonth() + 1;  // month index value is 0-11 so we must compenstte
    var day = timeStamp.getDate();
    return year + '-' + month + '-' + day ;
}

let dateStamp = randomDate()
console.log(dateStamp)