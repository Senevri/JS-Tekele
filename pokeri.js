//pokeri.js

widgets.push(new widget('init'));
foo = new widget('foo');
foo.add("<p>hello world too</p>");
foo.add("<p><moar stuff here!/p>");
foo.text();
widgets.push(foo);
drawWidgetsTo('main');
//document.getElementById('main').innerHTML = foo.text();
