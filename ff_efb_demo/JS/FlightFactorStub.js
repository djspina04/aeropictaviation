function FlightFactorStub() {

	setTimeout(function(){d_Dirok=1;}, 10000);
	this.d_Powered = 1;
	this.d_FwdLight = 0;
	this.d_CabLight = 0;
	this.d_AftLight = 0;
	this.d_CabinReady = 0;
	this.d_CabinReadyAvail = 0;
	this.d_Dirok = 1;
	this.d_FwdTemp=22.5;
	this.d_AftTemp=24.5;
	this.d_FwdTempCorrection=0;
	this.d_AftTempCorrection=0;
	this.d_FwdTempCkptDemand=24;
	this.d_AftTempCkptDemand=24;

	this.Get = function(path, handler) {
		var value = 0;
		if (path=="Aircraft.Electric.CIDS.FAP.Powered")value=this.d_Powered;
		else
		if (path=="Aircraft.Electric.CIDS.FAP.FwdLight")value=this.d_FwdLight;
		else
		if (path=="Aircraft.Electric.CIDS.FAP.CabLight")value=this.d_CabLight;
		else
		if (path=="Aircraft.Electric.CIDS.FAP.AftLight")value=this.d_AftLight;
		else
		if (path=="Aircraft.Electric.CIDS.FAP.CabinReady")value=this.d_CabinReady;
		else
		if (path=="Aircraft.Electric.CIDS.FAP.CabinReadyAvail")value=this.d_CabinReadyAvail;
		else
		if (path=="Aircraft.Electric.CIDS.FAP.DirOk")value=this.d_Dirok;
		else
		if (path=="Aircraft.Electric.CIDS.FAP")
			value={
				Powered:this.d_Powered,
				FwdLight:this.d_FwdLight,
				CabLight:this.d_CabLight,
				AftLight:this.d_AftLight,
				CabinReady:this.d_CabinReady,
				CabinReadyAvail:this.d_CabinReadyAvail,
				DirOk:this.d_Dirok,
				FwdTemperature:this.d_FwdTemp,
				AftTemperature:this.d_AftTemp,
				FwdTemperatureCorrection:this.d_FwdTempCorrection,
				AftTemperatureCorrection:this.d_AftTempCorrection,
				FwdTemperatureCkptDemand:this.d_FwdTempCkptDemand,
				AftTemperatureCkptDemand:this.d_AftTempCkptDemand

			};
		else{
			console.error("FlightFactor: Undefined parameter '%s'", path);
			return;
		}
		
		handler(value);
        };
	this.Set = function(path, value) {
		if (path=="Aircraft.Electric.CIDS.FAP.Powered")this.d_Powered=value;
		else
		if (path=="Aircraft.Electric.CIDS.FAP.FwdLight")this.d_FwdLight=value;
		else
		if (path=="Aircraft.Electric.CIDS.FAP.CabLight")this.d_CabLight=value;
		else
		if (path=="Aircraft.Electric.CIDS.FAP.AftLight")this.d_AftLight=value;
		else
		if (path=="Aircraft.Electric.CIDS.FAP.CabinReady")this.d_CabinReady=value;
		else
		if (path=="Aircraft.Electric.CIDS.FAP.CabinReadyAvail")this.d_CabinReadyAvail=value;
		else
		if (path=="Aircraft.Electric.CIDS.FAP.FwdTemperatureCorrection")this.d_FwdTempCorrection=value;
		else
		if (path=="Aircraft.Electric.CIDS.FAP.AftTemperatureCorrection")this.d_AftTempCorrection=value;
		else
		console.error("FlightFactor: Undefined parameter '%s'", path);
	};
}