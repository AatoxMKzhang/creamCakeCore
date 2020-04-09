import { ui } from "../ui/layaMaxUI";
import { YouziData, BI_PAGE_TYPE, UI_ZORDER, YOUZI_UI_ID } from "./YouziData";
import YouziAtlasPngAnima from "./YouziAtlasPngAnima";

/**
 * 全屏落地页矩阵3：由上方的矩阵banner和下方的的全屏落地页1组合而成，
 * 全屏落地页1矩阵需要进行调整
 */
export default class YouziMixBannerFullScreen extends ui.youzi.Youzi_FullMixBannerUI {
    //创建完成标志
    private isCreate = false;
    private bannerItemReport = {};
    private mixListItemReport = {};
    private uiScale = 1;

    private durBanner = 5000;
    private bannerStop = false;
    private bannerScrollLeft = true;
    private bannerScrollRight = false;
    private bannerScrollRightHandler: Laya.Handler = null;
    private bannerScrollLeftHandler: Laya.Handler = null;

    private durMixFull = 5000;
    private mixFullStop = false;
    private fullScrollTop = true;
    private fullScrollBottom = false;
    private fullScrollBottomHandler: Laya.Handler = null;
    private fullScrollTopHandler: Laya.Handler = null;
    private mixFullBreak = 8;

    private uiStateCallCopy: Function = null;

    constructor(params?: any) {
        super();
        this.visible = false;
        this.BannerUI.visible = false;
        this.MixListUI.visible = false;
        this.CloseBtn.visible = false;
        this.BannerUIList.hScrollBarSkin = "";
        this.MixList.vScrollBarSkin = "";
        this.designWHAdapter();
        this.initCustomParams(params);
        this.scale(0, 0);
        this.pivot(this.width / 2, this.height / 2);
        this.pos(Laya.stage.width / 2, this.height / 2);
    }

    private designWHAdapter() {
        if (Laya.stage.designWidth != this.width) {
            this.uiScale = Laya.stage.designWidth / this.width;
            this.FullMixBannerUI.scale(this.uiScale, this.uiScale);
            this.width = Laya.stage.designWidth;
        }

        if (Laya.stage.designHeight != this.height) {
            this.MaskBg.scaleY = Laya.stage.designHeight / this.height;
            this.height = Laya.stage.designHeight;
        }

        if (YouziData.getAspectRatio() > 1.9) {
            this.MixList.repeatY = 3;
            this.MixListUI.height += 220;
            this.MixList.height += 220;
            this.mixFullBreak = 11;
        }
    }

