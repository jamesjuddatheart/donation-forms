/*
	$('.donate-button').click(function() {
		$('.donate-button div.active').removeClass("active");
		$(this).find('.icon').addClass("active");
	});
*/
/* build country dropdown */
var selhtml = "";
var countryList = {};
jQuery("select#country option, select#billingCountry option").remove();
jQuery.getJSON("/donation-form-data/country_code_key.txt",function(data){
	jQuery.each(data,function(index,country) {
		countryList[country["countryname"]] = country["countrycode"];
		selhtml += '<option value="' + country["countryname"] + '" ' + ((country["countryname"] == "United States") ? "selected" : "") + '>' + country["countryname"] + '</option>';
	});
	jQuery("select#country, select#billingCountry").append(selhtml);
});

jQuery("select#country").change(function(){
	jQuery("select#state option, select#donorState option, select#billingState option").remove();
	var statehtml = "<option value=''>Please select</option>";
	jQuery.getJSON("/donation-form-data/country_" + countryList[this.value] + ".txt",function(data){
	   jQuery.each(data,function(index,state) {
	      statehtml += "<option value='" + state + "'>" + state + "</option>";
	   });
	   statehtml += "<option value='none'>N/A</option>";
	   jQuery("select#state, select#donorState, select#billingState").append(statehtml);
	});
});

function showLevels(frequency,level) {
	$('input[name=level_id]').val(level);
	$('.radio-label').removeClass("active");
	if (frequency == "recurring") {
		$('.recurring').show()
			.addClass('display__inline-block')
			.removeClass('d-none')
			.removeAttr('style');
		if (!$('.radio-applepay').hasClass("hidden")) {
			$('.radio-applepay').hide();
			$('.radio-venmo').hide();
		}
		$('.onetime').hide();
		// hide Amazon monthly option and select CC
		$('.radio-amazon, .radio-googlepay').css('cssText', 'display: none !important');
		$('#payment1').click();
		$('input[name=gift]').removeAttr('checked');
		$('input[id=gift2]').click().attr('checked','checked').next('button').addClass('active');
		$('input[name=other_amount]').val(25);
		$('input[name=recurring]').val('true');
		jQuery("#consentWidgetDiv").show();
	} else {
		$('.recurring').hide();
		$('.onetime').show()
			.addClass('display__inline-block')
			.removeAttr('style');
		// Show Amazon if enabled
		$('.radio-amazon, .radio-googlepay').css('cssText', '');
		if (!$('.radio-applepay').hasClass("hidden")) {
			$('.radio-applepay').show();
			$('.radio-venmo').show();
		}
		$('input[name=gift]').removeAttr('checked');
		if(location.href.indexOf("donatenow_lifeiswhy") > 0) {
			$('input[id=gift7]').click().attr('checked','checked').next('button').addClass('active');
			$('input[name=other_amount]').val(10);
		} else if(location.href.indexOf("jan19_ecc_appeal") > 0) {
		    $('input[id=gift5]').click().attr('checked','checked').next('button').addClass('active');
		    $('input[name=other_amount]').val(10);
		} else {
		    $('input[id=gift7]').click().attr('checked','checked').next('button').addClass('active');
		    // $('input[name=other_amount]').val(100);
		    $('input[name=other_amount]').val($('button[for=gift7]').data('amount'));
		}
		$('input[name=recurring]').val('false');
		jQuery("#consentWidgetDiv").hide();
	}
	$('#giftOtherText').val('').removeClass('validDonation').valid();
	updateSubmitText();
}

$('input[name=occurrence]').click(function(){
	console.log(this);
	showLevels($(this).data('frequency'),$(this).data("level"));
});

$('input[name="tribGift"]').click(function() {
  var honVal = $('input[name="tribGift"]:checked').val();
  $('input[name=is_hon_memorial]').val(honVal);
  if (honVal == "true") {
    $('input[name="tribute.type"]').val("Tribute");
  } else {
    $('input[name="tribute.type"]').val("");
  }
});

