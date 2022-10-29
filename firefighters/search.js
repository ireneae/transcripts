import {Transcripts} from '../search.js';

var s;
$(document).ready(function() {
    s = new Firefighters();
    s.readParams();
});

export function search() {
    s.search();
}

class Firefighters extends Transcripts {

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
        const crossover = urlParams.get('crossover');
        document.getElementById("phrase").value = query;
        if (searchContext != null) {
            if (searchContext == "true") {
                document.getElementById("contextToggle").checked = true;
            } else {
            document.getElementById("contextToggle").checked = false;
            }
        }
        if (crossover != null) {
            if (crossover == "true") {
                document.getElementById("crossoverToggle").checked = true;
            } else {
                document.getElementById("crossoverToggle").checked = false;
            }
        }
        if (query) {
            $('#search').click();
        }
    }

    queryLoneStar(phrase, showContext) {
        var epsSpan = document.getElementById("epResults");
        var file = 'ls_s02e03.txt';
        var found = false;
        jQuery.ajax({
            url:file,
            success: function (data) {
                if (data.toLowerCase().includes(phrase)) {
                    found = true;
                    epsSpan.innerHTML += "<a href=\"#epLS2.03\" class=\"eplink\">LS-2.03</a> ";
                    if (showContext) {
                        this.parseContext(phrase, "LS 2.03 - Hold the Line", "LS2.03", data);
                    }
                }
            },
            async: false
        });
        return found;
    }

    querySeason(text, titles, season, phrase, showContext) {
        var found = false;
        for (var ep=1; ep<=this.eps[season-1]; ep++) {
            if (season === 4 && ep === 4 && document.getElementById('crossoverToggle').checked) {
                found = this.queryLoneStar(phrase, showContext) || found;
            }
            var idx = this.getEpIndex(season, ep);
            found = this.searchEp(text[idx], titles[idx], phrase, season, ep, showContext) || found;
            if (ep === this.eps[season-1] && found) {
                document.getElementById("epResults").innerHTML += "<br />";
            }
        }
        return found;
    }
}