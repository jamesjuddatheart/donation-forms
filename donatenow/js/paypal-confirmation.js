
(function ($) {
	$.extend({
		getQuerystring: function(name){
		  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		  var regexS = "[\\?&]" + name + "=([^&#]*)";
		  var regex = new RegExp(regexS);
		  var results = regex.exec(location.href);
		  if(results == null)
			return "";
		  else
			return decodeURIComponent(results[1].replace(/\+/g, " "));
		}
	});
})(jQuery);

function includeCustomFBPixel(amt) {
    if(typeof(thank_you_pixel)!=='undefined'){
		fbq('track', 'Donation', { 
			value: amt, 
			currency: 'USD', 
		});
    };
}

jQuery(document).ready(function($) {

    var amt = $.getQuerystring("amount");
    var ref = $.getQuerystring("confirmation_code");
    var form = $.getQuerystring("form");
    var city = $.getQuerystring("city");
    var state = $.getQuerystring("state");

    $('p.confcode').html(ref);
    $('p.amount').html(amt);

    $('.thank-you').append('<img src="//offeredby.net/silver/track/rvm.cfm?cid=28556&oid='+ref+'&amount='+amt+'&quantity=1" height="1" width="1">');
	$.getScript("//action.dstillery.com/orbserv/nsjs?adv=cl1014039&ns=1985&nc=HBP-Donate-Now-Landing-Page&ncv=52&dstOrderId="+ref+"&dstOrderAmount="+amt);

	// Custom Tracking code
	includeCustomFBPixel(amt);
	
	/* ECOMMERCE TRACKING CODE */ 
	/*ga('require', 'ecommerce');
	ga('ecommerce:addTransaction', {
	  'id': ref,
	  'affiliation': 'AHA PayPal Donation',
	  'revenue': amt,
	  'city': city,
	  'state': state  // local currency code.
	});
	ga('ecommerce:send');
	ga('send', 'pageview', '/donateok.asp');
	*/
	
	pushDonationSuccessToDataLayer(form, ref, amt);
});
