var admin = require('firebase-admin');
var serviceAccount = require('./serviceAccountKey.json');
var express = require('express');
var app = express();

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://myapp-df0fa.firebaseio.com/"
});

var db = admin.database();
var ref = db.ref("Cities");

app.post('/Cities', function(req, res) {
	req.on('data', function(data) {
		datain = JSON.parse(data);
		if (!(datain['nama'].toUpperCase() === datain['nama']) ||
			!(datain['negara'].toUpperCase() === datain['negara'])) {
			result = {
				"isSuccess": false,
				"err": 'Nama kota dan negara harus uppercase'
			}
			res.send(result);
			return;
		}
		var isExist = false;
		ref.once("value", function(snapshot) {
			snapshot.forEach(doc => {
				if(datain['nama'] === doc.val()['nama']) {
					result = {
						"isSuccess": false,
						"err": 'Kota sudah pernah dimasukkan'
					}
					res.send(result);
					isExist = true;
					return;
				}
			});
		}).then(function() {
			if(isExist) return;
			ref.once("value", function(snapshot) {
				var s = "000";
				s = s + snapshot.numChildren();
				s = s.substr(s.length-3);
				var cityRef = ref.child(s);
				cityRef.set(datain);
				result = {
					"isSuccess": true,
					"data": datain,
					"ref id": s
				}
				res.send(result);
				console.log('Success adding data');
			});
		});
	});
});

app.put('/Cities/:id', function(req, res) {
	req.on('data', function(data) {
		cityRef = ref.child(req.params.id);
		datain = JSON.parse(data);
		cityRef.update(datain);
		cityRef.once("value", function(snapshot) {
			result = {
				"isSuccess": true,
				"data": snapshot
			}
			res.send(result);
			console.log('Success updating data');
		});
	});
});

app.get('/', function(req, res) {
	res.send("Hello!");
});

app.get('/Cities', function(req, res) {
	ref.orderByKey().once("value", function(snapshot) {
		var data = [];
		snapshot.forEach(doc => {
			data.push(doc);
		});
		result = {
			"isSuccess": true,
			"data": data
		}
		res.send(result);
	});
});

app.get('/Cities/:id', function(req, res) {
	cityRef = ref.child(req.params.id);
		cityRef.once("value", function(snapshot) {
		result = {
			"isSuccess": true,
			"data": snapshot
		}
		res.send(result);
	});
})

app.delete('/Cities/:id', function(req, res) {
	cityRef = ref.child(req.params.id);
	cityRef.remove();
	ref.orderByKey().once("value", function(snapshot) {
		var data = [];
		snapshot.forEach(doc => {
			data.push(doc);
		});
		result = {
			"isSuccess": true,
			"data": data
		}
		res.send(result);
		console.log('Success deleting data');
	});
})

var server = app.listen(3000, function() {
	console.log('Sample app is listening...');
});
