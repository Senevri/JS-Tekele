/*
	AJAX tests
*/

function testAjax() {
	$.ajax({
		url: "http://localhost:81/mansikka/test/leiska",
		//context: document.body,
		success: function () {
			var w = new Widget();
			w.add("ajax success");
			w.drawTo('main');
		}
		
	});
}

