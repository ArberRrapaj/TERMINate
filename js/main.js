/*
    Main Script for Communication with Backend and
 */
var image = null;
var userID = 0;
var currentEvent;
var currentCategory;
var eventsArray = [];
var categoriesArray = [];
var calendarInitialized = false;
var filteredEntries = [];
var dialogueOpen = false;
var statusArray = ["busy", "free", "tentative"];



var fetchEntries = function (callback) {
    getEntries(function(error, message) {
        if(error) callback(true, message);
        else callback(false, message);
    });
};


var fetchCategories = function (callback) {
    getCategories(function(error, data) {
        if(error) callback(true, "Error fetching categories");
        else{
            if(data.length === 0) {
                var result = prompt("Please enter your first category");
                if (result === null) callback(true, "Cancelled category insertion. Try again.");
                else {
                    if(result.length === 0 || !result.trim() || result.length > 30) callback(true, "Category-name can't be empty or longer than 30 characters, try again please!");
                    else {
                        var req = {
                            'name': result
                        };
                        postCategory(req, function(error, data) {
                            if (error) {
                                callback(true, "Error adding category. Try again!");
                            } else {
                                getCategories(function (error, data) {
                                    if (error) callback(true, "Error fetching categories");
                                    else {
                                        categoriesArray = data;
                                        addCategories();
                                        callback (false, "Categories successfully fetched");
                                    }
                                })
                            }
                        });
                    }
                }
            } else {
                categoriesArray = data;
                addCategories();
                callback (false, "Categories successfully fetched");
            }
        }
    });
};




/********************************
 ****  Backend-Communication ****
 ********************************/

/*
    Entry-Functions -> Basic CRUD
 */
var getEntries = function(callback) {
    console.log('Calling GetEntries');
    $.ajax({
        url : "http://dhbw.ramonbisswanger.de/calendar/" + userID + "/events",
        dataType: "json",
        type: "GET",
        success: function(res, textStatus, jqXHR)
        {
            var events = [];
            res.forEach(function(entry) {
                var allday;
                entry.allday === 1 ? allday = true : allday = false;
                var event = {
                    title: entry.title,
                    start: entry.start,
                    end: entry.end,
                    allDay: allday,
                    description: {
                        id: entry.id,
                        location: entry.location,
                        organizer: entry.organizer,
                        status: entry.status,
                        webpage: entry.webpage,
                        imageurl: entry.imageurl,
                        categories: entry.categories,
                        extra: entry.extra
                    }
                };
                events.push(event);
                $calendar.fullCalendar("renderEvent", event, true);
            });
            eventsArray = events;

            $calendar.fullCalendar("renderEvent", res, true);
            callback(false, "Entries successfully loaded");
        },
        error: function (jqXHR, textStatus, errorThrown) { callback(true, jqXHR.responseJSON.description); }
    });
};

var getEntry = function(id, callback) {
    console.log('Calling GetEntry');
    $.ajax({
        url : "http://dhbw.ramonbisswanger.de/calendar/" + userID + "/events/" + id,
        dataType: "json",
        type: "GET",
        success: function(entry, textStatus, jqXHR)
        {
            var allday;
            entry.allday === 1 ? allday = true : allday = false;
            var event = {
                title: entry.title,
                start: entry.start,
                end: entry.end,
                allDay: allday,
                description: {
                    id: entry.id,
                    location: entry.location,
                    organizer: entry.organizer,
                    status: entry.status,
                    webpage: entry.webpage,
                    imageurl: entry.imageurl,
                    categories: entry.categories,
                    extra: entry.extra
                }
            };
            callback(false, event);
        },
        error: function (jqXHR, textStatus, errorThrown) { callback(true, jqXHR.responseJSON.description); }
    });
};



var postEntry = function(data, callback) {
    var tempEvent = {};
    console.log('Calling PostEntry');
    $.ajax({
        url : "http://dhbw.ramonbisswanger.de/calendar/" + userID + "/events",
        contentType: "application/json",
        type: "POST",
        processData: false,
        data: JSON.stringify(data),
        success: function(res, textStatus, jqXHR)
        {
            var allday;
            res.allday === 1 ? allday = true : allday = false;
            tempEvent.title = res.title;
            tempEvent.start = res.start;
            tempEvent.end = res.end;
            tempEvent.allDay = allday;

            tempEvent.description = {
                id: res.id,
                location: res.location,
                organizer: res.organizer,
                status: res.status,
                webpage: res.webpage,
                imageurl: res.imageurl,
                categories: res.categories,
                extra: res.extra
            };
            $calendar.fullCalendar("renderEvent", tempEvent, true);
            eventsArray.push(tempEvent);
            callback(false, null);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            //console.log(jqXHR);
            callback(true, jqXHR.responseJSON.description);
        }
    });
};