$('input[name=notification_first_name], input[name=notification_last_name]').blur(function() {
	$('input[name="tribute.notify.name.full"]').val($('input[name=notification_first_name]').val() + ' ' + $('input[name=notification_last_name]').val());
	$('input[name="shipping.name.first"]').val($('input[name=notification_first_name]').val());
	$('input[name="shipping.name.last"]').val($('input[name=notification_last_name]').val());
	$('input[name="recipient_first_name"]').val($('input[name=notification_first_name]').val());
	$('input[name="recipient_last_name"]').val($('input[name=notification_last_name]').val());
});

$('input[name="tribute.honoree.name.first"], input[name="tribute.honoree.name.last"]').blur(function() {
	var honorFirst = $('input[name="tribute.honoree.name.first"]').val()
	var honorLast = $('input[name="tribute.honoree.name.last"]').val()
	$('input[name="honoree_first_name"]').val(honorFirst);
	$('input[name="honoree_last_name"]').val(honorLast);
	if ($('#tributeType').val()=="memorial"){
		$('input[name="ecard.subject"]').val("In memory of " + honorFirst + ' ' + honorLast);
	} else {
		$('input[name="ecard.subject"]').val("In honor of " + honorFirst + ' ' + honorLast);
	}
});

function noFocus() {
  $("body").on("mousedown", "*", function(e) {
    if (($(this).is(":focus") || $(this).is(e.target)) && $(this).css("outline-style") == "none") {
      $(this).css("outline", "none").on("blur", function() {
        $(this).off("blur").css("outline", "");
      });
    }
  });
};

// when text input with radio is selected
/*
$( 'input[type="radio"]' ).siblings( '.radio-input' ).focus(function() {
  // Check radio
  $(this).siblings('input[type="radio"]').prop( "checked", true );
  // check for key strokes
  $(this).on("keypress keyup blur",function (event) {
    // adds value from text input into radio value
    var input = $(this).val();
    $(this).siblings('input[type="radio"]').val('$' + input);
  });
});
*/
$( 'input[type="radio"]' ).siblings( '.radio-input' ).blur(function() {
	if (this.value != "") {
		// Check radio
		$(this).siblings('input[type="radio"]').prop( "checked", true );
		// adds value from text input into radio value
		var input = $(this).val();
		$(this).siblings('input[type="radio"]').val('$' + input);
	}
});

// updates preview window with image selected in radio button
$( document ).on('click', '.selection input[type="radio"]', function () {
  var newSrc =  $(this).siblings('label').children('img').attr('src');
  $( '.preview-window img' ).attr('src',  newSrc )
});

// add class selected when clicked to be pulled
$( '.card-selection button' ).on('click',function ( e ) {
  e.preventDefault();
  $('.card-selection button').removeClass('selected');
  $(this).addClass('selected');
});

// grabs image from modal if selected and adds to radio buttons and preview window
$( '#emailCardCta' ).on('click', function () {

    if( $( '.card-selection button' ).hasClass('selected') ) {
      var imgName = $('button.selected').attr('name');
      var imgSrc = $('button.selected').children('img').attr('src')

      if( $( '.emailaCard .selection #' + imgName ).length === 0 ) {

        //removed last radio and adds new one from modal
        $( '.emailaCard .selection input[type="radio"]' ).last().parent('.input-group').remove();
        //prepend new radio button
        $( '.emailaCard .selection .row' ).prepend(
          '<div class="input-group col-xs-4 col-sm-6">' +
            '<input type="radio" name="design" id="' + imgName +'" value=" '+ imgName + '"/>' +
            '<label for="' + imgName + '"><img src="' + imgSrc + '" alt="" class="img-responsive" /></label>'+
          '</div>'
        );
      }
      $( '.emailaCard .selection #' + imgName ).click();
    }
});

$('#tribGift1').on('click',function () {
	$('.tributeSection').slideDown('slow');
});

$('#tribGift2').on('click',function () {
	$('.tributeSection').slideUp('slow');
	$('#card_option').val('No Card');
});

$('input[name="ecard.send"]').click(function(event) {
	var crd = $('#card_option');
	switch(event.target.id) {
		case "emailaCard":
			crd.val('eCard');
			break;
		case "mailaPrintedCard":
			crd.val('Mail Card');
			break;
		default:
			crd.val('No Card');
	}
});

