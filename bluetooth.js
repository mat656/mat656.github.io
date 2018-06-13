	//BLE

	let connectBtn = document.getElementById('connect');
	let m1slider   = document.getElementById('m1');
	let m2slider   = document.getElementById('m2');
	let automBtn   = document.getElementById('autonomus');
	let terminal   	   = document.getElementById('terminal');
	var m1Change = false;
	var m2Change = false;
	let deviceCache = null;
	let characteristicCache = null;
	let executedForward = false;
	let executedReverse = false;
	let executedRight = false;
	let executedLeft = false;



	window.onload = () => {
		if(!navigator.bluetooth){
			alert('Your current browser does not support web bluetooth or is not enabled. Please use the latest version of Chrome and enable Web Bluetooth under chrome://flags');
			connectBtn.disabled = true;
		}
		connectBtn.onclick = connect;
	}

	/* document.addEventListener('keydown', function (evt) {
			if (evt.keyCode === 87) {
				if (!executedForward){
					updateSpeedForward();
				}	
			}
			if (evt.keyCode === 65) {
				if (!executedLeft){
					turnLeft();
				}
			}
			if (evt.keyCode === 83) {
				if (!executedReverse){
					updateSpeedReverse();
				}
			}
			if (evt.keyCode === 68) {
				if(!executedRight){
					turnRight();
				}
			}

	});
	document.addEventListener('keyup', function (evt) {
			if (evt.keyCode === 87) {
				executedForward = false;
			stopMotor();  			
		}
		if (evt.keyCode === 65) {
				executedLeft = false;
			stopMotor();  			
		}
		if (evt.keyCode === 83) {
				executedReverse = false;
			stopMotor();  			
		}
		if (evt.keyCode === 68) {
				executedRight = false;
			stopMotor();  			
		}
	}); */

	//keyCodes for W(87) and A(65) S(83) D(68)
	var codeset = { 87: false, 65: false, 83: false, 68: false };

	//Tracking the Key down & Key up events
	document.addEventListener('keydown', function (e){
	    if (e.keyCode in codeset) {
	        codeset[e.keyCode] = true;
	        if(codeset[87]){
	        	if (!executedForward){
	        		updateSpeedForward();
	        	}
	        }
	        if(codeset[65]){
				if (!executedLeft){
					turnLeft();
				}
			}
	        if(codeset[83]){
				if (!executedReverse){
					updateSpeedReverse();
				}
			}	
	        if(codeset[68]){
				if(!executedRight){
					turnRight();
				}
			}
		}
	});

	document.addEventListener('keyup', function (e) {
	    if (e.keyCode in codeset) {
	        codeset[e.keyCode] = false;
	        executedForward = false;
				executedLeft = false;				
	  		executedReverse = false;
			executedRight = false;
			stopMotor();  			
	    }
	});


	function connect() {
			return (deviceCache ? Promise.resolve(deviceCache) :
		  requestBluetoothDevice()).
		  then(device => connectDeviceAndCacheCharacteristic(device)).
		  then(characteristic => startNotifications(characteristic)).
		  catch(error => console.log(error));
	}

	function requestBluetoothDevice() {

		  return navigator.bluetooth.requestDevice({
		    filters: [{services: [0xFFE0]}],
		  }).
		      then(device => {
		        deviceCache = device;
		        return deviceCache;
		    	});
	}

	function connectDeviceAndCacheCharacteristic(device) {
		  if (device.gatt.connected && characteristicCache) {
		    return Promise.resolve(characteristicCache);
		  }

		  return device.gatt.connect().
		      then(server => {
		        return server.getPrimaryService(0xFFE0);
		      }).
		      then(service => {
		        return service.getCharacteristic(0xFFE1);
		      }).
		      then(characteristic => {
		        characteristicCache = characteristic;

		        return characteristicCache;
		      });
	}

	function startNotifications(characteristic) {
			return characteristic.startNotifications().
			then(() => {
			characteristic.addEventListener('characteristicvaluechanged',
	    		handleCharacteristicValueChanged);
			});
	}

	function handleCharacteristicValueChanged(event) {
			let value = new TextDecoder().decode(event.target.value);
			console.log(value);
			log(value, 'in');
			console.log("Finito");
	}

	let readBuffer = '';

	function log(data, type = '') {
			terminal.insertAdjacentHTML('beforeend',
			'<div' + (type ? ' class="' + type + '"' : '') + '>' + data + '</div>');
	}

	function writeToCharacteristic(characteristic, str) {
			characteristic.writeValue(str2ab(str));
	}

	function str2ab(str){
		let buf = new ArrayBuffer(str.length); // 2 bytes for each char
		let bufView = new Uint8Array(buf); //make sure buffer array is of type uint8
		for (let i=0, strLen=str.length; i < strLen; i++) {
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	}


	function stopMotor(){
		let str = "000#00#0#00"; 
		console.log(str);
			writeToCharacteristic(characteristicCache, str);
	}

	function updateLed(){
		if(m2slider.value == 100){
			let str = "0#0#0#0#"+m2slider.value;
			console.log(str);
				writeToCharacteristic(characteristicCache, str);
		}else if(m2slider.value == 0) {
			let str = "000#0#0#0#"+m2slider.value;
			console.log(str);
				writeToCharacteristic(characteristicCache, str);
		}else {
			let str = "00#0#0#0#"+m2slider.value;
			console.log(str);
				writeToCharacteristic(characteristicCache, str);
		}
	}

	function updateSpeedForward(){
		executedForward = true;
		if(m1slider.value == 100){
			let str = m1slider.value+"#0#0#000";
			console.log(str);
				writeToCharacteristic(characteristicCache, str);
		}else if(m1slider.value == 0) {
			let str = m1slider.value+"#00#00#000";
			console.log(str);
				writeToCharacteristic(characteristicCache, str);
		}else {
			let str = m1slider.value+"#00#00#00";
			console.log(str);
				writeToCharacteristic(characteristicCache, str);
		}
	}

	function updateSpeedReverse(){
			executedReverse= true;
			if(m1slider.value == 100){
			let str = "0#"+m1slider.value+"#0#000";
			console.log(str);
				writeToCharacteristic(characteristicCache, str);
		}else if(m1slider.value == 0) {
			let str = "00#"+m1slider.value+"#00#000";
			console.log(str);
				writeToCharacteristic(characteristicCache, str);
		}else {
			let str = "00#"+m1slider.value+"#00#00";
			console.log(str);
				writeToCharacteristic(characteristicCache, str);
		}
	}

	function turnRight(){
		  	executedRight = true;
			if(m1slider.value == 100){
			let str = "00#00#0#"+m1slider.value;
			console.log(str);
				writeToCharacteristic(characteristicCache, str);
		}else if(m1slider.value == 0) {
			let str = "000#00#00#"+m1slider.value;
			console.log(str);
				writeToCharacteristic(characteristicCache, str);
		}else {
			let str = "00#00#00#"+m1slider.value;
			console.log(str);
				writeToCharacteristic(characteristicCache, str);
		}
	}

	function turnLeft(){
		  	executedLeft = true;
			if(m1slider.value == 100){
			let str = "00#00#"+m1slider.value+"#0";
			console.log(str);
				writeToCharacteristic(characteristicCache, str);
		}else if(m1slider.value == 0) {
			let str = "000#00#"+m1slider.value+"#00";
			console.log(str);
				writeToCharacteristic(characteristicCache, str);
		}else {
			let str = "00#00#"+m1slider.value+"#00";
			console.log(str);
				writeToCharacteristic(characteristicCache, str);
		}
	}

	function automode(){
		let str = "11#11#1#1#0";
		console.log(str);
			writeToCharacteristic(characteristicCache, str);
	}

	function get_info(){
		let str = "0#1#1#11#11";
		console.log(str);
			writeToCharacteristic(characteristicCache, str);
	}
