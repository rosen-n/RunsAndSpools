// Given a set of runs and a set of spools, which spools should be used
// to produce the least amount of waste
function readInputs(csvFile, startMakeUp, endMakeUp) {

    // Open the file reader
    let file = csvFile.files[0];
    let fileReader = new FileReader();
    fileReader.readAsText(file);
    fileReader.onload = function() {
        var totalMakeUp = atoi(startMakeUp) + atoi(endMakeUp);
        // Read in data
        var strRes = fileReader.result;

        // Pull out runs and trim empty data
        var runStr = strRes.substr(strRes.indexOf("run") + 4, strRes.length - (strRes.length - (strRes.indexOf("spool") - 6)));
        while (runStr.indexOf(",,") != -1) {
            runStr = runStr.substr(0, runStr.indexOf(",,"));
        }

        // Pull out spools and trim enpty data
        var spoolStr = strRes.substr(strRes.indexOf("spool") + 6, strRes.length - strRes.indexOf("spool") + 6);
        while (spoolStr.indexOf(",,") != -1) {
            spoolStr = spoolStr.substr(0, spoolStr.indexOf(",,"));
        }

        // Make Arrays
        var runArr = runStr.split(',');
        var spoolArr = spoolStr.split(',');

        // Determine which spools to use
        computeSpools(runArr, spoolArr, totalMakeUp, startMakeUp, endMakeUp);
    };

    // Errors are bad, but we need to know what they are
    fileReader.onerror = function() {
        alert("Error:" + fileReader.error);
    };
}

function computeSpools(runArr, spoolArr, tMakeUp, sMakeUp, eMakeUp) {
    // Add make-ups to run lengths
    for (n = 0; n < runArr.length; n++) {
        var run = runArr[n];
        runArr[n] = atoi(run) + tMakeUp;
    }

    // Match up runs to spools for minimum remainders

    // Prioritize smaller spools to use them up first
    // Sort arrays least -> greatest
    // Reverse runs for matching
    runArr.sort(compareNumeric)

    runArr.reverse();
    spoolArr.sort(compareNumeric);
    let wasteArr = new Array(spoolArr.length).fill(Array(runArr.length));
    var l = 0;
    let usedRunIndexArr = new Array(runArr.length);
    var m = 0;

    for (i = 0; i < spoolArr.length; i++) {
        // Start with the next spool length
        var slength = atoi(spoolArr[i]);
        var runTotal = 0, q = 1;
        var runsList = new Array(runArr.length);

        for (j = 0; j < runArr.length; j++) {
            // Skip if already used
            if (!usedRunIndexArr.includes(j)) {
                // Does the remaining amount match any specific
                // remaining run length?
                var matchInd = runArr.indexOf(slength - runTotal);
                var rlength = 0;
                if (matchInd > -1) {
                    rlength = runArr[matchInd];
                } else {
                    rlength = runArr[j];
                }

                // Grab the next rlength and see if it fits and
                // keep track of which run length we're using
                if (runTotal + rlength <= slength) {
                    runTotal = runTotal + rlength;
                    usedRunIndexArr[m++] = j;
                    runsList[q++] = rlength;
                } else {
                    // If it didn't fit, does the next one?
                    for (k = j + 1; k < runArr.length; k++) {
                        r2length = runArr[k];
                        if (!usedRunIndexArr.includes(k)) {
                            if (runTotal + r2length <= slength) {
                                runTotal = runTotal + r2length;
                                usedRunIndexArr[m++] = k;
                                runsList[q++] = r2length;
                            }
                        }
                    }
                }
            }
        }

        // Add which runs were used for this spool
        runsList[0] = slength - runTotal;
        wasteArr[l++] = runsList;
    }

    // Compile the output table and make it all pretty
    outputResult(wasteArr, spoolArr, tMakeUp, sMakeUp, eMakeUp);
}

function outputResult(wArr, sArr, tMakeUp, sMakeUp, eMakeUp) {
    // Table setup and first two rows to get the table started
    var html = "<table><tr><th>Spool Length</th>";

    for (o = 0; o < sArr.length; o++) {
        html = html + "<td>" + sArr[o] + "</td>";
    }
    html = html + "</tr><tr><th>Remainder</th>";

    for (p = 0; p < wArr.length; p++) {
        html = html + "<td>" + wArr[p][0] + "</td>";
    }
    html = html + "</tr><tr><th>Runs</th>";

    // Build out the table in terms of which runs are paired with which spools
    var s = 0, emptyCells = 0;
    for (r = 1; r < wArr[s].length; r++) {
        emptyCells = 1;

        for (s = 0; s < wArr.length; s++) {
            html = html + "<td>";
            if (wArr[s][r] != undefined) {
                // Add run info for this cell
                //html = html + (wArr[s][r] - tMakeUp) + "(" + sMakeUp + ")(" + eMakeUp + ")";
                html = html + wArr[s][r];
            } else {
                // Count the empty cells so we know if we have a blank row
                emptyCells++;
            }
            html = html + "</td>";

            // Fixes and issue with "Undefined" at the edge of the wArr array for
            // the for-loop
            if (s + 1 == wArr.length) {
                s = 0;
                break;
            }
        }

        // Trying to keep the table neat and removing extra rows/cells
        if (r + 1 == wArr[s].length) {
            html = html + "</tr>";
        } else if (emptyCells > wArr.length) {
            // We now have an empty row, so remove it
            var newlen = html.lastIndexOf("</tr>");
            html = html.substring(0, newlen + 5);
            break;
        } else {
            html = html + "</tr><tr><td></td>";
        }

    }
    html = html + "</table>"

    // Effectively "post" the resulting HTML/Table
    document.getElementById('result').innerHTML = html;
}


// Thank you to the internet for this comparison function
function compareNumeric(a, b) {
    if (a > b) return 1;
    if (a == b) return 0;
    if (a < b) return -1;
}

// Found at: 
// https://www.geeksforgeeks.org/javascript-program-to-write-your-own-atoi/
// A simple atoi() function
function atoi(str) {
    // Initialize result
        let res = 0;
   
        // Iterate through all characters
        // of input string and update result
        // take ASCII character of corresponding digit and
        // subtract the code from '0' to get numerical
        // value and multiply res by 10 to shuffle
        // digits left to update running total
        for (let i = 0; i < str.length; ++i) {
            res = res * 10 + str[i].charCodeAt(0) - '0'.charCodeAt(0);
        }
   
        // return result.
        return res;
}