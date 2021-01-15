var authRequest;

/** BEGIN AMAZON PAY BUTTON **/
OffAmazonPayments.Button( "AmazonPayButton", "A1ZM7MXG16NQQB", {
	type: "PwA",
	// size: "small",

	// two new parameters
	useAmazonAddressBook: false,
	agreementType: 'BillingAgreement',

	// new callback
	onSignIn: function (contract) {
		amazon.Login.AmazonBillingAgreementId = contract.getAmazonBillingAgreementId();
		jQuery("input[name=AmazonBillingAgreementId]").val(amazon.Login.AmazonBillingAgreementId);		

		// render wallet widget code moved from authorize callback		
		// Wallet Widget for recurring payments
		amazon.Login.MODRenderWalletWidget();
	},
	
	authorization: function() {
		loginOptions = {scope: "profile postal_code payments:widget payments:billing_address", popup:true};
		authRequest = amazon.Login.authorize(loginOptions, function(response) { // Callback after login
			if (response.error) {
				alert('oauth error ' + response.error);
				return;
			}
			
			jQuery("#AmazonLogin").hide();
			jQuery("#AmazonPayButton").hide();
			jQuery("#AmazonLogoutButton").show();
			jQuery("#walletWidgetDiv").show();	
			jQuery("#consentWidgetDiv").show();
			
			// Populate submit form with response.access_token
			jQuery("input[name=AmazonAccessToken]").val(response.access_token);
			
			amazon.Login.retrieveProfile(response.access_token,amazon.Login.MODretrieveProfileCallback); // Retrive Amazon user's profile information
		});
	},
	
	onError: function(error) {
		// your error handling code
	}
} );
/** END AMAZON PAY BUTTON **/

/** BEGIN WALLET WIDGET **/
amazon.Login.MODRenderWalletWidget = function() {
	new OffAmazonPayments.Widgets.Wallet( {
		sellerId: 'A1ZM7MXG16NQQB',
		
		agreementType: "BillingAgreement",
		
		// Bind billing agreement ID
		amazonBillingAgreementId: amazon.Login.AmazonBillingAgreementId,

		onPaymentSelect: function(orderReference) {
			// RENDER CONSENT WIDGET IF MOD RECURRING CHECKBOX CHECKED
			if ( $("input[name=occurrence]:checked").val() == "Monthly Gift" ) {
				jQuery("#consentWidgetDiv").show();
			} else {
				jQuery("#consentWidgetDiv").hide();
			}
			
			amazon.Login.MODRenderRecurringPaymentsWidget();

			getAmazonAddress();
			//console.log(amazon.Login.GetBillingAgreementDetails(orderReference));
			//try { btnSubmitDonationFormInit(); } catch (_e) {};
		},
		
		design: {
			designMode: 'responsive'
		},
		
		onError: function(error) {
			alert(error.getErrorCode() + error.getErrorMessage()); // On PROD, log error via AJAX instead of alert
		}
	} ).bind("walletWidgetDiv");
};
/** END WALLET WIDGET **/

/** BEGIN RECURRING PAYMENTS WIDGET **/
amazon.Login.MODRenderRecurringPaymentsWidget = function() {
	new OffAmazonPayments.Widgets.Consent({
		sellerId: 'A1ZM7MXG16NQQB',
		amazonBillingAgreementId: amazon.Login.AmazonBillingAgreementId, 
		design: {
			designMode: 'responsive'
		},
		onReady: function(billingAgreementConsentStatus) { // Called after widget renders
			amazon.Login.MODBuyerBillingAgreementConsentStatus = billingAgreementConsentStatus.getConsentStatus();
			if (amazon.Login.MODBuyerBillingAgreementConsentStatus === "true") {
				jQuery("#amazonSubmit").removeAttr("disabled");
			} else {
				jQuery("#amazonSubmit").attr("disabled","disabled");
			}
		},
		onConsent: function(billingAgreementConsentStatus) {
			amazon.Login.MODBuyerBillingAgreementConsentStatus = billingAgreementConsentStatus.getConsentStatus();
			if (amazon.Login.MODBuyerBillingAgreementConsentStatus === "true") {
				jQuery("#amazonSubmit").removeAttr("disabled");
			} else {
				jQuery("#amazonSubmit").attr("disabled","disabled");
			}
		},
		onError: function(error) {
			// your error handling code
		} }).bind("consentWidgetDiv");
};
/** END RECURRING PAYMENTS WIDGET **/

amazon.Login.MODretrieveProfileCallback = function(response) {
	// For response object see "website-sdk-reference._TTH_.pdf", page 5 (as marked on bottom of page)
	var n = response.profile.Name.split(" ");
	if ($('input[name="donor.name.first"]').val() == "") $('input[name="donor.name.first"]').val(n[0]);
	if ($('input[name="donor.name.last"]').val() == "") $('input[name="donor.name.last"]').val(n[1]);	
	if ($('input[name="donor.address.zip"]').val() == "") $('input[name="donor.address.zip"]').val(response.profile.PostalCode);
	if ($('input[name="donor.email"]').val() == "") $('input[name="donor.email"]').val(response.profile.PrimaryEmail);	
	if ($('input[name="billing.name.first"]').val() == "") $('input[name="billing.name.first"]').val(n[0]);
	if ($('input[name="billing.name.last"]').val() == "") $('input[name="billing.name.last"]').val(n[1]);	
	if ($('input[name="billing.address.zip"]').val() == "") $('input[name="billing.address.zip"]').val(response.profile.PostalCode);
	if (n[1] != "") {
		$('.contact-information').show();
		$('.contact-information .geoaddress').hide();
		$('.contact-information .email-address').hide();
		$('.contact-information .billing-change').hide();
	}
};

