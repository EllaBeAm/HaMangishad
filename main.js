const State = {
    testsType: 'All',
    currTestIndex: 0,
    currSection: 0,
    currSide: 'left'
}
let data

function selectedType(e) {
    if (State.testsType == e.target.dataset.type) return
    makeBtnActive(e , "button.type-btn")
    State.testsType = e.target.dataset.type
    renderTabs()
    // renderInfo()
}

function selectedDate(e) {
    if (State.currTestIndex == e.target.dataset.index) return
    makeBtnActive(e , "button.date-btn")
    State.currTestIndex = e.target.dataset.index
    renderContent()
}

function selectedSection(e) {
    if (State.currSection == e.target.dataset.index) return
    makeBtnActive(e , "button.section-btn")
    State.currSection = e.target.dataset.index
    renderContent()
}

function selectedSide(e) {
    if (State.currSide == e.target.parentElement.dataset.side) return
    makeBtnActive(e , ".info .graphs .side-wrapper button")
    State.currSide = e.target.parentElement.dataset.side
    renderContent()
}

function makeBtnActive(e, className) {
    let selectedBtn = e.target
    let allBtnsOfType = document.querySelectorAll(className)
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
    let doRenderInstructions = State.currSection==0
    renderInfo(test, doRenderInstructions)
    if (test.type == 'US') renderGraphsManager(test)
    if (State.currSection == 1 && test.type == 'US') renderScans(test)
    else if (State.currSection == 2) renderRangeSlider()
}

function renderRangeSlider() {
    let allYears = [...new Set(data.map(test=>stringToYear(test.date)).sort())]
    let infoElm = document.querySelector('.content .info')
    let yearsWrapper = document.createElement('div')
    yearsWrapper.classList.add('years-wrapper')
    let yearsTitle = document.createElement('h3')
    yearsTitle.innerText = 'שנים'
    yearsWrapper.appendChild(yearsTitle)
    let sliderOneValue = document.createElement('div')
    sliderOneValue.classList.add('slider-value')
    sliderOneValue.dataset.index=0
    sliderOneValue.innerText=0
    let sliderTwoValue = sliderOneValue.cloneNode()
    sliderTwoValue.dataset.index=1
    sliderTwoValue.innerText=1
    yearsWrapper.appendChild(sliderOneValue)
    yearsWrapper.appendChild(sliderTwoValue)
    let sliderWrapper = document.createElement('div')
    sliderWrapper.classList.add('slider-wrapper')
    let sliderTrackElm = document.createElement('div')
    sliderTrackElm.classList.add('slider-track')
    sliderWrapper.appendChild(sliderTrackElm)
    let sliderOneElm = document.createElement('input')
    sliderOneElm.type = 'range'
    sliderOneElm.min = allYears[0]
    sliderOneElm.max = allYears[allYears.length-1]
    sliderOneElm.step = 1
    sliderOneElm.value = allYears[0]
    sliderOneElm.dataset.index = 0
    sliderOneElm.oninput = sliderInput
    let sliderTwoElm = sliderOneElm.cloneNode()
    sliderTwoElm.oninput = sliderInput
    sliderTwoElm.value = allYears[allYears.length-1]
    sliderTwoElm.dataset.index = 1
    sliderWrapper.appendChild(sliderOneElm)
    sliderWrapper.appendChild(sliderTwoElm)
    yearsWrapper.appendChild(sliderWrapper)
    infoElm.appendChild(yearsWrapper)
    let legendElm = document.createElement('div')
    let keysMap = [
        {text: 'ממצא יחיד', color:'#FBB040'},
        {text: 'ממצא שחזר בשתי בדיקות', color:'#F8893D'},
        {text: 'ממצא שחזר בשלוש בדיקות', color:'#F56239'},
        {text: 'ממצא שחזר בארבע בדיקות ומעלה', color:'#F23B36'},
    ]
    legendElm.classList.add('legend')
    for (let i=0; i<4; i++) {
        let keyWrapperElm = document.createElement('div')
        keyWrapperElm.classList.add('key')
        let circleElm = document.createElement('div')
        circleElm.classList.add('circle')
        circleElm.style.backgroundColor = keysMap[i].color
        let descElm = document.createElement('p')
        descElm.classList.add('desc')
        descElm.innerText = keysMap[i].text
        keyWrapperElm.appendChild(circleElm)
        keyWrapperElm.appendChild(descElm)
        legendElm.appendChild(keyWrapperElm)
    }
    infoElm.appendChild(legendElm)
    styleSlider();
}

