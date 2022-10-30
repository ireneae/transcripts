export function showDetailed(epNum, expand) {
    if (expand) {
        document.getElementById(epNum).style.display = "none";
        document.getElementById(epNum + "det").style.display = "block";
    } else {
        document.getElementById(epNum).style.display = "block";
        document.getElementById(epNum + "det").style.display = "none";
    }
}

export class Transcripts {

    N = 12;
    M = 2;
    #htmlRegex = /<[^>]*>/g;
    #seasons = 0;
    #eps = [];

    pad2(num) {
        return String(num).padStart(2, '0');
    }

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

    getEpIndex(season, ep) {
        var epNum = 0;
        var s = 0;
        var title = "";
        while (s < season-1) {
            epNum += this.eps[s];
            s += 1;
        }
        return epNum + ep - 1;
    }

    parseLines(lines, nos) {
        var txt = "<br />";
        nos.forEach((value) => {
            txt += lines[value].replace(this.htmlRegex, '') + "<br />";
        });
        return txt;
    }



    createNodes(epDiv, lines, nos, nosDet, epNum) {
        const textNode = document.createElement("div")
        textNode.id = epNum;
        const textNodeDet = document.createElement("div");
        textNodeDet.id = epNum + "det";
        textNodeDet.style.display = "none";
        textNode.innerHTML = this.parseLines(lines, nos);
        textNodeDet.innerHTML = this.parseLines(lines, nosDet);
        textNode.innerHTML += "<a href=\"javascript:showDetailed(\'" + epNum + "\', true)" + ";\" style=\"text-decoration: none\"><small>(expand)</small></a>"
        textNodeDet.innerHTML += "<a href=\"javascript:showDetailed(\'" + epNum + "\', false)" + ";\" style=\"text-decoration: none\"><small>(collapse)</small></a>"
        epDiv.appendChild(textNode);
        epDiv.appendChild(textNodeDet);
    }

    parseContext(phrase, epTitle, epNum, data) {
        const epDiv = document.createElement("div");
        epDiv.innerHTML = "<br><div class=\"resTitle\" id=\"ep" + epNum + "\">" + epTitle + "</div>";
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
        console.log(title);
        if (data.toLowerCase().includes(phrase)) {
            found = true;
            const epNum = "" + season + "." + this.pad2(ep)
            document.getElementById("epResults").innerHTML += "<a href=\"#ep" + epNum + "\" class=\"eplink\">" + epNum + "</a> ";
            if (showContext) {
                this.parseContext(phrase, title, epNum, data);
            }
        }
        return found;
    }

    querySeason(text, titles, season, phrase, showContext) {
        var found = false;
        for (var ep=1; ep<=this.eps[season-1]; ep++) {
            var idx = this.getEpIndex(season, ep);
            found = this.searchEp(text[idx], titles[idx], phrase, season, ep, showContext) || found;
            if (ep === this.eps[season-1] && found) {
                document.getElementById("epResults").innerHTML += "<br />";
            }
        }
        return found;
    }

    parseSeasonNumbers(titles) {
        var i = 0;
        var seasons = 0;
        var eps = [];
        while (i < titles.length) {
            if (titles[i]) {
                const season = parseInt(titles[i].split('.'));
                if (season > seasons) {
                    eps.push(1);
                    seasons += 1;
                } else {
                    eps[season-1] += 1;
                }
            }
            i += 1;
        }
        this.seasons = seasons;
        this.eps = eps;
    }

    search() {
        document.getElementById("contextResults").innerHTML = "";
        var phrase = document.getElementById("phrase").value.toLowerCase();
        if (!phrase) {
            return;
        }
        var titles;
        var epArray;
        jQuery.ajax({
            url:'titles.txt',
            success: function (data) {
                titles = data.split('\n');
            },
            async:false
        });
        jQuery.ajax({
            url:'transcripts.txt',
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
