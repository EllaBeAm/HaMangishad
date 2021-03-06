const State = {
    testsType: 'All',
    currTestIndex: 1,
    currSection: 0,
    currSide: 'left',
    selectedHour: 0
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
    State.selectedHour = 0
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

let forbidScroll = false
function shiftDateBtns(dir) {
    if (forbidScroll) return
    let dateBtnsWrapperElm = document.querySelector(".date-btns-wrapper")
    let leftScrollDistance = 0
    // let roundOffset = dateBtnsWrapperElm.scrollLeft-(Math.round(dateBtnsWrapperElm.scrollLeft/100)*100)
    switch (dir) {
        case "right":
            leftScrollDistance = 100
            break
        case "left":
            leftScrollDistance = -100
            break
    }
    dateBtnsWrapperElm.scrollBy({
        top: 0,
        left: leftScrollDistance,
        behavior: 'smooth'
    });
    forbidScroll = true
    setTimeout(_=>forbidScroll=false, 500);
}

function getFilteredTests() {
    if (State.testsType == 'All') return data
    else return data.filter(test => test.type == State.testsType)
}

function getCurrentTest() {
    return data.filter(test => test.index == State.currTestIndex)[0]
}

let typeToHeaderTextMap = {
    US: '??????????????????????',
    MRI: 'MRI???',
    MAMM: '????????????????'
}

function createAppendTextElm(type, text, parent, className) {
    let textElm = document.createElement(type)
    textElm.innerText = text
        if (className) textElm.classList.add(className)
    parent.appendChild(textElm)
}

function renderContent() {
    let test = getCurrentTest()
    let doRenderInstructions = State.currSection==0
    renderInfo(test, doRenderInstructions)
    renderGraphsManager(test)
    if (State.currSection == 1) renderScans(test)
    else if (State.currSection == 2) renderRangeSlider(!State.selectedHour)
}

function renderRangeSlider(isInInfo) {
    if (document.querySelector('.slider-wrapper input')) return
    let allYears = [...new Set(data.map(test=>stringToYear(test.date)).sort())]
    let parent
    if (isInInfo) parent = document.querySelector('.content .info')
    else parent = document.querySelector('.content .visuals')
    let yearsWrapper = document.createElement('div')
    yearsWrapper.classList.add('years-wrapper')
    let yearsTitle = document.createElement('h3')
    yearsTitle.innerText = '????????'
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
    parent.appendChild(yearsWrapper)
    if (isInInfo) {
        let legendElm = document.createElement('div')
        let keysMap = [
            {text: '???????? ????????', color:'#FBB040'},
            {text: '2 ????????????', color:'#F8893D'},
            {text: '3 ????????????', color:'#F56239'},
            {text: '4 ???????????? ??????????', color:'#F23B36'},
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
        parent.appendChild(legendElm)
    }
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
    scansWrapperElm.dataset.type = test.type
    // let sideFindings = test.findings.filter(finding => finding.side == State.currSide)
    let sideFindings = test.findings
    let hasActive = false
    let counter = 0
    sideFindings.forEach(finding => {
        finding.scans.forEach((scan, i) => {
            if ((test.type == 'US' && counter>=5) || (test.type == 'MRI' && counter>3)) return
            let scanElm = document.createElement('div')
            scanElm.style.backgroundImage = 'url(assets/findings/' + scan + '.png)'
            scanElm.classList.add('scan')
            if (i == 0 && !hasActive) {
                scanElm.classList.add('active')
                hasActive = true
            }
            scanElm.dataset.side = finding.side
            let scanTitleElm = document.createElement('span')
            scanTitleElm.classList.add('scan-title')
            scanTitleElm.innerText = finding.title
            scanElm.appendChild(scanTitleElm)
            scansWrapperElm.appendChild(scanElm)
            counter++
        })
    })
    test.scans.forEach((scan, i) => {
        if ((test.type == 'US' && counter>5) || (test.type == 'MRI' && counter>3)) return
        let scanElm = document.createElement('div')
        scanElm.style.backgroundImage = 'url(assets/findings/' + scan + '.png)'
        scanElm.classList.add('scan')
        if (i == 0 && !hasActive) {
            scanElm.classList.add('active')
            hasActive = true
        }
        // let scanTitleElm = document.createElement('span')
        // scanTitleElm.classList.add('scan-title')
        // scanTitleElm.innerText = scan.title
        // scanElm.appendChild(scanTitleElm)
        scansWrapperElm.appendChild(scanElm)
        counter++
    })
    visualsElm.appendChild(scansWrapperElm)
}

function renderGraphsManager() {
    let test = getCurrentTest()
    if (State.currSection == 0) {
        let parent = document.querySelector('.content .visuals')
        renderGraphs(test, 320, 180, parent)
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
            btnElm.innerText = side=='right'? '????????':'????????'
            if (test.type == 'MRI') {
                btnElm.classList.add('not-btn')
            } else {
                if (State.currSide == side) btnElm.classList.add('active')
                btnElm.onclick = selectedSide
            }
            wrapper.appendChild(btnElm)
            parent.appendChild(wrapper)
        })
    } else {
        let parent
        if (State.selectedHour) {
            parent = document.querySelector('.content .visuals .svg-wrapper')
            if (!parent) parent = document.querySelector('.content .visuals')
        } else {
            parent = document.querySelector('.content .visuals')
        }

        let timeMap = getTimeMap()
        console.log(timeMap);
        renderTimeGraphs(timeMap, 311, 180, parent)
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
    parent.classList.add('time-graphs')
    let svgWrapper = document.createElement('div')
    svgWrapper.classList.add('svg-wrapper')
    parent.appendChild(svgWrapper)
    let sides = ["left", "right"]
    let center = svgSize/2
    if (svgSize<radius*2) center=radius
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
        circleElm1.setAttributeNS(null, 'fill', 'none');
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
            let d = pathFromObject(hour, center, radius)
            chunckElm.setAttributeNS(null, "d", d);
            let color
            if (hours[hour] == 1) color='#FBB040'
            else if (hours[hour] == 2) color='#F8893D'
            else if (hours[hour] == 3) color='#F56239'
            else if (hours[hour] >= 4) color='#F23B36'
            if (side == State.currSide && hour == State.selectedHour) chunckElm.classList.add('selected')
            chunckElm.onclick = selectedTimeHour
            chunckElm.dataset.side = side
            chunckElm.dataset.hour = hour
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
        
        svgWrapper.appendChild(svgElm)
    })
}