function sliderInput(e) {
    let thisSlider = e.target
    let bothSliders = document.querySelectorAll('.slider-wrapper input')
    let otherSlider = Array.from(bothSliders).filter(elm => elm!=thisSlider)[0]
    let biggerSlider = Array.from(bothSliders).filter(elm => elm.dataset.index==1)[0]
    let smallerSlider = Array.from(bothSliders).filter(elm => elm.dataset.index==0)[0]
    let edgeValue
    if (thisSlider==smallerSlider) {
        edgeValue = parseInt(otherSlider.value) - parseInt(thisSlider.step)
    } else {
        edgeValue = parseInt(otherSlider.value) + parseInt(thisSlider.step)
    }
    if(parseInt(biggerSlider.value) - parseInt(smallerSlider.value) <= parseInt(thisSlider.step)){
        thisSlider.value = edgeValue
    }
    styleSlider(smallerSlider, biggerSlider);
    renderGraphsManager()
}

function styleSlider(smallerSlider, biggerSlider){
    if (!smallerSlider) {
        let bothSliders = document.querySelectorAll('.slider-wrapper input')
        biggerSlider = Array.from(bothSliders).filter(elm => elm.dataset.index==1)[0]
        smallerSlider = Array.from(bothSliders).filter(elm => elm.dataset.index==0)[0]
    }
    let sliderTrack = document.querySelector('.slider-track')
    percent1 = ((smallerSlider.value-smallerSlider.min) / (smallerSlider.max-smallerSlider.min)) * 100;
    percent2 = ((biggerSlider.value-biggerSlider.min) / (biggerSlider.max-biggerSlider.min)) * 100;
    sliderTrack.style.background = `linear-gradient(to right, transparent ${percent1}% , #fff ${percent1}% , #fff ${percent2}%, transparent ${percent2}%)`;
    let bothValuesElms = document.querySelectorAll('.slider-value')
    let smallerValueElm = Array.from(bothValuesElms).filter(elm => elm.dataset.index==0)[0]
    let biggerValueElm = Array.from(bothValuesElms).filter(elm => elm.dataset.index==1)[0]
    smallerValueElm.innerText = smallerSlider.value
    let sliderWidth = smallerSlider.parentElement.getBoundingClientRect().width
    let smallerValueWidth = smallerValueElm.getBoundingClientRect().width
    smallerValueElm.style.left = ((percent1/100)*(sliderWidth-22)-smallerValueWidth/2+12) + 'px'
    biggerValueElm.innerText = biggerSlider.value
    let biggerValueWidth = biggerValueElm.getBoundingClientRect().width
    biggerValueElm.style.left = ((percent2/100)*(sliderWidth-22)-biggerValueWidth/2+12) + 'px'
}

function renderScans(test) {
    let visualsElm = document.querySelector('.visuals')
    visualsElm.innerHTML = ''
    let scansWrapperElm = document.createElement('div')
    scansWrapperElm.classList.add('scans-wrapper')
    // let sideFindings = test.findings.filter(finding => finding.side == State.currSide)
    let sideFindings = test.findings
    let hasActive = false
    sideFindings.forEach(finding => {
        finding.scans.forEach((scan, i) => {
            let scanElm = document.createElement('img')
            scanElm.src = 'assets/findings/' + scan + '.png'
            scanElm.classList.add('scan')
            if (i == 0) {
                scanElm.classList.add('active')
                hasActive = true
            }
            scanElm.dataset.side = finding.side
            scansWrapperElm.appendChild(scanElm)
        })
    })
    test.scans.forEach((scan, i) => {
        let scanElm = document.createElement('img')
        scanElm.src = 'assets/findings/' + scan + '.png'
        scanElm.classList.add('scan')
        if (i == 0 && !hasActive) {
            scanElm.classList.add('active')
            hasActive = true
        }
        scansWrapperElm.appendChild(scanElm)
    })
    visualsElm.appendChild(scansWrapperElm)
}

