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
	return ($("input[name=df_preview]").val()) ? "true" : "false";
}

// Render Amazon Pay Button
var amazonPayButton = amazon.Pay.renderButton('#amazon-pay', {
   merchantId: 'A1ZM7MXG16NQQB',
   ledgerCurrency: 'USD',          
   sandbox: isSandbox(),
   checkoutLanguage: 'en_US', 
   productType: 'PayOnly',
   placement: 'Cart',
   buttonColor: 'Gold'
});

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
	// "&country=" + $('select[name="donor.address.country"]').val();

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
	let payload = buildPayLoad();
	// sign payload
	let signature = signatureData.signature;

	amazonPayButton.initCheckout({
		createCheckoutSessionConfig: {
		payloadJSON: payload,
		signature: signature,
		publicKeyId: 'AEO5HN4OQCCDG4JLTOW6WQF3'
		}
	});
}
