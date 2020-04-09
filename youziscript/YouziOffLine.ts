import {ui} from  '../ui/layaMaxUI'
import { YouziData, BI_PAGE_TYPE, YOUZI_UI_ID, UI_ZORDER } from './YouziData';
import YouziAtlasPngAnima from './YouziAtlasPngAnima';

export default class YouziOffLine extends ui.youzi.Youzi_OffLineUI{
    private offLineGameShow = [];
    private offLineGameDatas = [];
    private offLineCreateComplete = false;
    private isSendLog = true;
    private uiCompleteCallCopy:Function = null;
    private uiStateCallCopy:Function = null;
    //获取毫秒
    private hideOffLineGameTimes = 0;

    private scaleUI = 1;

    constructor(){
        super();
 
        this.OffLineUI.pos(Laya.stage.width/2 - this.OffLineUI.width/2,Laya.stage.height/2 - this.OffLineUI.height/2);
        this.visible = false;
        this.OffLineUI.visible = false;
        this.designWHAdapter();
        this.OffLineCloseButton.on(Laya.Event.CLICK, this, this.onBtnOffLineClose);
    }

    private designWHAdapter()
    {
        if(Laya.stage.designWidth != 720)
        {
            this.scaleUI = Laya.stage.designWidth/720;
            this.OffLineUI.scale(this.scaleUI,this.scaleUI);
            this.OffLineMask.scale(this.scaleUI,this.scaleUI);
        }
        if(YouziData.getAspectRatio() > 1.9)
        {
            this.OffLineMask.scaleY = 2;
        }
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

    initShow(){
        this.offLineGameDatas = YouziData.offlineBannerDatas;
        this.wxOnShow();
        this.wxOnHide();
        
        //以下demo演示用
        // this.createOffLineDialog();
        // this.visible = true;
        // this.OffLineUI.visible = true;
    }

    private wxOnShow()
    {
        var self = this;
        if(Laya.Browser.window.wx)
        {
            Laya.Browser.window.wx.onShow(function(res)
            {
              
                    var showOffLineTimes = Math.floor(new Date().getTime() - self.hideOffLineGameTimes);
                    var showOffLineTimeSecond = Math.floor(showOffLineTimes/1000);
                    if(showOffLineTimeSecond >= 8)
                    {
                        if(self.offLineCreateComplete)
                        {
                            self.visible = true;
                            self.OffLineUI.visible = true;
                            self.zOrder = UI_ZORDER.UI_ZORDER_ONE;
                            self.notifyUIState(YOUZI_UI_ID.Youzi_OffLine,true);
                            if(self.isSendLog){
                                for(var i=0;i<self.offLineGameShow.length;i++)
                                {
                                     YouziData.sendExposureLog(self.offLineGameShow[i], BI_PAGE_TYPE.OFFLINE);
                                     if(i == self.offLineGameShow.length){
                                         self.isSendLog = false;
                                     }
                                }
                            }
                        }
                    }       
               
            });
        }
        
    }

    private wxOnHide()
    {
        var self = this;
        if(Laya.Browser.window.wx)
        {
            Laya.Browser.window.wx.onHide(function()
            {
                self.hideOffLineGameTimes = new Date().getTime();
                if(self.offLineGameDatas.length > 0 && !self.offLineCreateComplete)
                {
                    self.createOffLineDialog();
                }
            });
        }
    }

    private createOffLineDialog(){
        if(this.offLineGameDatas.length <=0){
            console.log('离线推荐没有数据');
            return;
        }

        
        
        var offLineArr : Array<any> = [];
        for(var i:number = 0;i<this.offLineGameDatas.length;i++){
            if(i >= 3){
                break;
            }else{
                var tempOffLine = this.offLineGameDatas[i];
                offLineArr.push({namelab: tempOffLine.title});
            }
        }

        //设定list 位置，以这种方式解决list中item的居中问题
        switch(offLineArr.length){
            case 1:
                this.OffLineList.width = 140
                this.OffLineList.x = 194
            break;
            case 2:
                this.OffLineList.width = 305
                this.OffLineList.x = 111.5
                break;
            default:
            break;
        }

        this.OffLineList.mouseHandler = new Laya.Handler(this,this.onOffLinelistItemMouseEvent);
        this.OffLineList.dataSource = offLineArr;

        for(var j:number = 0; j < this.offLineGameDatas.length;j++)
        {
           
            if(this.offLineGameDatas[j].dynamicType == 1 && this.offLineGameDatas[j].dynamicIcon){
                var imgAnima = this.OffLineList.getCell(j).getChildByName('iconAnima') as Laya.Animation;
                imgAnima.scale(1.16,1.16);
                var youziAnima = new YouziAtlasPngAnima();
                youziAnima.createAnimation(
                    this.offLineGameDatas[j].dynamicIcon,
                    // imgAnima,
                    function(anima){
                        imgAnima.frames = anima.frames;
                        imgAnima.interval = anima.interval;
                        imgAnima.visible = true;
                        imgAnima.play();
                    });
            }else{
                var offLineIcon : Laya.Image = this.OffLineList.getCell(j).getChildByName('icon') as Laya.Image
                offLineIcon.skin = this.offLineGameDatas[j].iconImg;
            }
            
            if(this.offLineGameDatas[j].hotred == 1)
            {
                var offLineIconRedHit: Laya.Image = this.OffLineList.getCell(j).getChildByName('redhit') as Laya.Image
                offLineIconRedHit.visible = true;
            }
            this.offLineGameShow.push(this.offLineGameDatas[j]);
            if(++j >= offLineArr.length){
                // console.log('offlinecreat finish');
                this.offLineCreateComplete = true;
                break; 
            }
        }
        this.notifyUIComplete(YOUZI_UI_ID.Youzi_OffLine,{complete:true});
    }

    private onBtnOffLineClose(){
        this.visible = false;
        this.OffLineUI.visible = false;
        this.zOrder = 0;
        this.notifyUIState(YOUZI_UI_ID.Youzi_OffLine,false);
    }

    private onOffLinelistItemMouseEvent(e:Event, index: number): void{
        if(e.type == 'mousedown'){
        
        }else if(e.type == 'mouseup'){
             console.log("当前选择的hotlist索引：" + index);
             var tmpData = this.offLineGameDatas[index];
             tmpData.locationIndex = BI_PAGE_TYPE.OFFLINE;
             tmpData.type = 3;
             if(tmpData.hotred == 1){
                var hideOffLineHit:Laya.Image = this.OffLineList.getCell(index).getChildByName('icon').getChildByName('redhit') as Laya.Image;
                hideOffLineHit.visible = false;
             }
             YouziData.clickGameYouziUIId = YOUZI_UI_ID.Youzi_OffLine;
             YouziData.startOtherGame(tmpData,null);
            
        }else if(e.type == 'mouseover'){
        
            
        }else if(e.type == 'mouseout'){
           
        }
     }

}