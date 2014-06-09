var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

$(document).ready(function() {
	$('#date').text(new Date().toLocaleDateString());
	var thisMonth = new Date().getMonth() + 1;
	var thisYear = new Date().getFullYear();
	var info = GetInfo(thisMonth, thisYear);
	$('#list-this-month').html(info[0]);
	$('#month').val(thisMonth - 1);
	$('#year').val(thisYear);
	$('#this-month-mileage').text($('#month option:selected').text() + ' ' + $('#year').val() + ': ' + info[1] + ' mi');
	SetupEmailLink();
	$('#submit').click(OnButtonClick);
	$('body').on('click', '.row', OnDataRowClick);
	$('#update-date').click(OnUpdateDateClick)
});

function OnButtonClick() {
	var startingVal = $('#starting').val();
	var endingVal = $('#ending').val();
	var milesVal = $('#miles').val();
	var dateKey = GetDateKeyFromDate(new Date());
	ValidateAndStore(startingVal, endingVal, milesVal, dateKey);
	$('#result').text('Total: ' + localStorage[dateKey] + ' miles').show();
}

function OnDataRowClick() {
	$('input', '#back-fill-form').val('');
	var milesNum = $('.miles-number', this).text();
	if(milesNum != 0)
		$('.miles', '#back-fill-form').val(milesNum);
	$('.date', '#back-fill-form').val($('.date-key', this).val());
	var date = $('.date', this).text();
	$('#back-fill-form').dialog({
		title: date,
		modal: true,
		resizable: false,
		draggable: false,
		buttons: [ {
			text: "Submit",
			class: "btn",
			click: function() {
				var startingVal = $('.starting', this).val();
				var endingVal = $('.ending', this).val();
				var milesVal = $('.miles', this).val();
				var dateKey = $('.date', this).val();
				ValidateAndStore(startingVal, endingVal, milesVal, dateKey);
				$(this).dialog('close');
			}
		} ]
	});
}

function OnUpdateDateClick() {
	var month = parseInt($('#month').val()) + 1;
	var year = parseInt($('#year').val());
	var info = GetInfo(month, year);
	$('#list-this-month').html(info[0]);
	$('#this-month-mileage').text($('#month option:selected').text() + ' ' + $('#year').val() + ': ' + info[1] + ' mi');
	SetupEmailLink();
}

function ValidateAndStore(startingVal, endingVal, milesVal, dateKey) {
	if (ValidateInput(startingVal, endingVal, milesVal)) {
		if (milesVal != "") {
			var milesGiven = parseInt(milesVal, 0);
			StoreMileage(dateKey, milesGiven);
		} else {
			var startingMi = parseInt(startingVal, 0);
			var endingMi = parseInt(endingVal, 0);
			if (ValidateMileageValues(startingMi, endingMi))
				StoreMileage(dateKey, endingMi - startingMi);
		}
	}
}

function GetDateKeyFromDate(date) {
	return date.getFullYear() + "." + (date.getMonth() + 1) + "." + date.getDate();
}

function ValidateInput(starting, ending, miles) {
	if (!(starting == "" && ending == "" && miles == "") || miles != "") {
		return true;
	} else {
		alert("No, no. You've got to give me something to work with.");
		return false;
	}
}

function ValidateMileageValues(startingMi, endingMi) {
	if (endingMi < startingMi) {
		alert('Oh, dear.. Your ending mileage is lower than your starting mileage. I think you did something wrong.');
		return false;
	} else return true;
}

function StoreMileage(date, total) {
	localStorage[date] = total;
	OnUpdateDateClick();
}

// month is 1-based here
function GetInfo(month, year) {
	var pastDataHtml = "";
	var daysInMth = daysInMonth(month, year);
	var day = new Date(year, month - 1, 1);
	var totalMileage = 0;
	for (var i = 0; i < daysInMth; i++) {
		var dateKey = GetDateKeyFromDate(day);
		var miles = localStorage[dateKey];
		if (miles == null || miles == 'NaN') miles = 0;
		pastDataHtml +=
			'<div class="row" onclick="">' +
				'<div class="date">' +
					day.toLocaleDateString() +
					'<input type="hidden" class="date-key" value="' + dateKey + '">' +
				'</div>' +
				'<div class="mileage"><span class="miles-number">' + miles + '</span> miles</div>' +
			'</div>';
		day.setDate(day.getDate() + 1);
		totalMileage = totalMileage + parseInt(miles, 0);
	}
	return new Array(pastDataHtml, totalMileage);
}

function SetupEmailLink() {
	var subject = encodeURIComponent('Mileage for '
		+ monthNames[parseInt($('#month').val())] + ' '
		+ parseInt($('#year').val()));
	var body = encodeURIComponent('<b>' + $('#this-month-mileage').text() + '</b>');
	$('#email').attr('href', 'mailto:?Subject=' + subject + '&Body=' + body);
}

// month is 1-based here
function GetKeysForMonth(month) {
	var year = new Date().getFullYear();
	var daysInMth = daysInMonth(month, year);
	var arr = new Array();
	for (var i = 1; i <= daysInMth; i++) {
		var day = new Date(year, month - 1, i);
		arr[i-1] = GetDateKeyFromDate(day);
	}
	return arr;
}

// month is 1-based here
function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}