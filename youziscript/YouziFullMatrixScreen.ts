import { ui } from "../ui/layaMaxUI";
import { YouziData, BI_PAGE_TYPE, UI_ZORDER, YOUZI_UI_ID } from "./YouziData";
import YouziAtlasPngAnima from "./YouziAtlasPngAnima";
/**
 * 全屏落地页类型1
 */
export default class YouziFullMatrixScreen extends ui.youzi.Youzi_FullScreenUI {

    private fullScreenExposure = {};
    private breaki = 14;

    private curFront = true;
    private curBack = false;
    private stopAction = false;
    private isClick = false;
    private dur = 5000;
    private endCompletHandler: Laya.Handler = null;
    private startCompleteHandler: Laya.Handler = null;
    private FullScreenUIScale = 1;
    private uiStateCallCopy: Function = null;

    constructor(params?: any) {
        super();
        this.visible = false;
        this.FullScreenUI.visible = false;
        this.FullScreenList.vScrollBarSkin = "";
        this.designWHAdapter();
        this.initCustomParams(params);
        this.scale(0, 0);
        this.pivot(this.width / 2, this.height / 2);
        this.pos(Laya.stage.designWidth / 2, this.height / 2);
        this.closeFullScreen.on(Laya.Event.CLICK, this, this.onCloseFullScreen);
    }

    private designWHAdapter()  {
        if (Laya.stage.designWidth != this.width)  {
            this.FullScreenUIScale = Laya.stage.designWidth / this.width;
            this.FullScreenUI.scale(this.FullScreenUIScale, this.FullScreenUIScale);
            this.BG.scaleX = this.FullScreenUIScale;
            this.width = Laya.stage.designWidth;
        }

        if (Laya.stage.designHeight != this.height)  {
            this.BG.scaleY = Laya.stage.designHeight / this.height;
            this.height = Laya.stage.designHeight;
        }

        if (YouziData.getAspectRatio() > 1.9)  {
            this.BG.scaleY = 2;
            this.height += 300;
            this.FullScreenUI.height += 300;
            this.FullScreenList.repeatY = 5;
            this.FullScreenList.height += 300;
            this.breaki = 17;
        }

    }

    private initCustomParams(params)  {
        if (params)  {
            this.uiStateCallCopy = params.hasOwnProperty('uiStateCall') ? params.uiStateCall : null;
        }
    }

