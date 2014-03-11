// constants
window.constants = {
    /**
     * client id
     * @type {string}
     */
    CRIENT_ID : "445178350198-rcrhakfr1kn15s4r90v9leiuav8hlvlv.apps.googleusercontent.com",
    /**
     * api key
     * @type {string}
     */
    API_KEY : "AIzaSyBpAaZ02xFwLtnIQy6FhJ82pvuAfbwqxl0",
    /**
     * scope
     * @type {Array.<string>}
     */
    SCOPES : ["https://www.googleapis.com/auth/plus.me", "https://www.googleapis.com/auth/calendar.readonly"],
    /**
     * logout uri
     * @type {string}
     */
    LOGOUT_URI : "https://www.google.com/accounts/Logout"
};

// Functions
window.f = {
    onClientLoad : function() {
        gapi.client.setApiKey(constants.API_KEY);
        window.setTimeout(f.checkAuth, 1);
    },
    checkAuth : function() {
        gapi.auth.authorize({
            client_id : constants.CRIENT_ID,
            scope : constants.SCOPES,
            immediate : true
        }, f.handleAuthResult);
    },

    handleAuthResult : function(authResult) {
        var authorizeButton = document.getElementById('authorize_button');
        var logoutButton = $("#authrize_logout");
        if (authResult && !authResult.error) {
            authorizeButton.style.visibility = 'hidden';
            logoutButton.click(f.logout);
            logoutButton.css({
                "visibility" : ""
            });
            f.makeApiCall();
        } else {
            authorizeButton.onclick = f.handleAuthClick;
            authorizeButton.style.visibility = '';
            logoutButton.css({
                "visibility" : "hidden"
            });
        }
    },

    handleAuthClick : function(event) {
        gapi.auth.authorize({
            client_id : constants.CRIENT_ID,
            scope : constants.SCOPES,
            immediate : false
        }, f.handleAuthResult);
        return false;
    },
    makeApiCall : function() {
        gapi.client.load('plus', 'v1', function() {
            var request = gapi.client.plus.people.get({
                'userId' : 'me'
            });
            request.execute(function(resp) {
                var heading = document.createElement('h4');
                var image = document.createElement('img');
                image.src = resp.image.url;
                heading.appendChild(image);
                heading.appendChild(document.createTextNode(resp.displayName));

                document.getElementById('content').appendChild(heading);
            });
        });

        var restRequest = gapi.client.request({
            'path' : '/calendar/v3/users/me/calendarList'

        });
        restRequest.execute(function(calendarList) {
            // カレンダーを選択できるようにコンボボックスを作成する。
            var sel = document.createElement('select');
            var clItem = calendarList.items;
            var op = document.createElement('option');
            op.appendChild(document.createTextNode("---"));
            op.setAttribute("value", "");
            sel.appendChild(op);
            for (var i = 0; i < clItem.length; i++) {
                op = document.createElement('option');
                op.appendChild(document.createTextNode(clItem[i].summary));

                op.setAttribute("value", clItem[i].id);
                sel.appendChild(op);

            }
            sel.addEventListener("change", f.mySelCal, false);
            document.getElementById('content').appendChild(sel);
        });
    },

    getEventList : function(calenderId) {
        // 現在日付を基準に取得範囲を決める
        var today = new Date();
        var endDay = new Date(today.getTime() + 60 * 86400000);
        var restRequest = gapi.client.request({
            'path' : '/calendar/v3/calendars/' + calenderId + '/events',
            'params' : {
                'orderBy' : 'startTime',
                'singleEvents' : true,
                'timeMax' : endDay,
                'timeMin' : today
            }
        });
        console.log('https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(calenderId) + '/events');
        restRequest.execute(function(evList) {
            //console.dir(evList);
            var evItem = evList.items;
            var ul = document.createElement('ul');
            for (var i = 0; i < evItem.length; i++) {
                var li = document.createElement('li');
                var startDate = evItem[i].start.date;
                if (!startDate) {
                    startDate = evItem[i].start.dateTime;
                }
                li.appendChild(document.createTextNode(startDate + " " + evItem[i].summary));
                ul.appendChild(li);

            }
            document.getElementById('content').appendChild(ul);
        });
    },

    mySelCal : function(e) {
        if (this.selectedIndex == 0) {
            return;
        }
        // 選択されたカレンダーの直近の予定を表示する
        f.getEventList(this.options[this.selectedIndex].value);
    },

    logout : function() {
        window.setTimeout(function() {
            window.location.href = window.location.href;
        }, 3000);
        $("#logout_frame").attr({
            src : constants.LOGOUT_URI
        });

        //var nexturl = window.location.href;
        //window.location.href = constants.LOGOUT_URI + "?continue=http://gcalfinance.appengine.com";
        // $.ajax({
        // type : "GET",
        // url : constants.LOGOUT_URI,
        // success : function() {
        // window.location.href = window.location.href;
        // }
        // });
    }
};

