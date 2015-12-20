
// generate viewer from object code O at jquery selector
function work_inspect(sel, O) {
  $(function() {
    $(sel).html(O[0]).find(".obj.open").removeClass("open");
    $(sel).on("click", ".new", function(e) {
      var me = $(this);
      var o = me.data("o");
      me.toggleClass("new closed");
      me.hide();
      me.after(O[o]);
      e.stopPropagation();
    });
    $(sel).on("click", ".open", function(e) {
      var me = $(this);
      me.prev().show();
      me.hide();
      e.stopPropagation();
    });
    $(sel).on("click", ".closed", function(e) {
      var me = $(this);
      me.next().show();
      me.hide();
      e.stopPropagation();
    });
  });
};