$( '#differentBilling' ).on('click',function () {
  var billingInfo = $('#billingInfo');
  if ( $(this).is(':checked') ) {
    billingInfo.slideDown( 'slow' );
  } else {
    billingInfo.slideUp( 'slow' );
  }
});

$( '.dropdown input[type="radio"]' ).each( function(){

  var drop = $(this).attr('id');
  var innerFormGroup = $('.inner-form-group');

  $(this).on( 'click', function(){
    innerFormGroup.hide();
    $( '.inner-form-group.' + drop ).slideDown('slow');
    if( $(this).parent().hasClass('none') ){
      innerFormGroup.hide();
    }
  });
});


$( '#payment2' ).on('click', function () {
	// Populate hidden form fields with updated values
	$('#PaymentType').val('amazon');
	$('input[name=payment_source]').val('AMAZON');
	$('input[name=offline_payment_method]').val('cash');
	$('input[name=extproc]').val('');
	$('input[name=method]').val('donate');

	$('#payment1form').hide();
	$('#payment2form').slideDown('slow');
	if ($('input[name=occurrence]:checked').data("frequency") == "recurring") {
	  $('input[name=level_id]').val($('input[name=occurrence]:first').data("level"));
	}
});
$( '#payment1' ).on('click', function () {
	// Populate hidden form fields with updated values
	$('#PaymentType').val('cc');
	$('input[name=payment_source]').val('CC');
	$('input[name=offline_payment_method]').val('');
	$('input[name=extproc]').val('');
	$('input[name=method]').val('donate');

	$('#payment2form').hide();
	$('#payment1form').slideDown('slow');
	if ($('input[name=occurrence]:checked').data("frequency") == "recurring") {
	  $('input[name=level_id]').val($('input[name=occurrence]:checked').data("level"));
	}
});
$( '#payment3' ).on('click', function () {
	// Populate hidden form fields with updated values
	$('#PaymentType').val('cc');
	$('input[name=payment_source]').val('CC');
	$('input[name=offline_payment_method]').val('');
	$('input[name=extproc]').val('paypal');
	$('input[name=method]').val('startDonation');
	$('input[name=level_autorepeat]').val("true");
	$('#payment1form, #payment2form').hide();
	if ($('input[name=occurrence]:checked').data("frequency") == "recurring") {
	  $('input[name=level_id]').val($('input[name=occurrence]:checked').data("level"));
	}
	updatePayPalSuccessUrl();
});

$( '#payment4' ).on('click',function () {
	// Populate hidden form fields with updated values
	$('input[name=PaymentType]').val('APPLEPAY');
	$('input[name=payment_source]').val('APPLEPAY');
	$('input[name=offline_payment_method]').val('cash');
	$('input[name=extproc]').val('');
	$('input[name=method]').val('donate');
	$('#payment1form, #payment2form').hide();
	if ($('input[name=occurrence]:checked').data("frequency") == "recurring") {
	  $('input[name=level_id]').val($('input[name=occurrence]:checked').data("level"));
	}
});

$( '#payment5' ).on('click',function () {
	// Populate hidden form fields with updated values
	$('input[name=PaymentType]').val('VENMO');
	$('input[name=payment_source]').val('VENMO');
	$('input[name=offline_payment_method]').val('cash');
	$('input[name=extproc]').val('');
	$('input[name=method]').val('donate');
	$('#payment1form, #payment2form').hide();
	if ($('input[name=occurrence]:checked').data("frequency") == "recurring") {
	  $('input[name=level_id]').val($('input[name=occurrence]:checked').data("level"));
	}
});

$( '#payment6' ).on('click',function () {
	// Populate hidden form fields with updated values
	$('input[name=PaymentType]').val('GOOGLEPAY');
	$('input[name=payment_source]').val('GOOGLE PAY');
	$('input[name=offline_payment_method]').val('cash');
	$('input[name=extproc]').val('');
	$('input[name=method]').val('donate');
	$('#payment1form, #payment2form').hide();
	if ($('input[name=occurrence]:checked').data("frequency") == "recurring") {
	  $('input[name=level_id]').val($('input[name=occurrence]:checked').data("level"));
	}
});

