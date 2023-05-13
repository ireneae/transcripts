import {Transcripts} from '../search.js';

var s;
$(document).ready(function() {
    s = new TedLasso();
    s.readParams();
});

export function search() {
    s.search();
}

class TedLasso extends Transcripts {

}