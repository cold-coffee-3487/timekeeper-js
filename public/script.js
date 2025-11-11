const VERSION = '1.0.0';

function strToTime(timeStr) {
    const splitTime = timeStr.split(' ');
    timeStr = splitTime[0];
    let [hours, minutes] = timeStr.split(':').map(Number);
    if (splitTime.length > 1) {        
        pmStr = splitTime[1].toUpperCase();
        if (pmStr === 'PM') {
            if (hours < 12) {
                hours += 12;
            }
        } else if (pmStr === 'AM') {
            if (hours === 12) {
                hours = 0;
            }
        } else {
            console.log('Invalid AM/PM specifier:', pmStr);
            return NaN;
        }
    }
        
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}

function deleteRow(button) {
    //console.log('Deleting row from table');
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function addRow() {
    //console.log('Adding row to table');
    const text1 = document.getElementById('input1').value;
    const text2 = document.getElementById('input2').value;
    
    if (text1.trim() === '' || text2.trim() === '') {
        alert('Please fill in both fields');
        return;
    }

    const startTime = strToTime(text1);
    const endTime = strToTime(text2);

    //console.log('Start Time:', startTime);
    //console.log('End Time:', endTime);

    if (isNaN(startTime) || isNaN(endTime)) {
        alert('Invalid time format. Please use HH:MM format.');
        return;
    }
    
    if (endTime <= startTime) {
        alert('End time must be after start time');
        return;
    }
    
    const tableBody = document.getElementById('tableBody');
    const newRow = tableBody.insertRow();
    newRow.insertCell(0).textContent = startTime.toLocaleTimeString();
    newRow.insertCell(1).textContent = endTime.toLocaleTimeString();
    // Get difference in milliseconds
    const diffMs = endTime - startTime;

    // Convert to hours and minutes
    const msToHours = 36.0E5
    const msToMinutes = 6.0E4
    const hours = Math.floor(diffMs / msToHours);
    const minutes = Math.floor((diffMs % msToHours) / msToMinutes);

    newRow.insertCell(2).textContent = hours.toString().padStart(2,'0') + ':'
     + minutes.toString().padStart(2, '0');
    newRow.insertCell(3).innerHTML = '<button onclick="deleteRow(this)">Delete</button>';
    
    // Clear inputs
    document.getElementById('input1').value = '';
    document.getElementById('input2').value = '';

    computeTotalTime();
}

function computeTotalTime() {
    //console.log('Computing total elapsed time');
    const tableBody = document.getElementById('tableBody');
    let totalMs = 0;

    for (let i = 0; i < tableBody.rows.length; i++) {
        const row = tableBody.rows[i];
        const startTimeStr = row.cells[0].textContent;
        const endTimeStr = row.cells[1].textContent;

        const startTime = strToTime(startTimeStr);
        const endTime = strToTime(endTimeStr);

        totalMs += (endTime - startTime);
    }

    //console.log('Total milliseconds:', totalMs);
    const msToHours = 36.0E5
    const msToMinutes = 6.0E4
    const totalHours = Math.floor(totalMs / msToHours);
    const totalMinutes = Math.floor((totalMs % msToHours) / msToMinutes);
    
    document.getElementById('total-elapsed-time').textContent =
     'Total Elapsed Time: ' + totalHours.toString().padStart(2,'0') + ':' +
     totalMinutes.toString().padStart(2,'0') + ' = ' + (totalMs / msToHours).toFixed(1) + ' hours';
}

function saveDataToCookie() {
    //console.log('Saving data to cookie');
    const tableBody = document.getElementById('tableBody');
    const input1 = document.getElementById('input1').value;
    const input2 = document.getElementById('input2').value;
    let data = {"txtEntries": [input1, input2], "tableEntries": []};

    for (let i = 0; i < tableBody.rows.length; i++) {
        const row = tableBody.rows[i];
        const startTimeStr = row.cells[0].textContent;
        const endTimeStr = row.cells[1].textContent;
        data.tableEntries.push({start: startTimeStr, end: endTimeStr});
    }

    // store as a persistent cookie, valid for the entire site
    // make a UTC date equal to 1 year from now
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = "timekeeperData=" + JSON.stringify(data) + ";expires=" + expiryDate.toUTCString() + ";path=/";
}

function loadDataFromCookie() {
    //console.log('Loading data from cookie');
    const cookies = document.cookie.split('; ');
    let timekeeperData = null;

    for (let cookie of cookies) {
        if (cookie.startsWith('timekeeperData=')) {
            timekeeperData = JSON.parse(cookie.split('=')[1]);
            break;
        }
    }

    if (timekeeperData) {
        for (let entry of timekeeperData.tableEntries) {
            document.getElementById('input1').value = entry.start;
            document.getElementById('input2').value = entry.end;
            addRow();
        }

        document.getElementById('input1').value = timekeeperData.txtEntries[0];
        document.getElementById('input2').value = timekeeperData.txtEntries[1];
    }
}

function clearData() {
    //console.log('Clearing table data and cookie');
    const tableBody = document.getElementById('tableBody');
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }
    document.cookie = "timekeeperData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.getElementById('total-elapsed-time').textContent = 'Total Elapsed Time: None';
}  

window.onload = function() {
    loadDataFromCookie();
    document.getElementById('version-info').textContent = 'Version: ' + VERSION;
};

window.onbeforeunload = function() {
    saveDataToCookie();
};