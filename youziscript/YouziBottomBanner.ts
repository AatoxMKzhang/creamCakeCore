import { ui } from '../ui/layaMaxUI';
import { YouziData, BANNER_TYPE, BI_PAGE_TYPE, YOUZI_UI_ID } from './YouziData';
import YouziAtlasPngAnima from './YouziAtlasPngAnima';
/**
 * 底部猜你喜欢
 */
export default class YouziBottomBanner extends ui.youzi.Youzi_BottomBannerUI {

    private bannerType: number = BANNER_TYPE.MATRIX;
    private bannerBottomItemExposure = {};
    //false:中心化sdk控制底部猜你喜欢、底部微信banner广告和底部游戏banner推荐的显示切换；true：由游戏端子机进行控制显示和隐藏
    private isOffSwitch = false;
    private uiCompleteCallCopy: Function = null;
    private uiStateCallCopy: Function = null;

    private stopAction = false;
    private curFront = true;
    private curBack = false;
    private isClick = false;
    private endCompletHandler: Laya.Handler = null;
    private startCompleteHandler: Laya.Handler = null;
    private dur = 10;

    private scaleUI = 1;

    constructor(isOffSwitch, params) {
        super();
        this.visible = false;
        this.BannerBottomUI.visible = false;
        this.bottomList.hScrollBarSkin = "";
        this.isOffSwitch = isOffSwitch;
        this.designWHAdapter();
        this.initCustomParams(params);
    }

    private designWHAdapter() {
        if (Laya.stage.designWidth < Laya.stage.designHeight) {
            if (Laya.stage.designWidth != 720) {
                this.scaleUI = Laya.stage.designWidth / 720;
                this.scale(this.scaleUI, this.scaleUI);
            }
        }
        else {
            if (Laya.stage.designHeight != 720) {
                this.scaleUI = Laya.stage.designHeight / 720;
                this.scale(this.scaleUI, this.scaleUI);
            }
        }
    }

    private initCustomParams(params) {
        if (params) {
            this.x = params.hasOwnProperty('x') ? params.x : Laya.stage.width / 2 - this.BannerBottomUI.width / 2;
            this.y = params.hasOwnProperty('y') ? params.y : Laya.stage.height - this.BannerBottomUI.height;
        } else {
            this.pos(Laya.stage.width / 2 - this.BannerBottomUI.width / 2,
                Laya.stage.height - this.BannerBottomUI.height);
        }

    }

    setYouziPosition(x: number, y: number) {
        this.pos(x, y);
    }

    //传入UI是否创建完成通知对象
    setUICompleteCall(uiCompleteCall: Function) {
        this.uiCompleteCallCopy = uiCompleteCall;
    }

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
            YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    }

    initShow() {
        if (YouziData.matrixBannerDatas.length <= 0) {
            return;
        }
        this.loadBottomList();
        this.bottomlistAutoScroll();
        if (!this.isOffSwitch) {
            YouziData.addBanner(this);
        }
    }

    loadBottomList() {
        this.bottomList.array = YouziData.matrixBannerDatas;
        this.bottomList.renderHandler = new Laya.Handler(this, this.onListRender);
        this.bottomList.mouseHandler = new Laya.Handler(this, this.onBannerItemMouseEvent);

        this.notifyUIComplete(YOUZI_UI_ID.Youzi_BottomBanner, { complete: true });
        this.dur = YouziData.matrixBannerDatas.length ? (YouziData.matrixBannerDatas.length - 5) * 5000 : 5000;
        this.bottomlistAutoScroll();
    }

    private onListRender(item: Laya.Box, index: number): void {
        // console.log('------->render bottombanner : ',index);
        var imgAnima = item.getChildByName('iconAnima') as Laya.Animation;
        var icon = item.getChildByName('icon') as Laya.Image;
        if (YouziData.matrixBannerDatas[index].dynamicType == 1 &&
            YouziData.matrixBannerDatas[index].dynamicIcon) {
            imgAnima.scale(0.91, 0.91);
            imgAnima.visible = true;
            icon.visible = false;
            var youziAnima = new YouziAtlasPngAnima();
            youziAnima.createAnimation(
                YouziData.matrixBannerDatas[index].dynamicIcon,
                // imgAnima,
                function (anima) {
                    imgAnima.frames = anima.frames;
                    imgAnima.interval = anima.interval;
                    imgAnima.play();
                }
            );

        }
        else {
            imgAnima.visible = false;
            icon.visible = true;
            icon.skin = YouziData.matrixBannerDatas[index].iconImg;
        }
        var label = item.getChildByName('namelab') as Laya.Label;
        label.text = YouziData.moreDatas[index].title;

        this.checkSendExpsureLog(index);
    }

    private checkSendExpsureLog(index) {
        if (this.visible && this.BannerBottomUI.visible) {
            if (!this.bannerBottomItemExposure[YouziData.matrixBannerDatas[index].appid]) {
                // console.log('---send log index:',index);
                YouziData.sendExposureLog(YouziData.matrixBannerDatas[index], BI_PAGE_TYPE.MATRIX);
                this.bannerBottomItemExposure[YouziData.matrixBannerDatas[index].appid] = 1;
            }
        }
    }

    private onBannerItemMouseEvent(e: Event, index: number): void {
        if (e.type == 'mousedown') {

        } else if (e.type == 'mouseup') {
            if (!this.isClick) {
                this.isClick = true
                console.log("当前选择的bottombanner索引：" + index);
                YouziData.clickGameYouziUIId = YOUZI_UI_ID.Youzi_BottomBanner;
                var tmpData = YouziData.matrixBannerDatas[index]
                tmpData.locationIndex = BI_PAGE_TYPE.MATRIX;
                YouziData.startOtherGame(tmpData, this.startOtherCall.bind(this));
            }
        } else if (e.type == 'mouseover') {

        }
    }

    private startOtherCall(state) {
        this.isClick = false;
        this.starBottomBannerAction();
    }

    stopBottomBannerAcion() {
        this.stopAction = true;
    }

    starBottomBannerAction() {
        this.bottomlistAutoScroll();
    }

    private bottomlistAutoScroll() {

        if (this.bottomList.length <= 5) {
            return
        }
        this.stopAction = false;

        if (this.curFront && !this.curBack) {
            this.listTweenToEnd();
        } else if (!this.curFront && this.curBack) {
            this.listTweenToStart();
        }

    }

    private listTweenToEnd() {
        if (!this.stopAction) {
            this.endCompletHandler = new Laya.Handler(this, this.listTweenToStart, null, true);
            this.bottomList.tweenTo(this.bottomList.length - 1, this.dur, this.endCompletHandler);
        }
        this.curFront = true;
        this.curBack = false;
    }

    private listTweenToStart() {
        if (!this.stopAction) {
            this.startCompleteHandler = new Laya.Handler(this, this.listTweenToEnd, null, true);
            this.bottomList.tweenTo(0, this.dur, this.startCompleteHandler);
        }
        this.curFront = false;
        this.curBack = true;
    }

    showBanner() {
        if (this) {
            this.visible = true;
            this.BannerBottomUI.visible = true;
            this.notifyUIState(YOUZI_UI_ID.Youzi_BottomBanner, true);
            if (this.stopAction) {
                this.starBottomBannerAction();
            }
        }
    }

    hideBanner() {
        if (this) {
            this.stopBottomBannerAcion();
            this.visible = false;
            this.BannerBottomUI.visible = false;
            this.notifyUIState(YOUZI_UI_ID.Youzi_BottomBanner, false);
        }
    }

    destroySelf() {
        if (this) {
            this.removeSelf();
        }
    }

}