/*
    Controller for Calendar and Dialogues + Validation
 */
window.$entryDialogue = {};
window.$categoryDialogue = {};
$entryDialogue.emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
$entryDialogue.title = $( "#title" );
$entryDialogue.location = $( "#location" );
$entryDialogue.organizer = $( "#organizer" );
$entryDialogue.dateStart = $( "#dateStart" );
$entryDialogue.dateEnd = $( "#dateEnd" );
$entryDialogue.timeStart = $( "#timeStart" );
$entryDialogue.timeEnd = $( "#timeEnd" );
$entryDialogue.status = $( "#status" );
$entryDialogue.allday = $( "#allday" );
$entryDialogue.webpage = $( "#webpage" );
$entryDialogue.imageurl = $( "#imageurl" );
$entryDialogue.imagedata = $( "#imagedata" );
$entryDialogue.categories = $( "#categories" );
$entryDialogue.dialogTitle = $( "#ui-id-1" );
$entryDialogue.imagelink = $( "#imagelink" );
$entryDialogue.form = $( "#entryForm" );
$entryDialogue.extra = $( "#extra" );

$entryDialogue.addButton = $( "#addEntryButton" );
$entryDialogue.editButton = $( "#editEntryButton" );
$entryDialogue.deleteButton = $( "#deleteEntryButton" );
$entryDialogue.cancelButton = $( "#cancelEntryButton" );

$categoryDialogue.categories = $( "#globalCategories" );
$categoryDialogue.name = $( "#categoryName" );
var emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    allFields = $( [] ).add($entryDialogue.title).add($entryDialogue.location).add($entryDialogue.organizer).add($entryDialogue.dateStart).add($entryDialogue.dateEnd).add($entryDialogue.timeStart).add($entryDialogue.timeEnd).add($entryDialogue.status).add($entryDialogue.allday).add($entryDialogue.webpage).add($entryDialogue.imageurl).add($entryDialogue.categories).add($entryDialogue.imagedata).add($entryDialogue.extra);



// Initializes the calendar (fetches categories and Entries
var initializeCalendar = function() {
    calendarInitialized = false;
    userID = $("#userID").val();
    $calendar.fullCalendar("removeEvents");
    fetchCategories(function(error, data){
        if (error) {
            alert.alert("error", null, data);
            return;
        } else {
            alert.alert("success", null, data);
            fetchEntries(function(error, data) {
                if (error) alert.alert("error", null, data);
                else {
                    alert.alert("success", null, "Calendar successfully initialized");
                    calendarInitialized = true;
                }
            });
        }
    });
};




/*
    Calendar Functions
 */
var $calendar = $("#calendar").fullCalendar({
    theme: true,
    themeSystem: 'bootstrap4',
    // emphasizes business hours
    businessHours: false,
    // event dragging & resizing
    editable: false,
    selectable: true,
    select: function(start, end, jsEvent, view) {
        if (calendarInitialized) openDialogue(true, {"start": start, "end": end});
        else alert.alert("info", null, "Initialize the calendar first, by submitting your account-number");
    }, // End select
    eventClick: function (event, jsEvent, view) {
        if (calendarInitialized) openDialogue(false, event);
        else alert.alert("info", null, "Initialize the calendar first, by submitting your account-number");
    },
    // header
    header: {
        left: 'prevYear,nextYear',
        center: 'title',
        right: 'month,agendaWeek,agendaDay today prev,next listWeek'
    },
    height: "parent",
    //aspectRatio: 2
    //events: events_array
});


