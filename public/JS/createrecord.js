var x = document.getElementById('mytable');
var count = x.rows.length - 1

document.getElementById('moretextboxes').addEventListener("click", function(){
  
    
var new_row = x.rows[1].cloneNode(true);
var inp1 = new_row.cells[0].getElementsByTagName('input')[0];
inp1.name = "quantity_"+count;
var inp2 = new_row.cells[1].getElementsByTagName('select')[0];
inp2.name = "status_"+count;
var inp3 = new_row.cells[2].getElementsByTagName('input')[0];
inp3.name = "location_"+count;

x.appendChild(new_row);
count++;
});


