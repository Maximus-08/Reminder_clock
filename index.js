document.addEventListener('DOMContentLoaded', function() {
    // Create polar numbers
    const polarNumbersDiv = document.querySelector('.polar-numbers');
    for (let i = 0; i < 96; i++) {
        const numberDiv = document.createElement('div');
        numberDiv.className = 'number';
        
        // Calculate angle and radius
        const angle = i * 3.75; // 360 / 96 = 3.75 degrees per number
        numberDiv.style.transform = `rotate(${angle}deg)`;
        
        // Create number span
        const numberSpan = document.createElement('span');
        numberSpan.style.transform = 'rotate(90deg) translateX(-20px)';
        if (i % 5 === 0) {
            numberSpan.textContent = i;
            numberSpan.classList.add('highlight');
        } else {
            numberSpan.textContent = '.';
        }
        
        numberDiv.appendChild(numberSpan);
        polarNumbersDiv.appendChild(numberDiv);
    }
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format for datetime-local input
    const pad = num => num.toString().padStart(2, '0');
    const year = tomorrow.getFullYear();
    const month = pad(tomorrow.getMonth() + 1);
    const day = pad(tomorrow.getDate());
    const hours = pad(tomorrow.getHours());
    const minutes = pad(tomorrow.getMinutes());
    
    document.getElementById('targetDate').value = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    let countdownInterval;
    const countdownInfoDiv = document.getElementById('countdown-info');
    const timeDisplay = document.querySelector('.time-display');
    const availableTimeInfoDiv = document.getElementById('availableTimeInfo');
    
    // Activity time inputs
    const sleepTimeInput = document.getElementById('sleepTime');
    const choreTimeInput = document.getElementById('choreTime');
    const travelTimeInput = document.getElementById('travelTime');
    const workTimeInput = document.getElementById('workTime');
    const miscTimeInput = document.getElementById('miscTime');
    const totalDailyHoursSpan = document.getElementById('totalDailyHours');
    
    // Update total daily hours when inputs change
    function updateTotalDailyHours() {
        const sleepTime = parseFloat(sleepTimeInput.value) || 0;
        const choreTime = parseFloat(choreTimeInput.value) || 0;
        const travelTime = parseFloat(travelTimeInput.value) || 0;
        const workTime = parseFloat(workTimeInput.value) || 0;
        const miscTime = parseFloat(miscTimeInput.value) || 0;
        
        const totalHours = sleepTime + choreTime + travelTime + workTime + miscTime;
        totalDailyHoursSpan.textContent = totalHours.toFixed(1);
        
        // Warn if total hours exceeds 24
        if (totalHours > 24) {
            totalDailyHoursSpan.style.color = 'red';
        } else {
            totalDailyHoursSpan.style.color = '#6fbbdf';
        }
        
        // If countdown is running, update it
        if (countdownInterval) {
            updateCountdown();
        }
    }
    
    // Add event listeners to all activity inputs
    sleepTimeInput.addEventListener('input', updateTotalDailyHours);
    choreTimeInput.addEventListener('input', updateTotalDailyHours);
    travelTimeInput.addEventListener('input', updateTotalDailyHours);
    workTimeInput.addEventListener('input', updateTotalDailyHours);
    miscTimeInput.addEventListener('input', updateTotalDailyHours);
    
    // Initial update
    updateTotalDailyHours();
    
    // Update current time display
    function updateCurrentTimeDisplay() {
        const now = new Date();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
        
        document.querySelector('.day-name').textContent = dayNames[now.getDay()];
        document.querySelector('.month-name').textContent = monthNames[now.getMonth()];
        document.querySelector('.date-value').textContent = now.getDate();
        document.querySelector('.time-value').textContent = 
            `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        document.querySelector('.year-value').textContent = now.getFullYear();
    }
    
    // Initial time display update
    updateCurrentTimeDisplay();
    
    // Update time display every second
    setInterval(updateCurrentTimeDisplay, 1000);
    
    // Function to update an arc's clip path
    function updateArc(className, percentage) {
        // Make sure the percentage is between 0 and 100
        percentage = Math.max(0, Math.min(100, percentage));
        
        // Convert percentage to angle (0-360 degrees)
        const angle = 3.6 * percentage;
        
        // Calculate end coordinates for the clip path
        let clipPath;
        
        if (angle <= 90) {
            // First quadrant
            const x = 50 + 50 * Math.tan(angle * Math.PI / 180);
            clipPath = `polygon(50% 50%, 50% 0%, ${x}% 0%)`;
        } else if (angle <= 180) {
            // Second quadrant
            const y = 50 + 50 * Math.tan((angle - 90) * Math.PI / 180);
            clipPath = `polygon(50% 50%, 50% 0%, 100% 0%, 100% ${y}%)`;
        } else if (angle <= 270) {
            // Third quadrant
            const x = 50 - 50 * Math.tan((angle - 180) * Math.PI / 180);
            clipPath = `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, ${x}% 100%)`;
        } else {
            // Fourth quadrant
            const y = 50 - 50 * Math.tan((angle - 270) * Math.PI / 180);
            clipPath = `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${y}%)`;
        }
        
        document.querySelector(`.${className}`).style.clipPath = clipPath;
    }
    
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
              console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
              console.error('ServiceWorker registration failed:', error);
            });
        });
      }
      

    document.getElementById('startButton').addEventListener('click', function() {
        // Clear any existing interval
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        
        const targetDateInput = document.getElementById('targetDate').value;
        if (!targetDateInput) {
            countdownInfoDiv.textContent = 'Please select a date and time';
            return;
        }
        
        const targetDate = new Date(targetDateInput);
        countdownInfoDiv.textContent = `Target: ${targetDate.toLocaleString()}`;
        
          
        // Start the countdown
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
        
        function updateCountdown() {
            const currentTime = new Date();
            const timeDifference = targetDate - currentTime;
            
            if (timeDifference <= 0) {
                clearInterval(countdownInterval);
                document.getElementById('years-value').textContent = '0';
                document.getElementById('months-value').textContent = '0';
                document.getElementById('weeks-value').textContent = '0';
                document.getElementById('days-value').textContent = '0';
                document.getElementById('hours-value').textContent = '0';
                document.getElementById('minutes-value').textContent = '0';
                document.getElementById('seconds-value').textContent = '0';
                
                // Reset arcs
                updateArc('years-arc', 0);
                updateArc('months-arc', 0);
                updateArc('weeks-arc', 0);
                updateArc('days-arc', 0);
                updateArc('hours-arc', 0);
                updateArc('minutes-arc', 0);
                updateArc('seconds-arc', 0);
                
                countdownInfoDiv.textContent = 'Countdown complete!';
                availableTimeInfoDiv.textContent = 'Countdown complete!';
                return;
            }
            
            // Calculate time units
            const totalSeconds = Math.floor(timeDifference / 1000);
            const totalMinutes = Math.floor(totalSeconds / 60);
            const totalHours = Math.floor(totalMinutes / 60);
            const totalDays = Math.floor(totalHours / 24);
            
            // Calculate years, months, weeks, days
            let years = 0;
            let months = 0;
            let weeks = 0;
            let days = 0;
            let hours = 0;
            let minutes = 0;
            let seconds = 0;
            
            // Calculate remaining time units
            let tempDate = new Date(currentTime);
            
            // Count years
            while (true) {
                tempDate.setFullYear(tempDate.getFullYear() + 1);
                if (tempDate > targetDate) {
                    tempDate.setFullYear(tempDate.getFullYear() - 1);
                    break;
                }
                years++;
            }
            
            // Count months
            while (true) {
                tempDate.setMonth(tempDate.getMonth() + 1);
                if (tempDate > targetDate) {
                    tempDate.setMonth(tempDate.getMonth() - 1);
                    break;
                }
                months++;
            }
            
            // Calculate remaining days
            const remainingMs = targetDate - tempDate;
            const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
            
            // Calculate weeks and days
            weeks = Math.floor(remainingDays / 7);
            days = remainingDays % 7;
            
            // Calculate hours, minutes, seconds
            const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
            const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
            
            hours = remainingHours;
            minutes = remainingMinutes;
            seconds = remainingSeconds;
            
            // Update display
            document.getElementById('years-value').textContent = years;
            document.getElementById('months-value').textContent = months;
            document.getElementById('weeks-value').textContent = weeks;
            document.getElementById('days-value').textContent = days;
            document.getElementById('hours-value').textContent = pad(hours);
            document.getElementById('minutes-value').textContent = pad(minutes);
            document.getElementById('seconds-value').textContent = pad(seconds);
            
            // Update progress arcs
            updateArc('seconds-arc', (seconds / 60) * 100);
            updateArc('minutes-arc', (minutes / 60) * 100);
            updateArc('hours-arc', (hours / 24) * 100);
            updateArc('days-arc', (days / 7) * 100);
            updateArc('weeks-arc', (weeks / 4) * 100); // Approximating 4 weeks per month
            updateArc('months-arc', (months / 12) * 100);
            updateArc('years-arc', Math.min((years / 10) * 100, 100)); // Cap at 10 years for display
            
            // Calculate available time based on daily activities
            calculateAvailableTime(years, months, weeks, days, hours, minutes, seconds);
        }
        
        // Function to calculate real available time after subtracting daily activities
        function calculateAvailableTime(years, months, weeks, days, hours, minutes, seconds) {
            // Get daily committed hours
            const sleepTime = parseFloat(sleepTimeInput.value) || 0;
            const choreTime = parseFloat(choreTimeInput.value) || 0;
            const travelTime = parseFloat(travelTimeInput.value) || 0;
            const workTime = parseFloat(workTimeInput.value) || 0;
            const miscTime = parseFloat(miscTimeInput.value) || 0;
            
            const dailyCommittedHours = sleepTime + choreTime + travelTime + workTime + miscTime;
            const dailyAvailableHours = Math.max(0, 24 - dailyCommittedHours);
            
            // Convert everything to hours for calculation
            const totalDays = years * 365 + months * 30 + weeks * 7 + days; // Approximate
            let totalHours = totalDays * 24 + hours + minutes / 60 + seconds / 3600;
            
            // Calculate available hours (assuming dailyAvailableHours per day)
            const availableHours = totalDays * dailyAvailableHours + Math.min(hours, dailyAvailableHours);
            
            // Convert back to days/hours format
            const availableDays = Math.floor(availableHours / 24);
            const remainingAvailableHours = Math.floor(availableHours % 24);
            
            // Calculate percentage of time that's actually available
            const percentageAvailable = totalHours > 0 ? (availableHours / totalHours) * 100 : 0;
            
            // Build the display message
            let message = '';
            
            if (dailyCommittedHours > 24) {
                message = `<div style="color: #ff5555; font-weight: bold; margin-bottom: 10px;">
                    Warning: Your daily committed hours exceed 24 hours (${dailyCommittedHours.toFixed(1)} hrs/day)!
                </div>`;
            }
            
            message += `<div>Your daily committed time: ${dailyCommittedHours.toFixed(1)} hrs/day</div>
                <div>Your daily available time: ${dailyAvailableHours.toFixed(1)} hrs/day</div>
                <div style="margin-top: 10px;">Total countdown time: ${totalDays} days, ${hours} hrs</div>
                <div style="font-weight: bold; color: #6fbbdf; margin-top: 5px;">
                    Real available time: ${availableDays} days, ${remainingAvailableHours} hrs
                </div>
                <div style="margin-top: 10px;">Only <span style="color: #6fbbdf; font-weight: bold;">${percentageAvailable.toFixed(1)}%</span> of your countdown time is actually available for focused work</div>`;
            
            availableTimeInfoDiv.innerHTML = message;
        }
    });
    
    // Initial countdown setup
    document.getElementById('startButton').click();
});