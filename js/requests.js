
var usersArray = [];
var tasksArray = [];
var accessToken = "";
var companiesURL = "https://webapi.timedoctor.com/v1.1/companies";

// read access token from URL 
var getUrlParameter = function(sParam) {
    let queryObj = {};

    let querystring = window.location.hash.split('&');
    for (let i = 0; i < querystring.length; i++) {
        let name = querystring[i].split('=')[0];
        let value = querystring[i].split('=')[1];
        queryObj[name] = value;
    }
    return queryObj[sParam];
};

var assignAccessToken = function() {
    accessToken = getUrlParameter("access_token");
    makeRequest();
}

window.setTimeout(assignAccessToken, 2);

// function to make request for companies and users 
function makeRequest() {
    let newCompaniesURL = companiesURL+"?access_token="+accessToken;

    // making companies list request
    $.getJSON('http://cors.io/?'+newCompaniesURL,
        function(data) {

            let url = data.accounts[0].url;
            // this needs to be parsed to remove the last url component 
            let to = url.lastIndexOf('/');
            to = to == -1 ? url.length : to;
            url = url.substring(0, to);
            url = url+"?access_token="+accessToken;

            // making request for user list
            $.getJSON('http://cors.io/?'+url,
                function(response) {
                    response.users.forEach(function(eachUser) {
                        usersArray.push(eachUser);
                    });
                    $.each(usersArray, function(i, row) {
                        $('#user-list').append('<li><a href="#' + encodeURI(row.user_id) + ' " data-id="' + row.user_id + '">' + row.full_name + '</a></li>');    
                    });
                });
        });
}

// handling click on user element
$(document).on('click', '#user-list li a', function() {
    // clearing out old data
    tasksArray = [];
    $('#detail-list').empty();

    let userId = $(this).attr("data-id");
    let userInfo = usersArray.filter(user => {
        if (parseInt(userId) === parseInt(user.user_id)) {
            return user;
        }
        return null;
    });

    if (!userInfo) {
        return; 
    }

    let userObj = userInfo[0];
    let tasksURL = userObj.url + '/tasks';
    tasksURL = tasksURL+"?access_token="+accessToken;

    // making task list request (without status)
    $.getJSON('http://cors.io/?'+tasksURL, function(response) {
        response.tasks.forEach(function(eachTask) {
            tasksArray.push(eachTask);
        });
        $.each(tasksArray, function(i, row) {
            $('#detail-list').append('<li><a href="#' + encodeURI(row.task_id) + ' " data-id="' + row.task_id + '">' + row.task_name + '</a></li>');    
        });
    });    
});