import {Transcripts} from '../search.js';

var s;
$(document).ready(function() {
    s = new DoctorWho();
    s.readParams();
});

export function search() {
    s.search();
}

class DoctorWho extends Transcripts {

    readParams() {
        $('#phrase').keypress(function(e){
            if(e.keyCode==13) {
                $('#search').click();
            }
        });
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const query = urlParams.get('q');
        document.getElementById("phrase").value = query;
        if (query) {
            $('#search').click();
        }
    }

    getPermalink() {
        const params = new URLSearchParams();
        params.set('q', document.getElementById("phrase").value.toLowerCase())
        return window.location.pathname + "?" + params.toString();
    }

    querySeason(text, titles, season, phrase, showContext) {
        var found = false;
        var start = 1;
        if (season == 2 || season == 3 || season == 4) {
            var idx = this.getEpIndex(season, 1);
            found = this.searchEp(text[idx], titles[idx], phrase, season, 1, showContext) || found;
            start = 2;
        }
        for (var ep=start; ep<=this.eps[season-1]; ep++) {
            var idx = this.getEpIndex(season, ep);
            console.log("season", season, "ep", ep, "idx", idx);
            found = this.searchEp(text[idx], titles[idx], phrase, season, ep-start+1, showContext) || found;
            if (ep === this.eps[season-1] && found) {
                document.getElementById("epResults").innerHTML += "<br />";
            }
        }
        return found;
    }

    search() {
        document.getElementById("contextResults").innerHTML = "";
        var phrase = document.getElementById("phrase").value.toLowerCase();
        if (!phrase) {
            return;
        }
        var titles;
        var epArray;
        var url;
        jQuery.ajax({
            url:'titles.txt',
            success: function (data) {
                titles = data.split('\n');
            },
            async:false
        });
        jQuery.ajax({
            url: 'transcripts.txt',
                success: function (data) {
                    epArray = data.split("@@@@@@\n");
                },
                async: false
            });
        this.seasons=4;
        this.eps=[13, 14, 14, 14];
        var found = false;
        console.log(epArray.length);
        document.getElementById("epResults").innerHTML = "<div class=\"permalink\"><a href=" + this.getPermalink() + ">Link to search</a><br /><br /></div>";
        for (var season=1; season<=this.seasons; season++) {
            const s = season;
            found = this.querySeason(epArray, titles, s, phrase, true) || found;
        }
        if (!found) {
            document.getElementById("contextResults").innerHTML += "<center>No results found.<br /></center>";
        }
    }
}