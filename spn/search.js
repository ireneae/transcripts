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
        const deleted = urlParams.get('deleted');
        const query = urlParams.get('q');
        document.getElementById("phrase").value = query;
        if (searchContext != null) {
            if (searchContext == "true") {
                document.getElementById("contextToggle").checked = true;
            } else {
            document.getElementById("contextToggle").checked = false;
            }
        }
        if (deleted != null) {
            if (deleted == "true") {
                document.getElementById("deletedToggle").checked = true;
            } else {
            document.getElementById("deletedToggle").checked = false;
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
        params.set('deleted', document.getElementById('deletedToggle').checked);
        return window.location.pathname + "?" + params.toString();
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
        if (document.getElementById("deletedToggle").checked) {
            url = 'transcripts_withdeletedscenes.txt';
        } else {
            url = 'transcripts.txt';
        }
        jQuery.ajax({
            url:'titles.txt',
            success: function (data) {
                titles = data.split('\n');
            },
            async:false
        });
        jQuery.ajax({
            url: url,
                success: function (data) {
                    epArray = data.split("@@@@@@\n");
                },
                async: false
            });
        this.parseSeasonNumbers(titles);
        var showContext = document.getElementById('contextToggle').checked;
        var found = false;
        document.getElementById("epResults").innerHTML = "<div class=\"permalink\"><a href=" + this.getPermalink() + ">Link to search</a><br /><br /></div>";
        for (var season=1; season<=this.seasons; season++) {
            const s = season;
            found = this.querySeason(epArray, titles, s, phrase, showContext) || found;
        }
        if (!found) {
            document.getElementById("contextResults").innerHTML += "<center>No results found.<br /></center>";
        }
    }
}