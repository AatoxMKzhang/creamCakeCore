import { YouziData, BI_PAGE_TYPE } from "./YouziData";

export default class YouziBoxManager {
    public static instance:YouziBoxManager = null;
    public referrerInfo = {
        appid:null,
        anChannelId:null,
        ioChannelId:null,
        appId:null,
        togame:null,
        userType:null,
        boxAppid:null,
        locationIndex:null
    };

    constructor(){
        
    }

    public static getInstance(){
        if(this.instance == null){
            this.instance = new YouziBoxManager();
        }
        return this.instance;
    }

    wxLaunch(launchInfo){
        if(launchInfo.referrerInfo && launchInfo.referrerInfo.appId && launchInfo.referrerInfo.extraData && launchInfo.referrerInfo.extraData.togame)
        {
            this.referrerInfo = launchInfo.referrerInfo.extraData
            this.referrerInfo.appid = launchInfo.referrerInfo.appId
        }
        if(launchInfo.query && launchInfo.query.appid && launchInfo.query.togame)
        {
            this.referrerInfo =  launchInfo.query
            this.referrerInfo.appid = launchInfo.query.appid
        }

        if(launchInfo.query &&this.referrerInfo &&launchInfo.query.anChannelId)
        {
            this.referrerInfo.anChannelId = launchInfo.query.anChannelId
            this.referrerInfo.ioChannelId = launchInfo.query.ioChannelId
        }
    }

    wxOnShow(res){
        if(res.scene == 1037){
            if(res.referrerInfo && res.referrerInfo.appId&&res.referrerInfo.extraData&&res.referrerInfo.extraData.togame)
            {
                this.referrerInfo = res.referrerInfo.extraData
                this.referrerInfo.appid = res.referrerInfo.appId
            }

            if(res.query && res.query.appid && res.query.togame)
            {
                this.referrerInfo = res.query
                this.referrerInfo.appId = res.query.appid
            }

            if(res.query &&this.referrerInfo && res.query.anChannelId)
            {
                this.referrerInfo.anChannelId = res.query.anChannelId
                this.referrerInfo.ioChannelId = res.query.ioChannelId
            }
        }
    }

    sendExposureLog(_data, _screenid){
        YouziData.sendExposureLog(_data, _screenid)
    }

    //落地页展示时 发送该日志
    sendBox2Open(){
        let cb = function(res){
            console.log('log event sendBox2Open success---')
        }
        let curTime = YouziData.YouziDateFtt("yyyy-MM-dd hh:mm:ss",new Date());
        let oriappid = this.referrerInfo && this.referrerInfo.appid?this.referrerInfo.appid:YouziData.appid;
        let jumpappid = this.referrerInfo && this.referrerInfo.togame?this.referrerInfo.togame:YouziData.appid;
        if (!YouziData._userinfo.uid)
        {
            YouziData._loadUid()
        }
        let param =
        {
            "logType":'box2open',
            "channelId":YouziData.channelId,
            "orgAppid":oriappid,
            "uid":YouziData._userinfo.uid,
            "languageType":1,
            "jumpAppid":jumpappid,
            "boxAppid":YouziData.appid,
            "locationIndex":BI_PAGE_TYPE.BUY_Screen,
            "recommendType":1,
            "screenId":1,
            "dt":curTime,
            "sdkVersion": YouziData.SdkVersion
        }
        console.log(param);
        YouziData.logNavigate(param, cb);
    }

    //落地页跳转
    navigateToOtherGame(data,call){

        if(!Laya.Browser.window.wx){
            return;
        }

        var self = this

        if (!YouziData._userinfo.uid)
        {
            YouziData._loadUid()
        }

        let curTime = YouziData.YouziDateFtt("yyyy-MM-dd hh:mm:ss",new Date());
        let logtype =  this.referrerInfo && this.referrerInfo.appid?'jump2app':'box2app';
        let oriappid = this.referrerInfo && this.referrerInfo.appid?this.referrerInfo.appid:YouziData.appid;

        let cb = function(res)
        {
            console.log(logtype + ' event logged success---')
        }

        let youziUID = YouziData._userinfo.uid
        let userType = this.referrerInfo.userType ? this.referrerInfo.userType : 1
        let param =
        {
            "logType": logtype,
            "userType": userType,
            "channelId": YouziData.channelId,
            "orgAppid": oriappid,
            "uid": youziUID,
            "languageType": 1,
            "jumpAppid": data.appid,
            "boxAppid": this.referrerInfo.boxAppid?this.referrerInfo.boxAppid:YouziData.appid,
            "locationIndex": data.locationIndex?data.locationIndex: this.referrerInfo.locationIndex,
            "recommendType": 3,
            "screenId": 1,
            "dt": curTime,
            "sdkVersion": YouziData.SdkVersion
        }

        let desAppid = data.appid
        let haveBoxAppId = false;
        let _boxId = YouziData.appid;
        if(data.boxAppId && data.boxAppId!=YouziData.appid){
            haveBoxAppId = true;
            desAppid = data.boxAppId;
            _boxId = desAppid;
        }

        let extraJson = {
            'togame' : data.appid,
            'boxAppid' : _boxId,
            'orgAppid' : oriappid,
            'YouziFixUID': youziUID,
            'userType' : userType
        };
        //获取小程序路径
        let littleProgramPath = null;
        if(data.miniProgramArgs && data.miniProgramArgs != ''){
            littleProgramPath = data.miniProgramArgs;
        }

        if(data.anChannelId || data.ioChannelId){
            if(littleProgramPath != null){
                littleProgramPath = littleProgramPath + "&anChannelId="+data.anChannelId + "&ioChannelId=" +data.ioChannelId;
            }else{
                littleProgramPath = "?anChannelId="+data.anChannelId + "&ioChannelId=" +data.ioChannelId;
            }
        }

        console.log('mimiProgramPath:' + littleProgramPath);
        //获取联运小游戏附加key名和对应value值
        if(data.miniGameArgs && data.miniGameArgs != ''){
        let addJson = JSON.parse(data.miniGameArgs);
        //获取json中所有key名
        let addJsonKeyArr = Object.keys(addJson);
        //去第一个key名
        let key0 = addJsonKeyArr[0];
        if(key0 == 'togame' || key0 == 'boxAppid' || key0 == 'orgAppid'){
                console.log('联运附加key值冲突');
                return;
        }
        //往extraJson添加新属性
        extraJson[key0] = addJson[key0];
        }

        console.log('extraData'+JSON.stringify(extraJson));

        Laya.Browser.window.wx.navigateToMiniProgram(
        {
            appId : desAppid,
            path : littleProgramPath,
            extraData : extraJson,
            success(result)
            {
                YouziData.logNavigate(param,cb);
                if(call)
                    call('success');
                console.log('box manager navigateToMiniProgram success');
            },
            fail(res)
            {
                console.log('box manager navigateToMiniProgram fail');
                if(call)
                {
                    call('fail');
                }
            }
        });
    }

}