    private initCustomParams(params) {
        if (params) {
            this.uiStateCallCopy = params.hasOwnProperty('uiStateCall') ? params.uiStateCall : null;
        }
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

    onEnable() {
        if (YouziData.getDataLoaded()) {
            this.initShow();
        }
        else {
            YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    }

    private initShow() {
        this.CloseBtn.on(Laya.Event.CLICK, this, this.closeFullMixBanner);
        this.createMixBanner();
        this.createMixListUI();
    }

    private createMixBanner() {
        if (YouziData.matrixBannerDatas.length > 0) {
            this.BannerUI.visible = true;
            this.durBanner = YouziData.matrixBannerDatas.length > 5 ? (YouziData.matrixBannerDatas.length - 5) * 5000 : 5000;
            this.BannerUIList.array = YouziData.matrixBannerDatas;
            this.BannerUIList.mouseHandler = new Laya.Handler(this, this.bannerItemClick);
            this.BannerUIList.renderHandler = new Laya.Handler(this, this.bannerListItemRender);
        }
        else {
            YouziData.youziLog('YouziMixBanner:', '矩阵banner 无数据');
        }
    }

    private bannerListItemRender(item: Laya.Box, index: number): void {

        var imgAnima = item.getChildByName('iconAnima') as Laya.Animation;
        var icon = item.getChildByName('icon') as Laya.Image;
        if (YouziData.matrixBannerDatas[index].dynamicType == 1 &&
            YouziData.matrixBannerDatas[index].dynamicIcon) {
            imgAnima.visible = true;
            icon.visible = false;
            var youziAnima = new YouziAtlasPngAnima();
            youziAnima.createAnimation(
                YouziData.matrixBannerDatas[index].dynamicIcon,
                function (anima) {
                    imgAnima.frames = anima.frames;
                    imgAnima.interval = anima.interval;
                    imgAnima.play();
                });
        }
        else {
            imgAnima.visible = false;
            icon.visible = true;
            icon.skin = YouziData.matrixBannerDatas[index].iconImg;
        }

        this.checkBannerSendExpsureLog(index);
    }

    private checkBannerSendExpsureLog(index) {
        if (this.BannerUI.visible) {
            if (!this.bannerItemReport[YouziData.matrixBannerDatas[index].appid]) {
                // console.log('---send log index:',index);
                YouziData.sendExposureLog(YouziData.matrixBannerDatas[index], BI_PAGE_TYPE.FULL_MATRIX_SCRENN);
                this.bannerItemReport[YouziData.matrixBannerDatas[index].appid] = 1;
            }
        }
    }

    private createMixListUI() {
        if (YouziData.fullMatrixScreenDatas.length > 0) {
            this.MixListUI.visible = true;
            this.MixList.array = YouziData.fullMatrixScreenDatas;
            this.MixList.mouseHandler = new Laya.Handler(this, this.mixFullItemClick);
            this.MixList.renderHandler = new Laya.Handler(this, this.mixListItemRender);
        }
        else {
            YouziData.youziLog('YouziMixBanner:', '矩阵落地页类型3 无数据')
        }
    }

    private mixListItemRender(box: Laya.Box, index: number): void {
        // console.log('======>index:'+index)
        if (YouziData.fullMatrixScreenDatas[index].hotred == 0) {
            var redhit: Laya.Image = box.getChildByName("redhit") as Laya.Image;
            redhit.visible = false;
        }

        var iconAnima = box.getChildByName("iconAnima") as Laya.Animation;
        var icon = box.getChildByName('icon') as Laya.Image;
        if (YouziData.fullMatrixScreenDatas[index].dynamicType == 1 &&
            YouziData.fullMatrixScreenDatas[index].dynamicIcon) {

            iconAnima.frames = [];
            iconAnima.scale(1.66, 1.66);
            iconAnima.visible = true;
            icon.visible = false;
            var youziAnima = new YouziAtlasPngAnima();
            youziAnima.createAnimation(
                YouziData.fullMatrixScreenDatas[index].dynamicIcon,
                function (anima) {
                    iconAnima.frames = anima.frames;
                    iconAnima.interval = anima.interval;
                    iconAnima.play();
                });
        }
        else {
            iconAnima.visible = false;
            icon.visible = true;
            icon.skin = YouziData.fullMatrixScreenDatas[index].iconImg;
        }
        var label = box.getChildByName('namelab') as Laya.Label;
        label.text = YouziData.fullMatrixScreenDatas[index].title;

        this.checkFullSendExpsureLog(index);
    }

    private checkFullSendExpsureLog(index) {
        if (this.MixListUI.visible) {
            if (!this.mixListItemReport[YouziData.fullMatrixScreenDatas[index].appid]) {
                // console.log('---send log moregame index:',index);
                YouziData.sendExposureLog(YouziData.fullMatrixScreenDatas[index], BI_PAGE_TYPE.FULL_MATRIX_SCRENN);
                this.mixListItemReport[YouziData.fullMatrixScreenDatas[index].appid] = 1;
            }
        }
    }

    showFullMixBanner() {
        if (this.BannerUI.visible && this.MixListUI.visible) {
            if (this && this.parent) {
                this.visible = true;
                this.active = true;
                this.zOrder = UI_ZORDER.UI_ZORDER_TWO;
                Laya.Tween.to(this, { scaleX: 1, scaleY: 1 }, 500, Laya.Ease.quintIn, Laya.Handler.create(this, this.showActionFinish));
            }
        }
    }

    private showActionFinish() {
        this.notifyUIState(YOUZI_UI_ID.Youzi_Full, true);
        Laya.timer.once(3000, this, this.showCloseBtn);
        this.startBannerScrollAction();
        this.startMixFullScrollAction();
    }

    private showCloseBtn() {
        this.CloseBtn.visible = true;
    }

    closeFullMixBanner() {
        Laya.Tween.to(this, { scaleX: 0, scaleY: 0 }, 500, Laya.Ease.quadOut, Laya.Handler.create(this, this.closeActionFinish));

    }

    private closeActionFinish() {
        this.visible = false;
        this.CloseBtn.visible = false;
        this.zOrder = 0;
        this.notifyUIState(YOUZI_UI_ID.Youzi_Full, false);
        this.stopBannerScrollAction();
        this.stopMixFullScrollAction();
        this.bannerItemReport = {};
        this.mixListItemReport = {};
        this.active = false;
    }
    /***上方banner的自动左右滑动 */
    private stopBannerScrollAction() {
        this.bannerStop = true;
    }

    private startBannerScrollAction() {
        this.bannerAutoScroll();
    }

    private bannerAutoScroll() {
        if (this.BannerUIList.length <= 5)
            return;
        this.bannerStop = false;
        if (this.bannerScrollLeft && !this.bannerScrollRight) {
            this.bannerListTweenToRight();
        }
        else if (this.bannerScrollRight && !this.bannerScrollLeft) {
            this.bannerListTweenToLeft();
        }

    }

    private bannerListTweenToRight() {
        if (!this.bannerStop) {
            this.bannerScrollLeftHandler = new Laya.Handler(this, this.bannerListTweenToLeft, null, true);
            this.BannerUIList.tweenTo(this.BannerUIList.length - 1, this.durBanner, this.bannerScrollLeftHandler)
        }
        this.bannerScrollLeft = true;
        this.bannerScrollRight = false;

    }

    private bannerListTweenToLeft() {
        if (!this.bannerStop) {
            this.bannerScrollRightHandler = new Laya.Handler(this, this.bannerListTweenToRight, null, true);
            this.BannerUIList.tweenTo(0, this.durBanner, this.bannerScrollRightHandler);
        }
        this.bannerScrollLeft = false;
        this.bannerScrollRight = true;
    }

    /**下方矩阵上下滑动 */
    private stopMixFullScrollAction() {
        this.mixFullStop = true;
    }

    private startMixFullScrollAction() {
        this.fullScroolAutoAction();
    }

    private fullScroolAutoAction() {
        if (this.MixList.length <= this.mixFullBreak + 1)
            return;
        this.mixFullStop = false;
        if (this.fullScrollTop && !this.fullScrollBottom) {
            this.fullListTweenToBottom();
        }
        else if (this.fullScrollBottom && !this.fullScrollTop) {
            this.fullListTweenToTop();
        }

    }

    private fullListTweenToBottom() {
        if (!this.mixFullStop) {
            this.fullScrollBottomHandler = new Laya.Handler(this, this.fullListTweenToTop, null, true);
            this.MixList.tweenTo(this.MixList.length - 1, this.durMixFull, this.fullScrollBottomHandler);
        }
        this.fullScrollTop = true;
        this.fullScrollBottom = false;
    }

    private fullListTweenToTop() {
        if (!this.mixFullStop) {
            this.fullScrollTopHandler = new Laya.Handler(this, this.fullListTweenToBottom, null, true);
            this.MixList.tweenTo(0, this.durMixFull, this.fullScrollTopHandler);
        }
        this.fullScrollTop = false;
        this.fullScrollBottom = true;
    }

    /**banner中点击 */
    private bannerItemClick(e: Event, index: number) {
        if (e.type == 'mousedown') {

        } else if (e.type == 'mouseup') {
            console.log("当前选择的mix banner索引：" + index);
            var tmpData = YouziData.matrixBannerDatas[index]
            tmpData.locationIndex = BI_PAGE_TYPE.FULL_MATRIX_SCRENN;
            YouziData.clickGameYouziUIId = YOUZI_UI_ID.Youzi_Full;
            YouziData.startOtherGame(tmpData, null);
        } else if (e.type == 'mouseover') {

        }
    }

    /**下方矩阵中点击 */
    private mixFullItemClick(e: Event, index: number) {
        if (e.type == 'mousedown') {

        } else if (e.type == 'mouseup') {
            console.log("当前选择的全屏落地页3索引：" + index);
            var tmpData = YouziData.fullMatrixScreenDatas[index];
            tmpData.locationIndex = BI_PAGE_TYPE.FULL_MATRIX_SCRENN;
            YouziData.clickGameYouziUIId = YOUZI_UI_ID.Youzi_Full;
            YouziData.startOtherGame(tmpData, null);
        } else if (e.type == 'mouseover') {

        }
    }

}