function selectedTimeHour(e) {
    State.selectedHour = e.target.dataset.hour
    State.currSide = e.target.dataset.side
    renderContent()
}
             

function renderGraphs(test, svgSize, radius, parent) {
    parent.innerHTML = ''
    parent.classList.remove('time-graphs')
    let isInInfo = parent.classList.contains("graphs")
    let center = svgSize/2
    let sides = ["left", "right"]
    sides.forEach(side=>{
        let findings = test.findings.filter(finding => finding.side == side)
        if (!findings || findings.length == 0) {
            let svgElm = document.createElementNS('http://www.w3.org/2000/svg' ,'svg')
            svgElm.setAttributeNS(null, 'width', svgSize);
            svgElm.setAttributeNS(null, 'height', svgSize);
            let defsElm = document.createElementNS('http://www.w3.org/2000/svg' ,'defs')
            let size = radius*2/3 - 10
            if (isInInfo) size += 6
            defsElm.innerHTML = `<path id="arc1" d="${getArc1Path2(svgSize, radius, true)}" />
            <path id="arc2" d="${getArc2Path(svgSize, size, true)}" />`
            svgElm.appendChild(defsElm)
            let circleElm3 = document.createElementNS('http://www.w3.org/2000/svg' ,'circle')
            circleElm3.setAttributeNS(null, 'cx', center);
            circleElm3.setAttributeNS(null, 'cy', center);
            circleElm3.setAttributeNS(null, 'fill', 'none');
            circleElm3.setAttributeNS(null, 'stroke', 'white');
            circleElm3.setAttributeNS(null, 'stroke-dasharray', '4 4');
            let arc1 = document.createElementNS('http://www.w3.org/2000/svg' ,'path')
            arc1.setAttributeNS(null, 'fill', 'transparent');
            arc1.setAttributeNS(null, 'stroke', 'white');
            arc1.setAttributeNS(null, 'stroke-dasharray', '4 4');
            arc1.setAttributeNS(null, 'd', getArc1Path(svgSize, radius));
            let arc2 = arc1.cloneNode()
            arc2.setAttributeNS(null, 'd', getArc2Path(svgSize, radius*2/3));
            circleElm3.setAttributeNS(null, 'r', radius/3);
            circleElm3.setAttributeNS(null, 'id', 'circle-3');
            svgElm.append(circleElm3)
            svgElm.append(arc1)
            svgElm.append(arc2)
            let textElm1 = document.createElementNS('http://www.w3.org/2000/svg' ,'text')
            let textPathElm1 = document.createElementNS('http://www.w3.org/2000/svg' ,'textPath')
            textPathElm1.setAttributeNS(null, 'href', `#arc2`);
            let textPath1Offset = '12.5%'
            if (isInInfo) textPath1Offset = '11%'
            textPathElm1.setAttributeNS(null, 'startOffset',textPath1Offset);
            textPathElm1.setAttributeNS(null, 'fill', 'white');
            textPathElm1.innerHTML = '?????????? ??????????'
            textElm1.appendChild(textPathElm1)
            let textElm2 = document.createElementNS('http://www.w3.org/2000/svg' ,'text')
            let textPathElm2 = document.createElementNS('http://www.w3.org/2000/svg' ,'textPath')
            textPathElm2.setAttributeNS(null, 'href', `#arc1`);
            let textPath2Offset = '8%'
            if (isInInfo) textPath2Offset = '5%'
            textPathElm2.setAttributeNS(null, 'startOffset', textPath2Offset);
            textPathElm2.setAttributeNS(null, 'side', 'left');
            textPathElm2.setAttributeNS(null, 'fill', 'white');
            textPathElm2.innerHTML = '?????? ???????????? ????????????'
            textPathElm2.style.letterSpacing = isInInfo? '1px':'4px'
            textElm2.appendChild(textPathElm2)
            svgElm.appendChild(textElm1)
            svgElm.appendChild(textElm2)
            if (!isInInfo) {
                let sideTextElm = document.createElementNS('http://www.w3.org/2000/svg' ,'text')
                sideTextElm.setAttributeNS(null, 'fill', 'white');
                sideTextElm.setAttributeNS(null, 'text-anchor', 'middle');
                sideTextElm.setAttributeNS(null, 'x', center);
                sideTextElm.setAttributeNS(null, 'y', radius*2 + 40);
                let sideText = side=='right'? '????????':'????????'
                sideTextElm.innerHTML = sideText
                sideTextElm.classList.add('svg-side-text')
                svgElm.appendChild(sideTextElm)
            }
            parent.appendChild(svgElm)
        } else {
            let svgElm = document.createElementNS('http://www.w3.org/2000/svg' ,'svg')
            svgElm.setAttributeNS(null, 'width', svgSize);
            svgElm.setAttributeNS(null, 'height', svgSize);
            let defsElm = document.createElementNS('http://www.w3.org/2000/svg' ,'defs')
            defsElm.innerHTML = `<pattern id='stripes-pattern-1' patternUnits='userSpaceOnUse' width='20' height='40' patternTransform='scale(1) rotate(0)'>
                        <rect x='0' y='0' width='100%' height='100%' fill='transparent'/>
                        <path d='M0 5h20z' stroke-width='1' stroke='#fff' fill='none'/>
                        <path d='M0 15h20z' stroke-width='1' stroke='#fff' fill='none'/>
                        <path d='M0 25h20z' stroke-width='1' stroke='#fff' fill='none'/>
                        <path d='M0 35h20z' stroke-width='1' stroke='#fff' fill='none'/>
                    </pattern>
                    <pattern id='dots-pattern-1' patternUnits='userSpaceOnUse' width='24' height='24' patternTransform='scale(1) rotate(0)'>
                        <rect x='0' y='0' width='100%' height='100%' fill='transparent'/>
                        <circle cx="8" cy="8" r="2" fill='#fff'/>
                        <circle cx="20" cy="20" r="2" fill='#fff'/>
                    </pattern>
                    <pattern id='stripes-pattern-2' patternUnits='userSpaceOnUse' width='20' height='40' patternTransform='scale(1) rotate(0)'>
                        <rect x='0' y='0' width='100%' height='100%' fill='#01A9E8'/>
                        <path d='M0 5h20z' stroke-width='1' stroke='#fff' fill='none'/>
                        <path d='M0 15h20z' stroke-width='1' stroke='#fff' fill='none'/>
                        <path d='M0 25h20z' stroke-width='1' stroke='#fff' fill='none'/>
                        <path d='M0 35h20z' stroke-width='1' stroke='#fff' fill='none'/>
                    </pattern>
                    <pattern id='dots-pattern-2' patternUnits='userSpaceOnUse' width='24' height='24' patternTransform='scale(1) rotate(0)'>
                        <rect x='0' y='0' width='100%' height='100%' fill='#01A9E8'/>
                        <circle cx="8" cy="8" r="2" fill='#fff'/>
                        <circle cx="20" cy="20" r="2" fill='#fff'/>
                    </pattern>
                    <pattern id='stripes-pattern-3' patternUnits='userSpaceOnUse' width='20' height='40' patternTransform='scale(1) rotate(0)'>
                        <rect x='0' y='0' width='100%' height='100%' fill='#F7EB01'/>
                        <path d='M0 5h20z' stroke-width='1' stroke='#fff' fill='none'/>
                        <path d='M0 15h20z' stroke-width='1' stroke='#fff' fill='none'/>
                        <path d='M0 25h20z' stroke-width='1' stroke='#fff' fill='none'/>
                        <path d='M0 35h20z' stroke-width='1' stroke='#fff' fill='none'/>
                    </pattern>
                    <pattern id='dots-pattern-3' patternUnits='userSpaceOnUse' width='24' height='24' patternTransform='scale(1) rotate(0)'>
                        <rect x='0' y='0' width='100%' height='100%' fill='#F7EB01'/>
                        <circle cx="8" cy="8" r="2" fill='#fff'/>
                        <circle cx="20" cy="20" r="2" fill='#fff'/>
                    </pattern>
                    <pattern id='stripes-pattern-4' patternUnits='userSpaceOnUse' width='20' height='40' patternTransform='scale(1) rotate(0)'>
                        <rect x='0' y='0' width='100%' height='100%' fill='#E60087'/>
                        <path d='M0 5h20z' stroke-width='1' stroke='#fff' fill='none'/>
                        <path d='M0 15h20z' stroke-width='1' stroke='#fff' fill='none'/>
                        <path d='M0 25h20z' stroke-width='1' stroke='#fff' fill='none'/>
                        <path d='M0 35h20z' stroke-width='1' stroke='#fff' fill='none'/>
                    </pattern>
                    <pattern id='dots-pattern-4' patternUnits='userSpaceOnUse' width='24' height='24' patternTransform='scale(1) rotate(0)'>
                        <rect x='0' y='0' width='100%' height='100%' fill='#E60087'/>
                        <circle cx="8" cy="8" r="2" fill='#fff'/>
                        <circle cx="20" cy="20" r="2" fill='#fff'/>
                    </pattern>
                    <pattern id='lump-pattern' patternUnits='userSpaceOnUse' width='6' height='6' patternTransform='scale(1) rotate(0)'>
                        <circle cx="1" cy="1" r="1" fill='#fff'/>
                        <circle cx="4" cy="4" r="1" fill='#fff'/>
                    </pattern>
                    <pattern id='cyst-pattern' patternUnits='userSpaceOnUse' width='4' height='4' patternTransform='scale(1) rotate(0)'>
                        <path d='M0 1h6z' stroke-width='1' stroke='#fff' fill='none'/>
                    </pattern>
                    <circle id="cyst-tag" cx="0" cy="0" r="8" stroke-width='1' stroke='#fff' fill='url(#cyst-pattern)'/>
                    <circle id="lump-tag" cx="0" cy="0" r="8" stroke-width='1' stroke='#fff' fill='url(#lump-pattern)'/>
                    `
            svgElm.appendChild(defsElm)
            let circleElm1 = document.createElementNS('http://www.w3.org/2000/svg' ,'circle')
            circleElm1.setAttributeNS(null, 'cx', center);
            circleElm1.setAttributeNS(null, 'cy', center);
            circleElm1.setAttributeNS(null, 'r', radius);
            circleElm1.setAttributeNS(null, 'fill', 'none');
            circleElm1.setAttributeNS(null, 'stroke', 'white');
            let circleElm2 = circleElm1.cloneNode()
            circleElm2.setAttributeNS(null, 'fill', 'none');
            circleElm2.setAttributeNS(null, 'r', radius*2/3);
            let circleElm3 = circleElm2.cloneNode()
            circleElm3.setAttributeNS(null, 'r', radius/3);
            svgElm.append(circleElm1)
            console.log(findings);
            let hoursMarked = []
            for (let i=0; i<findings.length; i++) {
                let area = findings[i]
                let chunckElm = document.createElementNS("http://www.w3.org/2000/svg", "path")
                let d = pathFromObject(area.hour, center, radius)
                chunckElm.setAttributeNS(null, "d", d);
                chunckElm.setAttributeNS(null, 'stroke', 'white');
                let patternFillUrl
                if (area.type == 'cyst') patternFillUrl = `url(#dots-pattern-${area.birads})`
                else if (area.type == 'lump') patternFillUrl = `url(#stripes-pattern-${area.birads})`
                else patternFillUrl = '#56a4da'
                chunckElm.setAttributeNS(null, 'fill', patternFillUrl);
                svgElm.append(chunckElm)
                if (isInInfo) continue
                let lineElm = document.createElementNS("http://www.w3.org/2000/svg", "path")
                let lineRadius = radius
                let firstHour
                if (Array.isArray(area.hour)) firstHour=area.hour[0]
                else firstHour=area.hour
                if (hoursMarked.indexOf(firstHour) == -1) {
                    let angle = (Math.PI/12)*((-firstHour*2)+13)
                    let length = 40
                    let lineX1 = center + Math.sin(angle)*lineRadius
                    let lineY1 = center + Math.cos(angle)*lineRadius
                    let lineX2 = center + Math.sin(angle)*(lineRadius+length)
                    let lineY2 = center + Math.cos(angle)*(lineRadius+length)
                    let lineH = 90
                    if (firstHour >= 7) lineH *= -1
                    let lineD = `M ${lineX1} ${lineY1} L ${lineX2} ${lineY2} h ${lineH}`
                    lineElm.setAttributeNS(null, "d", lineD);
                    lineElm.setAttributeNS(null, 'stroke', 'white');
                    lineElm.setAttributeNS(null, 'fill', 'none');
                    lineElm.setAttributeNS(null, 'stroke-dasharray', '4 4');
                    let textElm = document.createElementNS("http://www.w3.org/2000/svg", "text")
                    let textX = lineX2 + 5
                    let textY = lineY2-4
                    if (firstHour >= 7) textX -= ((area.title.length)*5)+5
                    textElm.setAttributeNS(null, "x", textX);
                    textElm.setAttributeNS(null, "y", textY);
                    textElm.setAttributeNS(null, 'fill', 'white');
                    textElm.innerHTML = area.title
                    textElm.classList.add('finding')
                    for (let i=0; i<area.amount; i++) {
                        let tagX = lineX2 + i*-20 - 6
                        if (firstHour < 7) tagX += ((area.title.length)*5) +5
                        let tagY = textY - 20
                        let tagElm = document.createElementNS("http://www.w3.org/2000/svg", "use")
                        let hrefTag = area.type=='lump'?'#lump-tag':'cyst-tag'
                        tagElm.setAttributeNS(null, 'href', hrefTag);
                        tagElm.setAttributeNS(null, 'x', tagX);
                        tagElm.setAttributeNS(null, 'y', tagY);
                        svgElm.append(tagElm)
                    }
                    hoursMarked.push(firstHour)
                    svgElm.append(textElm)
                    svgElm.append(lineElm)

                    let d = pathFromObject(area.hour, center, radius+5, true)
                    defsElm.innerHTML += ` <path id='birads-path-${side}-${i}' d='${d}' stroke='#fff' fill='none'/>`
                    let biradsTextPath = document.createElementNS('http://www.w3.org/2000/svg' ,'textPath')
                    biradsTextPath.setAttributeNS(null, 'href', `#birads-path-${side}-${i}`);
                    let biradsTextPathOffset = '5%'
                    if (Array.isArray(area.hour)) biradsTextPathOffset = '17%'
                    biradsTextPath.setAttributeNS(null, 'startOffset', biradsTextPathOffset);
                    // biradsTextPath.setAttributeNS(null, 'side', 'left');
                    biradsTextPath.setAttributeNS(null, 'fill', 'white');
                    biradsTextPath.innerHTML = 'BIRADS ' + area.birads
                    
                    let biradsTextElm = document.createElementNS("http://www.w3.org/2000/svg", "text")
                    biradsTextElm.classList.add('birads-text')
                    biradsTextElm.appendChild(biradsTextPath)
                    svgElm.appendChild(biradsTextElm)
                }
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
            
            if (!isInInfo) {
                let sideTextElm = document.createElementNS('http://www.w3.org/2000/svg' ,'text')
                sideTextElm.setAttributeNS(null, 'fill', 'white');
                sideTextElm.setAttributeNS(null, 'text-anchor', 'middle');
                sideTextElm.setAttributeNS(null, 'x', center);
                sideTextElm.setAttributeNS(null, 'y', radius*2 + 40);
                let sideText = side=='right'? '????????':'????????'
                sideTextElm.innerHTML = sideText
                sideTextElm.classList.add('svg-side-text')
                svgElm.appendChild(sideTextElm)
            }
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

function getArc1Path2(size, radius, flip) {
    let center = size/2
    let x1 = center + Math.sin(-Math.PI/3)*radius
    let y1 = center + Math.cos(-Math.PI/3)*radius
    let x2 = center + Math.sin(Math.PI/3)*radius
    let y2 = center + Math.cos(Math.PI/3)*radius
    let sweep = 0
    let largeArc = 0    
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

function pathFromObject(hour, center, radius, isBirads) {
	let str = ''
    let firstHour
    if (Array.isArray(hour)) firstHour = hour[0]
    else firstHour = hour
	let a1 = (firstHour-3.5)*(2*Math.PI/12)

	const cos = Math.cos;
	const sin = Math.sin;
	const ?? = Math.PI;
	let cx = center
	let cy = center
	let rx1 = radius
	let ry1 = radius
	let t1 = a1
    let ?? = 0
	let ?? = (2*??/12)
    // quick ugly fix, all hour arrays have 2 consequtive hours
    if (Array.isArray(hour)) ?? *= 2
	const f_matrix_times = (( [[a,b], [c,d]], [x,y]) => [ a * x + b * y, c * x + d * y]);
	const f_rotate_matrix = (x => [[cos(x),-sin(x)], [sin(x), cos(x)]]);
	const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);
	const rotMatrix = f_rotate_matrix(??);
	const [sX1, sY1] = ( f_vec_add ( f_matrix_times ( rotMatrix, [rx1 * cos(t1), ry1 * sin(t1)] ), [cx,cy] ) );
	const [eX1, eY1] = ( f_vec_add ( f_matrix_times ( rotMatrix, [rx1 * cos(t1+??), ry1 * sin(t1+??)] ), [cx,cy] ) );
	const fA = ( (  ?? > ?? ) ? 1 : 0 );
	const fS = 1 // ( (  ?? > 0 ) ? 1 : 0 );
	const fS2 = ( (  ?? > 0 ) ? 0 : 1 );
    if (isBirads) {
        str = "M " + sX1 + " " + sY1 + " A " + [ rx1 , ry1 , ?? / (2*??) *360, fA, fS, eX1, eY1 ].join(" ") + ' Z'
    } else {
        let outerArc = "M " + sX1 + " " + sY1 + " A " + [ rx1 , ry1 , ?? / (2*??) *360, fA, fS, eX1, eY1 ].join(" ")
        let line = "L " + cx + " " + cy
        str = outerArc + line + " Z"
    }
    return str
}


function renderInfo(test, doRenderInstructions) {
    let infoElm = document.querySelector('.content .info')
    infoElm.innerHTML = ''
    let testHeaderText 
    let testTitleText
    let testSubtitleText
    if (State.currSection == 2) {
        testHeaderText = '????????'
        testTitleText = '???????????? ????????????'
        testSubtitleText = '???????????? ???????? ???????????? ????????????'
    } else {
        testHeaderText = '[ ' + typeToHeaderTextMap[test.type] + ' ' + test.date + ' ]'
        testTitleText = test.title
        testSubtitleText = test.subtitle
    }
    createAppendTextElm('h3', testHeaderText, infoElm)
    createAppendTextElm('h1', testTitleText, infoElm)
    createAppendTextElm('h2', testSubtitleText, infoElm)
    if (doRenderInstructions) {
        createAppendTextElm('h1', '???????? ????????', infoElm, 'instructions-header')
        createAppendTextElm('h2', test.instructions, infoElm)
    } else if (State.currSection == 2)  {
        if (State.selectedHour) {
            addHourList(infoElm)
        } else {
            createAppendTextElm('h3', '>> ???????? ???????? ?????? ?????????? ???????????? ?????????????? ?????? ??????????', infoElm)
        }
    } else {
        let graphsElm = document.createElement('div')
        graphsElm.classList.add('graphs')
        infoElm.appendChild(graphsElm)
    }
}

function addHourList(parent) {
    let findings = getFindingsBySideAndHour(State.currSide, State.selectedHour)
    console.log(findings);
    let findingsWrapper = document.createElement('div')
    findingsWrapper.classList.add('findings-list')
    parent.appendChild(findingsWrapper)
    findings.forEach(finding => {
        let findingElm = document.createElement('div')
        findingElm.classList.add('finding')
        findingElm.innerText = finding.testType + ' ' + finding.date
        findingElm.dataset.birads = finding.birads
        findingsWrapper.appendChild(findingElm)
    })
}

function getFindingsBySideAndHour(side, hour) {
    let findings = []
    data.forEach(test => {
        test.findings.forEach(finding => {
            if (finding.side != side) return
            if (!Array.isArray(finding.hour)) finding.hour=[finding.hour]
            finding.hour.forEach(finHour => {
                if (finHour == hour) {
                    finding.date = test.date
                    finding.testType = test.type
                    findings.push(finding)
                }
            })
        })
    })
    return findings
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
    data = await fetchData()
    data.sort((a,b) => stringToTimestamp(a.date) - stringToTimestamp(b.date)) 
    data.forEach((test, i) => {
        test['index'] = i
    });
    renderTabs(data)
    let dateBtnsWrapperElm = document.querySelector(".date-btns-wrapper")
    dateBtnsWrapperElm.scrollBy(100, 0);
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