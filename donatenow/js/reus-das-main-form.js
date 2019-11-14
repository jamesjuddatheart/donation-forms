window.loconn = {
    baseURL: null,
    consid: null,
    key: null,
    responseType: 'json',
    token: null,
    init: function(args) {
        // Store incoming args for reuse in other methods
        loconn.baseURL = args.baseURL;
        loconn.consid = args.consid;
        loconn.key = args.key;
        loconn.token = args.token;

        if (loconn.consid && loconn.token !== null && loconn.baseURL !== null && loconn.token !== null) {
            pmx.cookie.delete('dasprev');
            pmx.cookie.delete('dascust');
            pmx.methods.getUser();
            pmx.methods.getUserTransactions();
            pmx.methods.updateFormFields();
            if (pmx.cookie.get('dascust') === true || pmx.cookie.get('dasprev') === true) {
                pmx.methods.logInteraction("true", 1050);
            }
        }
    }
}

window.pmx = {
    cookie: {
        // Days to Expiration of the Cookie
        DTE: "90",
        delete: function(c_name) {
            document.cookie = c_name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        },
        get: function(c_name) {
            var i, x, y, cookieArray = document.cookie.split(";");
            for (i = 0; i < cookieArray.length; i++) {
                x = cookieArray[i].substr(0, cookieArray[i].indexOf("="));
                y = cookieArray[i].substr(cookieArray[i].indexOf("=") + 1);
                x = x.replace(/^\s+|\s+$/g, "");
                if (x == c_name) {
                    return unescape(y);
                }
            }
        },
        set: function(c_name, value, exdays) {
            var exdate = new Date();
            exdate.setTime(exdate.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var c_value = escape(value) +
                ((exdays === null) ? "" : "; expires=" + exdate.toUTCString());
            document.cookie = c_name + "=" + c_value + ";path=/";
        }
    },
    values: {
        prevAmount: null,
        customAmount: null
    },
    methods: {
        getUser: function() {
            $.ajax({
                method: "POST",
                requiresAuth: true,
                async: false,
                cache: false,
                dataType: "json",
                url: loconn.baseURL + "?method=getUser&v=1.0&api_key=" + loconn.key + "&auth=" + loconn.token + "&response_format=" + loconn.responseType,
                success: function(data) {
                    if ($.isEmptyObject(data.getConsResponse) == false) {
                        /****************************************************
                         * Check to see if the current user has a custom
                         * attribute of custom_monetary_value5
                         ****************************************************/
                        if (parseFloat(data.getConsResponse.custom.monetary_amount[4].content) >= 0) {
                            pmx.values.customAmount = data.getConsResponse.custom.monetary_amount[4].content;

                            // Cookie our end user so we know they got a DAS custom amount
                            pmx.cookie.set('dascust', true);
                        }
                    }
                },
                error: function(data) {}
            });
        },
        getUserTransactions: function() {
            $.ajax({
                method: "POST",
                requiresAuth: true,
                async: false,
                cache: false,
                dataType: "json",
                url: loconn.baseURL + "?method=getUserTransactions&v=1.0&api_key=" + loconn.key + "&auth=" + loconn.token + "&response_format=" + loconn.responseType,
                success: function(data) {
                    if ($.isEmptyObject(data.getConsTransactionsResponse) == false) {
                        /****************************************************
                         * Since the CONS API doesn't guarantee that the
                         * transactions array will be in date order, looping
                         * through transactions, grabbing the timestame, and
                         * putting them in reverse chronological order
                         *
                         * NOTE: If a user has given a single gift, the
                         * response does not return an array. If/Else If used
                         * to catch this condition.
                         ****************************************************/

                        // Check to see if we have a single transaction or multiples
                        if (isArray(data.getConsTransactionsResponse.transaction) === false) {
                            // Cookie our end user so we know they got a DAS previous amount
                            pmx.cookie.set('dasprev', true)

                            // Single donation amount
                            pmx.values.prevAmount = data.getConsTransactionsResponse.transaction.amount.decimal;
                        } else if (isArray(data.getConsTransactionsResponse.transaction) === true) {
                            // Array of donation amoiunts
                            var transByDate = [];
                            for (var i = 0; i < data.getConsTransactionsResponse.transaction.length; i++) {
                                transByDate[i] = { "origPos": i, "origTimestamp": data.getConsTransactionsResponse.transaction[i].timestamp };
                            }
                            transByDate.sort(function(a, b) {
                                var dateA = new Date(a.origTimestamp),
                                    dateB = new Date(b.origTimestamp);
                                return dateB - dateA
                            });
                            // Cookie our end user so we know they got a DAS previous amount
                            pmx.cookie.set('dasprev', true)

                            // Saving results we need for later use
                            pmx.values.prevAmount = data.getConsTransactionsResponse.transaction[transByDate[0].origPos].amount.decimal;
                        }
                    }
                },
                error: function(data) {}
            });
        },
        logInteraction: function(subject, id) {
            var amountTrack = "$0"
            if (pmx.values.prevAmount !== null) {
                amountTrack == "$" + pmx.values.prevAmount;
            }
            var interactionComment = "Previous donation amount: " + amountTrack;
            $.ajax({
                method: "POST",
                requiresAuth: true,
                async: false,
                cache: false,
                dataType: "json",
                url: loconn.baseURL + "?method=logInteraction&v=1.0&api_key=" + loconn.key + "&auth=" + loconn.token + "&response_format=" + loconn.responseType + "&interaction_subject=" + subject + "&interaction_type_id=" + id + "&interaction_body=" + interactionComment,
                success: function(data) {},
                error: function(data) {}
            });
        },
        updateFormFields: function() {
            if (pmx.values.prevAmount != null && pmx.values.prevAmount <= 250) {
                /****************************************************
                 * If we determine the end user is logged in and has
                 * donated previoulsy and last amount <= $250, round the amount up to the
                 * nearest interval of 5, update input label value in
                 * postion 2 to the calculated suggested gift amount
                 ****************************************************/
                newAmount = parseInt(Math.ceil((parseFloat(pmx.values.prevAmount) * 1.5) / 5) * 5);
                // Hide Postion #4 of the Donation Array
                $('#gift8').parent('.gift').remove();

                // Update the hidden form field with the update value
                $('input[name=other_amount]').val(newAmount);

                // Double check that all the radio button are not checked
                $('#gift5, #gift6, #gift7, #gift8').prop('checked', false);

                // Update Button #1 to new previous donation amount update inline onclick
                $('#gift5').attr('aria-label', pmx.values.prevAmount).val('$' + pmx.values.prevAmount);
                $('button[for=gift5]').attr({'title':'$' + pmx.values.prevAmount, 'data-amount': pmx.values.prevAmount}).text('$' + pmx.values.prevAmount).data('amount', pmx.values.prevAmount);

                // Update Button #2 to new Amount and update inline onclick
                $('#gift6').attr('aria-label', newAmount).val('$' + newAmount);
                $('button[for=gift6]').attr({'title':'$' + newAmount, 'data-amount': newAmount}).text('$' + newAmount).data('amount', newAmount);

                // Update Button #3 to new Amount and update inline onclick
                $('#gift7').attr('aria-label', (newAmount * 2)).val('$' + (newAmount * 2));
                $('button[for=gift7]').attr({'title':'$' + (newAmount * 2), 'data-amount':(newAmount * 2)}).text('$' + (newAmount * 2)).data('amount', (newAmount * 2));

                // Set the checked state to true so the button shows active
                $('#gift6').prop('checked', true);
                $('button[for=gift6]').click();


            } else if (pmx.values.prevAmount == null && pmx.values.customAmount != null && pmx.values.prevAmount <= 250) {
                newAmount = parseInt(Math.ceil((parseFloat(pmx.values.customAmount) * 1.5) / 5) * 5);
                // Hide Postion #4 of the Donation Array
                $('#gift8').parent('.gift').remove();

                // Update the hidden form field with the update value
                $('input[name=other_amount]').val(newAmount);

                // Double check that all the radio button are not checked
                $('#gift5, #gift6, #gift7, #gift8').prop('checked', false);

                // Update Button #1 to new previous donation amount update inline onclick
                $('#gift5').attr('aria-label', pmx.values.prevAmount).val('$' + pmx.values.prevAmount);
                $('button[for=gift5]').attr({'title':'$' + pmx.values.prevAmount, 'data-amount': pmx.values.prevAmount}).text('$' + pmx.values.prevAmount).data('amount', pmx.values.prevAmount);

                // Update Button #2 to new Amount and update inline onclick
                $('#gift6').attr('aria-label', newAmount).val('$' + newAmount);
                $('button[for=gift6]').attr({'title':'$' + newAmount, 'data-amount': newAmount}).text('$' + newAmount).data('amount', newAmount);

                // Update Button #3 to new Amount and update inline onclick
                $('#gift7').attr('aria-label', (newAmount * 2)).val('$' + (newAmount * 2));
                $('button[for=gift7]').attr({'title':'$' + (newAmount * 2), 'data-amount':(newAmount * 2)}).text('$' + (newAmount * 2)).data('amount', (newAmount * 2));

                // Set the checked state to true so the button shows active
                $('#gift6').prop('checked', true);
                $('button[for=gift6]').click();
            }
        }
    }
}
