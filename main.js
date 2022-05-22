function selectedType(e) {
    let selectedTypeBtn = e.target
    let typeButtons = document.querySelectorAll("button.type-btn")
    typeButtons.forEach(btn => btn.classList.remove("active"))
    selectedTypeBtn.classList.add("active")
}

function selectedDate(e) {
    let selectedTypeBtn = e.target
    let typeButtons = document.querySelectorAll("button.date-btn")
    typeButtons.forEach(btn => btn.classList.remove("active"))
    selectedTypeBtn.classList.add("active")
}

function shiftDateBtns(dir) {
    console.log(dir);
    
}