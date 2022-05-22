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

function selectedSection(e) {
    let selectedSectionBtn = e.target
    let sectionButtons = document.querySelectorAll("button.section-btn")
    sectionButtons.forEach(btn => btn.classList.remove("active"))
    selectedSectionBtn.classList.add("active")
}

function shiftDateBtns(dir) {
    console.log(dir);
    let leftScrollDistance = 0
    switch (dir) {
        case "right":
            leftScrollDistance = 100
            break
        case "left":
            leftScrollDistance = -100
            break
    }
    let dateBtnsWrapperElm = document.querySelector(".date-btns-wrapper")
    dateBtnsWrapperElm.scrollBy({
        top: 0,
        left: leftScrollDistance,
        behavior: 'smooth'
    });
}

function init() {
    let dateBtnsWrapperElm = document.querySelector(".date-btns-wrapper")
    dateBtnsWrapperElm.scrollBy(-100, 0);
}

init()