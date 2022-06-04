const State = {
    testsType: 'All',
    currTestIndex: 0,
    currSection: 0
}
let data

function selectedType(e) {
    makeBtnActive(e , "type-btn")
    State.testsType = e.target.dataset.type
    renderTabs()
    // renderInfo()
}

function selectedDate(e) {
    makeBtnActive(e , "date-btn")
    State.currTestIndex = e.target.dataset.index
    renderContent()
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

function renderContent() {
    let test = getCurrentTest()
    renderInfo(test)
    if (State.currSection ==0 && test.type == 'US') renderGraphs(test)
    else renderScans()
}

function renderScans() {
    let visualsElm = document.querySelector('.visuals')
    visualsElm.innerHTML = ''
}

function renderGraphs(test) {
    let visualsElm = document.querySelector('.content .visuals')
    visualsElm.innerHTML = ''
    let sides = ["left", "right"]
    console.log(test.findings);
    sides.forEach(side=>{
        let findings = test.findings.filter(finding => finding.side == side)
        if (!findings || findings.length == 0) {
            console.log("no findingnd");
            let radius = 155
            let svgElm = document.createElementNS('http://www.w3.org/2000/svg' ,'svg')
            svgElm.setAttributeNS(null, 'width', 320);
            svgElm.setAttributeNS(null, 'height', 320);
            let defsElm = document.createElementNS('http://www.w3.org/2000/svg' ,'defs')
            let circleElm1 = document.createElementNS('http://www.w3.org/2000/svg' ,'circle')
            circleElm1.setAttributeNS(null, 'cx', radius);
            circleElm1.setAttributeNS(null, 'cy', radius);
            circleElm1.setAttributeNS(null, 'r', radius);
            circleElm1.setAttributeNS(null, 'fill', 'transparent');
            circleElm1.setAttributeNS(null, 'stroke', 'white');
            circleElm1.setAttributeNS(null, 'stroke-dasharray', '4 4');
            let circleElm2 = circleElm1.cloneNode()
            circleElm2.setAttributeNS(null, 'fill', 'none');
            circleElm2.setAttributeNS(null, 'r', radius*2/3);
            let circleElm3 = circleElm2.cloneNode()
            circleElm3.setAttributeNS(null, 'r', radius/3);
            svgElm.append(circleElm1)
            svgElm.append(circleElm2)
            svgElm.append(circleElm3)
            
            visualsElm.appendChild(svgElm)
        } else {
            let radius = 155
            let svgElm = document.createElementNS('http://www.w3.org/2000/svg' ,'svg')
            svgElm.setAttributeNS(null, 'width', 320);
            svgElm.setAttributeNS(null, 'height', 320);
            let defsElm = document.createElementNS('http://www.w3.org/2000/svg' ,'defs')
            defsElm.innerHTML = `<pattern id='stripes-pattern' patternUnits='userSpaceOnUse' width='20' height='40' patternTransform='scale(1) rotate(0)'>
                        <rect x='0' y='0' width='100%' height='100%' fill='#00aeef'/>
                        <path d='M0 5h20z' stroke-width='1' stroke='#fff' fill='none'/>
                        <path d='M0 15h20z' stroke-width='1' stroke='#fff' fill='none'/>
                        <path d='M0 25h20z' stroke-width='1' stroke='#fff' fill='none'/>
                        <path d='M0 35h20z' stroke-width='1' stroke='#fff' fill='none'/>
                    </pattern>
                    <pattern id='dots-pattern' patternUnits='userSpaceOnUse' width='24' height='24' patternTransform='scale(1) rotate(0)'>
                        <rect x='0' y='0' width='100%' height='100%' fill='#00aeef'/>
                        <circle cx="8" cy="8" r="2" fill='#fff'/>
                        <circle cx="20" cy="20" r="2" fill='#fff'/>
                    </pattern>`
            svgElm.appendChild(defsElm)
            let circleElm1 = document.createElementNS('http://www.w3.org/2000/svg' ,'circle')
            circleElm1.setAttributeNS(null, 'cx', radius);
            circleElm1.setAttributeNS(null, 'cy', radius);
            circleElm1.setAttributeNS(null, 'r', radius);
            circleElm1.setAttributeNS(null, 'fill', 'transparent');
            circleElm1.setAttributeNS(null, 'stroke', 'white');
            let circleElm2 = circleElm1.cloneNode()
            circleElm2.setAttributeNS(null, 'fill', 'none');
            circleElm2.setAttributeNS(null, 'r', radius*2/3);
            let circleElm3 = circleElm2.cloneNode()
            circleElm3.setAttributeNS(null, 'r', radius/3);
            svgElm.append(circleElm1)
            for (let i=0; i<findings.length; i++) {
                let area = findings[i]
                let chunckElm = document.createElementNS("http://www.w3.org/2000/svg", "path")
                let d = pathFromObject(area, radius)
                chunckElm.setAttributeNS(null, "d", d);
                chunckElm.setAttributeNS(null, 'stroke', 'white');
                let patternFillUrl
                if (area.type == 'cyst') patternFillUrl = 'url(#dots-pattern)'
                else if (area.type == 'lump') patternFillUrl = 'url(#stripes-pattern)'
                else patternFillUrl = '#56a4da'
                chunckElm.setAttributeNS(null, 'fill', patternFillUrl);
                svgElm.append(chunckElm)
            }
            let d = ''
            // for (let i=0; i<6; i++) {
            //     let a1 = (i+0.5)*(2*Math.PI/12)
            //     let a2 = (i+6.5)*(2*Math.PI/12)
            //     let r = (radius/10)
            //     let x1 = Math.round(Math.sin(a1)*r)*10+radius
            //     let y1 = Math.round(Math.cos(a1)*r)*10+radius
            //     let x2 = Math.round(Math.sin(a2)*r)*10+radius
            //     let y2 = Math.round(Math.cos(a2)*r)*10+radius
            //     d += `M ${x1} ${y1} L ${x2} ${y2} `
            // }
            let slicesLinesElm = document.createElementNS("http://www.w3.org/2000/svg", "path")
            slicesLinesElm.setAttributeNS(null, "d", d);
            slicesLinesElm.setAttributeNS(null, 'stroke', 'white');
            svgElm.append(slicesLinesElm)
            svgElm.append(circleElm2)
            svgElm.append(circleElm3)
            
            visualsElm.appendChild(svgElm)
        }
    })
}

function pathFromObject(obj, radius) {
	let str = ''
	let a1 = (obj.hour-3.5)*(2*Math.PI/12)

	const cos = Math.cos;
	const sin = Math.sin;
	const π = Math.PI;
	let cx = radius
	let cy = radius
	let rx1 = radius
	let ry1 = radius
	let t1 = a1
  let φ = 0
	let Δ = (2*π/12)
	const f_matrix_times = (( [[a,b], [c,d]], [x,y]) => [ a * x + b * y, c * x + d * y]);
	const f_rotate_matrix = (x => [[cos(x),-sin(x)], [sin(x), cos(x)]]);
	const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);
	const rotMatrix = f_rotate_matrix(φ);
	const [sX1, sY1] = ( f_vec_add ( f_matrix_times ( rotMatrix, [rx1 * cos(t1), ry1 * sin(t1)] ), [cx,cy] ) );
	const [eX1, eY1] = ( f_vec_add ( f_matrix_times ( rotMatrix, [rx1 * cos(t1+Δ), ry1 * sin(t1+Δ)] ), [cx,cy] ) );
	const fA = ( (  Δ > π ) ? 1 : 0 );
	const fS = 1 // ( (  Δ > 0 ) ? 1 : 0 );
	const fS2 = ( (  Δ > 0 ) ? 0 : 1 );
	let outerArc = "M " + sX1 + " " + sY1 + " A " + [ rx1 , ry1 , φ / (2*π) *360, fA, fS, eX1, eY1 ].join(" ")
    let line = "L " + cx + " " + cy
    str = outerArc + line + " Z"
	return str
}


function renderInfo(test) {
    let infoElm = document.querySelector('.content .info')
    infoElm.innerHTML = ''
    let testHeaderText = typeToHeaderTextMap[test.type] + ' ' + test.date
    createAppendTextElm('h3', testHeaderText, infoElm)
    createAppendTextElm('h1', test.title, infoElm)
    createAppendTextElm('h2', test.subtitle, infoElm)
    createAppendTextElm('h1', 'הנחיות', infoElm)
    createAppendTextElm('h2', test.instructions, infoElm)
}

function renderTabs() {
    let dateTabsWrapperElm = document.querySelector(".date-btns-wrapper")
    dateTabsWrapperElm.innerHTML = ''
    let tests = getFilteredTests()
    tests.forEach((test, i)=> {
        // console.log(i + ": " + test);
        let newTabElm = document.createElement("button")
        newTabElm.onclick = selectedDate
        newTabElm.dataset.index = test.index
        newTabElm.classList.add("date-btn")
        if (test.index == State.currTestIndex) newTabElm.classList.add("active")
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
    renderTabs(data)
    renderContent()
}

function fetchData() {
  return fetch('data.json')
  .then(response => response.json())
}

init()