// Open the Calendar Dialogue
var openDialogue = function (newEntry, event) {
    closeDialogue(true);

    if(newEntry) {
        $entryDialogue.addButton.show();

        $entryDialogue.dateStart.val(event.start.format("Y-MM-DD"));
        $entryDialogue.dateEnd.val(event.end.subtract(1, 'days').format("Y-MM-DD"));
        $entryDialogue.timeStart.timepicker('setTime', new Date());
        $entryDialogue.timeEnd.timepicker('setTime', new Date());
    } else {
        $entryDialogue.editButton.show();
        $entryDialogue.deleteButton.show();

        console.log(event);
        currentEvent = event;
        $entryDialogue.title.val(event.title);

        $entryDialogue.dateStart.val(event.start.format("Y-MM-DD"));
        if (event.end) $entryDialogue.dateEnd.val(event.end.format("Y-MM-DD"));
        else $entryDialogue.dateEnd.val(event.start.format("Y-MM-DD"));

        $entryDialogue.timeStart.timepicker('setTime', new Date(event.start));
        if (event.end) $entryDialogue.timeEnd.timepicker('setTime', new Date(event.end));
        else $entryDialogue.timeEnd.timepicker('setTime', new Date(event.start));

        var alldayCheck;
        if(event.allDay) alldayCheck = true;
        else alldayCheck = false;
        $entryDialogue.allday.checked = alldayCheck;

        if (event.description.location  != null)    $entryDialogue.location.val(event.description.location);
        if (event.description.organizer != null)    $entryDialogue.organizer.val(event.description.organizer);
        if (event.description.status    != null)    $entryDialogue.status.val(event.description.status.toLowerCase());
        if (event.description.webpage   != null)    $entryDialogue.webpage.val(event.description.webpage);
        if (event.description.extra     != null)    $entryDialogue.extra.val(event.description.extra);
        if (event.description.imageurl  != null)    {
            $entryDialogue.imageurl.attr('src', event.description.imageurl);
            $entryDialogue.imagelink.attr("href", event.description.imageurl);
            $entryDialogue.imagelink.attr("data-lightbox", "image-1");
        }
        if (event.description.categories  != null)  {
            var categoriesSelect = [];
            var categoriesEvent = event.description.categories;
            categoriesEvent.forEach(function (category) {
                categoriesSelect.push(category.id);
            });
            $entryDialogue.categories.multipleSelect('setSelects', categoriesSelect);
        }
    }



    if(!dialogueOpen) $("#dialog-TD").show("slow");
    else $("#dialog-TD").effect( "highlight", {color: "rgb(200, 218, 244)"} , 1100 );
    dialogueOpen = true;
    $entryDialogue.title.focus();
};

// Close the Calendar Dialogue
var closeDialogue = function (justReset) {
    allFields.removeClass( "ui-state-error" );
    if(!justReset) {
        $("#dialog-TD").hide("slow");
        dialogueOpen = false;
        $calendar.fullCalendar("unselect");
    }

    $entryDialogue.addButton.hide();
    $entryDialogue.editButton.hide();
    $entryDialogue.deleteButton.hide();

    $entryDialogue.form[0].reset();

    $entryDialogue.location.val("");
    $entryDialogue.organizer.val("");
    $entryDialogue.webpage.val("");
    $entryDialogue.imagedata.val("");
    $entryDialogue.extra.val("");
    $entryDialogue.imageurl.removeAttr("src");
    $entryDialogue.imagelink.removeAttr("href");
    $entryDialogue.imagelink.removeAttr("data-lightbox");

    $entryDialogue.status.multipleSelect('setSelects', ["free"]);
    $entryDialogue.categories.multipleSelect('uncheckAll');
};

// Open the categories dialogue
var openCategoriesModal = function() {
    if(calendarInitialized) {
        fetchCategories(function (error, data) {
            if (error) alert.alert("error", null, data);
            else {
                clearGlobalSelect();
                $categoryDialogue.name.val('');
                $('#categoriesModal').modal();
            }
        });
    }
    else alert.alert("info", null, "Initialize the calendar first, by submitting your account-number");
};






/*
    Validation Functions
 */
