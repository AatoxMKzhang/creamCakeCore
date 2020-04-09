import {ui} from  '../ui/layaMaxUI'
import { YouziData, YOUZI_UI_ID, BI_PAGE_TYPE, UI_ZORDER } from './YouziData';
import YouziAtlasPngAnima from './YouziAtlasPngAnima';

export default class YouziSlideWindowH extends ui.youzi.Youzi_SlideWindowHUI{

    private slideItemExposure = {}
    private uiCompleteCallCopy:Function = null;
    private uiStateCallCopy:Function = null;
    private slideButton:Laya.Button = null;
    private slideMask:Laya.Button = null;
    private showFirst = false;
    private acitonPianYi = 0;
    private isLeft = false;
    private isAddStage = false;
    private moveDistance = this.width;
    private scaleUI = 1;

    constructor(leftOrRight,params){
        super();
        this.visible = false;
        this.SlideWindowUI.visible = false;
        this.slideList.vScrollBarSkin = "";
        this.isLeft = leftOrRight;
        this.btnSLideClose.on(Laya.Event.CLICK, this, this.closeSlideWindow);

        if(YouziData.getAspectRatio() >= 1.9){ 
            this.acitonPianYi = 20
        }

        if(!leftOrRight){
            this.right = -this.width
            this.slideBg.scaleX = -1;
            this.slideBg.pos(this.slideBg.width,this.slideBg.y)
            this.slideList.pos(this.slideList.x,this.slideList.y);
        }else{
            this.left = -this.width;
        }
        this.designWHAdapter();
        this.initCustomParams(params);
        
    }

    private designWHAdapter()
    {
        if(Laya.stage.designHeight != 720)
        {
            this.scaleUI = Laya.stage.designHeight/720;
            this.scale(this.scaleUI,this.scaleUI);
        }
        this.y = Laya.stage.height/2-this.height*this.scaleUI/2;
        this.moveDistance = this.width*this.scaleUI;
    }

    private initCustomParams(params)
    {
        if(params)
        {
            this.uiStateCallCopy = params.hasOwnProperty('uiStateCall')?params.uiStateCall:null;
            if(params.hasOwnProperty('y'))
                this.y = params.y;
            if(params.hasOwnProperty('scaleY'))
                this.scaleY = params.scaleY;
            if(params.hasOwnProperty('scaleX'))
            {
                this.scaleX = params.scaleX;
                this.moveDistance = this.width*params.scaleX;
            }
                
            
        }
    }

    // setYouziPosition(y,scalex,scaley){
    //     if(y){
    //         this.centerX = NaN;
    //         this.centerY = NaN;
    //         this.pos(this.x,y);
    //     }
            
    //     if(scalex)
    //         this.scaleX = scalex
    //     if(scaley)
    //         this.scaleY = scaley;
    // }

    setAddToStage(addToStage:boolean)
    {
        this.isAddStage = addToStage;
    }

    setSlideButton(slideBtn:Laya.Button)
    {
        this.slideButton = slideBtn;
    }

    setSlideMask(slideViewMask:Laya.Button){
        this.slideMask = slideViewMask;
    }

    //传入UI是否创建完成通知对象
    // setUICompleteCall(uiCompleteCall:Function)
    // {
    //     this.uiCompleteCallCopy = uiCompleteCall;
    // }
    
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

    //显示抽屉按钮，隐藏抽屉遮罩
    private showSlideBtnAndHideSlideMask()
    {
        if(this.slideButton)
            this.slideButton.visible = true;
        if(this.slideMask)
            this.slideMask.visible = false;
    }

    //隐藏抽屉按钮，显示抽屉遮罩
    private hideSlideBtnAndShowSlideMask()
    {
        if(this.slideButton)
            this.slideButton.visible = false;
        if(this.slideMask)
            this.slideMask.visible = true;
    }

    showSlideWindow(){
        if(YouziData.hotListDatas.length <= 0)
        {
            console.log('抽屉没有数据');
            return;
        }
        if(this.isAddStage)
        {
            this.slideMask.zOrder = UI_ZORDER.UI_ZORDER_THREE-1;
            this.zOrder = UI_ZORDER.UI_ZORDER_THREE;
        }
        if(!this.SlideWindowUI.visible){
            this.visible = true;
            this.SlideWindowUI.visible = true;
            this.hideSlideBtnAndShowSlideMask();
            var self = this;
            this.slideWindowActionShow(function(){
                self.notifyUIState(YOUZI_UI_ID.Youzi_SlideWindow,true);
                if(!self.showFirst){
                    self.showFirst = true;
                    self.checkExposure();
                }
            });
        }
    }

