document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const hoursDisplay = document.getElementById('hours');
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const millisecondsDisplay = document.getElementById('milliseconds');
    
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const lapBtn = document.getElementById('lap-btn');
    
    const lapList = document.getElementById('lap-list');
    const totalTimeDisplay = document.getElementById('total-time');
    const avgLapDisplay = document.getElementById('avg-lap');
    const fastestLapDisplay = document.getElementById('fastest-lap');
    const slowestLapDisplay = document.getElementById('slowest-lap');
    
    const themeButtons = document.querySelectorAll('.theme-btn');
    const featureTabs = document.querySelectorAll('.feature-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    const soundToggle = document.getElementById('sound-toggle');
    const precisionSelect = document.getElementById('precision-select');
    const splitMethodSelect = document.getElementById('split-method');
    
    const clickSound = document.getElementById('click-sound');
    const beepSound = document.getElementById('beep-sound');
    const lapSound = document.getElementById('lap-sound');
    
    // Variables
    let startTime;
    let elapsedTime = 0;
    let timerInterval;
    let laps = [];
    let isRunning = false;
    let precision = 2; // Default to milliseconds
    
    // Initialize Chart
    const ctx = document.getElementById('lap-chart').getContext('2d');
    let lapChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Lap Times (seconds)',
                data: [],
                backgroundColor: 'rgba(66, 133, 244, 0.2)',
                borderColor: 'rgba(66, 133, 244, 1)',
                borderWidth: 2,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Time (seconds)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Lap Number'
                    }
                }
            }
        }
    });
    
    // Event Listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    lapBtn.addEventListener('click', recordLap);
    
    themeButtons.forEach(button => {
        button.addEventListener('click', changeTheme);
    });
    
    featureTabs.forEach(tab => {
        tab.addEventListener('click', switchTab);
    });
    
    soundToggle.addEventListener('change', toggleSounds);
    precisionSelect.addEventListener('change', updatePrecision);
    splitMethodSelect.addEventListener('change', updateSplitMethod);
    
    // Functions
    // function playSound(sound) {
    //     if (soundToggle.checked) {
    //         sound.currentTime = 0;
    //         sound.play();
    //     }
    // }
    function playSound(sound) {
    if (soundToggle.checked) {
        sound.currentTime = 0;
        sound.play().catch(err => {
            console.warn("Audio playback blocked by browser:", err);
        });
    }
}

    
    function toggleSounds() {
        localStorage.setItem('stopwatchSoundsEnabled', soundToggle.checked);
    }
    
    function updatePrecision() {
        precision = parseInt(precisionSelect.value);
        localStorage.setItem('stopwatchPrecision', precision);
        updateDisplay();
    }
    
    function updateSplitMethod() {
        localStorage.setItem('stopwatchSplitMethod', splitMethodSelect.value);
        updateLapDisplay();
    }
    
    function changeTheme(e) {
        const theme = e.target.id.replace('-theme', '');
        document.body.setAttribute('data-theme', theme);
        
        themeButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        localStorage.setItem('stopwatchTheme', theme);
        
        // Update chart colors based on theme
        updateChartTheme();
    }
    
    function updateChartTheme() {
        const theme = document.body.getAttribute('data-theme') || 'light';
        let textColor;
        
        switch(theme) {
            case 'dark':
                textColor = '#e8eaed';
                break;
            case 'professional':
                textColor = '#5a5c69';
                break;
            default:
                textColor = '#333';
        }
        
        lapChart.options.scales.x.grid.color = `rgba(${theme === 'dark' ? '255,255,255' : '0,0,0'}, 0.1)`;
        lapChart.options.scales.y.grid.color = `rgba(${theme === 'dark' ? '255,255,255' : '0,0,0'}, 0.1)`;
        lapChart.options.scales.x.ticks.color = textColor;
        lapChart.options.scales.y.ticks.color = textColor;
        lapChart.update();
    }
    
    function switchTab(e) {
        const tabId = e.target.getAttribute('data-tab');
        
        featureTabs.forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');
        
        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        
        playSound(clickSound);
    }
    
    function startTimer() {
        if (!isRunning) {
            playSound(beepSound);
            isRunning = true;
            startTime = Date.now() - elapsedTime;
            timerInterval = setInterval(updateTimer, 10);
            
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            resetBtn.disabled = false;
            lapBtn.disabled = false;
        }
    }
    
    function pauseTimer() {
        if (isRunning) {
            playSound(clickSound);
            isRunning = false;
            clearInterval(timerInterval);
            
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    }
    
    function resetTimer() {
        playSound(clickSound);
        isRunning = false;
        clearInterval(timerInterval);
        elapsedTime = 0;
        laps = [];
        
        updateDisplay();
        updateLapDisplay();
        updateAnalytics();
        
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        resetBtn.disabled = true;
        lapBtn.disabled = true;
    }
    
    function recordLap() {
        if (isRunning) {
            playSound(lapSound);
            const currentTime = getFormattedTime();
            const lapTime = getCurrentTime();
            
            let lapData = {
                number: laps.length + 1,
                time: lapTime,
                total: elapsedTime
            };
            
            laps.push(lapData);
            updateLapDisplay();
            updateAnalytics();
        }
    }
    
    function updateTimer() {
        elapsedTime = Date.now() - startTime;
        updateDisplay();
    }
    
    function getCurrentTime() {
        return elapsedTime;
    }
    
    function getFormattedTime() {
        const date = new Date(elapsedTime);
        let hours = date.getUTCHours().toString().padStart(2, '0');
        let minutes = date.getUTCMinutes().toString().padStart(2, '0');
        let seconds = date.getUTCSeconds().toString().padStart(2, '0');
        let milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0').slice(0, precision);
        
        return { hours, minutes, seconds, milliseconds };
    }
    
    function updateDisplay() {
        const time = getFormattedTime();
        hoursDisplay.textContent = time.hours;
        minutesDisplay.textContent = time.minutes;
        secondsDisplay.textContent = time.seconds;
        millisecondsDisplay.textContent = time.milliseconds;
    }
    
    function updateLapDisplay() {
        // Clear existing laps
        while (lapList.children.length > 1) {
            lapList.removeChild(lapList.lastChild);
        }
        
        const splitMethod = splitMethodSelect.value;
        
        laps.forEach((lap, index) => {
            const lapItem = document.createElement('div');
            lapItem.className = 'lap-item';
            if (index === laps.length - 1) {
                lapItem.classList.add('highlight');
            }
            
            const lapNumber = document.createElement('span');
            lapNumber.textContent = `Lap ${lap.number}`;
            
            const lapTime = document.createElement('span');
            const lapTimeFormatted = formatTime(lap.time);
            lapTime.textContent = lapTimeFormatted;
            
            const splitTime = document.createElement('span');
            let splitValue;
            
            if (splitMethod === 'split') {
                splitValue = index === 0 ? lap.time : lap.time - laps[index - 1].time;
            } else {
                splitValue = lap.time;
            }
            
            const splitTimeFormatted = formatTime(splitValue);
            splitTime.textContent = splitTimeFormatted;
            
            lapItem.appendChild(lapNumber);
            lapItem.appendChild(lapTime);
            lapItem.appendChild(splitTime);
            
            lapList.appendChild(lapItem);
        });
    }
    
    function formatTime(timeInMs) {
        const date = new Date(timeInMs);
        let hours = date.getUTCHours().toString().padStart(2, '0');
        let minutes = date.getUTCMinutes().toString().padStart(2, '0');
        let seconds = date.getUTCSeconds().toString().padStart(2, '0');
        let milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0').slice(0, precision);
        
        if (precision > 0) {
            return `${hours}:${minutes}:${seconds}.${milliseconds}`;
        } else {
            return `${hours}:${minutes}:${seconds}`;
        }
    }
    
    function updateAnalytics() {
        if (laps.length > 0) {
            // Update total time
            totalTimeDisplay.textContent = formatTime(elapsedTime);
            
            // Calculate average lap time
            const avgLapTime = laps.reduce((sum, lap) => sum + (splitMethodSelect.value === 'split' ? 
                (lap.number === 1 ? lap.time : lap.time - laps[lap.number - 2].time) : lap.time), 0) / laps.length;
            avgLapDisplay.textContent = formatTime(avgLapTime);
            
            // Find fastest and slowest laps
            let lapTimes = [];
            if (splitMethodSelect.value === 'split') {
                lapTimes = laps.map((lap, index) => 
                    index === 0 ? lap.time : lap.time - laps[index - 1].time);
            } else {
                lapTimes = laps.map(lap => lap.time);
            }
            
            const fastestLap = Math.min(...lapTimes);
            const slowestLap = Math.max(...lapTimes);
            
            fastestLapDisplay.textContent = formatTime(fastestLap);
            slowestLapDisplay.textContent = formatTime(slowestLap);
            
            // Update chart
            updateChart();
        } else {
            totalTimeDisplay.textContent = '00:00:00';
            avgLapDisplay.textContent = '00:00:00';
            fastestLapDisplay.textContent = '00:00:00';
            slowestLapDisplay.textContent = '00:00:00';
            
            // Clear chart
            lapChart.data.labels = [];
            lapChart.data.datasets[0].data = [];
            lapChart.update();
        }
    }
    
    function updateChart() {
        const labels = laps.map(lap => `Lap ${lap.number}`);
        let data;
        
        if (splitMethodSelect.value === 'split') {
            data = laps.map((lap, index) => 
                index === 0 ? lap.time / 1000 : (lap.time - laps[index - 1].time) / 1000);
        } else {
            data = laps.map(lap => lap.time / 1000);
        }
        
        lapChart.data.labels = labels;
        lapChart.data.datasets[0].data = data;
        lapChart.update();
    }
    
    // Load saved preferences
    function loadPreferences() {
        // Theme
        const savedTheme = localStorage.getItem('stopwatchTheme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        document.getElementById(`${savedTheme}-theme`).classList.add('active');
        
        // Sounds
        const soundsEnabled = localStorage.getItem('stopwatchSoundsEnabled');
        if (soundsEnabled !== null) {
            soundToggle.checked = soundsEnabled === 'true';
        }
        
        // Precision
        const savedPrecision = localStorage.getItem('stopwatchPrecision');
        if (savedPrecision !== null) {
            precision = parseInt(savedPrecision);
            precisionSelect.value = precision;
        }
        
        // Split Method
        const savedSplitMethod = localStorage.getItem('stopwatchSplitMethod');
        if (savedSplitMethod !== null) {
            splitMethodSelect.value = savedSplitMethod;
        }
        
        updateChartTheme();
    }
    
    // Initialize
    loadPreferences();
});