function checkLength( field, name, min, max ) {
    if ( field.val().trim().length > max || field.val().length < min ) {
        field.addClass( "ui-state-error" );
        alert.alert("info", null, "Length of " + name + " must be between " +
            min + " and " + max + "." );
        return false;
    } else {
        return true;
    }
}


function checkRegexp( field, regexp, message ) {
    if ( !( regexp.test( field.val() ) ) ) {
        field.addClass( "ui-state-error" );
        alert.alert("info", null, message );
        return false;
    } else {
        return true;
    }
}

function checkDate( type, field, mom) {
    if ( mom.isValid() ) {
        return true;
    } else {
        console.log(field);
        field.addClass( "ui-state-error" );
        if (type === 1) alert.alert( "info", null, "That is not a valid date, please check your input" );
        if (type === 2) alert.alert( "info", null, "That is not a valid time, please check your input" );
        return false;
    }
}

function checkSelect( type, value, array, field) {
    if( type === 1 ) {
        if ( array.some(function (element) {
                return element === value;
            })){
            return true;
        } else {
            field.addClass( "ui-state-error" );
            alert.alert( "info", null, "Status must be a valid element from the dropdown" );
            return false;
        }
    }
    if ( type === 2) {
        var valid = true;
        $entryDialogue.categories.multipleSelect('getSelects').forEach(function (val) {
            valid = valid && categoriesArray.some(function (element) {
                    return parseInt(val) === element.id;
            })
        });
        if(valid) return true;
        else {
            field.addClass( "ui-state-error" );
            alert.alert( "info", null, "Catgories must be valid elements from the dropdown" );
            return false;
        }
    }
}


var validateDialogue = function () {

    var valid = true;
    allFields.removeClass( "ui-state-error" );

    valid = valid && checkDate ( 1, $entryDialogue.dateStart, moment($entryDialogue.dateStart[0].valueAsDate));
    valid = valid && checkDate ( 1, $entryDialogue.dateEnd, moment($entryDialogue.dateEnd[0].valueAsDate));
    valid = valid && checkDate ( 2, $entryDialogue.timeStart, moment($entryDialogue.timeStart.timepicker("getTime")));
    valid = valid && checkDate ( 2, $entryDialogue.timeEnd, moment($entryDialogue.timeEnd.timepicker("getTime")));

    valid = valid && checkLength( $entryDialogue.title, "title", 2, 50 );
    valid = valid && checkLength( $entryDialogue.location, "location", 0, 50 );
    valid = valid && checkLength( $entryDialogue.organizer, "organizer", 3, 50 );
    valid = valid && checkSelect( 1, $entryDialogue.status.multipleSelect('getSelects')[0], statusArray, $entryDialogue.status);
    valid = valid && checkSelect( 2, $entryDialogue.categories.multipleSelect('getSelects'), categoriesArray, $entryDialogue.categories);

    valid = valid && checkLength( $entryDialogue.webpage, "webpage", 0, 100 );

    valid = valid && checkRegexp( $entryDialogue.title, /^[a-z0-9]([0-9a-z_\s])+$/i, "Title may contain letters, numbers, spaces and underscores and must begin with a letter or number." );
    valid = valid && checkRegexp( $entryDialogue.organizer, emailRegex, "Organizer has to be an e-mail, eg. larry@lehre.dhbw-stuttgart.de" );
    valid = valid && checkRegexp( $entryDialogue.location, /^[a-z0-9]([0-9a-z_,\s])+$/i, "Location doesn't allow special characters");

    if ( valid ) return true;
    else return false;
};





/*
    Data Preparation for main.js
 */

