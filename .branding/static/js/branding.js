// $(document).ready(function(){
document.title="Atlas Developer's Guide"
$('.branding-header').html(
  '<div id="atlas-title"><a href="/wiki/"><span id="atlas-title-content">Atlas Developer Guide</span></a></div>'
);

$('footer').prepend(
  '<div id="atlas-footer"><div class="license"><a href="/static/cc-by-sa.txt"><img src="/static/images/cc-by-sa.png"/></a></div></div>'
);

$('.breadcrumb-sep').text('>');

$('#page-content').on( 'contentUpdate', function(){
  var seen = [];
  $('.start-sidebar').each(function(){
    var id = $(this).attr('id');
    if ( seen.indexOf(id) < 0 ) {
      seen.push(id);

      $(this).nextUntil('.end-sidebar').wrapAll('<div class="sidebar" id="wrapped-' + id + '"></div>');
    }
  });
  
  $('.start-sidebar').remove();
  $('.end-sidebar').remove();
});

var htmlButton = '<button id="html-button">Show HTML</button>';
$(document).on('ready', function(){
  $('#buttonbar-page-global').append(htmlButton);
  $('#html-button').on('click', function(){

    var cleanHtml = $('html')[0].outerHTML.replace('&#8221;', "'").replace(htmlButton, "");

    $('body').append('<div style="display:none;" id="html"><textarea id="html-content">HTML goes here.</textarea></div>');
    $('#html-content').text(cleanHtml);
    $('#html').dialog({
      title: "HTML Viewer",
      height: 'auto',
      width: 'auto',
      resize: 'auto',
      modal: true,
      close: function(event, ui){
        $('#html').remove();
      }
    });
  });
});

