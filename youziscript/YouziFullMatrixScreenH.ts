import { ui } from "../ui/layaMaxUI";
import { YouziData, BI_PAGE_TYPE, UI_ZORDER, YOUZI_UI_ID } from "./YouziData";
import YouziAtlasPngAnima from "./YouziAtlasPngAnima";

export default class YouziFullMatrixScreenH extends ui.youzi.Youzi_FullScreenHUI {

    private fullScreenExposure = {};
    private FullScreenUIScale = 1
    private breaki = 14;
    private curFront = true;
    private curBack = false;
    private stopAction = false;
    private isClick = false;
    private dur = 5000;
    private endCompletHandler: Laya.Handler = null;
    private startCompleteHandler: Laya.Handler = null;
    private uiStateCallCopy: Function = null;

    constructor(params?: any) {
        super();
        this.visible = false;
        this.FullScreenUI.visible = false;
        this.FullScreenList.hScrollBarSkin = "";
        this.designWHAdapter();
        this.scale(0, 0);
        this.pivot(this.width / 2, this.height / 2);
        this.pos(this.width / 2, Laya.stage.designHeight / 2);
        this.closeFullScreen.on(Laya.Event.CLICK, this, this.onCloseFullScreen);
    }

    private designWHAdapter()  {
        if (Laya.stage.designHeight != this.height)  {
            this.FullScreenUIScale = Laya.stage.designHeight / this.height;
            this.FullScreenUI.scale(this.FullScreenUIScale, this.FullScreenUIScale);
            this.BG.scaleY = this.FullScreenUIScale;
            this.height = Laya.stage.designHeight;
        }

        if (Laya.stage.designWidth != this.width)  {
            this.BG.scaleX = Laya.stage.designWidth / this.width;
            this.width = Laya.stage.designWidth;
        }

        if (YouziData.getAspectRatio() > 1.9)  {
            this.BG.scaleX = 2;
            this.width += 300;
            this.FullScreenUI.width += 300;
            this.FullScreenList.repeatX = 5;
            this.FullScreenList.width += 300;
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
            this.dur = YouziData.fullMatrixScreenDatas.length > (this.breaki + 1) ? (YouziData.fullMatrixScreenDatas.length - this.breaki - 1) * 5000 : 5000;

            this.FullScreenList.array = YouziData.fullMatrixScreenDatas;
            this.FullScreenList.mouseHandler = new Laya.Handler(this, this.onItemClick);
            this.FullScreenList.renderHandler = new Laya.Handler(this, this.onListRender);
        } else {
            console.log('全屏落地页无数据');
        }
    }

    private onListRender(box: Laya.Box, index: number): void  {
        if (YouziData.fullMatrixScreenDatas[index].hotred == 0) {
            var redhit: Laya.Image = box.getChildByName("redhit") as Laya.Image;
            redhit.visible = false;
        }

        var iconAnima = box.getChildByName("iconAnima") as Laya.Animation;
        var icon = box.getChildByName('icon') as Laya.Image;
        if (YouziData.fullMatrixScreenDatas[index].dynamicType == 1 &&
            YouziData.fullMatrixScreenDatas[index].dynamicIcon)  {

            //此处是为了解决动态调整list高度后，有些box的iconAnima会自动被之前的anima赋值导致显示出动画和图片的叠加
            iconAnima.frames = []
            iconAnima.scale(1.66, 1.66);
            iconAnima.visible = true;
            icon.visible = false;
            var youziAnima = new YouziAtlasPngAnima();
            youziAnima.createAnimation(
                YouziData.fullMatrixScreenDatas[index].dynamicIcon,
                // iconAnima,
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
        // this.checkExposure();
        this.notifyUIState(YOUZI_UI_ID.Youzi_Full, true);
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