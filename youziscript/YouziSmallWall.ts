import { ui } from "../ui/layaMaxUI";
import { YouziData, BI_PAGE_TYPE, YOUZI_UI_ID } from "./YouziData";
import YouziAtlasPngAnima from "./YouziAtlasPngAnima";

export default class YouziSmallWall extends ui.youzi.Youzi_SmallWallUI
{
    private redHitHide = [];
    private smallWallItemExposure = {};
    private smallWallItemExposureCount = 0;
    // private uiCompleteCallCopy:Function = null;
    // private uiStateCallCopy:Function = null;
    private curFront = true;
    private curBack = false;
    private stopAction = false;
    private isClick = false;
    private dur = 5000;
    private scaleUI = 1;
    private endCompletHandler:Laya.Handler = null;
    private startCompleteHandler:Laya.Handler = null;

    constructor(params)
    {
        super();
        this.visible = false;
        this.SmallWallUI.visible = false;
        this.smallWallList.vScrollBarSkin = "";
        this.designWHAdapter();
        this.initCustomParams(params);
    }

    private designWHAdapter()
    {
        if(Laya.stage.designWidth != 720)
        {
            this.scaleUI = Laya.stage.designWidth/720;
            this.scale(this.scaleUI,this.scaleUI);
        }
    }

    initCustomParams(params)
    {
        if(params)
        {
            this.x = params.hasOwnProperty('x')?params.x:0;
            this.y = params.hasOwnProperty('y')?params.y:0;
        }
    }

    // setYouziPosition(x:number,y:number)
    // {
    //     this.pos(x,y);
    // }

    //传入UI是否创建完成通知对象
    // setUICompleteCall(uiCompleteCall:Function)
    // {
    //     this.uiCompleteCallCopy = uiCompleteCall;
    // }
    
    /**通知UI已创建完毕
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    // private notifyUIComplete(uiID,msg)
    // {
    //     if(this.uiCompleteCallCopy)
    //     {
    //         this.uiCompleteCallCopy(uiID,msg);
    //     }
    // }

    // offUICompleteCall()
    // {
    //     if(this.uiCompleteCallCopy)
    //     {
    //         this.uiCompleteCallCopy = null;
    //     }
    // }

    onEnable()
    {
        if(YouziData.getDataLoaded())
        {
            this.initShow();
        }else{
            YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    }

    private initShow()
    {
        if(YouziData.moreDatas.length > 0)
        {
            
            
            this.smallWallList.array = YouziData.moreDatas;
            this.smallWallList.renderHandler = new Laya.Handler(this,this.onListRender);
            this.smallWallList.mouseHandler = new Laya.Handler(this,this.onSmallWallListItemMouseEvent);
            this.visible = true;
            this.SmallWallUI.visible = true;
            // this.notifyUIComplete(YOUZI_UI_ID.Youzi_SmallWall,{complete:true});
            this.dur = YouziData.moreDatas.length>8?(YouziData.moreDatas.length-8)*5000:5000;
            this.starSmallWallAction();
        }
    }

    private scrollBarListen(){
       this.starSmallWallAction();
    }

    private onListRender(cell:Laya.Box,index:number):void
    {
        // console.log('small index : ',index);
            if(YouziData.moreDatas[index].hotred == 1){
                var redHitWall:Laya.Image = cell.getChildByName('redhit') as Laya.Image;
                redHitWall.visible = true;
            }
            
            var imgAnima = cell.getChildByName('iconAnima') as Laya.Animation;
            var icon = cell.getChildByName('icon') as Laya.Image;
            if(YouziData.moreDatas[index].dynamicType == 1 && YouziData.moreDatas[index].dynamicIcon)
            {
                imgAnima.visible = true;
                icon.visible = false;
                var youziAnima = new YouziAtlasPngAnima();
                youziAnima.createAnimation(
                    YouziData.moreDatas[index].dynamicIcon,
                    // imgAnima,
                    function(anima){
                        imgAnima.frames = anima.frames;
                        imgAnima.interval = anima.interval;
                        imgAnima.play();
                    });
            }
            else
            {
                imgAnima.visible = false;
                icon.visible = true;
                icon.skin = YouziData.moreDatas[index].iconImg;
            }
            var label = cell.getChildByName('namelab') as Laya.Label;
            label.text = YouziData.moreDatas[index].title;
       
        this.checkSendExpsureLog(index);
    }

    private checkSendExpsureLog(index)
    {
        if(this.visible && this.SmallWallUI.visible)
        {
            if(!this.smallWallItemExposure[YouziData.moreDatas[index].appid])
            {
                // console.log('---send log moregame index:',index);
                YouziData.sendExposureLog(YouziData.moreDatas[index],BI_PAGE_TYPE.SMALL_MATRIX_WALL);
                this.smallWallItemExposure[YouziData.moreDatas[index].appid] = 1;
            }
        }
    }

    stopSmallWallAcion()
    {
        this.stopAction = true;
    }

    starSmallWallAction()
    {
        this.smallWallListAutoScroll();
    }

    private smallWallListAutoScroll(){
        if(!this.SmallWallUI.visible)
            return;
        if(this.smallWallList.length<=8){
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
            this.smallWallList.tweenTo(this.smallWallList.length-1,this.dur,this.endCompletHandler);
        }
        this.curFront = true;
        this.curBack = false;
    }

    private listTweenToStart()
    {
        if(!this.stopAction){
            this.startCompleteHandler = new Laya.Handler(this,this.listTweenToEnd,null,true); 
            this.smallWallList.tweenTo(0,this.dur,this.startCompleteHandler);
        }
        this.curFront = false;
        this.curBack = true;
    }

    private onSmallWallListItemMouseEvent(e:Event,index:number):void
    {
        if(e.type == 'mousedown'){
        
           }else if(e.type == 'mouseup'){
            if(!this.isClick){
                this.isClick = true;
                console.log("当前选择的大家都在玩儿索引：" + index);
                var tmpData = YouziData.moreDatas[index];
                tmpData.locationIndex = BI_PAGE_TYPE.SMALL_MATRIX_WALL;
                YouziData.clickGameYouziUIId = YOUZI_UI_ID.Youzi_SmallWall;
                YouziData.startOtherGame(tmpData,this.startOtherCall.bind(this));
                if(tmpData.hotred == 1){
                   var tmpSlideHit:Laya.Image = this.smallWallList.getCell(index).getChildByName('redhit') as Laya.Image;
                   tmpSlideHit.visible = false;
                }
            }
                
           }else if(e.type == 'mouseover'){
              
           }
    }

    private startOtherCall(state){
        this.isClick = false;
        this.starSmallWallAction();
    }


}