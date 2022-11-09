import {Transcripts} from '../search.js';

var s;
$(document).ready(function() {
    s = new DTA();
    s.readParams();
});

export function search() {
    s.search();
}

class DTA extends Transcripts {

    parseContext(phrase, epTitle, epNum, data) {
        const epDiv = document.createElement("div");
        epDiv.innerHTML = "<br><div class=\"resTitle\" id=\"ep" + epNum + "\">" + epTitle.split(' ').slice(2).join(' ') + "</div>";
        var lines = data.split("\n");
        var nos = [];
        var nosDet = [];
        var txt = "";
        var k = 0;
        for (var i=0; i<lines.length; i++) {
            var line = lines[i].replace(this.htmlRegex, '');
            if (line.toLowerCase().includes(phrase)) {
                var start = i-this.M;
                if (nos.length > 0 && start > nos[nos.length - 1]) {
                    // finish out the current set
                    this.createNodes(epDiv, lines, nos, nosDet, epNum + "." + k);
                    nos = [];
                    nosDet = [];
                    k += 1;
                } else if (nos.length > 0) {
                    start = nos[nos.length - 1] + 1;
                }
                for (var j=start; j < i+this.M+1; j++) {
                    if (j >= 0 && j < lines.length - 1) {
                        nos.push(j);
                    }
                }
                for (var j=start-(this.N-this.M); j < i+this.N+1; j++) {
                    if (j >= 0 && (nosDet.length == 0 || j > nosDet[nosDet.length-1]) && j < lines.length - 1) {
                        nosDet.push(j);
                    }
                }
            }
        }
        this.createNodes(epDiv, lines, nos, nosDet, epNum + "." + k);
        epDiv.innerHTML += "<br />";
        document.getElementById("contextResults").appendChild(epDiv);
    }

    searchEp(data, title, phrase, season, ep, showContext) {
        var found = false;
        if (data.toLowerCase().includes(phrase)) {
            found = true;
            var epNum = title.split(' ')[0]
            document.getElementById("epResults").innerHTML += "<a href=\"#ep" + epNum + "\" class=\"eplink\">" + epNum + "</a> ";
            if (showContext) {
                this.parseContext(phrase, title, epNum, data);
            }
        }
        return found;
    }

    readParam(urlParams, paramString) {
        const param = urlParams.get(paramString)
        if (param != null) {
            if (param == "true") {
                document.getElementById(paramString+"Toggle").checked = true;
            } else {
                document.getElementById(paramString+"Toggle").checked = false;
            }
        }
    }

    readParams() {
        $('#phrase').keypress(function(e){
            if(e.keyCode==13) {
                $('#search').click();
            }
        });
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        this.readParam(urlParams, 'motw');
        this.readParam(urlParams, 'tlis');
        this.readParam(urlParams, 'itstl');
        this.readParam(urlParams, 'gog');
        this.readParam(urlParams, 'tfk');
        const query = urlParams.get('q');
        document.getElementById("phrase").value = query;
        if (query) {
            $('#search').click();
        }
    }

    getPermalink() {
        const params = new URLSearchParams();
        params.set('q', document.getElementById("phrase").value.toLowerCase())
        params.set('motw', document.getElementById('motwToggle').checked);
        params.set('tlis', document.getElementById('tlisToggle').checked);
        params.set('itstl', document.getElementById('itstlToggle').checked);
        params.set('gog', document.getElementById('gogToggle').checked);
        params.set('tfk', document.getElementById('tfkToggle').checked);

        return window.location.pathname + "?" + params.toString();
    }

    getTitles(book) {
        var titles;
        jQuery.ajax({
            url:'titles_'+book+'.txt',
            success: function (data) {
                titles = data.split('\n');
            },
            async:false
        });
        return titles.slice(0,-1);
    }

    getText(book) {
        var chapters;
        jQuery.ajax({
            url:'chapters_'+book+'.txt',
            success: function (data) {
                chapters = data.split('@@@@@@');
            },
            async:false
        });
        return chapters.slice(0,-1);
    }


    search() {
        document.getElementById("contextResults").innerHTML = "";
        var phrase = document.getElementById("phrase").value.toLowerCase();
        if (!phrase) {
            return;
        }
        var titles = [];
        var chapArray = [];
        var seasons = 0;
        var eps = [];
        var bookTitles;
        if (document.getElementById("motwToggle").checked) {
            bookTitles = this.getTitles('book1')
            eps.push(bookTitles.length);
            titles = titles.concat(bookTitles);
            chapArray = chapArray.concat(this.getText('book1'));
            seasons += 1;
        }
        if (document.getElementById("itstlToggle").checked) {
            bookTitles = this.getTitles('book2')
            eps.push(bookTitles.length);
            titles = titles.concat(bookTitles);
            chapArray = chapArray.concat(this.getText('book2'));
            seasons += 1;
        }
        if (document.getElementById("tlisToggle").checked) {
            bookTitles = this.getTitles('book3')
            eps.push(bookTitles.length);
            titles = titles.concat(bookTitles);
            chapArray = chapArray.concat(this.getText('book3'));
            seasons += 1;
        }
        if (document.getElementById("gogToggle").checked) {
            bookTitles = this.getTitles('book4')
            eps.push(bookTitles.length);
            titles = titles.concat(bookTitles);
            chapArray = chapArray.concat(this.getText('book4'));
            seasons += 1;
        }
        if (document.getElementById("tfkToggle").checked) {
            bookTitles = this.getTitles('book5')
            eps.push(bookTitles.length);
            titles = titles.concat(bookTitles);
            chapArray = chapArray.concat(this.getText('book5'));
            seasons += 1;
        }

        this.seasons = seasons;
        this.eps = eps;
        console.log(this.seasons, this.eps);
        console.log(titles);
        console.log(chapArray.length);
        var found = false;
        document.getElementById("epResults").innerHTML = "<div class=\"permalink\"><a href=" + this.getPermalink() + ">Link to search</a><br /><br /></div>";
        for (var season=1; season<=this.seasons; season++) {
            const s = season;
            found = this.querySeason(chapArray, titles, s, phrase, true) || found;
        }
        if (!found) {
            document.getElementById("contextResults").innerHTML += "<center>No results found.<br /></center>";
        }
    }
}