$('select[name=msgPrefillEcard]').change(function(){
	$('textarea[name="ecard.message"]').val(this.value);
});
$('select[name=msgPrefillMail]').change(function(){
	$('textarea[name="tribute.message.body"]').val(this.value);
});

var maxLength = 250;
$('textarea').keyup(function() {
	var length = $(this).val().length;
	var length = maxLength-length;
	$('.msgLimitEcard').text(length);
});

$('#tributeType').on('change', function () {
  var honorFirst = $('input[name="tribute.honoree.name.first"]').val();
  var honorLast = $('input[name="tribute.honoree.name.last"]').val();
  if(this.value === "honor"){
    $(".honor").show();
    $(".memorial").hide();
    $('input[name="tribute.type"]').val("Tribute");
    $("#imgSampleHonor").show();
	$("#imgSampleMemorial").hide();
	$('input[name="ecard.subject"]').val("In honor of " + honorFirst + ' ' + honorLast);
  } else {
	$(".memorial").show();
    $(".honor").hide();
    $('input[name="tribute.type"]').val("Memorial");
    $("#imgSampleHonor").hide();
	$("#imgSampleMemorial").show();
	$('input[name="ecard.subject"]').val("In memory of " + honorFirst + ' ' + honorLast);
  }
});

$('.frequency label, .tributeSel label, .paymentSel label, .cardSel label').keypress(function(e) {
    if(e.which == 13 || e.which == 32) {
	$(this).click();
   	$(this).prev('input').click();
    }
});

$('.radio-label').click(function(){
	$('#giftOtherText').val('').removeClass('validDonation');
	$('input[name=other_amount]').val($(this).data("amount"));
	$('#giftOtherText').valid();
	$('.radio-label').removeClass("active");
	$(this).addClass("active");
	updateSubmitText();
});
$('.radio-label').keypress(function(e) {
    if(e.which == 13) {
	$(this).click();
	$(this).prev('input').click();
	updateSubmitText();
    }
});

$('.radio-input').blur(function(){
	if (this.value != "") {
		$(this).addClass('validDonation');
		$('input[name=other_amount]').val(this.value);
		$('#giftOtherText').valid();
		$('.radio-label').removeClass("active");
		$(this).addClass("active");
		updateSubmitText();
	}
});
$('#AmazonPayButton').keypress(function(e) {
    if(e.which == 13) {
	$(this).find('img').click();
    }
});

// update paypal success url
function updatePayPalSuccessUrl(){
	let params = "&city=" + encodeURI($('#city').val()) +
		"&state=" + $('#state').val() +
		"&email=" + encodeURI($('#emailAddress').val()) +
		"&first=" + encodeURI($('#firstName').val()) +
		"&last=" + encodeURI($('#lastName').val()) +
		"&ddCompanyId=" + jQuery('input[name=doublethedonation_company_id]').val();
	let successURL = $('input[name=finish_success_redirect]').val();
	const len = successURL.indexOf("&city");
	if (len > 0){
		successURL = successURL.substring(0, len);
	}
	successURL = successURL + params;
	$('input[name=finish_success_redirect]').val(successURL);
}

$('#donorState').change(function(){
   $('input[name="donor.address.state"]').val($(this).find('option:selected').val());
   $('input[name="billing.address.state"]').val($(this).find('option:selected').val());
   $('#billingStatex').val($(this).val());
});
$('#billingStatex').change(function(){
   $('input[name="billing.address.state"]').val($(this).find('option:selected').val());
});
$('select#countryx').change(function(){
   if ($(this).val() != "United States") {
	$('.input-group.state').addClass('hidden');
	$('.input-group.province').removeClass('hidden');
	$('.input-group.bstate').addClass('hidden');
	$('.input-group.bprovince').removeClass('hidden');
   } else {
	$('.input-group.province').addClass('hidden');
	$('.input-group.state').removeClass('hidden');
		$('.input-group.bprovince').addClass('hidden');
	$('.input-group.bstate').removeClass('hidden');
   }
});
$('select#billingCountryx').change(function(){
   if ($(this).val() != "United States") {
	$('.input-group.bstate').addClass('hidden');
	$('.input-group.bprovince').removeClass('hidden');
   } else {
	$('.input-group.bprovince').addClass('hidden');
	$('.input-group.bstate').removeClass('hidden');
   }
});