function renderGraphsManager() {
    let test = getCurrentTest()
    if (State.currSection == 0) {
        let parent = document.querySelector('.content .visuals')
        renderGraphs(test, 311, 155, parent)
    }
    else if (State.currSection == 1) {
        let parent = document.querySelector('.content .info .graphs')
        renderGraphs(test, 101, 50, parent)
        let svgElms = Array.from(parent.querySelectorAll("svg"))
        svgElms.forEach((elm, i) => {
            let side = i==0? 'left':'right'
            let wrapper = document.createElement('div')
            wrapper.classList.add(`side-wrapper`)
            wrapper.dataset['side'] = side
            wrapper.appendChild(elm)
            let btnElm = document.createElement('button')
            if (State.currSide == side) btnElm.classList.add('active')
            btnElm.innerText = side=='right'? 'ימין':'שמאל'
            btnElm.onclick = selectedSide
            wrapper.appendChild(btnElm)
            parent.appendChild(wrapper)
        })
    } else {
        let parent = document.querySelector('.content .visuals')
        let timeMap = getTimeMap()
        console.log(timeMap);
        renderTimeGraphs(timeMap, 311, 155, parent)
    }
}

function getTimeMap() {
    let res = {
        left: {},
        right: {}
    }
    let minYear = document.querySelector('.slider-wrapper input[data-index="0"]')?.value
    let maxYear = document.querySelector('.slider-wrapper input[data-index="1"]')?.value
    console.log(minYear, maxYear);
    let filteredData
    if (minYear && maxYear) {
        filteredData = data.filter(test=>stringToYear(test.date)>=minYear && stringToYear(test.date)<=maxYear)
    } else {
        filteredData = data
    }
    filteredData.forEach(test => {
        test.findings.forEach(finding => {
            if (!Array.isArray(finding.hour)) finding.hour=[finding.hour]
            finding.hour.forEach(hour => {
                if (res[finding.side][hour]) res[finding.side][hour]++
                else res[finding.side][hour]=1
            })
        })
    })
    return res
}

function stringToYear(str) {
    return parseInt('20'+str.split('.')[2])
}

function renderTimeGraphs(timeMap, svgSize, radius, parent) {
    parent.innerHTML = ''
    let sides = ["left", "right"]
    sides.forEach(side=>{
        let svgElm = document.createElementNS('http://www.w3.org/2000/svg' ,'svg')
        svgElm.setAttributeNS(null, 'width', svgSize);
        svgElm.setAttributeNS(null, 'height', svgSize);
        let defsElm = document.createElementNS('http://www.w3.org/2000/svg' ,'defs')
        svgElm.appendChild(defsElm)
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
        let hours = timeMap[side]
        for (let hour in hours) {
            let chunckElm = document.createElementNS("http://www.w3.org/2000/svg", "path")
            let d = pathFromObject(hour, radius)
            chunckElm.setAttributeNS(null, "d", d);
            let color
            if (hours[hour] == 1) color='#FBB040'
            else if (hours[hour] == 2) color='#F8893D'
            else if (hours[hour] == 3) color='#F56239'
            else if (hours[hour] >= 4) color='#F23B36'
            chunckElm.setAttributeNS(null, 'fill', color);
            chunckElm.setAttributeNS(null, 'stroke',color);
            svgElm.append(chunckElm)
        }
        let d = ''
        let slicesLinesElm = document.createElementNS("http://www.w3.org/2000/svg", "path")
        slicesLinesElm.setAttributeNS(null, "d", d);
        slicesLinesElm.setAttributeNS(null, 'stroke', 'white');
        svgElm.append(slicesLinesElm)
        svgElm.append(circleElm1)
        svgElm.append(circleElm2)
        svgElm.append(circleElm3)
        
        parent.appendChild(svgElm)
    })
}

