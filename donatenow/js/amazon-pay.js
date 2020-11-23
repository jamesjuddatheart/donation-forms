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

// Amazon V2
function isSandbox() {
	if ($("input[name=df_preview]").val() || $("input[name=instance]").val() == 'heartdev') {
		return true;
	}
	return false;
}

/**
 * Build payload details
 */
function buildPayLoad() {
	// return URL -- incorporate current URL
	const checkoutResultReturnUrl = location.href + ((location.href.indexOf("?")>0) ? '&' : '?') + 'amazon=thankyou';
	const amznPayLoad = {
		"webCheckoutDetails": {
			"checkoutResultReturnUrl": checkoutResultReturnUrl,
			"checkoutMode": "ProcessOrder"
		},
		"storeId": "amzn1.application-oa2-client.38bb1196ffea48f2b70647a398ce8a27",
		"chargePermissionType": "OneTime",
		"paymentDetails": {
			"paymentIntent": "AuthorizeWithCapture",
			"chargeAmount": {
				"amount": $('input[name=other_amount]').val(),
				"currencyCode": "USD"
			},
			"presentmentCurrency":"USD"
		},
		"merchantMetadata": {
			"merchantReferenceId":"Single-Donation",
			"merchantStoreName":"The American Heart Association",
			"noteToBuyer":"Thank you for your donation"
		},
		// "addressDetails": {
		// 	"name": $('input[name="donor.name.first"]').val() + " " + $('input[name="donor.name.last"]').val(),
		// 	"addressLine1": $('input[name="donor.address.street1"]').val(),
		// 	"city": $('input[name="donor.address.city"]').val(),
		// 	"stateOrRegion": $('[name="donor.address.state"]').val(),
		// 	"postalCode": $('input[name="donor.address.zip"]').val(),
		// 	// "countryCode": $('select[name="donor.address.country"]').val(),
		// 	// "phoneNumber": "212555555"
		// }
	};
	return amznPayLoad;
}

function buildSignatureParams() {
	const returnUrl = location.href + ((location.href.indexOf("?")>0) ? '&' : '?') + 'amazon=thankyou';
	const signParams = "&other_amount=" + $('input[name=other_amount]').val() +
	"&first_name=" + $('input[name="donor.name.first"]').val() +
	"&last_name=" + $('input[name="donor.name.last"]').val() +
	"&street1=" + $('input[name="donor.address.street1"]').val() +
	"&city=" + $('input[name="donor.address.city"]').val() +
	"&state=" + $('[name="donor.address.state"]').val() +
	"&zip=" + $('input[name="donor.address.zip"]').val();
	// "&custom_note=" + custom string;

	return signParams + "&return_url_js=" + returnUrl;
}

/**
 * 
 * @param {*} amazonPayInitCheckout Callback function to process signature
 */
function getSignature(amazonPayInitCheckout) {
	let paramPayload = URLEncode(buildSignatureParams());
	let tokenURL = "https://tools.heart.org/donate/amazon/v2/getsignature.php?payload=" + paramPayload;
	if(isSandbox()) {
		tokenURL + '&sandbox=true';
	}
	console.log(tokenURL);

	$.ajax({
		method: "POST",
		cache:false,
		dataType: "json",
		url: tokenURL + "&callback=?",
		success: amazonPayInitCheckout
	});
}

/**
 * Submit to Amazon
 * @param {*} signatureData returned signature
 */
function amazonPayInitCheckout(signatureData) {
	let payload = signatureData.payload;
	let signature = signatureData.signature;

	localStorage.setItem('amz_aha_signature', signature);
	localStorage.setItem('amz_aha_amt', $('input[name=other_amount]').val());

	amazonPayButton.initCheckout({
		createCheckoutSessionConfig: {
		payloadJSON: JSON.stringify(payload),
		signature: signature,
		publicKeyId: 'AEO5HN4OQCCDG4JLTOW6WQF3'
		}
	});
}

function amazonPayVerifyCheckout(amazonCheckoutSessionId, amzSignature, amzAmt) {
	let params = "amazonCheckoutSessionId=" + amazonCheckoutSessionId + "amount=" + amzAmt + "&signature=" + amzSignature;
	if(isSandbox()) {
		params = 'sandbox=true&' + params;
	}
	params = URLEncode(params);

	$.ajax({
		method: "POST",
		cache: false,
		dataType: "json",
		url: "https://tools.heart.org/donate/amazon/v2/checkout.php?" + params + "&callback=?",
		success: function(data) { //callbackSuccess
			console.log(data);
			//save off amazon id into custom field
			$('input[name=check_number]').val(data.chargePermissionId);
			$('input[name=payment_confirmation_id]').val('AMAZON:'+data.chargePermissionId);
			donateOffline(donateOfflineCallback);
			showConfirmationPage();
			clearStorage();
		},
		error: function(data) { //callbackFail
			console.log(data);
			$('#donation-errors').append('<div class="alert alert-danger" role="alert">' + data.toString() + '</div>');
			$('.donation-loading').remove();
			$('.donation-form').show();
		}
	});
}

// Re-populate from localStorage
function populateForm(lsForm) {
	// build array of saved data
	let donateData = {};
	const formPairs = lsForm.split("&");
	for(let key in formPairs) {
		donateData[formPairs[key].split("=")[0]] = formPairs[key].split('=')[1];
	}
	// populate selects
	$('.donation-form select').each(function(){
		$(this).val(donateData[this.name]);
		// $('select[name="'+this.name+'"]').val(donateData[this.name]);
	});
	// populate inputs
	$('.donation-form input').each(function(){
		$(this).val(decodeURI(donateData[this.name]));
	});
	// populate checkboxs
	$('.donation-form input:checkbox').each(function(){
		if(donateData[this.name]){
			$(this).prop('checked', true);
		}
	});
	// populate radios, exclude gift amount
	$('.donation-form input:radio').not('input[name=occurrence], input[name=gift]').each(function(){
		if (decodeURI(donateData[this.name]) == $(this).val()) {
			$(this).click();
		}
	});
	// reset gift amount
	populateAmount(donateData['other_amount']);
}

function showConfirmationPage() {
	const email = $('input[name="donor.email"]').val();
	const first = $('input[name="donor.name.first"]').val();
	const last = $('input[name="donor.name.last"]').val();
	const street1 = $('input[name="donor.address.street1"]').val();
	const street2 = $('input[name="donor.address.street2"]').val();
	const city = $('input[name="donor.address.city"]').val();
	const state = $('[name="donor.address.state"]').val();
	const zip = $('input[name="donor.address.zip"]').val();
	const country = $('select[name="donor.address.country"]').val();
	const form = $('input[name=form_id]').val();
	const amt = $('input[name=other_amount]').val();
	const ref = $('input[name=check_number]').val();

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

function clearStorage() {
	localStorage.removeItem('amzAhaToken').removeItem('amz_aha_amt').removeItem('ahaDonate');
}
