var Fap = function(){
	sim = new FlightFactor();
	//sim = new FlightFactorStub();
	
	PageShown = 								5; /*0=None, 1=Status*/
	PageScroll = 								0;
	BootComplete = 								0;
	Systemuptime = 								0;
	Lastinputtime = 							0;
	timer = setInterval(function(){ Screensaver() }, 1000);
	debugtimer = setInterval(function(){ DebugAnimation() }, 1000);
	loadingTimer = 0;
	debug = 									0;

	WaterWaste_WasteLevel = 					0;
	WaterWaste_WaterLevel = 					0;

	Temperature_FWDActual = 					24.0;
	Temperature_AFTActual = 					24.0;
	Temperature_FWDSelectedCockpit = 			24.0;
	Temperature_AFTSelectedCockpit = 			24.0;
	Temperature_FWDSelectedCabin = 				0.0;
	Temperature_AFTSelectedCabin = 				0.0;
	Temperature_FWDCorrection = 				0.0;
	Temperature_AFTCorrection = 				0.0;
	Temperature_DisplaySelect	=				0;

	Door_L1 = 									0;
	Door_L2 = 									0;
	Door_OWL1 = 								0;
	Door_OWL2 = 								0;						
	Door_OWR1 = 								0;
	Door_OWR2 = 								0;
	Door_L3 = 									0;
	Door_R3 = 									0;

	Light_MainActual = 							0;
	Light_MainRequest = 						0;
	Light_AISLActual = 							0;
	Light_AISLRequest = 						0;
	Light_WIDWActual = 							0;
	Light_WIDWRequest = 						0;
	Light_FWDActual = 							0;
	Light_FWDRequest = 							0;
	Light_MIDActual = 							0;
	Light_MIDRequest = 							0;
	Light_AFTActual = 							0;
	Light_AFTRequest = 							0;
	Light_RLActual = 							0;
	Light_RLRequest = 							0;

	PA_Playing = 								"NULL";
	PA_Chanavail = 								0;
	PA_PaAvail	=								"NONE";
	PA_PaRequest = 								"NONE";
	PA_VolumeActual = 							5;
	PA_VolumeRequest = 							0;

	CabinReady =								0;
	CabinReadyAvail =							0;
	Powered = 									0;
	DirOk = 									0;

	Color_failiure =							"Magenta";
	Light_ColorOff =							"Grey";
	Light_ColorLow =							"olive";
	Light_ColorMed =							"darkkhaki";
	Light_ColorHigh =							"Yellow";

	button_active = "url('Resources/FAP/button_active.png')";
	button_normal = "url('Resources/FAP/button_normal.png')";
	button_inactive = "url('Resources/FAP/button_inactive.png')";

	updateData = 0;
	processData = 0;

	refreshLight = 1;
	refreshStatus = 1;
	refreshTemperature = 1;

	/*XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
				/*    INTITIALIZATION 	*/
	function Initialize()
	{
		Lastinputtime = new Date();
		Shutdown();
		updateData = setInterval(UpdateData, 1500);
		processData = setInterval(ProcessData, 1000);
	}

	function UpdateData()
	{	
		sim.Get("Aircraft.Electric.CIDS.FAP", function(data){
			if (data.Powered>0){
				if (Powered==0)
					Powerup(data.Ready);
				Powered = 1;

				DirOk = data.DirOk;
			}
			else{
				if (Powered>0)
					Shutdown();
				Powered=0;
			}

			if (CabinReadyAvail!=data.CabinReadyAvail || CabinReady!=data.CabinReady)			{
				CabinReadyAvail = data.CabinReadyAvail;
				CabinReady = data.CabinReady;
				refreshStatus=1;
			}
			

			if (Light_FWDActual!=data.FwdLight)
				LightUpdateState(1,data.FwdLight);
			if (Light_MIDActual!=data.CabLight)
				LightUpdateState(2,data.CabLight);
			if (Light_AFTActual!=data.AftLight)
				LightUpdateState(3,data.AftLight);

			if (Temperature_FWDCorrection!=data.FwdTemperatureCorrection || Temperature_AFTCorrection!=data.AftTemperatureCorrection ||
				Temperature_FWDActual!=data.FwdTemperature || Temperature_AFTActual!=data.AftTemperature ||
				Temperature_FWDSelectedCockpit!=data.FwdTemperatureCkptDemand || Temperature_AFTSelectedCockpit!=data.AftTemperatureCkptDemand) {
				Temperature_FWDCorrection=data.FwdTemperatureCorrection;
				Temperature_AFTCorrection=data.AftTemperatureCorrection;
				Temperature_FWDActual=data.FwdTemperature;
				Temperature_AFTActual=data.AftTemperature;
				Temperature_FWDSelectedCockpit=data.FwdTemperatureCkptDemand;
				Temperature_AFTSelectedCockpit=data.AftTemperatureCkptDemand;
				refreshTemperature=1; 
			}			
		});	
	}

	function ProcessData()
	{
		if (refreshLight)
			RefreshLight();
		if (refreshStatus)
			RefreshCabinReady();
		if (refreshTemperature)
			RefreshTemperature();
		refreshLight = 0;
		refreshStatus = 0;
		refreshTemperature = 0;
	}

	function Shutdown(){
		// fap_body
		BootComplete = 0;
		Systemuptime = 0;

		clearInterval(loadingTimer);

		document.getElementById('progress_loading').value = 0;
		document.getElementById('fap_body').style.visibility = "hidden";
		document.getElementById('fap_loading').style.visibility = "hidden";
		document.getElementById('fap_border').style.visibility = "hidden";
		document.getElementById('fap_container').style.visibility = "hidden";
		document.getElementById('fap_screensaver').style.display = "hidden";
		document.getElementById('fap_img_screensaver').style.display = "hidden";
		document.getElementById('fap_td_AUDIO').style.visibility = "hidden";
		document.getElementById('fap_td_LIGHTS').style.visibility = "hidden";
		document.getElementById('fap_td_DOOR').style.visibility = "hidden";
		document.getElementById('fap_td_TEMPERATURE').style.visibility = "hidden";
		document.getElementById('fap_td_WATER').style.visibility = "hidden";
		document.getElementById('fap_title').style.visibility = "hidden";
		document.getElementById('fap_interface_waterwaste').style.display = "none";
		document.getElementById('fap_interface_temperature').style.display = "none";		
		document.getElementById('fap_interface_lights').style.display = "none";
		document.getElementById('fap_button_cabin_ready').style.visibility="hidden";
		var elements = document.getElementsByClassName('fap_row_title');
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];
			element.style.visibility = "hidden";
		}
	}

	function Powerup(ready){
		document.getElementById('fap_body').style.visibility = "visible";
		resizetext();
		BootComplete = 0;
		Lastinputtime = new Date();
		PageShown=1;
		
		document.getElementById('fap_button_status').style.backgroundImage = button_active;
		
	/*	if(BootComplete==1){ // for future, if we have loading sequence finished but screen is switched off
			if(Systemuptime<24)Systemuptime=24
			document.getElementById('fap_loading').style.visibility = "hidden";
			document.getElementById('fap_border').style.visibility = "visible";
			document.getElementById('fap_container').style.visibility = "visible";
			document.getElementById('fap_screensaver').style.display = "none";
			document.getElementById('fap_img_screensaver').style.display = "none";
			Lastinputtime = new Date();
			dynamicUpdateTimer = setInterval(UpdateDynamic, 1000);
			ShowPage(PageShown);		
			return;
		}*/
		if(BootComplete!=1){
			/*Initiate Boot Seq*/
			if (ready)
				Systemuptime = 30;
			loadingTimer = setInterval(selftest, 40)
			return;
		}
	}

	function selftest(){
		Systemuptime = Systemuptime + 0.1;
		if(Systemuptime<1)
			return;
		
		if (Systemuptime<16){
			if(Systemuptime<4){
				document.getElementById('fap_loading').style.visibility ="visible";
				document.getElementById('fap_loading').style.display = "block";
				return;
			}
			if(Systemuptime<8){
				document.getElementById('progress_loading').value = 0.10;
				return;
			}
			if(Systemuptime<10){
				document.getElementById('progress_loading').value = (Systemuptime-6)*0.1
				return;
			}
			if(Systemuptime<14){
				document.getElementById('progress_loading').value = 0.75;
				return;
			}
			if(Systemuptime<15){
				document.getElementById('progress_loading').value = 0.95;
				return;
			}
		}
		if(Systemuptime>16)
			document.getElementById('fap_loading').style.visibility = "hidden";	
		if(Systemuptime>18)
			document.getElementById('fap_border').style.visibility = "visible";	
		if(Systemuptime>22)
			document.getElementById('fap_container').style.visibility = "visible";
		if (DirOk==0)
			return;
		if(Systemuptime>23)
			document.getElementById('fap_td_AUDIO').style.visibility = "visible";
		if(Systemuptime>24)
			document.getElementById('fap_td_TEMPERATURE').style.visibility = "visible";
		if(Systemuptime>25){
			document.getElementById('fap_td_DOOR').style.visibility = "visible";
			document.getElementById('fap_td_WATER').style.visibility = "visible";
		}
		if(Systemuptime>26)
			document.getElementById('fap_td_LIGHTS').style.visibility = "visible";		
		if(Systemuptime>27){		
			clearInterval(loadingTimer);
			BootComplete = 1;
			Lastinputtime = new Date();
			PageShown=1;
			ShowPage(PageShown);
			//dynamicUpdateTimer = setInterval(UpdateDynamic, 3000);
			document.getElementById('fap_button_status').style.backgroundImage = button_active;
			return;
		}
	}

	/*-------------------------------------------------------- */
	/*XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
				/*    DRAWING PAGES 	*/
	function SelectPage(id){
		if(PageShown!=id){setTimeout(function(){ShowPage(id)},50)};
	}
	function ShowPage(id){
		PageShown = id;
		FlushPage();
		setTimeout(function(){LoadPage(id)},300);
	}
							
	function FlushPage(){
			document.getElementById('fap_td_AUDIO').style.visibility = "hidden";
			document.getElementById('fap_td_LIGHTS').style.visibility = "hidden";
			document.getElementById('fap_td_DOOR').style.visibility = "hidden";
			document.getElementById('fap_td_TEMPERATURE').style.visibility = "hidden";
			document.getElementById('fap_td_WATER').style.visibility = "hidden";	
			document.getElementById('fap_title').style.visibility = "hidden";
			document.getElementById('fap_interface_waterwaste').style.display = "none";
			document.getElementById('fap_interface_temperature').style.display = "none";		
			document.getElementById('fap_interface_lights').style.display = "none";
			var elements = document.getElementsByClassName('fap_row_title');
				for (var i = 0; i < elements.length; i++) {
					var element = elements[i];
					element.style.visibility = "hidden";
				}
			document.getElementById('fap_button1').style.backgroundImage = button_normal;
			document.getElementById('fap_button2').style.backgroundImage = button_normal;
			document.getElementById('fap_button3').style.backgroundImage = button_normal;
			document.getElementById('fap_button4').style.backgroundImage = button_normal;
			document.getElementById('fap_button5').style.backgroundImage = button_normal;		
			document.getElementById('fap_button_status').style.backgroundImage = button_normal;
			
	}

				
	function LoadPage(id){
		//beep.play();
		PageShown = id;
		document.getElementById('fap_title').style.visibility = "visible";
		if(id==0){
			document.getElementById('fap_title').innerHTML = "";
		};
		
		if(id==1){																							/*STATUS*/
			document.getElementById('fap_title').innerHTML = "CABIN STATUS";
			document.getElementById('fap_td_AUDIO').style.visibility = "visible";
			document.getElementById('fap_td_LIGHTS').style.visibility = "visible";
			document.getElementById('fap_td_DOOR').style.visibility = "visible";
			document.getElementById('fap_td_TEMPERATURE').style.visibility = "visible";
			document.getElementById('fap_td_WATER').style.visibility = "visible";
			var elements = document.getElementsByClassName('fap_row_title');
				for (var i = 0; i < elements.length; i++) {
					var element = elements[i];
					element.style.visibility = "visible";
				}
			document.getElementById('fap_button_status').style.backgroundImage = button_active;
			RefreshStatus();
		}
		if(id==2){																							/*AUDIO*/
			document.getElementById('fap_title').innerHTML = "AUDIO";
			document.getElementById('fap_td_AUDIO').style.visibility = "visible";
			document.getElementById('fap_button1').style.backgroundImage = button_active;
			RefreshStatus();
		}
		if(id==3){																							/*LIGHTS*/
			document.getElementById('fap_title').innerHTML = "CABIN LIGHTING";
			document.getElementById('fap_td_LIGHTS').style.visibility = "visible";
			document.getElementById('fap_interface_lights').style.display = "block";
			document.getElementById('fap_button2').style.backgroundImage = button_active;
			RefreshStatus();
		}
		if(id==4){																							/*DOOR / SLIDES*/
			document.getElementById('fap_title').innerHTML = "DOOR / SLIDES";
			document.getElementById('fap_td_DOOR').style.visibility = "visible";
			document.getElementById('fap_button3').style.backgroundImage = button_active;
			RefreshStatus();		
		}
		if(id==5){																							/*TEMPERATURE*/
			document.getElementById('fap_title').innerHTML = "CABIN TEMPERATURE";
			document.getElementById('fap_td_TEMPERATURE').style.visibility = "visible";		
			document.getElementById('fap_interface_temperature').style.display = "block";
			document.getElementById('fap_button4').style.backgroundImage = button_active;
			RefreshStatus();		
		}
		if(id==6){																							/*WATER / WASTE*/
			document.getElementById('fap_title').innerHTML = "WATER / WASTE";
			document.getElementById('fap_td_WATER').style.visibility = "visible";
			document.getElementById('fap_interface_waterwaste').style.display = "block";
			document.getElementById('fap_button5').style.backgroundImage = button_active;
			RefreshWater();	
		}
	}

	function RefreshCabinReady()
	{
		var div_cabin_ready = document.getElementById('fap_button_cabin_ready');

		if (CabinReadyAvail>0){
			div_cabin_ready.style.visibility="visible";
			if (CabinReady>0)
				div_cabin_ready.style.backgroundImage = button_active;
			else
				div_cabin_ready.style.backgroundImage = button_normal;
		}
		else
			div_cabin_ready.style.visibility="hidden";
	}

	function RefreshStatus(){
		
		var div_temperature_fwd =  document.getElementById('fap_temperature_fwd_value');
		var div_temperature_aft =  document.getElementById('fap_temperature_aft_value');
		
		var div_audio_volume = document.getElementById('fap_audio_volume');
		var div_audio_playing = document.getElementById('fap_audio_playing');

		div_temperature_fwd.innerHTML = temptostring(Temperature_FWDActual);
		div_temperature_aft.innerHTML = temptostring(Temperature_AFTActual);
		
		div_audio_volume.style.height = 100 - (PA_VolumeActual*10) + "%";
		if(PA_Playing=="NULL"){	
			div_audio_playing.innerHTML = "";
			}
			else{div_audio_playing.innerHTML = PA_Playing;
		}
	}

	function RefreshWater(){
		var water_wastelevel =  document.getElementById('fap_water_wastelevel');
		var water_waterlevel =  document.getElementById('fap_water_waterlevel');
		water_wastelevel.style.height = (WaterWaste_WasteLevel / 150 * 62) +"%";
		water_waterlevel.style.height = (WaterWaste_WaterLevel / 200 * 62) +"%";
	}

	function RefreshLight(){
		var div_light_fwd =  document.getElementById('fap_light_fwd');
		var div_light_mid =  document.getElementById('fap_light_mid');
		var div_light_aft =  document.getElementById('fap_light_aft');

		var light_button_fwd_brt =  document.getElementById('fap_light_button_fwd_brt');
		var light_button_fwd_dim1 =  document.getElementById('fap_light_button_fwd_dim1');
		var light_button_fwd_dim2 =  document.getElementById('fap_light_button_fwd_dim2');
		var light_button_cab_brt =  document.getElementById('fap_light_button_cab_brt');
		var light_button_cab_dim1 =  document.getElementById('fap_light_button_cab_dim1');
		var light_button_cab_dim2 =  document.getElementById('fap_light_button_cab_dim2');
		var light_button_aft_brt =  document.getElementById('fap_light_button_aft_brt');
		var light_button_aft_dim1 =  document.getElementById('fap_light_button_aft_dim1');
		var light_button_aft_dim2 =  document.getElementById('fap_light_button_aft_dim2');
		
		var light_button_Main =  document.getElementById('fap_light_button_Main');
		var light_button_AISLE =  document.getElementById('fap_light_button_AISLE');
		var light_button_WIDW =  document.getElementById('fap_light_button_WIDW');
		
		div_light_fwd.style.backgroundColor = colorfromlight(Light_FWDActual);
		div_light_mid.style.backgroundColor = colorfromlight(Light_MIDActual);
		div_light_aft.style.backgroundColor = colorfromlight(Light_AFTActual);

		
		light_button_Main.style.backgroundImage = button_normal;
		light_button_AISLE.style.backgroundImage = button_normal;
		light_button_WIDW.style.backgroundImage = button_normal;	
		if(Light_MainActual==1)light_button_Main.style.backgroundImage = button_active;
		if(Light_AISLActual==1)light_button_AISLE.style.backgroundImage = button_active;
		if(Light_WIDWActual==1)light_button_WIDW.style.backgroundImage = button_active;
		
		light_button_fwd_brt.style.backgroundImage = button_normal;
		light_button_fwd_dim1.style.backgroundImage = button_normal;
		light_button_fwd_dim2.style.backgroundImage = button_normal;
		if(Light_FWDActual==3)light_button_fwd_brt.style.backgroundImage = button_active;
		if(Light_FWDActual==2)light_button_fwd_dim1.style.backgroundImage = button_active;
		if(Light_FWDActual==1)light_button_fwd_dim2.style.backgroundImage = button_active;
		
		light_button_cab_brt.style.backgroundImage = button_normal;
		light_button_cab_dim1.style.backgroundImage = button_normal;
		light_button_cab_dim2.style.backgroundImage = button_normal;
		if(Light_MIDActual==3)light_button_cab_brt.style.backgroundImage = button_active;
		if(Light_MIDActual==2)light_button_cab_dim1.style.backgroundImage = button_active;
		if(Light_MIDActual==1)light_button_cab_dim2.style.backgroundImage = button_active;
		
		light_button_aft_brt.style.backgroundImage = button_normal;
		light_button_aft_dim1.style.backgroundImage = button_normal;
		light_button_aft_dim2.style.backgroundImage = button_normal;
		if(Light_AFTActual==3)light_button_aft_brt.style.backgroundImage = button_active;
		if(Light_AFTActual==2)light_button_aft_dim1.style.backgroundImage = button_active;
		if(Light_AFTActual==1)light_button_aft_dim2.style.backgroundImage = button_active;
		
		
	}
	function RefreshTemperature(){
		Temperature_FWDSelectedCabin = Temperature_FWDSelectedCockpit+Temperature_FWDCorrection;
		Temperature_AFTSelectedCabin = Temperature_AFTSelectedCockpit+Temperature_AFTCorrection;

		var div_temperature_fwd =  document.getElementById('fap_temperature_fwd_value');
		var div_temperature_aft =  document.getElementById('fap_temperature_aft_value');
		div_temperature_fwd.innerHTML = temptostring(Temperature_FWDActual);
		div_temperature_aft.innerHTML = temptostring(Temperature_AFTActual);

		var temp_select_value_thermometer =  document.getElementById('fap_temp_select_value_thermometer');
		var temp_select_value =  document.getElementById('fap_temp_select_value');
		var div_temp_box_title =  document.getElementById('fap_temp_box_title');
		var temp_select_value_thermometer_label = document.getElementById('fap_temp_select_value_thermometer_label');
		
		 	
		
		if(Temperature_DisplaySelect==1){		
			temp_select_value.innerHTML = "<b>" + temptostring(Temperature_FWDSelectedCabin) + "°C</b>";
			temp_select_value_thermometer.style.height = heightfromtemperature(Temperature_FWDActual)+"%";
			div_temp_box_title.innerHTML = "FWD AREA";
			temp_select_value_thermometer_label.innerHTML = temptostring(Temperature_FWDActual) + "°C";
			
		}
		if(Temperature_DisplaySelect==2){
			temp_select_value.innerHTML = "<b>" + temptostring(Temperature_AFTSelectedCabin) + "°C</b>";
			temp_select_value_thermometer.style.height = heightfromtemperature(Temperature_AFTActual)+"%";
			div_temp_box_title.innerHTML = "AFT AREA";
			temp_select_value_thermometer_label.innerHTML = temptostring(Temperature_AFTActual) + "°C";
		
		}		
	}

	function TempRequest(direction){
		if(direction=="="){
			Temperature_FWDSelectedCabin=Temperature_FWDSelectedCockpit;
			Temperature_AFTSelectedCabin=Temperature_AFTSelectedCockpit;
			Temperature_FWDCorrection=0.0;
			Temperature_AFTCorrection=0.0;		
		}
		else{
			if(direction=="+"){
				if(Temperature_DisplaySelect==1)
					Temperature_FWDCorrection=Temperature_FWDCorrection+0.5;
				if(Temperature_DisplaySelect==2)
					Temperature_AFTCorrection=Temperature_AFTCorrection+0.5;
			}
			if(direction=="-"){
				if(Temperature_DisplaySelect==1)
					Temperature_FWDCorrection=Temperature_FWDCorrection-0.5;
				if(Temperature_DisplaySelect==2)
					Temperature_AFTCorrection=Temperature_AFTCorrection-0.5;		
			}

			if(Temperature_FWDCorrection>2)
				Temperature_FWDCorrection=2; 	
			if(Temperature_FWDCorrection<-2)
				Temperature_FWDCorrection=-2; 	
			if(Temperature_AFTCorrection>2)
				Temperature_AFTCorrection=2;
			if(Temperature_AFTCorrection<-2)
				Temperature_AFTCorrection=-2;
		}
		
		sim.Set("Aircraft.Electric.CIDS.FAP.FwdTemperatureCorrection", Temperature_FWDCorrection);
		sim.Set("Aircraft.Electric.CIDS.FAP.AftTemperatureCorrection", Temperature_AFTCorrection);

		RefreshTemperature();
	}

	function TempToggle(id){
		var temp_select_value_box_up =  document.getElementById('fap_temp_select_value_box_up');
		var temp_select_value_box_down =  document.getElementById('fap_temp_select_value_box_down');
		
		if((id==Temperature_DisplaySelect)||((Temperature_DisplaySelect==0)&&(id==0))){
			temp_select_value_box_up.style.display = "none";
			temp_select_value_box_down.style.display = "none";
			Temperature_DisplaySelect=0;
			RefreshTemperature();
			return;
		}
		if((id==1)||(id==2)){		
			temp_select_value_box_up.style.display = "block";
			temp_select_value_box_down.style.display = "block";		
			Temperature_DisplaySelect=id;
			RefreshTemperature();
			return;
		}
		
		
	}

	function heightfromtemperature(temperature){
		var mintemp = 11; /* %height for 16°C */
		var maxtemp = 86; /* %height for 30°C */
		var onedegree = (maxtemp-mintemp)/14;
		
		var height = mintemp;
		
		if((temperature>=16)&&(temperature<=30)){	
			height = ((temperature-16)*onedegree)+mintemp;				
	}
		else{
			if(temperature>16)height = maxtemp;
			if(temperature<16)height =  mintemp;
		}
		return height;
		
		
	}

	/*-------------------------------------------------------- */
	function DisplayTouch(){
		Lastinputtime = new Date();
		
		}
	function ScreensaverTouch(){
		Lastinputtime = new Date();
		setTimeout(hideScreensaverImage,500);
		setTimeout(hideScreensaverBackground, 1300);
	}
	function hideScreensaverImage(){
		document.getElementById('fap_img_screensaver').style.display = "none";	
	}
	function hideScreensaverBackground(){
		document.getElementById('fap_screensaver').style.display = "none";
	}

	function showScreensaverImage(){
		document.getElementById('fap_img_screensaver').style.display = "block";	
	}
	function showScreensaverBackground(){
		document.getElementById('fap_screensaver').style.display = "block";
	}
	function ShowScreensaver(){	
		setTimeout(showScreensaverBackground,500);
		setTimeout(showScreensaverImage, 1300);
	}

	function Screensaver(){
		var timenow = new Date();
		var diff = (timenow.getTime()-Lastinputtime.getTime())/1000;
		
		if(diff>=30){
			//ShowScreensaver();
		}
	}



	function LightUpdateState(zone,value){
		
		Light_FWDRequest=Light_FWDActual;
		Light_MIDRequest=Light_MIDActual;
		Light_AFTRequest=Light_AFTActual;
		
		if(zone==0){/*Master ROW*/
				if(value==1){/*LIGHT MASTER PRESS*/
					if(Light_MainActual==1){
						Light_MainRequest=0;
					}else{
						Light_MainRequest=1;
					}
					
				}	
				if(value==2){/*AISL MASTER PRESS*/
					if(Light_AISLActual==1)Light_AISLRequest=0;
					if(Light_AISLActual==0)Light_AISLRequest=1;
				}	
				if(value==3){/*WDO MASTER PRESS*/
					if(Light_WIDWActual==1)Light_WIDWRequest=0;
					if(Light_WIDWActual==0)Light_WIDWRequest=1;
				}	
				if(value==4){/*R/L SET MASTER PRESS*/
					Light_RLRequest=1;
				}	
				if(value==5){/*R/L RESET MASTER PRESS*/
					Light_RLRequest=0;
				}			
		}
		
		
		if(zone==1){
				if(Light_FWDActual==value){Light_FWDRequest=0};
				if(Light_FWDActual!=value){
					Light_FWDRequest=value
					if(Light_MainActual==0)Light_MainRequest=1;
					if((Light_AISLActual==0)&&(Light_WIDWActual==0))Light_MainRequest=1;
					};			
				if((Light_FWDRequest==0)&&(Light_MIDRequest==0)&&(Light_AFTRequest==0))Light_MainRequest=0;		
		}
		if(zone==2){
				if(Light_MIDActual==value){Light_MIDRequest=0};
				if(Light_MIDActual!=value){
					Light_MIDRequest=value
					if(Light_MainActual==0)Light_MainRequest=1;
					if((Light_AISLActual==0)&&(Light_WIDWActual==0))Light_MainRequest=1;
					};	
				if((Light_FWDRequest==0)&&(Light_MIDRequest==0)&&(Light_AFTRequest==0))Light_MainRequest=0;				
		}
		if(zone==3){
				if(Light_AFTActual==value){Light_AFTRequest=0};
				if(Light_AFTActual!=value){
					Light_AFTRequest=value
					if(Light_MainActual==0)Light_MainRequest=1;
					if((Light_AISLActual==0)&&(Light_WIDWActual==0))Light_MainRequest=1;
					};	
				if((Light_FWDRequest==0)&&(Light_MIDRequest==0)&&(Light_AFTRequest==0))Light_MainRequest=0;				
		}
		
		if((Light_MainRequest==0)&&(Light_MainActual==1)){		
						Light_AISLRequest=0;
						Light_WIDWRequest=0;
						Light_FWDRequest=0;
						Light_MIDRequest=0;
						Light_AFTRequest=0;		
		}
		if((Light_MainRequest==1)&&(Light_MainActual==0)){
			if((Light_FWDActual==0)&&(Light_MIDActual==0)&&(Light_AFTActual==0)&&(Light_FWDRequest==0)&&(Light_MIDRequest==0)&&(Light_AFTRequest==0)){
						if((Light_AISLActual==0)&&(Light_WIDWActual==0)){						
							Light_AISLRequest=1;
							Light_WIDWRequest=1;
						}
						Light_FWDRequest=3;
						Light_MIDRequest=3;
						Light_AFTRequest=3;
			}else{
						if((Light_AISLActual==0)&&(Light_WIDWActual==0)){						
							Light_AISLRequest=1;
							Light_WIDWRequest=1;
						}
			}
						
		}
		
		Light_FWDActual=Light_FWDRequest;
		Light_MIDActual=Light_MIDRequest;
		Light_AFTActual=Light_AFTRequest;	
		Light_MainActual=Light_MainRequest;
		Light_AISLActual=Light_AISLRequest;
		Light_WIDWActual=Light_WIDWRequest;
		Light_RLActual=Light_RLRequest;

		refreshLight = 1;
	}

	function LightRequest(zone,value){
		LightUpdateState(zone,value);

		sim.Set("Aircraft.Electric.CIDS.FAP.FwdLight", Light_FWDActual);
		sim.Set("Aircraft.Electric.CIDS.FAP.CabLight", Light_MIDActual);
		sim.Set("Aircraft.Electric.CIDS.FAP.AftLight", Light_AFTActual);

		setTimeout(RefreshLight,200);
		setTimeout(RefreshStatus,200);
		/*END DEBUG*/	
	}

	function CabinReadyRequest(){
		if (CabinReadyAvail>0)
		{
			if (CabinReady==0)
				CabinReady=1;
			else
				CabinReady=0;

			sim.Set("Aircraft.Electric.CIDS.FAP.CabinReady", CabinReady);

			RefreshCabinReady();
		}
	}

	function colorfromlight(value){
		var color = Color_failiure;
		if(value==0){color=Light_ColorOff};
		if(value==1){color=Light_ColorLow};
		if(value==2){color=Light_ColorMed};
		if(value==3){color=Light_ColorHigh};
		return color;
	}





	window.onresize = function () {
			resizetext();
	}
	function resizetext(){	
			var Borderwidth = 1000;//(document.getElementById("fap_border").offsetWidth);		 
			var elements = document.getElementsByClassName('bigfont');
				for (var i = 0; i < elements.length; i++) {
					var element = elements[i];
					element.style.fontSize = Borderwidth*0.03+"px";
				}
			var elements = document.getElementsByClassName('biggerfont');
				for (var i = 0; i < elements.length; i++) {
					var element = elements[i];
					element.style.fontSize = Borderwidth*0.017+"px";
				}
			var elements = document.getElementsByClassName('smallfont');
				for (var i = 0; i < elements.length; i++) {
					var element = elements[i];
					element.style.fontSize = Borderwidth*0.015+"px";
				}
			var elements = document.getElementsByClassName('fap_button');
				for (var i = 0; i < elements.length; i++) {
					var element = elements[i];
					element.style.fontSize = Borderwidth*0.008+"px";
					element.style.width = Borderwidth*0.049+"px";
					element.style.height = Borderwidth*0.049+"px";
				}
			var elements = document.getElementsByClassName('fap_buttonamber');
				for (var i = 0; i < elements.length; i++) {
					var element = elements[i];
					element.style.fontSize = Borderwidth*0.008+"px";
					element.style.width = Borderwidth*0.049+"px";
					element.style.height = Borderwidth*0.049+"px";
				}
				/* button is 5% of width */
			
	}			
			
	function temptostring(value){
		if (Number.isInteger(value)) { 
			return value + ".0"
		} else {
			return value.toString(); 
		}
	}	

	
		
	/* DEBUG */
	function switchpages(){
		if(PageShown==1){
			ShowPage(2);
			return;
		}
		if(PageShown==2){
			ShowPage(3);
			return;
		}
		if(PageShown==3){
			ShowPage(4);
			return;
		}
		if(PageShown==4){
			ShowPage(5);
			return;
		}
		if(PageShown==5){
			ShowPage(6);
			return;
		}
		if(PageShown==6){
			ShowPage(1);
			return;
		}
	}

	function Debug(){
		
			if(debug==1){
				debug=0;
				return;
			}else{
			if(debug==0)debug=1;
			return;
			}
	}


	function DebugAnimation(){
		if(debug==1){		
			if(WaterWaste_WasteLevel<=140){
				WaterWaste_WasteLevel=WaterWaste_WasteLevel+10;
			}else{
				WaterWaste_WasteLevel=0;
			}
			
			if(WaterWaste_WaterLevel>=20){
				WaterWaste_WaterLevel=WaterWaste_WaterLevel-20;
			}else{
				WaterWaste_WaterLevel=200;
			}
			RefreshWater();
			
			if(Temperature_FWDActual>=28){
				Temperature_FWDActual=16;
			}
			else{
				Temperature_FWDActual=Temperature_FWDActual+0.5;
			}
			if(Temperature_AFTActual>=28){
				Temperature_AFTActual=16;
			}
			else{
				Temperature_AFTActual=Temperature_AFTActual+1.5;
			}
			
			if(PA_VolumeActual<=9){
				PA_VolumeActual=PA_VolumeActual+1;
			}else{
				PA_VolumeActual=0;
			}
			if(PA_Playing=="NULL")PA_Playing=0;
			if(PA_Playing<=3){
				PA_Playing=PA_Playing+1;
			}else{
				PA_Playing="NULL";
			}
			RefreshTemperature();
			RefreshStatus();
		}
	}

	return{
		Initialize: Initialize,
		SelectPage: SelectPage,
		DisplayTouch: DisplayTouch,
		ScreensaverTouch: ScreensaverTouch,
		Powerup: Powerup,
		LightRequest: LightRequest,
		CabinReadyRequest: CabinReadyRequest,
		TempRequest: TempRequest,
		TempToggle: TempToggle,
		Debug: Debug,
		CabinReady: CabinReady,
		ShowScreensaver: ShowScreensaver,
		FF:sim
	}
}();

$(document).ready(function(){
		Fap.Initialize();
	});
