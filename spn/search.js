import {Transcripts} from '../search.js';

var s;
$(document).ready(function() {
    s = new Supernatural();
    s.readParams();
});

export function search() {
    s.search();
}

class Supernatural extends Transcripts {

    readParams() {
        $('#phrase').keypress(function(e){
            if(e.keyCode==13) {
                $('#search').click();
            }
        });
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const searchContext = urlParams.get('context');
        const query = urlParams.get('q');
        document.getElementById("phrase").value = query;
        if (searchContext != null) {
            if (searchContext == "true") {
                document.getElementById("contextToggle").checked = true;
            } else {
            document.getElementById("contextToggle").checked = false;
            }
        }
        if (query) {
            $('#search').click();
        }
    }

    getPermalink() {
        const params = new URLSearchParams();
        params.set('q', document.getElementById("phrase").value.toLowerCase())
        params.set('context', document.getElementById('contextToggle').checked);
        return window.location.pathname + "?" + params.toString();
    }
}