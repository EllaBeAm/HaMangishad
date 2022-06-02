const State = {
    testsType: 'All',
    currTestIndex: 0,
    currSection: 0
}
let data

function selectedType(e) {
    makeBtnActive(e , "type-btn")
    State.testsType = e.target.dataset.type
    rerenderTabs()
}

function selectedDate(e) {
    makeBtnActive(e , "date-btn")
    console.log(e.target.dataset.index);
}

function selectedSection(e) {
    makeBtnActive(e , "section-btn")
}

function makeBtnActive(e, className) {
    let selectedBtn = e.target
    let allBtnsOfType = document.querySelectorAll(`button.${className}`)
    allBtnsOfType.forEach(btn => btn.classList.remove("active"))
    selectedBtn.classList.add("active")
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

function getFilteredTests() {
    if (State.testsType == 'All') return data
    else return data.filter(test => test.type == State.testsType)
}

function rerenderTabs() {
    let dateTabsWrapperElm = document.querySelector(".date-btns-wrapper")
    dateTabsWrapperElm.innerHTML = ''
    let tests = getFilteredTests()
    console.log(tests);
    tests.forEach((test, i)=> {
        // console.log(i + ": " + test);
        let newTabElm = document.createElement("button")
        newTabElm.onclick = selectedDate
        newTabElm.dataset.index = i
        newTabElm.classList.add("date-btn")
        if (i==0) newTabElm.classList.add("active")
        let btnTitleElm = document.createElement("span")
        btnTitleElm.innerText = test.date
        newTabElm.appendChild(btnTitleElm)
        dateTabsWrapperElm.appendChild(newTabElm)
    })
}

async function init() {
    // let dateBtnsWrapperElm = document.querySelector(".date-btns-wrapper")
    // dateBtnsWrapperElm.scrollBy(-100, 0);
    data = await fetchData()
    rerenderTabs(data)
}

function fetchData() {
  return fetch('data.json')
  .then(response => response.json())
}

init()