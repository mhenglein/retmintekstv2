function runPopovers() {
  var is_touch_device = "ontouchstart" in window || (window.DocumentTouch && document instanceof DocumentTouch);

  $('[data-toggle="popover"]').popover({
    trigger: is_touch_device ? "click focus" : "hover focus",
  });
}

$(document).ready(function () {
  runPopovers();
});

setTimeout(runPopovers, 10000);
