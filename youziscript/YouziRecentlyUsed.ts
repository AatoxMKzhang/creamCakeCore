import { ui } from "../ui/layaMaxUI";
import { YouziData, BI_PAGE_TYPE, UI_ZORDER, YOUZI_UI_ID } from "./YouziData";
import YouziAtlasPngAnima from "./YouziAtlasPngAnima";

/**
 * 全屏落地页类型2
 */
export default class YouziRecentlyUsed extends ui.youzi.Youzi_RecentlyUsedUI
{
    private recentlyUsedExposure = {};
    private hw = 0;
    private breaki = 8;

    private curFront = true;
    private curBack = false;
    private stopAction = false;
    private isClick = false;
    private dur = 5000;
    private endCompletHandler:Laya.Handler = null;
    private startCompleteHandler:Laya.Handler = null;
    private uiStateCallCopy:Function = null;

    private scaleUI = 1;
    private listMoveSpeed = 100;

    constructor(params?:any)
    {
        super();
        this.visible = false;
        this.RecentlyUsedList.vScrollBarSkin = "";
        console.log('YouziRecentlyUsed');
        this.designWHAdapter();
        this.initCustomParams(params);
        this.scale(0,0);
        this.pivot(this.width/2,this.height/2);
        this.pos(Laya.stage.designWidth/2,this.height/2);
        this.CloseBtn.on(Laya.Event.CLICK,this,this.closeRecentlyUsed);
    }

    private designWHAdapter()
    {
        if(Laya.stage.designWidth != this.width)
        {
            this.scaleUI = Laya.stage.designWidth/this.width;
            this.RecentlyUsedUI.scale(this.scaleUI,this.scaleUI);
            this.GameListBG.scaleX = this.scaleUI;
            this.width = Laya.stage.designWidth;
        }

        if(Laya.stage.designHeight != this.height)
        {
            this.GameListBG.scaleY = Laya.stage.designHeight/this.height;
            this.height = Laya.stage.designHeight;
            this.RecentlyUsedList.height = this.RecentlyUsedList.height+(Laya.stage.designHeight-1280);
        }

        if(YouziData.getAspectRatio() > 1.9)
        {
            this.GameListBG.scaleY = 2;
            this.RecentlyUsedList.repeatY = 9;
            this.RecentlyUsedList.height += 240;
            this.breaki = 9;
            this.height += 240;
        }

    }

