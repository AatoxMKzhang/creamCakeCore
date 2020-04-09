import { ui } from '../ui/layaMaxUI'
import { YouziData, YOUZI_UI_ID, BI_PAGE_TYPE, UI_ZORDER } from './YouziData';
import YouziAtlasPngAnima from './YouziAtlasPngAnima';

export default class YouziMoreGame extends ui.youzi.Youzi_MoreGameUI {

    private mainItemExposure = {}; g
    private fisrtShow = false;
    private isCreate = false;
    private uiCompleteCallCopy: Function = null;
    private uiStateCallCopy: Function = null;

    private curFront = true;
    private curBack = false;
    private stopAction = false;
    private isClick = false;
    private dur = 5000;
    private endCompletHandler: Laya.Handler = null;
    private startCompleteHandler: Laya.Handler = null;

    private scaleMoreGameUI = 1;

    private isAddToStage = false;

    constructor(params) {
        super();
        this.designWHAdapter();
        this.initCustomParams(params);

        this.visible = false;
        this.MoreGameUI.visible = false;
        this.moreGameList.vScrollBarSkin = "";
        this.moreGameCloseBtn.on(Laya.Event.CLICK, this, this.onBtnCloseClicked);
    }
    //对不同的设计尺寸进行适配
    private designWHAdapter() {
        if (Laya.stage.designWidth != this.width) {
            this.scaleMoreGameUI = Laya.stage.designWidth / this.width;
            this.MoreGameUI.scale(this.scaleMoreGameUI, this.scaleMoreGameUI);
            this.maskBG.scale(this.scaleMoreGameUI, this.scaleMoreGameUI);
            this.width = Laya.stage.designWidth;
        }
        if (Laya.stage.designHeight != this.height) {
            this.maskBG.scaleY = Laya.stage.designHeight / this.height;
            this.height = Laya.stage.designHeight;
        }
    }

    private initCustomParams(params) {
        if (params) {
            this.MoreGameUI.x = params.hasOwnProperty('x') ? params.x : (Laya.stage.width - this.MoreGameUI.width * this.scaleMoreGameUI) / 2;
            this.MoreGameUI.y = params.hasOwnProperty('y') ? params.y : (Laya.stage.height - this.MoreGameUI.height * this.scaleMoreGameUI) / 2;
            this.uiStateCallCopy = params.hasOwnProperty('uiStateCall') ? params.uiStateCall : null;
        }
        else {
            this.MoreGameUI.pos((Laya.stage.width - this.MoreGameUI.width * this.scaleMoreGameUI) / 2,
                (Laya.stage.height - this.MoreGameUI.height * this.scaleMoreGameUI) / 2);
        }
    }

    setAddToStage(addToStage: boolean) {
        this.isAddToStage = addToStage;
    }