// Onclick Add-Button, prepares the entry for the backend format and sends it over to POST-Entry
$entryDialogue.addEntry = function() {
    if ( validateDialogue() ) {
        var startDate = moment($entryDialogue.dateStart[0].valueAsDate);
        var endDate = moment($entryDialogue.dateEnd[0].valueAsDate);

        var starttime = moment($entryDialogue.timeStart.timepicker("getTime"));
        var endtime = moment($entryDialogue.timeEnd.timepicker("getTime"));


        if($entryDialogue.allday[0].checked) {
            // noinspection JSAnnotator
            starttime.minute(00);
            // noinspection JSAnnotator
            starttime.hour(01);

            endtime.hour(23);
            endtime.minute(59);
        }
        startDate = startDate.set({
            'hour' : starttime.get('hour'),
            'minute'  : starttime.get('minute'),
            'seconds' : 0,
            'milliseconds' : 0
        });

        endDate = endDate.set({
            'hour' : endtime.get('hour'),
            'minute'  : endtime.get('minute'),
            'seconds' : 0,
            'milliseconds' : 0
        });
        startDate.hour(startDate.hour()-1);
        endDate.hour(endDate.hour()-1);

        $entryDialogue.categories.multipleSelect('getSelects');
        var status = $entryDialogue.status.multipleSelect('getSelects')[0].trim();
        var statusString = status.charAt(0).toUpperCase() + status.slice(1);

        var selectedOptions = $entryDialogue.categories.multipleSelect('getSelects');
        var selectedCategories = [];
        selectedOptions.forEach(function (option) {
            selectedCategories.push({
                'id': option,
            })
        });

        var data = {
            title: $entryDialogue.title.val().trim(),
            location: $entryDialogue.location.val().trim(),
            organizer: $entryDialogue.organizer.val().trim(),
            start: startDate.toDate(),
            end: endDate.toDate(),
            status: statusString,
            allday: $entryDialogue.allday[0].checked,
            webpage: $entryDialogue.webpage.val().trim(),
            imagedata: image,
            categories: selectedCategories,
            extra: $entryDialogue.extra.val().trim()
        };

        postEntry(data, function (error, response) {
            if (error) alert.alert("error", null, response);
            else {
                alert.alert("success", null, "Entry successfully added");
                closeDialogue(false);
            }
        });
    }
};


// Onclick Change-Button, prepares the entry for the backend format and sends it over to PUT-Entry
$entryDialogue.changeEntry = function () {
    if (  validateDialogue()  ) {
        var startDate = moment($entryDialogue.dateStart[0].valueAsDate);
        var endDate = moment($entryDialogue.dateEnd[0].valueAsDate);

        var starttime = moment($entryDialogue.timeStart.timepicker("getTime"));
        var endtime = moment($entryDialogue.timeEnd.timepicker("getTime"));

        if($entryDialogue.allday[0].checked) {
            // noinspection JSAnnotator
            starttime.minute(00);
            // noinspection JSAnnotator
            starttime.hour(00);

            endtime.hour(23);
            endtime.minute(59);
        }
        startDate = startDate.set({
            'hour' : starttime.get('hour'),
            'minute'  : starttime.get('minute'),
            'seconds' : 0,
            'milliseconds' : 0
        });

        endDate = endDate.set({
            'hour' : endtime.get('hour'),
            'minute'  : endtime.get('minute'),
            'seconds' : 0,
            'milliseconds' : 0
        });
        startDate.hour(startDate.hour()-1);
        endDate.hour(endDate.hour()-1);

        var status = $entryDialogue.status.multipleSelect('getSelects')[0].trim();
        var statusString = status.charAt(0).toUpperCase() + status.slice(1);

        var selectedOptions = $entryDialogue.categories.multipleSelect('getSelects');
        var selectedCategories = [];
        selectedOptions.forEach(function (option) {
            selectedCategories.push({
                'id': option,
            })
        });

        var data = {
            id: currentEvent.description.id,
            title: $entryDialogue.title.val().trim(),
            location: $entryDialogue.location.val().trim(),
            organizer: $entryDialogue.organizer.val().trim(),
            start: startDate.toDate(),
            end: endDate.toDate(),
            status: statusString,
            allday: $entryDialogue.allday[0].checked,
            webpage: $entryDialogue.webpage.val().trim(),
            imagedata: image,
            categories: selectedCategories,
            extra: $entryDialogue.extra.val().trim()
        };

        putEntry(data, function (error, response) {
            if (error) alert.alert("error", null, response);
            else {
                alert.alert("success", null, "Entry successfully changed");
                closeDialogue(false);
            }
        });
    }
};


