import { ui } from "../ui/layaMaxUI";
import { YouziData } from "./YouziData";
import YouziBoxManager from "./YouziBoxManager";

export default class YouziScreenPage extends ui.youzi.Youzi_ScreenPageUI
{

    private gotoGameListenTemp:Function = null;
    private launch = null;
    private loadErrParamInfo = {
        anChannelId:null,
        ioChannelId:null,
        appid:null
    };
    private luodiInfo = {
        anChannelId:null,
        ioChannelId:null,
        appid:null
    };

    private scaleUI = 1;
    
    constructor(wxLaunch)
    {
        super();
        this.designWHAdapter();
        this.visible = false;
        this.luoDiBtn.visible = false;
        this.launch = wxLaunch;
    }

    private designWHAdapter()
    {
        if(Laya.stage.designWidth != this.width)
        {
            this.scaleUI = Laya.stage.designWidth/this.width;
            this.scale(this.scaleUI,this.scaleUI);
        }
    }

    registerGoToGameListen(gotoGameListen:Function)
    {
        this.gotoGameListenTemp = gotoGameListen;
    }

    private notifyGoToGame()
    {
        if(this.gotoGameListenTemp){
            this.gotoGameListenTemp();
            this.gotoGameListenTemp = null;
        }
            
    }

    onMyStart()
    {
        this.PageBtn.on(Laya.Event.CLICK,this,this.btnLuoDiClick);
        if(YouziData.getDataLoaded())
        {
            this.initShow();
        }
        else
        {
            YouziData._loadedCallBacks.push(this.initShow.bind(this));
            if(YouziData._isLoadFinish)
            {
                this.loadErrHandle();
            }
            else
            {
                YouziData._requestErrorCbs.push(this.loadErrHandle.bind(this));
            }
        }
    }

    private loadErrHandle()
    {

        console.log('launch---'+JSON.stringify(this.launch))
        if(this.launch.query && this.launch.query.anChannelId)
        {
            this.loadErrParamInfo.anChannelId = this.launch.query.anChannelId
            this.loadErrParamInfo.ioChannelId = this.launch.query.ioChannelId
        }
        if(this.launch.referrerInfo && this.launch.referrerInfo.extraData && this.launch.referrerInfo.extraData.togame)
        {
            this.loadErrParamInfo.appid = this.launch.referrerInfo.extraData.togame
            this.luodiInfo = this.loadErrParamInfo;
            console.log('jump info--'+this.loadErrParamInfo);
            this.visible = true;
        } else {
            this.goGame();
        }
    }

    private initShow()
    {
        if(Laya.Browser.window.wx){
            if(this.launch){
                YouziBoxManager.getInstance().wxLaunch(this.launch);
                this.initUI(this.launch);
            }
            Laya.Browser.window.wx.onShow(this.wxOnShowCb.bind(this));
        }else{
            this.goGame();
        }
    }

    private wxOnShowCb(res){
        YouziBoxManager.getInstance().wxOnShow(res);
        this.initUI(res);
    }

    private initUI(launch)
    {
        let togameAppId = YouziBoxManager.getInstance().referrerInfo.togame;
        if(togameAppId)
        {
            let data = YouziData.getDataFromAllGameObj(togameAppId)
            if (data)
            {
                this.luodiInfo = data
                //合并从推广游戏跳进普通盒子的游戏来源渠道
                if(launch.query &&launch.query.anChannelId)
                {
                this.luodiInfo.anChannelId = launch.query.anChannelId
                this.luodiInfo.ioChannelId = launch.query.ioChannelId
                }
                this.showLuoDi(data.newPush,data.iconImg)
            }
            else
            {
                console.log('没发现落地页data',togameAppId)
                this.goGame()
            }
        }
        else
        {
            console.log('没发现落地页appid')
            this.goGame()
        }
    }

    private showLuoDi(bigUrl,smallUrl)
    {
        if(bigUrl)
        {
            
            this.Big.skin = bigUrl;
            this.visible = true;
            YouziBoxManager.getInstance().sendBox2Open();
        }
        else if(smallUrl)
        {
            this.Small.skin = smallUrl;
            this.visible = true;
            this.luoDiBtn.visible = true;
            YouziBoxManager.getInstance().sendBox2Open();
        }
        else
        {
            this.closeLuoDi();
        }
    }

    private btnLuoDiClick()
    {
        var btnLuoDiClickSelf = this;
        console.log('点击落地页 即将跳转:',this.luodiInfo.appid);
        if(this.luodiInfo.appid){
            var luodiToOtherCb = function(res){
                btnLuoDiClickSelf.closeLuoDi();
            }
            YouziBoxManager.getInstance().navigateToOtherGame(this.luodiInfo,luodiToOtherCb);
        }else{
            this.closeLuoDi();
        }
    }

    private closeLuoDi()
    {
        if(this.visible){
            this.visible = false;
        }
        this.goGame();
    }

    private goGame()
    {
        this.notifyGoToGame();
    }

}