var putEntry = function(data, callback) {
    console.log('Calling PutEntry');
    $.ajax({
        url : "http://dhbw.ramonbisswanger.de/calendar/" + userID + "/events/" + data.id,
        contentType: "application/json",
        type: "PUT",
        processData: false,
        data: JSON.stringify(data),
        success: function(res, textStatus, jqXHR)
        {
            getEntry(currentEvent.description.id, function (error, event) {
                if (error) callback(false, null);
                else {
                    var index = eventsArray.indexOfEntry(currentEvent.description.id);

                    var allday;
                    event.allday === 1 ? allday = true : allday = false;
                    currentEvent.title = event.title;
                    currentEvent.start = event.start;
                    currentEvent.end = event.end;
                    currentEvent.allDay = allday;

                    currentEvent.description = {
                        id: event.description.id,
                        location: event.description.location,
                        organizer: event.description.organizer,
                        status: event.description.status,
                        webpage: event.description.webpage,
                        imageurl: event.description.imageurl,
                        categories: event.description.categories,
                        extra: event.description.extra
                    };

                    console.log("'New' Event: "); console.log(currentEvent);
                    eventsArray[index] = currentEvent;
                    $calendar.fullCalendar("updateEvent", currentEvent, true);
                    callback(false, null);
                }
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            //console.log(jqXHR);
            callback(true, jqXHR.responseJSON.description);
        }
    });
};

var deleteEntry = function(callback) {
    console.log('Calling DeleteEntry');
    $.ajax({
        url : "http://dhbw.ramonbisswanger.de/calendar/" + userID + "/events/" + currentEvent.description.id,
        contentType: "application/json",
        type: "DELETE",
        processData: false,
        success: function(res, textStatus, jqXHR)
        {
            var index = eventsArray.indexOfEntry(currentEvent.description.id);
            eventsArray.splice(index);
            $calendar.fullCalendar("removeEvents", currentEvent._id);
            console.log(res);
            callback(false, "Successfully deleted entry");
        },
        error: function (jqXHR, textStatus, errorThrown) {
            //console.log(jqXHR);
            callback(true, jqXHR.responseJSON.description);
        }
    });
};








/*
    Category-Functions -> Basic CRUD
 */

var getCategories = function(callback) {
    console.log('Calling GetCategories');
    $.ajax({
        url : "http://dhbw.ramonbisswanger.de/calendar/" + userID + "/categories",
        dataType: "json",
        type: "GET",
        success: function(res, textStatus, jqXHR)
        {
            console.log(res);
            callback(false, res.sort());
        },
        error: function (jqXHR, textStatus, errorThrown) { callback(true, jqXHR.responseJSON.description); }
    });
};

var postCategory = function (data, callback) {
    console.log('Calling PostCategory');
    $.ajax({
        url : "http://dhbw.ramonbisswanger.de/calendar/" + userID + "/categories",
        contentType: "application/json",
        type: "POST",
        processData: false,
        data: JSON.stringify(data),
        success: function(res, textStatus, jqXHR)
        {
            console.log(res);
            categoriesArray.push(data);
            callback(false, res);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            //console.log(jqXHR);
            callback(true, jqXHR.responseJSON.description);
        }
    });
};


var deleteCategory = function (callback) {
    console.log('Calling DeleteCategory');
    $.ajax({
        url : "http://dhbw.ramonbisswanger.de/calendar/" + userID + "/categories/" + currentCategory.id,
        contentType: "application/json",
        type: "DELETE",
        processData: false,
        success: function(res, textStatus, jqXHR)
        {
            //console.log(res);
            callback(false, "Successfully deleted entry");
        },
        error: function (jqXHR, textStatus, errorThrown) {
            //console.log(jqXHR);
            callback(true, jqXHR.responseJSON.description);
        }
    });
};





/********************************
 *******  Helper-Functions ******
 ********************************/

// Removes Categories from everywhere used
var removeCategories = function() {
    var categories = document.getElementById("categories");
    while (categories.firstChild) {
        categories.removeChild(categories.firstChild);
    }

    var globalCategories = document.getElementById("globalCategories");
    while (globalCategories.firstChild) {
        globalCategories.removeChild(globalCategories.firstChild);
    }
};

// Adds Categories to all selects necessary
var addCategories = function() {
    removeCategories();
    categoriesArray = categoriesArray.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);} );
    var select = $entryDialogue.categories;
    for(var i = 0; i < categoriesArray.length; i++)
    {
        var option = $("<option />", {
            value: categoriesArray[i].id,
            text: categoriesArray[i].name
        });
        select.append(option).multipleSelect("refresh");
    }

    var globalSelect = $categoryDialogue.categories;
    for(var i = 0; i < categoriesArray.length; i++)
    {
        var option = $("<option />", {
            value: categoriesArray[i].id,
            text: categoriesArray[i].name
        });
        globalSelect.append(option).multipleSelect("refresh");
    }
};