    private initCustomParams(params)
    {
        if(params)
        {
            this.uiStateCallCopy = params.hasOwnProperty('uiStateCall')?params.uiStateCall:null;
        }
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

    private initShow()
    {
        
        if(YouziData.fullMatrixScreenDatas.length > 0)
        {
            this.dur = (((YouziData.fullMatrixScreenDatas.length+1) * 130)/this.listMoveSpeed)*1000;
            this.RecentlyUsedList.array = YouziData.fullMatrixScreenDatas;
            this.RecentlyUsedList.mouseHandler = new Laya.Handler(this,this.onItemClick);
            this.RecentlyUsedList.renderHandler = new Laya.Handler(this,this.onListRender);
        }
        else
        {
            YouziData.youziLog('全屏落地页类型2:','无数据');
        }
    }

    private onListRender(box:Laya.Box,index:number):void
    {
        
            if(YouziData.fullMatrixScreenDatas[index].hotred == 0){
                var redhit:Laya.Image  = box.getChildByName("redhit") as Laya.Image;
                redhit.visible = false;
            }
            // console.log('======>index:'+index);
            var iconAnima = box.getChildByName("iconAnima") as Laya.Animation;
            var icon = box.getChildByName('icon') as Laya.Image;
            if(YouziData.fullMatrixScreenDatas[index].dynamicType == 1 && 
                YouziData.fullMatrixScreenDatas[index].dynamicIcon)
            {
                // console.log('======>index:'+index+",dynamicType:"+this.fullScreenData[index].dynamicType+",dynamicIcon:"+this.fullScreenData[index].dynamicIcon);    
                iconAnima.scale(0.83,0.83);
                iconAnima.frames = [];
                iconAnima.visible = true;
                icon.visible = false;
                var youziAnima = new YouziAtlasPngAnima();
                youziAnima.createAnimation(
                    YouziData.fullMatrixScreenDatas[index].dynamicIcon,
                    function(anima){
                        console.log('anima play index:'+index);
                        iconAnima.frames = anima.frames;
                        iconAnima.interval = anima.interval;
                        iconAnima.play();
                })
            }
            else
            {
                iconAnima.visible = false;
                icon.visible = true;
                icon.skin = YouziData.fullMatrixScreenDatas[index].iconImg;
            }
            var label = box.getChildByName('namelab') as Laya.Label;
            label.text = YouziData.fullMatrixScreenDatas[index].title;

        this.checkSendExpsureLog(index);
    }

    private checkSendExpsureLog(index)
    {
        if(this.visible)
        {
            if(!this.recentlyUsedExposure[YouziData.fullMatrixScreenDatas[index].appid])
            {
                // console.log('---send log moregame index:',index);
                YouziData.sendExposureLog(YouziData.fullMatrixScreenDatas[index],BI_PAGE_TYPE.FULL_MATRIX_SCRENN);
                this.recentlyUsedExposure[YouziData.fullMatrixScreenDatas[index].appid] = 1;
            }
        }
    }

    showRecentlyUsed()
    {
        if(YouziData.fullMatrixScreenDatas.length <=0 )
        {
            YouziData.youziLog('全屏落地页类型2:','无数据');
            return;
        }
        if(this && this.parent){
            this.zOrder = UI_ZORDER.UI_ZORDER_TWO;
            this.visible = true;
            Laya.Tween.to(this,{scaleX:1,scaleY:1},500,Laya.Ease.quadIn,Laya.Handler.create(this,this.showActionFinish));
        }
        
    }

    //打开动画结束
    private showActionFinish()
    {
        this.notifyUIState(YOUZI_UI_ID.Youzi_Full,true);
        // this.checkExposure();
        this.starFullListAction();
    }

    closeRecentlyUsed()
    {
        Laya.Tween.to(this,{scaleX:0,scaleY:0},500,Laya.Ease.quadOut,Laya.Handler.create(this,this.closeActionFinish));
    }

    //关闭动画结束
    private closeActionFinish()
    {
        this.zOrder = 0;
        this.visible = false;
        this.stopFullListAcion();
        this.recentlyUsedExposure = {};
        this.notifyUIState(YOUZI_UI_ID.Youzi_Full,false);
    }

    private stopFullListAcion()
    {
        this.stopAction = true;
    }

    private starFullListAction()
    {
        this.fullScreenListAutoScroll();
    }

    private fullScreenListAutoScroll(){
        if(!this.visible)
            return;
        if(this.RecentlyUsedList.length<=this.breaki+1){
            return;
        }
        this.stopAction = false;
        
        //当前是从前面开始向后，但是未到后面
        if(this.curFront && !this.curBack){
            this.listTweenToEnd();
        }else if(!this.curFront && this.curBack){
            this.listTweenToStart();
        }
    }

    private listTweenToEnd()
    {
        if(!this.stopAction){
            this.endCompletHandler = new Laya.Handler(this,this.listTweenToStart,null,true);
            this.RecentlyUsedList.tweenTo(this.RecentlyUsedList.length-1,this.dur,this.endCompletHandler);
        }
        this.curFront = true;
        this.curBack = false;
    }

    private listTweenToStart()
    {
        if(!this.stopAction){
            this.startCompleteHandler = new Laya.Handler(this,this.listTweenToEnd,null,true); 
            this.RecentlyUsedList.tweenTo(0,this.dur,this.startCompleteHandler);
        }
        this.curFront = false;
        this.curBack = true;
    }

    private onItemClick(e:Event,index:number)
    {
        if(e.type == 'mousedown'){
         
        }else if(e.type == 'mouseup'){
            console.log("当前选择的全屏落地页索引：" + index);
            var tmpData = YouziData.fullMatrixScreenDatas[index];
            tmpData.locationIndex = BI_PAGE_TYPE.FULL_MATRIX_SCRENN;
            YouziData.clickGameYouziUIId = YOUZI_UI_ID.Youzi_Full;
            YouziData.startOtherGame(tmpData,null);
        }else if(e.type == 'mouseover'){
        
        }
    }

    private checkExposure()
     {
        if(this.visible){
            for(var i=0; i<YouziData.fullMatrixScreenDatas.length; i++){
                if(i>this.breaki){
                    console.log('break i:'+i);
                    break;
                }
                var infoData = YouziData.fullMatrixScreenDatas[i];
                if(!this.recentlyUsedExposure[infoData.appid]){
                    this.recentlyUsedExposure[infoData.appid] = 1;
                    YouziData.sendExposureLog(infoData, BI_PAGE_TYPE.FULL_MATRIX_SCRENN);
                }  
            }
        }
    }


}