function renderGraphs(test, svgSize, radius, parent) {
    parent.innerHTML = ''
    let isInInfo = parent.classList.contains("graphs")
    let sides = ["left", "right"]
    sides.forEach(side=>{
        let findings = test.findings.filter(finding => finding.side == side)
        if (!findings || findings.length == 0) {
            let svgElm = document.createElementNS('http://www.w3.org/2000/svg' ,'svg')
            // svgElm.setAttributeNS(null, 'xmlns', "http://www.w3.org/2000/svg");
            // svgElm.setAttributeNS(null, 'xlink:xmlns', "http://www.w3.org/1999/xlink");
            svgElm.setAttributeNS(null, 'width', svgSize);
            svgElm.setAttributeNS(null, 'height', svgSize);
            let defsElm = document.createElementNS('http://www.w3.org/2000/svg' ,'defs')
            let size = radius*2/3 - 10
            if (isInInfo) size += 5
            defsElm.innerHTML = `<path id="arc1" d="${getArc1Path(svgSize, radius, true)}" />
            <path id="arc2" d="${getArc2Path(svgSize, size, true)}" />`
            svgElm.appendChild(defsElm)
            let circleElm3 = document.createElementNS('http://www.w3.org/2000/svg' ,'circle')
            circleElm3.setAttributeNS(null, 'cx', radius);
            circleElm3.setAttributeNS(null, 'cy', radius);
            circleElm3.setAttributeNS(null, 'fill', 'transparent');
            circleElm3.setAttributeNS(null, 'stroke', 'white');
            circleElm3.setAttributeNS(null, 'stroke-dasharray', '4 4');
            let arc1 = document.createElementNS('http://www.w3.org/2000/svg' ,'path')
            arc1.setAttributeNS(null, 'fill', 'transparent');
            arc1.setAttributeNS(null, 'stroke', 'white');
            arc1.setAttributeNS(null, 'stroke-dasharray', '4 4');
            arc1.setAttributeNS(null, 'd', getArc1Path(svgSize, radius));
            let arc2 = arc1.cloneNode()
            arc2.setAttributeNS(null, 'd', getArc2Path(svgSize, radius*2/3));
            // let circleElm1 = document.createElementNS('http://www.w3.org/2000/svg' ,'circle')
            // circleElm1.setAttributeNS(null, 'cx', radius);
            // circleElm1.setAttributeNS(null, 'cy', radius);
            // circleElm1.setAttributeNS(null, 'r', radius);
            // circleElm1.setAttributeNS(null, 'fill', 'transparent');
            // circleElm1.setAttributeNS(null, 'stroke', 'white');
            // circleElm1.setAttributeNS(null, 'stroke-dasharray', '4 4');
            // circleElm1.setAttributeNS(null, 'id', 'circle-1');
            // let circleElm2 = circleElm1.cloneNode()
            // circleElm2.setAttributeNS(null, 'fill', 'none');
            // circleElm2.setAttributeNS(null, 'r', radius*2/3);
            // circleElm2.setAttributeNS(null, 'id', 'circle-2');
            // let circleElm3 = circleElm2.cloneNode()
            circleElm3.setAttributeNS(null, 'r', radius/3);
            circleElm3.setAttributeNS(null, 'id', 'circle-3');
            // svgElm.append(circleElm1)
            // svgElm.append(circleElm2)
            svgElm.append(circleElm3)
            svgElm.append(arc1)
            svgElm.append(arc2)
            let textElm1 = document.createElementNS('http://www.w3.org/2000/svg' ,'text')
            let textPathElm1 = document.createElementNS('http://www.w3.org/2000/svg' ,'textPath')
            textPathElm1.setAttributeNS(null, 'href', `#arc2`);
            let textPath1Offset = '12.5%'
            // if (isInInfo) textPath1Offset = '0%'
            textPathElm1.setAttributeNS(null, 'startOffset',textPath1Offset);
            textPathElm1.setAttributeNS(null, 'fill', 'white');
            textPathElm1.innerHTML = 'בדיקה תקינה'
            textElm1.appendChild(textPathElm1)
            let textElm2 = document.createElementNS('http://www.w3.org/2000/svg' ,'text')
            let textPathElm2 = document.createElementNS('http://www.w3.org/2000/svg' ,'textPath')
            textPathElm2.setAttributeNS(null, 'href', `#arc1`);
            let textPath2Offset = '7.5%'
            if (isInInfo) textPath2Offset = '5%'
            textPathElm2.setAttributeNS(null, 'startOffset', textPath2Offset);
            textPathElm2.setAttributeNS(null, 'side', 'right');
            textPathElm2.setAttributeNS(null, 'fill', 'white');
            textPathElm2.innerHTML = 'ללא ממצאים חשודים'
            textPathElm2.style.letterSpacing = isInInfo? '1px':'2px'
            textElm2.appendChild(textPathElm2)
            svgElm.appendChild(textElm1)
            svgElm.appendChild(textElm2)
            parent.appendChild(svgElm)
            
            // let imgElm = document.createElement('img')
            // imgElm.src = 'assets/images/no_findings-05.png'
            // imgElm.style.width = svgSize + 'px'
            // parent.appendChild(imgElm)
        } else {
            let svgElm = document.createElementNS('http://www.w3.org/2000/svg' ,'svg')
            svgElm.setAttributeNS(null, 'width', svgSize);
            svgElm.setAttributeNS(null, 'height', svgSize);
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
                let d = pathFromObject(area.hour, radius)
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
            
            parent.appendChild(svgElm)
        }
    })
}

