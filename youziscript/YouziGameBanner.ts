import { ui } from "../ui/layaMaxUI";
import { YouziData, BI_PAGE_TYPE, YOUZI_UI_ID, BANNER_TYPE } from "./YouziData";

/**
 * 底部游戏banner推荐，类似于微信banner广告
 */
export default class YouziGameBanner extends ui.youzi.Youzi_GameBannerViewUI
{
    private isOffSwitch = false;
    private bannerType:number = BANNER_TYPE.GAME;
    private switchTime = 5;
    private gameBannerItemExposure = {};
    private startSwitchIndex = 0;
    private isHide = false;
    private uiCompleteCallCopy:Function = null;
    private uiStateCallCopy:Function = null;

    constructor(isOffSwitch,switchTime)
    {
        super();
        this.pos(Laya.stage.width/2-this.GameBannerList.width/2,Laya.stage.height-this.GameBannerList.height);
        this.visible = false;
        this.GameBannerList.hScrollBarSkin = "";
        this.isOffSwitch = isOffSwitch;
        this.switchTime = switchTime < 5 ? 5:switchTime;
        this.switchTime *= 1000;
    }

    setYouziPosition(x:number,y:number)
    {
        this.pos(x,y);
    }

    //传入UI是否创建完成通知对象
    setUICompleteCall(uiCompleteCall:Function)
    {
        this.uiCompleteCallCopy = uiCompleteCall;
    }
    
    /**通知UI已创建完毕
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    private notifyUIComplete(uiID,msg)
    {
        if(this.uiCompleteCallCopy)
        {
            this.uiCompleteCallCopy(uiID,msg);
        }
    }

    offUICompleteCall(){
        if(this.uiCompleteCallCopy)
        {
            this.uiCompleteCallCopy = null;
        }
    }

    setUIStateCall(uiStateCall:Function)
    {
        this.uiStateCallCopy = uiStateCall;
    }

    /**通知UI界面状态
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    private notifyUIState(uiID,msg)
    {
        if(this.uiStateCallCopy)
        {
            this.uiStateCallCopy(uiID,msg);
        }
    }

    offUIStateCall(){
        if(this.uiStateCallCopy){
            this.uiStateCallCopy = null;
        }
    }

    onEnable()
    {  
        if(YouziData.getDataLoaded())
        {
            this.initShow();
        }
        else
        {
            YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    }

    initShow()
    {
        if(YouziData.gameBannerDatas.length <= 0)
            return;
            
        this.loadGameBannerList();
        this.creatGameBannerTimerLoop();
        if(!this.isOffSwitch)
        {
            YouziData.addBanner(this);
        }
    }

    private loadGameBannerList()
    {
        this.GameBannerList.repeatX = YouziData.gameBannerDatas.length;
        var gameBannerArr = [];
        for(var gameBannerArrI = 0; gameBannerArrI < YouziData.gameBannerDatas.length;gameBannerArrI++)
        {
            gameBannerArr.push({infoData:YouziData.gameBannerDatas[gameBannerArrI]});
        }
        
        this.GameBannerList.mouseHandler = new Laya.Handler(this,this.onGameBannerItemMouseEvent)
        this.GameBannerList.dataSource = gameBannerArr;

        for(var gameBannerDataI = 0; gameBannerArrI < YouziData.gameBannerDatas.length; gameBannerDataI++)
        {
            var gameBannerImage:Laya.Image = this.GameBannerList.getCell(gameBannerDataI).getChildByName('icon') as Laya.Image;
            gameBannerImage.skin = YouziData.gameBannerDatas[gameBannerDataI].bannerImg;
        }
        this.notifyUIComplete(YOUZI_UI_ID.Youzi_GameBanner,{complete:true});
    }

    private creatGameBannerTimerLoop()
    {
        Laya.timer.loop(this.switchTime,this,this.updateGameBaner);
    }

    private clearGameBannerTimerLoop()
    {
        Laya.timer.clear(this,this.updateGameBaner);
    }

    private updateGameBaner(e:Event)
    {
        
        if(YouziData.gameBannerDatas.length <=1){
            this.checkExposure();
            return;
        }else{
            this.startSwitchIndex = this.GameBannerList.startIndex+1;
            this.GameBannerList.scrollTo(this.startSwitchIndex>=this.GameBannerList.length?0:this.startSwitchIndex);
            this.checkExposure();
        }     
        
    }

    private checkExposure()
    {
        
        if(this.visible)
        {
            var data = YouziData.gameBannerDatas[this.startSwitchIndex]
            if(!this.gameBannerItemExposure[data.appid]){
                this.gameBannerItemExposure[data.appid] = 1;
                YouziData.sendExposureLog(data, BI_PAGE_TYPE.GAME);
            }
            
        }
    }

    private onGameBannerItemMouseEvent(e:Event, index: number)
    {
        if(e.type == 'mousedown'){
 
        }else if(e.type == 'mouseup'){
             console.log("当前选择的gamebannerlist索引：" + index);
             var tmpData = YouziData.gameBannerDatas[index];
             tmpData.locationIndex = BI_PAGE_TYPE.GAME;
             tmpData.type = 5
             YouziData.clickGameYouziUIId = YOUZI_UI_ID.Youzi_GameBanner;
             YouziData.startOtherGame(tmpData,null);
        
        }else if(e.type == 'mouseover'){
         
        }
    }

    showBanner()
    {
        if(this)
        {
            this.visible = true;
            if(this.isHide){
                this.isHide = false;
                this.creatGameBannerTimerLoop();
            }
            this.notifyUIState(YOUZI_UI_ID.Youzi_GameBanner,true);    
        }
    }

    hideBanner()
    {
        if(this)
        {
            this.isHide = true;
            this.visible = false;
            this.clearGameBannerTimerLoop();
            this.notifyUIState(YOUZI_UI_ID.Youzi_GameBanner,false);    
        }
        
    }

    destroySelf()
    {
        if(this){
            this.removeSelf();
        }
    }


}