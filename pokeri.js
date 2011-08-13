//pokeri.js
var widgets = new Widget('widget');
widgets.add(new Widget('init'));
foo = new Widget('foo');
foo.add("<p>hello world too</p>");
foo.add("<p><moar stuff here!/p>");
foo.text();
widgets.add(foo);
widgets.drawTo('main');
//document.getElementById('main').innerHTML = foo.text();
