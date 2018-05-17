/* GA CODE */
/*
function getUrlVars(key){ 
	var vars = {}; 
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, 
	function(m,key,value) { 
		vars[key] = unescape(value.replace(/\+/g, " ")); 
	}); 

	return vars; 
}



$.fn.serializeObject=function(){var o={};var a=this.serializeArray();$.each(a,function(){if(o[this.name]!==undefined){if(!o[this.name].push){o[this.name]=[o[this.name]]}o[this.name].push(this.value||"")}else{o[this.name]=this.value||""}});return o};
*/
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-18677883-25', 'auto');
ga('require', 'GTM-M37NXBT');
ga('send', 'pageview');


ga('create', 'UA-12551341-7', 'auto', 't2', {'allowLinker': true});
ga('t2.require', 'linker');
ga('t2.linker:autoLink', ['heart.org']);      // Domains that are linked from this page.
ga('t2.send', 'pageview');                          // Send hits after initializing the auto-linker plug-in.

/*
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-18677883-25']);
	_gaq.push(['_trackPageview']);

	_gaq.push(['t2._setAccount', 'UA-12551341-7']);
	_gaq.push(['t2._setDomainName', 'heart.org']);
	_gaq.push(['t2._setAllowLinker', true]);
	_gaq.push(['t2._trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
*/


/* FORM FILD ABANDONMENT CODE*/
(function($) {
	$(document).ready(function() {
		$(':input').blur(function () {
			if($(this).val().length > 0) {
				//_gaq.push(['_trackEvent', 'FormDonation', 'completed', $(this).attr('id')]);
				ga('send', 'event', 'FormDonation', 'completed', $(this).attr("id"));
			}
			else {
				//_gaq.push(['_trackEvent', 'FormDonation', 'skipped', $(this).attr('id')]);
				ga('send', 'event', 'FormDonation', 'skipped', $(this).attr("id"));
			}
		});

		// track field data
		$('form select').change(function(e) {
			ga('send', 'event', 'FormDonation', 'Change', $(this).attr("id"));
		});  
		  
		
	});
})(jQuery);