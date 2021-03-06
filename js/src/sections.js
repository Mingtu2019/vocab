var section = ''
var secobj = {};
var style = {}, weight = {};

function addSection()
{
  var name = prompt('Add new section:');
  if (name == null || name == '')
    return;
  $.post('set/new_section.php', 'name=' + name, function() {refreshSections(false);});
}

function sectionEditButton()
{
      return '<button class="btn btn-xs btn-warning"><span class="fa fa-pencil"></span></button>';
}

function refreshSections(refresh)
{
  $.getJSON("get/section_list.php", function(res) {
    var html = '';
    for (i in res) {
      var obj = res[i];
      var sid = obj['sid'];
      var name = obj['name'];
      var active = '';
      var button = '';
      if (!refresh && sid == section) {
        active = 'active';
        button = sectionEditButton();
      }
      html = html.concat('<a class="nav-item ' + active + ' nav-link align-self-end" href="#" sid="' + sid + '" data-toggle="tab">' + disp(name) + button + '</a>');
    }
    html = html.concat('<a class="nav-item nav-link align-self-end" href="#" sid="add"><span class="fa fa-plus"></span></a>');
    html = html.concat('<a class="nav-item nav-link align-self-end" href="cards.php" target="_blank" sid="check"><span class="fa fa-check-square-o"></span></a>');
    $('#sectabs').html(html);
    if (refresh)
      refreshUnits(null);
    section = '';
    $('#edit_section').hide(ani);
    $('#edit_word').hide(ani);
  });
}

function refreshEditSection()
{
  $('#section_id').text('Edit section #' + secobj.sid);
  $('#section_name textarea').val(secobj.name);
  autosize.update($('#section_name textarea'));
  $('#section_style').html(jsonedit(secobj.style));
  $('#section_weight').html(jsonedit(secobj.weight));
  autosize($('#edit_section textarea'));
}

// Section tabs 'click'
$('#sectabs').on('click', 'a', function() {
  var secid = $(this).attr('sid');
  if (secid == "add")
    addSection();
  else if (secid == "check")
    ;
  else if (secid != section) {
    var a = $(this);
    $.getJSON("get/section.php?sid=" + secid, function(obj) {
      refreshUnits(secid);
      secobj = obj;
      section = obj.sid;
      style = JSON.parse(obj.style);
      if (style == null)
        style = {};
      weight = JSON.parse(obj.weight);
      if (weight == null)
        weight = {};
      a.closest('nav').find('.btn-warning').remove();
      a.append(sectionEditButton());
      $('#edit_section').hide(ani);
      $('#edit_word').show(ani);
    });
  }
});

// Section tabs 'edit'
$('#sectabs').on('click', '.btn-warning', function() {
  $('#edit_section').toggle(ani, function() {
    refreshEditSection();
  });
});

// Section editor header 'click'
$('#edit_section .card-header').click(function() {$('#edit_section').hide(ani);});

// Section editor 'cancel'
$('#section_name .nameeditor .btn-warning').click(function() {$('#edit_section').hide(ani);});

// Section editor 'submit'
$('#section_name .nameeditor .btn-success').click(function() {
  var obj = {sid: section};
  obj['name'] = $('#section_name textarea').val();
  obj['style'] = JSON.stringify(jsonobj($('#section_style')));
  obj['weight'] = JSON.stringify(jsonobj($('#section_weight')));
  $.post("set/section.php", JSON.stringify(obj), function(res) {
    if (res !== 'OK')
      alert("Save unsuccessful");
    else
      refreshSections(true);
  });
});

// Section editor 'remove'
$('#section_name .nameeditor .btn-danger').click(function() {
  if (confirm('DELETE section #' + section + '?'))
    $.post('set/delete_section.php', 'sid=' + section, function() {refreshSections(true);});
});
