document.getElementById("update-button").addEventListener("click", function() {
    // Use AJAX to retrieve the JSON object from the PHP file
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            var tableBody = document.getElementById("rank-table-body");
            var count = 0;

        // Clear the existing rows from the table
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }
            // Loop through the data and add it to the table
            for (var i = 0; i < 10; i++) {
                var row = document.createElement("tr");
                count++;
                row.innerHTML = "<td>" + count + "</td>" +
                                "<td>" + data[i].name + "</td>" +
                                "<td>" + data[i].point + "</td>" +
                                "<td>" + data[i].creation + "</td>";
                tableBody.appendChild(row);
            }
        }
    };
    xhr.open("GET", "/db-php/connDB.php", true);
    xhr.send();
});