// Returns true if entry-categories contain the currentCategory
var filterEntries = function (entry) {
    var entryCategories = entry.description.categories;
    return entryCategories.some(function (entryCategory) {
        return JSON.stringify(entryCategory) === JSON.stringify(currentCategory);
    });
};

// Clears the GlobalCategoriesSelect
var clearGlobalSelect = function () {
    $categoryDialogue.categories.multipleSelect('uncheckAll');
};

Array.prototype.indexOfEntry = function (value) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i].description.id === value) return i;
    }
    return -1;
};

Array.prototype.indexOfCategory = function (value) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i].id === value) return i;
    }
    return -1;
};

$(document).ready(function(){
    console.log("document ready");

    /*
        var title = document.getElementById('title');
        var location = document.getElementById("location");
        var organizer = document.getElementById("organizer");
        var timeStart = document.getElementById("timeStart");
        var timeEnd = document.getElementById("timeEnd");
        var dateStart = document.getElementById("dateStart");
        var dateEnd = document.getElementById("dateEnd");
        var status = document.getElementById("status");
        var allday = document.getElementById("allday");
        var webpage = document.getElementById("webpage");
    */

    $('#timeStart').timepicker({
        'scrollDefault': 'now',
        'timeFormat': 'H:i',
        'step': 5
    });
    $('#timeEnd').timepicker({
        'scrollDefault': 'now',
        'timeFormat': 'H:i',
        'step': 5
    });


    $entryDialogue.categories.multipleSelect({
        width: '90%',
        maxHeight: 114,
        filter: true,
        'allSelected': false
    });

    $entryDialogue.status.multipleSelect({
        width: '90%',
        filter: false,
        'allSelected': false,
        single: true
    });

    $categoryDialogue.categories.multipleSelect({
        width: '100%',
        'allSelected': false,
        keepOpen: true,
        onClick: function(view) {
            console.log(view);
            if(view) {
                $categoryDialogue.categories.multipleSelect('setSelects', [parseInt(view.value)]);
                var selected = view.value;
                currentCategory = categoriesArray.find(function (cat) {
                    console.log(cat.id + " and " + selected);
                    return cat.id == selected;
                });
                console.log(selected);
                console.log(categoriesArray);
                console.log(currentCategory);


                var filtered = eventsArray.filter(filterEntries);
                filteredEntries = filtered;

                var list_html = "";
                if (filtered.length === 0) {
                    list_html += "<p class='noEntries'>There are no entries in this category</p>";
                } else {
                    filtered = filtered.sort(function(a,b){
                        // Turn your strings into dates, and then subtract them
                        // to get a value that is either negative, positive, or zero.
                        return new Date(a.start) - new Date(b.start);
                    });
                    for (var i = 0; i < filtered.length; i++) {
                        list_html += "<div class='eventLi'>" +
                            "<p class='eventStart'>" + moment(filtered[i].start).format("LLL") + "</p>" +
                            "<p class='eventTitle'>" + filtered[i].title + "</p>" + "</div>";
                    }
                }
                $("#accordion").html(list_html);
            }
        },
        onUncheckAll: function () {
            var button = document.getElementById("addCategoryButton");
            button.onclick = addCategory;
            button.textContent = "Add Category";
            $("#accordion").html("<div><p>Please select a category, so you can see the matching events</p></div>");
            $categoryDialogue.name.val('');
        },
        filter: true,
        single: false,
        selectAll: false,
        isOpen: true
    });

    document.getElementById('uploadButton').onclick = function() {
        document.getElementById('imagedata').click();
    };


    $('#userID').keyup(function () {
        if ($(this).val() == '') {
            //Check to see if there is any text entered
            // If there is no text within the input then disable the button
            $('.enableOnInput').prop('disabled', true);
        } else {
            //If there is text in the input, then enable the button
            $('.enableOnInput').prop('disabled', false);
        }
    });

    $('#calendar').fullCalendar('option', 'height', "parent");

    alert.alert("info", null, "Welcome, please type in your account-number to access your personal calendar.")


    $(document).on({
        ajaxStart: function() { console.log("loading af"); $('body').addClass('loading');    },
        ajaxStop: function() { $('body').removeClass('loading'); }
    });

});
