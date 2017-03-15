/*global $ */
$(document).ready(function(){
  $('#approved').hide();
	$('#submit').click(function(){
 		var format = /([^ ]\()|([)][^;])|([ ]{2,}?[\(])|([^)](?=;)[;])|((?:^|[ ])(?:(?:[A-Z]+?|[a-z]+?)[ ][-][ ].+?(?:[,|;]|$)))/g;
    var input = $('#input').text().trim();
    // Formatting
    $('.output').text('');
    clearHighlights();
    if (input.match(format) == null) {
    	$('#format-check > span').text('✔️').prop('title', 'Passed').css('color', '#0F0');
      process(parse(input));
    } else {
			$('#format-check > span').text('✖️').prop('title', 'Failed').css('color', '#F00');
      highlightFormattingErrors(format);
    }
  });
  
  $('#reset').click(function(){
    $('#input').text('');
    $('.output').text('');
    $('.check > span').text('').prop('title', '').css('color', '');
  });
});

function process(acronyms) {
  var remarks = "";
  var approved = "";
  var unknown = "";
	$.each(acronyms, function(i, v) {
  	switch(isApproved(v.acronym, v.meaning)) {
    	case 'yes':
      	approved += '<span title="' + v.meaning + '">' + v.acronym + '</span>, ';
        break;
      case 'maybe':
      	unknown += '<span title="' + getApproved(v.acronym).meaning +
          '">' + v.acronym + '</span>, ';
      	remarks += v.meaning + " ("+ v.acronym + "); ";
        break;
      default:
      	remarks += v.meaning + " ("+ v.acronym + "); ";
    }
  });
  // Alphabetized
  if(isAlphabetized(acronyms)) {
  	$('#alpha-check > span').text('✔️').prop('title', 'Passed').css('color', '#0F0');
  } else {
  	$('#alpha-check > span').text('✖️').prop('title', 'Failed').css('color', '#F00');
  }
  // Approved
  if (approved == "") {
  	if (unknown == "") {
  		$('#approved-check > span').text('✔️').prop('title', 'Passed').css('color', '#0F0');
      $('#approved').hide();
    } else {
    	$('#approved-check > span').text('❓').prop('title', 'Check Acronym Matches!').css('color', '#FC0');
      $('#approved').show();
    }
  } else {
		$('#approved-check > span').text('✖️').prop('title', 'Failed').css('color', '#F00');
      $('#approved').show();
    }
    $('#remarks').text(remarks.substr(0, remarks.length - 2));
    $('#firm').html(approved.substr(0, approved.length - 2));
    $('#possible').html(unknown.substr(0, unknown.length - 2));
}

function parse(input) {
	var acronyms = [];
  var array = input.replace(/\),/g, ");").split(";");
  array.forEach(function(s, i) {
  		if (s.match(/\((.*)\)/i) == null) return;
    	acronyms.push({
      	"acronym": s.match(/\((.*)\)/i)[1].trim(),
        "meaning": s.substr(0, s.indexOf("(")).trim(),
        "o": i
      });
    });
    return acronyms.sort(alphabetize);
}

function getApproved(a) {
	var o = {acronym:a, meaning:"Unknown"};
	$.each(approvedJson, function(i, v) {
 		if (v.acronym.toUpperCase() === a.toUpperCase()) {
      o = v;
    	return;
    }
  })
  return o;
}

function isApproved(acronym, meaning) {
	var approved = "no";
	$.each(approvedJson, function(i, v) {
 		if (v.acronym.toUpperCase() === acronym.toUpperCase()) {
    	approved = "maybe";
      if (v.meaning.toUpperCase().trim() === meaning.toUpperCase().trim()) {
    		approved = "yes";
    		return;
      }
    }
	});
  return approved;
}

function highlightFormattingErrors(regex) {
  clearHighlights();
	var input = $('#input').text().trim();
  input = input.replace(regex, '<span class="error">$1$2$3$4$5</span>');
  $('#input').html(input);
}

function clearHighlights() {
	$('#input > span').replaceWith(function() { return $(this).text(); });
}

function alphabetize(a, b) {
	var objectA = a.acronym.toUpperCase();
  var objectB = b.acronym.toUpperCase(); 
  if (objectA < objectB) {
    return -1;
  }
  if (objectA > objectB) {
    return 1;
  }
  return 0;
}

function isAlphabetized(array) {
	for (var i = 0; i < array.length; i++) {
		if (array[i].o != i)
			return false;
  }

  return true;
}