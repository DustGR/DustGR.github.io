// from data.js
var tableData = data;

// YOUR CODE HERE!
//An object to store the filter settings
var filter = {
    datetime : "none",
    city : "none",
    state : "none",
    country : "none",
    shape: "none",
}

//An object to store what items go in each dropdown menu
var menuItems = { 
    city : [],
    state : [],
    country : [],
    shape : []
}

// ------ Dropdowns ------ //

//Fills menuItems with unique entries from data
data.forEach(encounter => {
    Object.keys(menuItems).forEach(k=>{ //iterate through each category (city, state, country, shape)
        if (!(menuItems[k].includes(encounter[k]))) {
            menuItems[k].push(encounter[k]);  //push entries that aren't already in the menu
        }
    })
})
//menuItems prettying
Object.values(menuItems).forEach(v=> v.sort())  //sorts each set of menu items alphabetically
Object.keys(menuItems).forEach(k=>{
    if (k === 'state' || k === 'country') { //States and countries are capitalized
        menuItems[k] = menuItems[k].map(newVal => newVal.toUpperCase())
    }
    else { //Cities, Countries get first letter capitalized
        menuItems[k] = menuItems[k].map(newVal => (
        newVal.split(" ").map(word=> 
            (word.slice(0,1).toUpperCase() + word.slice(1))) //capitalizes the first letter
            .join(" ")
            //Does not work when the word starts with punctuation
        ))
    }
})
//Note that we will need to .toLowerCase everything when we use the .filter() later

// @@TODO: make this into a function and rework the filter into a new country-state-city hierarchy
//Populate dropdowns
Object.entries(menuItems).forEach(k=> { //Runs for each key (city, state, country, shape)
    var currentMenu = d3.select("#" + k[0] + "-menu"); //Selects the dropdown for the current menu
    k[1].forEach(item=> { //within the current key/filter category, appends a list item for each value
        currentMenu.append("li").attr("class", k[0] + '-select').attr("id",k[0] + "-" + item).append("a").text(item) //Adds new list item with id 
    })
})

//Function for updating dropdown menu button text with current filter settings
function updateButtons() {
    Object.entries(filter).forEach(entry => {
        //I'm not sure if declaring variables for each of these is more efficient, but it's more readable
        let key = entry[0];  
        let value = entry[1];
        let currentButton = d3.select("#"+key+"-button-text");
        if (value === "none") {
            value = key.slice(0,1).toUpperCase() + key.slice(1);
            }
        currentButton.text(value);
        }
    )
}

// Selecting a dropdown item populates the filter
d3.selectAll(".dropdown-menu>li").on("click", function() {
    let selection = d3.select(this).attr("id").split("-")[1];
    let category = d3.select(this).attr("id").split("-")[0];
    filter[category] = selection;
    updateButtons();
})

// Prevent reloading the page when form items are used
d3.select("#filter-form").on("submit", function() {
    d3.event.preventDefault(); 
    if (d3.select("#date-text").property("value") == ""){
        filter['datetime'] = "none";
    }
    }
)

//Update filter when date field is changed
d3.select("#date-text").on("change", function() {
    filter['datetime'] = d3.select(this).property("value")
    if (d3.select("#date-text").property("value") == ""){
        filter['datetime'] = "none";
    }
    }
);



// ------ Filter UI visibility toggling ------ //

//Function for toggling menu visibility by toggling CSS class on <li> tags for each form item
function toggleVis(elemName) {
    let elem = d3.select(elemName)
    let classes = elem.attr("class"); //Retrieve the class list for the element
    if (classes.search("invis") >= 0) { // If there's an invis class present,
        classes = classes.replace(" invis", ""); //takes the invis class out of the class list
        elem.attr("class", classes);
    }
    else {  //If there's no invis class on the class list,
        elem.attr("class", classes + " invis"); //adds the invis class to the class list
    }
}

d3.selectAll(".toggler").on("click", function() {//causes buttons to toggle filter option visibility
    //transforms #name-toggle to #name.sort - so each button affects the correct ID
    toggleVis("#" + d3.select(this).attr("id").replace("-toggle","-sort"));
})


// ------ Filter Function ------ //
function checkFilters(encounter) {
    let result = true
    Object.entries(filter).forEach(f=>{
        let fKey = f[0].toLowerCase();
        let fValue = f[1].toLowerCase();

        //For each key in filter, if a value in the data doesn't match and the filter 
        //isn't none, return false.
        if ((fValue !== "none") && (encounter[fKey] !== fValue)) {
            result = false
        }
    })
    return result;
}


// ------ Populate Table ------ //
//Function to populate table
function populateTable() {
    var table = d3.select("#ufo-table");
    d3.selectAll(".table-body").remove() //clears the table body before repopulating
    let filterData = data.filter(checkFilters);
    filterData.forEach(encounter =>{
        var row = table.append("tr").attr("class", "table-body");
        Object.values(encounter).forEach(dat => {
            row.append("td").html(dat)
        })
    })
}
//Re-populate the table when the filter table function gets pushed
d3.select("#filter-btn").on("click", c=>{
    populateTable()}
)

//Populate the table when the page loads
populateTable() 