    slideWindowActionShow(actionFinishCall){
        var self = this;
        if(!this.isLeft){
            Laya.Tween.to(this, {
                right:self.acitonPianYi
            }, 500, Laya.Ease.quadInOut, Laya.Handler.create(this,actionFinishCall));
        }else{
            Laya.Tween.to(this, {
                left:self.acitonPianYi
            }, 500, Laya.Ease.quadInOut, Laya.Handler.create(this,actionFinishCall));
        }
    }

    closeSlideWindow(){
        if(YouziData.hotListDatas.length <= 0)
        {
            console.log('抽屉没有数据');
            return;
        }
        var self = this;
        this.slideWindowActionClose(function(){
            self.notifyUIState(YOUZI_UI_ID.Youzi_SlideWindow,false);
            self.visible = false;
            self.SlideWindowUI.visible = false;
            self.btnSLideClose.visible = true;
            self.showSlideBtnAndHideSlideMask();
            if(self.isAddStage)
            {
                self.slideMask.zOrder = 0;
                self.zOrder = 0;
            }
        });
        //点击隐藏按钮，防止动画过程中继续点击造成过多偏移
        self.btnSLideClose.visible = false;
    }

    slideWindowActionClose(actionFinishCall){
        if(!this.isLeft){
            Laya.Tween.to(this, {
                right:-this.moveDistance
            }, 500, Laya.Ease.quadInOut, Laya.Handler.create(this,actionFinishCall));
        }else{
            Laya.Tween.to(this, {
                left:-this.moveDistance
            }, 500, Laya.Ease.quadInOut, Laya.Handler.create(this,actionFinishCall));
        }
    }

    initShow(){    
        this.slideList.array = YouziData.hotListDatas;
        this.slideList.renderHandler = new Laya.Handler(this, this.onListRender);
        this.slideList.mouseHandler = new Laya.Handler(this, this.onslideListItemMouseEvent);
        this.notifyUIComplete(YOUZI_UI_ID.Youzi_SlideWindow,{complete:true});
    }

    private onListRender(item: Laya.Box, index: number): void {
        // console.log('------->render slide : ',index);
            if(YouziData.hotListDatas[index].hotred == 0){
                var redHitWall:Laya.Image = item.getChildByName('markImg') as Laya.Image;
                redHitWall.visible = false;
            }
    
            var imgAnima = item.getChildByName('iconAnima') as Laya.Animation;
            var icon : Laya.Image = item.getChildByName('icon') as Laya.Image;
            if(YouziData.hotListDatas[index].dynamicType == 1 && YouziData.hotListDatas[index].dynamicIcon)
            {
                imgAnima.scale(1.08,1.08);
                imgAnima.visible = true;
                icon.visible = false;
                var youziAnima = new YouziAtlasPngAnima();
                youziAnima.createAnimation(
                    YouziData.hotListDatas[index].dynamicIcon,
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
                icon.skin = YouziData.hotListDatas[index].iconImg;
            }
            var label = item.getChildByName('namelab') as Laya.Label;
            label.text = YouziData.hotListDatas[index].title;
        
        this.checkSendExpsureLog(index);
    } 

    private checkSendExpsureLog(index)
    {
        if(this.visible && this.SlideWindowUI.visible)
        {
            if(!this.slideItemExposure[YouziData.hotListDatas[index].appid])
            {
                // console.log('---send log moregame index:',index);
                YouziData.sendExposureLog(YouziData.hotListDatas[index],BI_PAGE_TYPE.FLOAT);
                this.slideItemExposure[YouziData.hotListDatas[index].appid] = 1;
            }
        }
    }

    private onslideListItemMouseEvent(e:Event,index: number): void
    {
        if(e.type == 'mousedown'){
         
        }else if(e.type == 'mouseup'){
            console.log("当前选择的slideh索引：" + index);;
            var tmpData = YouziData.hotListDatas[index];
            tmpData.locationIndex = BI_PAGE_TYPE.FLOAT;
            YouziData.clickGameYouziUIId = YOUZI_UI_ID.Youzi_SlideWindow;
            YouziData.startOtherGame(tmpData,null);
            if(tmpData.hotred == 1){
                var tmpSlideHit:Laya.Image = this.slideList.getCell(index).getChildByName('markImg') as Laya.Image;
                tmpSlideHit.visible = false;
            }
        }else if(e.type == 'mouseover'){
        
        }
       
    }

    private checkExposure()
    {

        if(this.SlideWindowUI.visible)
        {
            for(var i=0; i<YouziData.hotListDatas.length; i++)
            {
                if(i>11)
                    break;

                var infoData = YouziData.hotListDatas[i];
                // console.log(infoData)
                if(!this.slideItemExposure[infoData.appid])
                {
                    this.slideItemExposure[infoData.appid] = 1
                    YouziData.sendExposureLog(infoData, BI_PAGE_TYPE.FLOAT)
                }
                
               
            }
        }
    }


}