function getArc1Path(size, radius, flip) {
    let center = size/2
    let x1 = center + Math.sin(Math.PI/3)*radius
    let y1 = center + Math.cos(Math.PI/3)*radius
    let x2 = center + Math.sin(-Math.PI/3)*radius
    let y2 = center + Math.cos(-Math.PI/3)*radius
    let sweep = flip? 1:0
    let largeArc = flip? 0:1
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${x2} ${y2}`
}

function getArc2Path(size, radius, flip) {
    let center = size/2
    let x1 = center + Math.sin(-Math.PI*2/3)*radius
    let y1 = center + Math.cos(-Math.PI*2/3)*radius
    let x2 = center + Math.sin(Math.PI*2/3)*radius
    let y2 = center + Math.cos(Math.PI*2/3)*radius
    let sweep = flip? 1:0
    let largeArc = flip? 0:1
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${x2} ${y2}`
}

function pathFromObject(hour, radius) {
	let str = ''
	let a1 = (hour-3.5)*(2*Math.PI/12)

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


function renderInfo(test, doRenderInstructions) {
    let infoElm = document.querySelector('.content .info')
    infoElm.innerHTML = ''
    let testHeaderText 
    let testTitleText
    let testSubtitleText
    if (State.currSection == 2) {
        testHeaderText = 'מעקב'
        testTitleText = 'בדיקות קודמות'
        testSubtitleText = 'אזורים שבהם ממצאים חוזרים'
    } else {
        testHeaderText = typeToHeaderTextMap[test.type] + ' ' + test.date
        testTitleText = test.title
        testSubtitleText = test.subtitle
    }
    createAppendTextElm('h3', testHeaderText, infoElm)
    createAppendTextElm('h1', testTitleText, infoElm)
    createAppendTextElm('h2', testSubtitleText, infoElm)
    if (doRenderInstructions) {
        createAppendTextElm('h1', 'הנחיות', infoElm)
        createAppendTextElm('h2', test.instructions, infoElm)
    } else if (State.currSection == 2)  {
        createAppendTextElm('h3', '>> בחרי אזור כדי לצפות ברשימת הבדיקות בהן חופיע', infoElm)
    } else {
        let graphsElm = document.createElement('div')
        graphsElm.classList.add('graphs')
        infoElm.appendChild(graphsElm)
    }
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
    data.sort((a,b) => stringToTimestamp(a.date) - stringToTimestamp(b.date)) 
    data.forEach((test, i) => {
        test['index'] = i
    });
    renderTabs(data)
    renderContent()
}

function stringToTimestamp(str) {
    let parts = str.split('.')
    return new Date(20+parts[2], parts[1]-1, parts[0])
}

function fetchData() {
  return fetch('data.json')
  .then(response => response.json())
}

init()