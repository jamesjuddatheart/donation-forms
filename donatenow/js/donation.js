/*
	$('.donate-button').click(function() {
		$('.donate-button div.active').removeClass("active");
		$(this).find('.icon').addClass("active");
	});
*/

function showLevels(frequency,level) {
	$('input[name=level_id]').val(level);
	$('.radio-label').removeClass("active");
	if (frequency == "recurring") {
		$('.recurring').show()
			.addClass('display__inline-block')
			.removeClass('d-none')
			.removeAttr('style');
		$('.onetime').hide();
		$('input[name=gift]').removeAttr('checked');
		$('input[id=gift2]').click().attr('checked','checked').next('label').addClass('active');
		$('input[name=other_amount]').val(25);
		$('input[name=recurring]').val('true');
		jQuery("#consentWidgetDiv").show();
	} else {
		$('.recurring').hide();
		$('.onetime').show()
			.addClass('display__inline-block')
			.removeAttr('style');
		$('input[name=gift]').removeAttr('checked');
		if(location.href.indexOf("donatenow_lifeiswhy" > 0)) {
		    $('input[id=gift8]').click().attr('checked','checked').next('label').addClass('active');
		} else {
		    $('input[id=gift7]').click().attr('checked','checked').next('label').addClass('active');
		}
		$('input[name=other_amount]').val(100);
		$('input[name=recurring]').val('false');
		jQuery("#consentWidgetDiv").hide();
	}
	$('#giftOtherText').val('').removeClass('validDonation').valid();;
}

$('input[name=occurrence]').click(function(){
	console.log(this);
	showLevels($(this).data('frequency'),$(this).data("level"));
});

$('input[name="tribGift"]').click(function() {
  var honVal = $('input[name="tribGift"]:checked').val();
  $('input[name=is_hon_memorial]').val(honVal);
});

$('input[name=notification_first_name], input[name=notification_last_name]').blur(function() {
	$('input[name="tribute.notify.name.full"]').val($('input[name=notification_first_name]').val() + ' ' + $('input[name=notification_last_name]').val());
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

$( '#payment2' ).on('click',function () {
	// Populate hidden form fields with updated values
	$('#PaymentType').val('amazon');
	$('input[name=source]').val('AMAZON');
	$('input[name=payment_source]').val('AMAZON');
	$('input[name=extproc]').val('');
	$('input[name=method]').val('donate');

	$('#payment1form').hide();
	$('#payment2form').slideDown('slow');
	if ($('input[name=occurrence]:checked').data("frequency") == "recurring") {
	  $('input[name=level_id]').val($('input[name=occurrence]:first').data("level"));
	}
});
$( '#payment1' ).on('click',function () {
	// Populate hidden form fields with updated values
	$('#PaymentType').val('cc');
	$('input[name=source]').val('GENERAL');
	$('input[name=payment_source]').val('CC');
	$('input[name=extproc]').val('');
	$('input[name=method]').val('donate');

	$('#payment2form').hide();
	$('#payment1form').slideDown('slow');
	if ($('input[name=occurrence]:checked').data("frequency") == "recurring") {
	  $('input[name=level_id]').val($('input[name=occurrence]:checked').data("level"));
	}
});
$( '#payment3' ).on('click',function () {
	// Populate hidden form fields with updated values
	$('#PaymentType').val('cc');
	$('input[name=source]').val('PAYPAL');
	$('input[name=payment_source]').val('CC');
	$('input[name=extproc]').val('paypal');
	$('input[name=method]').val('startDonation');
	$('input[name=level_autorepeat]').val("true");
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
	if(this.value === "honor"){
		$(".honor").show();
		$(".memorial").hide();
    } else {
    		$(".memorial").show();
		$(".honor").hide();
    }
});

$('.frequency label, .tributeSel label, .paymentSel label, .cardSel label').keypress(function(e) {
    if(e.which == 13) {
	$(this).click();
   	$(this).prev('input').click();
    }
});

$('.radio-label').click(function(){
	$('#giftOtherText').val('').removeClass('validDonation');
	$('input[name=other_amount]').val($(this).data("amount"));
	$('#giftOtherText').valid();
});
$('.radio-label').keypress(function(e) {
    if(e.which == 13) {
	$(this).click();
	$(this).prev('input').click();
    }
});

$('.radio-input').blur(function(){
	if (this.value != "") {
		$(this).addClass('validDonation');
		$('input[name=other_amount]').val(this.value);
		$('#giftOtherText').valid();
	}
});
$('#AmazonPayButton').keypress(function(e) {
    if(e.which == 13) {
	$(this).find('img').click();
    }
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
