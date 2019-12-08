/* IMPORTANT
 * =========
 * This script is included in the head section of every page.
 * This file should be kept small to not affect page load too bad.
 */

const validMethods = ['GET', 'POST'];

// Synchronous ajax requests...
// Asynchronous should be preferred.
// method = 'GET' or 'POST', url should be address pointing to localhost.
// Returns the ajax responseText or throws an Error.
function ajax(method, url) {
    // Function Guards
    if (!validMethods.includes(method)) {
        alert(`Unexpected request method: ${method.toString()}\nExpected one of: ${validMethods.toString()}`);
        throw new Error(`Unexpected request method: ${method.toString()}\nExpected one of: ${validMethods.toString()}`);
    }



    let ajaxRequest = new XMLHttpRequest();

    if (!ajaxRequest) {
        alert('Failed to create XMLHttpRequest (AJAX) instance!');
        throw new Error('Failed to create XMLHttpRequest (AJAX) instance!');
    }

    ajaxRequest.open(method, url, false);
    ajaxRequest.send();

    if (ajaxRequest.status === 200) {
        return ajaxRequest.responseText;
    } else {
        alert('Got non-200 (OK) HTTP status code in response.');
        throw new Error('Got non-200 (OK) HTTP status code in response.');
    }
}

/* Asynchronous via promises.
 * Returns a promise that contains the response text of the ajax request.
 */
function asyncAjax(method, url) {
    // Function Guards
    if (!validMethods.includes(method)) {
        return Promise.reject(`Unexpected request method: ${method.toString()}\nExpected one of: ${validMethods.toString()}`);
    }

    let promise = new Promise((resolve, reject) => {
        let ajaxRequest = new XMLHttpRequest();
        if (!ajaxRequest) {
            reject('Failed to create XMLHttpRequest (AJAX) instance!');
        }

        ajaxRequest.onreadystatechange = function() {
            // XMLHttpRequest.DONE === 4
            if (ajaxRequest.readyState === 4) {
                if (ajaxRequest.status !== 200) {
                    reject('Got non-200 (OK) HTTP status code in response.');
                } else {
                    resolve(ajaxRequest.responseText);
                }
            }
        };
        ajaxRequest.open(method, url, true);
        ajaxRequest.send();
    });

    return promise;
}
