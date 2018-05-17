/* Total Donations ticker */

var startDate = new Date("11/25/2015");

//var startDate = new Date("11/25/2015");

var endDate = new Date("1/1/2016");

var finalEndDate = new Date("1/1/2016"); 

var today = new Date();	 

$(document).ready(function(){ 

if (today >= startDate  && today <= endDate){

//if (getCookieInfo('firstHit') == null) {

// setCookieInfo('firstHit', 'true', endDate);

if (getCookieInfo('aftEndDate') == null) {

document.cookie="aftEndDate=JavaScript Kit"+'; path=/'; 

$.colorbox({scrolling:false, closeButton:false, width:"692px",height:"470px",inline:true,href:"#lightbox_container",

onClosed:function(){ }

});

}

}else if(today > endDate  && today<= finalEndDate){

if (getCookieInfo('aftEndDate') == null) {

document.cookie="aftEndDate=JavaScript Kit"+'; path=/'; 

$.colorbox({scrolling:false, closeButton:false, width:"692px",height:"470px",inline:true,href:"#lightbox_container",

onClosed:function(){ }

});

}

}  

$.ajax({

dataType: 'jsonp',

data: '',

jsonp: 'jsonp_callback',

url: 'https://zurigroup2.com/aha/lightbox/get_totals.php',

success: function (data) {

$("#lb_therm_goal").html('$'+data.goal_friendly);

$("#lb_therm_raised").html('$'+data.raised_friendly);

var pct = data.percent;

var max_width = 325;

var fill_width = parseInt(max_width) * (pct/100);

$('#lb_therm_bar').html(pct+'%');

$('#lb_therm_bar').css('width',fill_width+'px');

}

});

$("input[name='amount'][value='other']").click(function(){

var thisval = $("#lb_amt_other").val();

if(thisval.toLowerCase()=='other'){

$("#lb_amt_other").val('');

}

});

$("#lb_amt_other").bind("focus",function(){

var thisval = $(this).val();

if(thisval.toLowerCase()=='other'){

$(this).val('');

$("input[name='amount'][value='other']").attr('checked',true);

}

});

$("#lb_amt_other").bind("blur",function(){

var thisval = $(this).val();

if(thisval.toLowerCase()==''){

$(this).val('OTHER');

$("input[name='amount'][value='other']").attr('checked',false);

}

});

$("#lb_give_btn").click(function(){

var selected_amt = $("input[name='amount']:checked").val();

if(selected_amt.toLowerCase()=='other'){

selected_amt = $("input[name='lb_amt_other']").val();

}

if($.isNumeric(selected_amt)==false){

alert('Please enter a numeric value');

return false;

}else{

window.location = 'https://donatenow.heart.org/yearend/?amount='+selected_amt;

return false;

}

});

});

function addCommas(nStr){

nStr += '';

x = nStr.split('.');

x1 = x[0];

x2 = x.length > 1 ? '.' + x[1] : '';

var rgx = /(\d+)(\d{3})/;

while (rgx.test(x1)) {

x1 = x1.replace(rgx, '$1' + ',' + '$2');

}

return x1 + x2;

}

function cbClose(){

$.colorbox.close();

}

function setCookieInfo (name,value,expires) {

document.cookie = name + "=" + escape (value) +

((expires) ? "; expires=" + expires.toGMTString() : "");

}	

function getCookieVal (offset) {

var endstr = document.cookie.indexOf (";", offset);

if (endstr == -1) { endstr = document.cookie.length; }

return unescape(document.cookie.substring(offset, endstr));

}

function getCookieInfo(name) {

var arg = name + "=";

var alen = arg.length;

var clen = document.cookie.length;

var i = 0;

while (i < clen) {

var j = i + alen;

if (document.cookie.substring(i, j) == arg) {

return getCookieVal (j);

}

i = document.cookie.indexOf(" ", i) + 1;

if (i == 0) break; 

}

return null;

}