    /**通知UI界面状态
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    private notifyUIState(uiID, msg)  {
        if (this.uiStateCallCopy)  {
            this.uiStateCallCopy(uiID, msg);
        }
    }

    onEnable()  {

        if (YouziData.getDataLoaded()) {
            this.initShow();
        } else {
            YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    }

    private initShow()  {

        if (YouziData.fullMatrixScreenDatas.length > 0) {
            this.dur = YouziData.fullMatrixScreenDatas.length > (this.breaki + 1) ? (YouziData.fullMatrixScreenDatas.length - this.breaki) * 5000 : 5000;
            this.FullScreenList.array = YouziData.fullMatrixScreenDatas;
            this.FullScreenList.mouseHandler = new Laya.Handler(this, this.onItemClick);
            this.FullScreenList.renderHandler = new Laya.Handler(this, this.onListRender);
        } else {
            this.destroy();
            console.log('全屏落地页无数据');
        }
    }

    private onListRender(box: Laya.Box, index: number): void  {

        if (YouziData.fullMatrixScreenDatas[index].hotred == 0) {
            var redhit: Laya.Image = box.getChildByName("redhit") as Laya.Image;
            redhit.visible = false;
        }
        // console.log('======>index:'+index);
        var iconAnima = box.getChildByName("iconAnima") as Laya.Animation;
        var icon = box.getChildByName('icon') as Laya.Image;

        if (YouziData.fullMatrixScreenDatas[index].dynamicType == 1 &&
            YouziData.fullMatrixScreenDatas[index].dynamicIcon)  {
            // console.log('======>index:'+index+",dynamicType:"+this.fullScreenData[index].dynamicType+",dynamicIcon:"+this.fullScreenData[index].dynamicIcon);   
            iconAnima.scale(1.66, 1.66);
            iconAnima.frames = [];
            iconAnima.visible = true;
            icon.visible = false;
            var youziAnima = new YouziAtlasPngAnima();
            youziAnima.createAnimation(
                YouziData.fullMatrixScreenDatas[index].dynamicIcon,
                function (anima) {
                    // console.log('anima play index:'+index);
                    iconAnima.frames = anima.frames;
                    iconAnima.interval = anima.interval;
                    iconAnima.play();
                })
        }
        else  {
            iconAnima.visible = false;
            icon.visible = true;
            icon.skin = YouziData.fullMatrixScreenDatas[index].iconImg;
        }
        var label = box.getChildByName('namelab') as Laya.Label;
        label.text = YouziData.fullMatrixScreenDatas[index].title;

        this.checkSendExpsureLog(index);
    }

    private checkSendExpsureLog(index)  {
        if (this.FullScreenUI.visible)  {
            if (!this.fullScreenExposure[YouziData.fullMatrixScreenDatas[index].appid])  {
                // console.log('---send log moregame index:',index);
                YouziData.sendExposureLog(YouziData.fullMatrixScreenDatas[index], BI_PAGE_TYPE.FULL_MATRIX_SCRENN);
                this.fullScreenExposure[YouziData.fullMatrixScreenDatas[index].appid] = 1;
            }
        }
    }

    public showFullScreen()  {
        if (YouziData.fullMatrixScreenDatas.length <= 0)  {
            console.log('全屏落地页无数据不展示');
            return;
        }
        if (this && this.parent) {
            this.zOrder = UI_ZORDER.UI_ZORDER_TWO;
            this.visible = true;
            this.FullScreenUI.visible = true;
            Laya.Tween.to(this, { scaleX: 1, scaleY: 1 }, 500, Laya.Ease.quadIn, Laya.Handler.create(this, this.showActionFinsh));
        }
    }

    private showActionFinsh()  {
        this.notifyUIState(YOUZI_UI_ID.Youzi_Full, true);
        // this.checkExposure();
        this.starFullListAction();
    }

    private onCloseFullScreen() {
        this.stopFullListAcion();
        Laya.Tween.to(this, { scaleX: 0, scaleY: 0 }, 500, Laya.Ease.quadInOut, Laya.Handler.create(this, this.closeActionFinsh));
        this.destroy();
    }

    private closeActionFinsh() {
        this.zOrder = 0;
        this.visible = false;
        this.FullScreenUI.visible = false;
        this.fullScreenExposure = {};
        this.notifyUIState(YOUZI_UI_ID.Youzi_Full, false);
    }

    private stopFullListAcion()  {
        this.stopAction = true;
    }

    private starFullListAction()  {
        this.fullScreenListAutoScroll();
    }

    private fullScreenListAutoScroll() {
        if (!this.FullScreenUI.visible)
            return;
        if (this.FullScreenList.length <= this.breaki + 1) {
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

    private listTweenToEnd()  {
        if (!this.stopAction) {
            this.endCompletHandler = new Laya.Handler(this, this.listTweenToStart, null, true);
            this.FullScreenList.tweenTo(this.FullScreenList.length - 1, this.dur, this.endCompletHandler);
        }
        this.curFront = true;
        this.curBack = false;
    }

    private listTweenToStart()  {
        if (!this.stopAction) {
            this.startCompleteHandler = new Laya.Handler(this, this.listTweenToEnd, null, true);
            this.FullScreenList.tweenTo(0, this.dur, this.startCompleteHandler);
        }
        this.curFront = false;
        this.curBack = true;
    }

    private onItemClick(e: Event, index: number): void  {
        if (e.type == 'mousedown') {

        } else if (e.type == 'mouseup') {
            console.log("当前选择的全屏落地页索引：" + index);
            var tmpData = YouziData.fullMatrixScreenDatas[index];
            tmpData.locationIndex = BI_PAGE_TYPE.FULL_MATRIX_SCRENN;
            YouziData.clickGameYouziUIId = YOUZI_UI_ID.Youzi_Full;
            YouziData.startOtherGame(tmpData, null);
            // if(tmpData.hotred == 1){
            //     var tmpSlideHit:Laya.Image = this.FullScreenList.getCell(index).getChildByName('redhit') as Laya.Image;
            //     tmpSlideHit.visible = false;
            //     this.fullScreenData[index].hotred = 0;
            // }
        } else if (e.type == 'mouseover') {

        }
    }

    private checkExposure()  {
        if (this.FullScreenUI.visible)  {
            for (var i = 0; i < YouziData.fullMatrixScreenDatas.length; i++)  {
                if (i > this.breaki)  {
                    console.log('break i:' + i);
                    break;
                }
                var infoData = YouziData.fullMatrixScreenDatas[i];
                if (!this.fullScreenExposure[infoData.appid])  {
                    this.fullScreenExposure[infoData.appid] = 1;
                    YouziData.sendExposureLog(infoData, BI_PAGE_TYPE.FULL_MATRIX_SCRENN);
                }

            }
        }
    }

}