function updateSubmitText() {
	if(location.href.indexOf("donatenow_legacy_tyson") > 0) {
		$('#donate-submit').text('Submit');
	} else {
		amt = $('input[name=other_amount]').val();
		occurrence = $('input[name=occurrence]:checked').data('frequency');
		if (occurrence == 'annual') {
			freq = 'Annually';
		} else if (occurrence == 'recurring') {
			freq = 'Monthly';
		} else {
			freq = 'Now';
		}
		submit = $('#donate-submit');
		submit.text('Give $'+ amt + ' ' + freq);
	}
}
updateSubmitText();

// Set the donation amount
function populateAmount(amount) {
	// select appropriate option - onetime vs recurring gift arrays
	const giftButton = $('button[data-amount=' + amount + ']');
	const giftButtonVisible = $(giftButton).parent().parent().attr('style') != "display: none;" && giftButton.length;
	if(giftButtonVisible) {
		$(giftButton).click();
	} else {
		$('.radio-label').removeClass("active");
		$('input[name="gift"]').removeAttr('checked').prop("checked", false);
		$('#giftOtherText').addClass("active").valid();
		$('#giftOtherText, input[name=other_amount]').val(amount);
		updateSubmitText();
	}
}

const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 2
});

$('.amount-input').blur(function(){
	if (this.value != "") {
		this.value=this.value.replace('.00', '').replace('$','').replace(',','');
		$('input[name=other_amount]').val(this.value);
		jQuery("#giftOtherText").val(formatter.format(this.value));
	}
});

// Double the Donation Widget
if(!window.doublethedonation) {
	jQuery("#dd-company-name-input").html("<div class='form-row'><div class='form-content'><input type='text'/></div></div>");
}
jQuery(document).on("doublethedonation_company_id", function () {
	var dtd_company_id = jQuery('input[name="doublethedonation_company_id"]').val();
	// jQuery("#double_the_donation_company_idhidden").val(dtd_company_id);
	jQuery("#double_the_donation_company_id").val(dtd_company_id);
});

jQuery('.donation-level-user-entered input').attr("placeholder","Amount").after("<div class='other-amt-note'><em>$25 minimum donation</em></div>");

jQuery('.donation-level-container').click(function(){
  jQuery('.donation-level-container').removeClass('active');
  jQuery('.formMessage p').removeClass('active');
  jQuery('.donation-level-container input[type=radio]').attr("aria-checked","false");
  jQuery(this).find('input[type=radio]').attr("aria-checked","true");
  jQuery(this).addClass('active');
  for (var x=0;x<10;x++) {
    if($(this).hasClass('level'+x)){
       var level = 'level'+x;
       if(jQuery('.donation-level-container.active').hasClass('level'+x)) {
	   jQuery('.formMessage .level'+x).addClass('active');
       }
       break;
    }
  }

  //check last entry to see if active
  jQuery('.donation-level-user-entered').hide();
  if(jQuery('.enterAmt.active').hasClass('level'+x)) {
    jQuery('.donation-level-user-entered').show();
  }
}

document.cookie="level="+level;
//var amt = $(this).find('.donation-level-amount-container').text();
//$('.donateSubmit').text('Donate '+amt);

});
/*
$('#tributeType input[name^="year"]').click(function() {
  var radioval = $(this).val();
  var price = $('.price .' + radioval);

  // trigger radio button
  $( '.radio-group input[value='+ radioval +']' ).prop("checked", true);

  // show hide price section
  if( price.hasClass( 'hidden' ) ) {
    price.removeClass( 'hidden' );
    price.siblings().addClass( 'hidden' );
  }
});
*/
/* dynamically add tabindexs for accessibility */
/*
$("input:visible, select, input + label").not(':hidden').each(function (i) { 
	$(this).attr('tabindex', i + 1);
});
*/