    // setYouziPosition(x:number,y:number){
    //     this.centerX = NaN;
    //     this.centerY = NaN;
    //     this.MoreGameUI.pos(x,y);
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
    private notifyUIComplete(uiID, msg) {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy(uiID, msg);
        }
    }

    offUICompleteCall() {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy = null;
        }
    }

    setUIStateCall(uiStateCall: Function) {
        this.uiStateCallCopy = uiStateCall;
    }

    /**通知UI界面状态
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    private notifyUIState(uiID, msg) {
        if (this.uiStateCallCopy) {
            this.uiStateCallCopy(uiID, msg);
        }
    }

    offUIStateCall() {
        if (this.uiStateCallCopy) {
            this.uiStateCallCopy = null;
        }
    }

    onEnable() {
        if (YouziData.getDataLoaded()) {
            this.initShow();
        } else {
            YouziData._loadedCallBacks.push(this.initShow.bind(this))
        }
    }

    public showMoreGameUI() {
        if (this.isCreate && !this.visible) {
            if (this.isAddToStage) {
                this.zOrder = UI_ZORDER.UI_ZORDER_THREE;
            }
            this.visible = true
            this.MoreGameUI.visible = true;
            this.starMoreGameAction();
            this.notifyUIState(YOUZI_UI_ID.Youzi_MoreGame, true);
            // if(!this.fisrtShow){
            //     this.fisrtShow = true;
            this.checkExposure();
            // }
        }
    }

    private onBtnCloseClicked() {
        this.stopMoreGameAcion();
        this.visible = false;
        this.MoreGameUI.visible = false;
        this.mainItemExposure = {};
        this.notifyUIState(YOUZI_UI_ID.Youzi_MoreGame, false);
        if (this.isAddToStage) {
            this.zOrder = 0;
        }
        this.destroy();
    }

    private initShow() {

        if (YouziData.moreDatas.length > 0) {
            this.moreGameList.array = YouziData.moreDatas;
            this.moreGameList.renderHandler = new Laya.Handler(this, this.onListRender);
            this.moreGameList.mouseHandler = new Laya.Handler(this, this.moreGameListMouseEvent);
            this.isCreate = true;
            this.notifyUIComplete(YOUZI_UI_ID.Youzi_MoreGame, { complete: true });
            this.dur = YouziData.moreDatas.length > 12 ? (YouziData.moreDatas.length - 12) * 5000 : 5000;
        }
    }

    private onListRender(item: Laya.Box, index: number): void {

        var imgAnima = item.getChildByName('iconAnima') as Laya.Animation;
        var imgIcon = item.getChildByName('icon') as Laya.Image;
        if (YouziData.moreDatas[index].dynamicType == 1 && YouziData.moreDatas[index].dynamicIcon) {
            imgAnima.scale(1.16, 1.16);
            imgAnima.visible = true;
            imgIcon.visible = false;
            var youziAnima = new YouziAtlasPngAnima();
            youziAnima.createAnimation(
                YouziData.moreDatas[index].dynamicIcon,
                function (anima) {
                    imgAnima.frames = anima.frames;
                    imgAnima.interval = anima.interval;
                    imgAnima.play();
                });
        } else {
            imgAnima.visible = false;
            imgIcon.visible = true;
            imgIcon.skin = YouziData.moreDatas[index].iconImg;
        }

        var label = item.getChildByName('namelab') as Laya.Label;
        label.text = YouziData.moreDatas[index].title;

        this.checkSendExpsureLog(index);
    }

    private checkSendExpsureLog(index) {
        if (this.visible && this.MoreGameUI.visible) {
            if (!this.mainItemExposure[YouziData.moreDatas[index].appid]) {
                // console.log('---send log moregame index:',index);
                YouziData.sendExposureLog(YouziData.moreDatas[index], BI_PAGE_TYPE.MORE);
                this.mainItemExposure[YouziData.moreDatas[index].appid] = 1;
            }
        }
    }

    stopMoreGameAcion() {
        this.stopAction = true;
    }

    starMoreGameAction() {
        this.moreGameListAutoScroll();
    }

    private moreGameListAutoScroll() {
        if (!this.MoreGameUI.visible)
            return;
        if (this.moreGameList.length <= 15) {
            return;
        }
        this.stopAction = false;

        //当前是从前面开始向后，但是未到后面
        if (this.curFront && !this.curBack) {
            this.listTweenToEnd();
        } else if (!this.curFront && this.curBack) {
            this.listTweenToStart();
        }
    }

    private listTweenToEnd() {
        if (!this.stopAction) {
            this.endCompletHandler = new Laya.Handler(this, this.listTweenToStart, null, true);
            this.moreGameList.tweenTo(this.moreGameList.length - 1, this.dur, this.endCompletHandler);
        }
        this.curFront = true;
        this.curBack = false;
    }

    private listTweenToStart() {
        if (!this.stopAction) {
            this.startCompleteHandler = new Laya.Handler(this, this.listTweenToEnd, null, true);
            this.moreGameList.tweenTo(0, this.dur, this.startCompleteHandler);
        }
        this.curFront = false;
        this.curBack = true;
    }

    private moreGameListMouseEvent(e: Event, index: number): void {
        if (e.type == 'mousedown') {
            // if(type == 1 || type ==2){
            //     this.mouseClickChange = true;
            // }
        } else if (e.type == 'mouseup') {
            if (!this.isClick) {
                this.isClick = true;
                console.log("当前选择的更多游戏索引：" + index);
                var tmpData = YouziData.moreDatas[index];
                tmpData.locationIndex = BI_PAGE_TYPE.MORE;
                YouziData.clickGameYouziUIId = YOUZI_UI_ID.Youzi_MoreGame;
                YouziData.startOtherGame(tmpData, this.startOtherCall.bind(this));
                // var curTime = YouziData.YouziDateFtt("yyyyMMdd",new Date());
                // localStorage.setItem(tmpData.appid, curTime);
            }

        } else if (e.type == 'mouseover') {

        }
    }

    private startOtherCall() {
        this.isClick = false;
        this.starMoreGameAction();
    }

    private checkExposure() {
        if (this.MoreGameUI.visible) {
            for (var i = 0; i < YouziData.moreDatas.length; i++) {
                if (i > 14) {
                    break;
                }
                var infoData = YouziData.moreDatas[i];
                if (!this.mainItemExposure[infoData.appid]) {
                    this.mainItemExposure[infoData.appid] = 1;
                    YouziData.sendExposureLog(infoData, BI_PAGE_TYPE.MORE);
                }


            }
        }
    }

}