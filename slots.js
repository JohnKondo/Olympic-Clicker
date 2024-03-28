const spinBtn = document.querySelector('.spin-btn'),
    stopBtn = document.querySelector('.stop-btn'),
    spin1 = document.querySelector('.spinner-1'),
    spin2 = document.querySelector('.spinner-2'),
    spin3 = document.querySelector('.spinner-3'),
    spinSymbols = Array.from(spin1.querySelectorAll('.symbol'))

let nbSpin = 0;

let stopWheel = false,
    canSpin = true,
    jackpot = false

const spinners = [{
    id: spin1,
    delaySpin: 100,
    acceleration: 1.2,
    rotSpin: 0
},
{
    id: spin2,
    delaySpin: 100,
    acceleration: 1.1,
    rotSpin: 0
},
{
    id: spin3,
    delaySpin: 150,
    acceleration: 1.075,
    rotSpin: 0
}]

const spin = () => {
    if (canSpin) {
        nbSpin++;
        for (let i = 0; i < spinners.length; i++) {
            spinWheel(spinners[i])
        }
        btnPushed(spinBtn, true)
        if (jackpot) {
            document.querySelector('.machine-title').classList.remove('jackpot')
            jackpot = false
        }
        setTimeout(function () {
            stopBtn.click();
        }, nbSpin == 1 ? 500 : 1100);
    }
    canSpin = false
}

const stop = () => {
    if (!canSpin) {
        stopWheel = true
        btnPushed(stopBtn, true)
    }
}

const spinWheel = (spinner) => {
    let firstWheel = true

    const wheelInterval = setInterval(() => {
        let stoDelay;
        const formerDelay = spinner.delaySpin

        stopWheel ? spinner.delaySpin *= spinner.acceleration : spinner.delaySpin > 125 && (spinner.delaySpin /= spinner.acceleration)

        firstWheel ? (stoDelay = 0, firstWheel = false) : stoDelay = spinner.delaySpin

        setTimeout(() => {
            spinner.rotSpin -= 30
            spinner.id.style.setProperty('--rot-spin', spinner.rotSpin + 'deg')
            spinner.id.style.setProperty('--rot-speed', (spinner.delaySpin / 1000) + 's')
        }, stoDelay)

        spinner.delaySpin >= 1000 && (
            clearInterval(wheelInterval),
            spinner.id.dataset.id === "3" && checkSymbols(spinner.delaySpin),
            spinner.delaySpin = formerDelay
        )
    }, 100)
}

const btnPushed = (btn, pushed) => {
    btn.style.setProperty('--btn-bottom', pushed ? '5%' : '12.5%')
    btn.style.cursor = pushed ? 'not-allowed' : "pointer"
}

const checkSymbols = (delay) => {
    setTimeout(() => {
        const getSymbol = (i) => {
            return spinSymbols[((-30 - spinners[i].rotSpin) / 30) % 12].dataset.value
        }

        const symbol1 = getSymbol(0),
            symbol2 = getSymbol(1),
            symbol3 = getSymbol(2)

        if (symbol1 === symbol2 && symbol1 === symbol3) {
            document.querySelector('.machine-title').classList.add('jackpot')
            jackpot = true;
            document.getElementById("winDiv").style.display = "flex";
        }
        else {
            document.getElementById("looseDiv").style.display = "flex";
        }
        document.getElementById('run-button').style.display = "flex";

    }, 125 + delay * 2)
}

const reactivateButton = () => {
    stopWheel = false
    canSpin = true
    btnPushed(spinBtn, false)
    btnPushed(stopBtn, false)
}

spinBtn.addEventListener('click', spin)

stopBtn.addEventListener('click', stop)

export { reactivateButton };