// Handler for clicking on logout
amazon.Login.MODLogoutClickHandler = function() {
	$("#AmazonLogin").show();
	$("#AmazonLogoutButton").hide();	
	$("#walletWidgetDiv").hide();	
	$("#consentWidgetDiv").hide();	
	amazon.Login.logout();
	$("input[name=AmazonBillingAgreementId]").val("");
	$("input[name=AmazonOrderReferenceId]").val("");
	$("input[name=AmazonAccessToken]").val("");
	$("#AmazonPayButton").show();
};

function donateAmazonOld() {
	window.scrollTo(0, 0);
	$('.donation-form').hide();
	$('.donation-form').before('<div class="well donation-loading">' + 
					 'Thank You!  We are now processing your donation from Amazon ...' +
				   '</div>');
	// read saved form data
	// add 
	var params = $('.donation-form').serialize();
	var amazonErr = false;
	var status = "";
	var amt = 0;
	var ref = 0;

	$.ajax({
		method: "POST",
		async: false,
		cache:false,
		dataType: "json",
		url:"https://tools.heart.org/donate/amazon/payWithAmazon.php?"+params+"&callback=?",
		success: function(data){
			if ($('label[for="type-monthly"] .active').length > 0) {
				status = data.data.AuthorizeOnBillingAgreementResult.AuthorizationDetails.AuthorizationStatus.State;
				amt = data.data.AuthorizeOnBillingAgreementResult.AuthorizationDetails.CapturedAmount.Amount;
				ref = data.data.AuthorizeOnBillingAgreementResult.AuthorizationDetails.AmazonAuthorizationId;

				if (status != "Closed") {
					amazonErr = true;
				}
			} else {
				status = data.data.AuthorizeResult.AuthorizationDetails.AuthorizationStatus.State;
				amt = data.data.AuthorizeResult.AuthorizationDetails.CapturedAmount.Amount;
				ref = data.data.AuthorizeResult.AuthorizationDetails.AmazonAuthorizationId;

				if (status != "Closed") {
					amazonErr = true;
				}
			}

			if (amazonErr) {
				$('#donation-errors').append('<div class="alert alert-danger">' + data.data.toString() + '</div>');

				$('.donation-loading').remove();
				$('.donation-form').show();
			} else {
				//save off amazon id into custom field
				$('input[name=check_number]').val(ref);
				$('input[name=payment_confirmation_id]').val('AMAZON:'+ref);

				//logout of amazon
				amazon.Login.logout();

				//make offline donation in luminate to record transaction
				// if ($('input[name="df_preview"]').val() != "true") donateOffline();
				donateOffline(donateOfflineCallback);

				var email = $('input[name="donor.email"]').val();
				var first = $('input[name="donor.name.first"]').val();
				var last = $('input[name="donor.name.last"]').val();
				var street1 = $('input[name="donor.address.street1"]').val();
				var street2 = $('input[name="donor.address.street2"]').val();
				var city = $('input[name="donor.address.city"]').val();
				var state = $('[name="donor.address.state"]').val();
				var zip = $('input[name="donor.address.zip"]').val();
				var country = $('select[name="donor.address.country"]').val();
				var form=$('input[name=form_id]').val();

			  $('.donation-loading').remove();
			  $('.donate-now, .header-donate').hide();
			  $('.thank-you').show();
			  $.get(donation_thank_you_page,function(datat){ 
				  $('.thank-you').html($(datat).find('.thank-you').html());
				  $('p.first').html(first);
				  $('p.last').html(last);
				  $('p.street1').html(street1);
				  $('p.street2').html(street2);
				  $('p.city').html(city);
				  $('p.state').html(state);
				  $('p.zip').html(zip);
				  $('p.country').html(country);
				  $('p.email').html(email);
				  $('tr.cardGroup').hide();
				  $('tr.amazon').show();
				  $('p.amount').html("$"+amt);
				  $('p.confcode').html(ref);
				});

				$('.thank-you').append('<img src="//offeredby.net/silver/track/rvm.cfm?cid=28556&oid='+ref+'&amount='+amt+'&quantity=1" height="1" width="1">');
				$.getScript("//action.dstillery.com/orbserv/nsjs?adv=cl1014039&ns=1985&nc=HBP-Donate-Now-Landing-Page&ncv=52&dstOrderId="+ref+"&dstOrderAmount="+amt);

				// Custom Tracking code
				includeCustomFBPixel(amt);

				/* ECOMMERCE TRACKING CODE */ 
				ga('require', 'ecommerce');

				ga('ecommerce:addTransaction', {
				  'id': ref,
				  'affiliation': 'AHA Amazon Donation',
				  'revenue': amt,
				  'city': $('input[name="donor.address.city"]').val(),
				  'state': $('select[name="donor.address.state"]').val()  // local currency code.
				});

				ga('ecommerce:send');

				ga('send', 'pageview', '/donateok.asp');

				pushDonationSuccessToDataLayer(form, ref, amt);
			}
		}
	});

}