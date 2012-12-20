function MPI () {
	var messages = null;	
}

MPI.instance = null;
MPI.getInstance = function () {
	if (MPI.instance === null) {
		MPI.instance = new MPI();
		MPI.messages = [];
	}
	return MPI.instance;
}

