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
    rerenderInfo()
}

function selectedDate(e) {
    makeBtnActive(e , "date-btn")
    State.currTestIndex = e.target.dataset.index
    rerenderInfo()
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

function getCurrentTest() {
    return data.filter(test => test.index == State.currTestIndex)[0]
}

let typeToHeaderTextMap = {
    US: 'אולטראסאונד',
    MRI: 'MRI‏',
    MAMM: 'ממוגרפיה'
}

function createAppendTextElm(type, text, parent) {
    let textElm = document.createElement(type)
    textElm.innerText = text
    parent.appendChild(textElm)
}

function rerenderInfo() {
    let test = getCurrentTest()
    let infoElm = document.querySelector('.content .info')
    infoElm.innerHTML = ''
    let testHeaderText = typeToHeaderTextMap[test.type] + ' ' + test.date
    createAppendTextElm('h3', testHeaderText, infoElm)
    createAppendTextElm('h1', test.title, infoElm)
    createAppendTextElm('h2', test.subtitle, infoElm)
    createAppendTextElm('h1', 'הנחיות', infoElm)
    createAppendTextElm('h2', test.instructions, infoElm)
}

function rerenderTabs() {
    let dateTabsWrapperElm = document.querySelector(".date-btns-wrapper")
    dateTabsWrapperElm.innerHTML = ''
    let tests = getFilteredTests()
    tests.forEach((test, i)=> {
        // console.log(i + ": " + test);
        let newTabElm = document.createElement("button")
        newTabElm.onclick = selectedDate
        newTabElm.dataset.index = test.index
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
    data.forEach((test, i) => {
        test['index'] = i
    });
    rerenderTabs(data)
}

function fetchData() {
  return fetch('data.json')
  .then(response => response.json())
}

init()