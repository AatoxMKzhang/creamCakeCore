import {ui} from  '../ui/layaMaxUI';
import {YouziData, BI_PAGE_TYPE, YOUZI_UI_ID} from './YouziData';
import YouziAtlasPngAnima from './YouziAtlasPngAnima';


export default class YouziGuessLike extends ui.youzi.Youzi_GuessLikeUI{

    private guessAnyItemExposure = {};
    private firstShow = false;
    private uiCompleteCallCopy:Function = null;
    private uiStateCallCopy:Function = null;
    private curFront = true;
    private curBack = false;
    private stopAction = false;
    private isClick = false;
    private endCompletHandler:Laya.Handler = null;
    private startCompleteHandler:Laya.Handler = null;

    private dur = 5000;
    private scaleUI = 1;

    constructor(params){
        super();
        this.visible = false;
        this.guessUI.visible = false;
        this.guesslist.hScrollBarSkin= "";
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

    private initCustomParams(params)
    {
        if(params)
        {
            this.x = params.hasOwnProperty('x')?params.x:0;
            this.y = params.hasOwnProperty('y')?params.y:0;
        }
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

    onEnable(){
        if(YouziData.getDataLoaded()){
            this.initShow();
        }else{
            YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    }

    // showGuessLikeView(){
    //     if(!this.firstShow){
    //         this.firstShow = true;
    //         this.checkExposure();
    //     }
    //     this.visible = true;
    //     this.guessUI.visible = true;
    //     this.guessAnylistAutoScroll();
    // }

    // hideGuessLikeView(){
    //     this.visible = false;
    //     this.guessUI.visible = false; 
    // }

    initShow(){
        if(YouziData.matrixBannerDatas.length <= 0){
            return;
        }

        this.guesslist.dataSource = YouziData.matrixBannerDatas;
        this.guesslist.mouseHandler = new Laya.Handler(this, this.onGuessLikeItemMouseEvent);
        this.guesslist.renderHandler = new Laya.Handler(this,this.onListRender);

        this.visible = true;
        this.guessUI.visible = true;
        this.notifyUIComplete(YOUZI_UI_ID.Youzi_GuessLike,{complete:true});
        this.notifyUIState(YOUZI_UI_ID.Youzi_GuessLike,true);
        this.dur = YouziData.matrixBannerDatas.length>5?(YouziData.matrixBannerDatas.length-5)*5000:5000;
        this.starGuessLikeAction();
    }

    private onListRender(item:Laya.Box,index:number):void
    {
        // console.log('------->render guesslike : ',index);
            var imgAnima = item.getChildByName('iconAnima') as Laya.Animation;
            var icon : Laya.Image = item.getChildByName('icon') as Laya.Image;

            if(YouziData.matrixBannerDatas[index].dynamicType == 1 && 
                YouziData.matrixBannerDatas[index].dynamicIcon)
            {
                imgAnima.scale(0.75,0.75);
                imgAnima.visible = true;
                icon.visible = false;
                var youziAnima = new YouziAtlasPngAnima();
                youziAnima.createAnimation(
                    YouziData.matrixBannerDatas[index].dynamicIcon,
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
                icon.visible =true;
                icon.skin = YouziData.matrixBannerDatas[index].iconImg;
            }
        
        this.checkSendExpsureLog(index);
    }

    private checkSendExpsureLog(index)
    {
        if(this.visible && this.guessUI.visible)
        {
            if(!this.guessAnyItemExposure[YouziData.matrixBannerDatas[index].appid])
            {
                // console.log('---send log index:',index);
                YouziData.sendExposureLog(YouziData.matrixBannerDatas[index],BI_PAGE_TYPE.GUESS);
                this.guessAnyItemExposure[YouziData.matrixBannerDatas[index].appid] = 1;
            }
        }
    }

    stopGuessLikeAcion()
    {
        this.stopAction = true;
    }

    starGuessLikeAction()
    {
        this.guessAnylistAutoScroll();
    }

    private guessAnylistAutoScroll(){
        if(!this.guessUI.visible)
            return;
        if(this.guesslist.length<=5){
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
            this.guesslist.tweenTo(this.guesslist.length-1,this.dur,this.endCompletHandler);
        }
        this.curFront = true;
        this.curBack = false;
    }

    private listTweenToStart()
    {
        if(!this.stopAction){
            this.startCompleteHandler = new Laya.Handler(this,this.listTweenToEnd,null,true);
            this.guesslist.tweenTo(0,this.dur,this.startCompleteHandler);
        }
        this.curFront = false;
        this.curBack = true;
    }

    private onGuessLikeItemMouseEvent(e:Event,index: number): void
    {
        if(e.type == 'mousedown'){
         
        }else if(e.type == 'mouseup'){
            if(!this.isClick){
                this.isClick = true;
                console.log("当前选择的guesslike索引：" + index);
                YouziData.clickGameYouziUIId = YOUZI_UI_ID.Youzi_GuessLike;
                var tmpData = YouziData.matrixBannerDatas[index];
                tmpData.locationIndex = BI_PAGE_TYPE.GUESS;
                YouziData.startOtherGame(tmpData,this.startOtherCall.bind(this));
            }
            
        }else if(e.type == 'mouseover'){

        }
      
     }

    private startOtherCall(state){
        this.isClick = false;
        this.starGuessLikeAction();
    }

}