// Onclick Delete-Button, calls DELETE-Entry
$entryDialogue.removeEntry = function () {
    deleteEntry(function (error, response) {
        if (error) alert.alert("error", null, response);
        else {
            alert.alert("success", null, "deleted Entry with id: " + currentEvent.description.id);
            closeDialogue(false);
        }
    });
};

// Onclick Add-Category-Button, calls POST-Category
var addCategory = function () {
    var categoryName = $("#categoryName").val().trim();
    if(categoryName && categoryName.length !== 0 && categoryName.length < 30) {
        var category = {  "name": categoryName };
        postCategory(category, function (error, data) {
            if (error) alert.alert("error", null, "Error adding Category, try again");
            else {
                fetchCategories(function (error, data) {
                    if (error) {
                        alert.alert("error", null, data);
                        return;
                    } else {
                        alert.alert("success", null, data);
                        clearGlobalSelect();
                    }
                });
            }
        });
    } else alert.alert("error", null, "Category can't be empty or longer than 30 characters, try again please!");
};

// Onclick Delete-Category-Button, calls DELETE-Category and catches last category
var removeCategory = function () {
    var success = true;
    var index = 0;
    if (categoriesArray.length !== 1) {
        if (filteredEntries.length > 0) {
            filteredEntries.forEach(function (entry) {
                index++;
                $.ajax({
                    url : "http://dhbw.ramonbisswanger.de/calendar/" + userID + "/categories/" + currentCategory.id + "/" + entry.description.id,
                    contentType: "application/json",
                    type: "DELETE",
                    processData: false,
                    success: function(res, textStatus, jqXHR)
                    {
                        getEntry(entry.description.id, function (error, event) {
                            if (error) {
                                alert.alert("error", null, data);
                                success = success && false;
                            }
                            else {
                                entry.description.categories = event.description.categories;
                                $calendar.fullCalendar("updateEvent", entry, true);
                                success = success && true;
                            }
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert.alert("error", null, jqXHR.responseJSON.description);
                        success = success && false;
                    }
                });
                if (index === filteredEntries.length) {
                    if (success) {
                        deleteCategory(function (error, data) {
                            if (error) alert.alert("error", null, data);
                            else {
                                fetchCategories (function (error, dato) {
                                    if (error) {
                                        alert.alert("error", null, "Please refresh the page");
                                    } else {
                                        clearGlobalSelect();
                                        alert.alert("success", null, data);
                                    }
                                });
                            }
                        })
                    }
                }
            });
        } else {
            deleteCategory(function (error, data) {
                if (error) alert.alert("error", null, data);
                else {
                    fetchCategories (function (error, dato) {
                        if (error) {
                            alert.alert("error", null, "Please refresh the page");
                        } else {
                            clearGlobalSelect();
                            alert.alert("success", null, data);
                        }
                    });
                }
            })
        }
    } else alert.alert("warning", null, "You can't delete all categories, add another one first to delete this one");
};









// OnChange Image Upload, validates size and sets attributes for further usage
function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        if (input.files[0].size / 1024 <= 500) {
            reader.onload = function (e) {
                $entryDialogue.imageurl.attr('src', e.target.result);
                $entryDialogue.imagelink.attr("href", e.target.result);
                $entryDialogue.imagelink.attr("data-lightbox", "image-1");
                console.log(e.target.result);
                image = e.target.result;
            };
            reader.readAsDataURL(input.files[0]);
        } else alert.alert("info", null, "Chosen image is too big, please upload a file < 500kb");
    }
}
