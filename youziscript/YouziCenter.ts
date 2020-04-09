//必要
import { YouziData, YOUZI_UI_ID, FULL_SCREEN_TYEP } from "./YouziData";
import YouziMainPush from "./YouziMainPush";
import YouziBottomBanner from "./YouziBottomBanner";
import YouziWeChatBanner from "./YouziWeChatBanner";
import YouziGameBanner from "./YouziGameBanner";
import YouziMultipleMainPushManager from "./YouziMultipleMainPushManager";

//横屏
import YouziMoreGame from "./YouziMoreGame";
import YouziSlideWindow from "./YouziSlideWindow";
import YouziGuessLike from "./YouziGuessLike";
import YouziSmallWall from "./YouziSmallWall";
import YouziOffLine from "./YouziOffLine";
import YouziFullMatrixScreen from "./YouziFullMatrixScreen"

//竖屏
import YouziGuessLikeH from "./YouziGuessLikeH";
import YouziMoreGameH from "./YouziMoreGameH";
import YouziOffLineH from "./YouziOffLineH";
import YouziSlideWindowH from "./YouziSlideWindowH";
import YouziSmallWallH from "./YouziSmallWallH";
import YouziFullMatrixScreenH from "./YouziFullMatrixScreenH";
import YouziRecentlyUsed from "./YouziRecentlyUsed";
import YouziMixBannerFullScreen from "./YouziMixBannerFullScreen";

export const MiniGame_Plat_Type =
{
    Test: 0,
    WeChat: 1,
    OppoMiniGame: 2
}

export const FullMartixType =
{
    TypeNormal: 1, //普通全屏矩阵，3列多行
    TypeUsed: 2, // 类型微信最近使用小程序排版，单列多行
    TypeMixBanner: 3 //混合型，上方为当行banner矩阵，下方为多列多行菊展墙
}

export default class YouziCenter {
    public static instance: YouziCenter = null;
    private navigateToMiniCallTemp: Array<Function> = [];

    private fullScreenMatrixNode: Laya.Node = null;
    //全屏落地页矩阵类型1
    private fullScreenMatrix: YouziFullMatrixScreen = null;
    private fullScreenMatrixH: YouziFullMatrixScreenH = null;

    //全屏落地页矩阵类型2
    private recentlyUsedScreen: YouziRecentlyUsed = null;

    //全屏落地页矩阵类型3
    private fullMixBanner: YouziMixBannerFullScreen = null;

    private vertical = true;//false 横屏
    private hw = 0; //分辨率比例
    // 更多游戏UI-竖屏
    private tempMoreGameUI: YouziMoreGame = null;
    //抽屉游戏UI-竖屏
    private tempSlideWindowUI: YouziSlideWindow = null;
    private slideWindowMask: Laya.Button = null;
    //更多游戏UI-横屏
    private tempMoreGameUIH: YouziMoreGameH = null;
    //抽屉游戏UI-横屏
    private tempSlideWindowUIH: YouziSlideWindowH = null;
    private slideWindowMaskH: Laya.Button = null;
    //离线推荐
    private offLineTemp = null;

    public static getInstance() {
        if (this.instance == null) {
            this.instance = new YouziCenter();
        }
        return this.instance

    }

    public youziDebug(debug: boolean) {
        YouziData.debug = debug;
    }
    /**
     * 
     * @param appId 小游戏平台提供的appid
     * @param resVersion 中心化请求数据资源的版本号，请找我方运营
     * @param miniGamePlatType 小游戏平台类型, 请使用sdk定义好的类型 MiniGame_Plat_Type
     */
    public initYouzi(appId: string, resVersion: string, miniGamePlatType: number) {
        this.getAspectRatio();
        YouziData.init(appId, resVersion, miniGamePlatType);
    }

    public getAspectRatio() {
        if (this.hw == 0) {
            if (Laya.stage.width > Laya.stage.height) {
                this.vertical = false;
                this.hw = Laya.Browser.width / Laya.Browser.height;
            }
            else {
                this.hw = Laya.Browser.height / Laya.Browser.width;
            }
        }
        return this.hw;
    }

    /**
     * 设置小游戏跳转回调
     */
    public registerNavigateToMiniCall(call: Function) {
        this.navigateToMiniCallTemp.push(call);
    }

    /**
     *重要：此接口只能SDK可调用
     */
    public notifyNavigateToMini(uiId: number) {
        if (this.navigateToMiniCallTemp.length > 0) {
            this.navigateToMiniCallTemp.forEach(function (call) {
                call(uiId);
            });
        }
    }

    /**
     * 销毁跳转通知
     */
    public offNavigateToMimiCall() {
        this.navigateToMiniCallTemp = null;
    }

    /**
     * 创建更多游戏按钮
     * @param parentNode 更多游戏按钮父节点
     * @param isAutoClick 是否有sdk自动完成点击注册,true交给sdk注册，false则开发者自行注册
     * @param params json{x:0,y:0,width:0,height:0,btnUrl:'youziTexture/btn-entrance-nogift.png'} btnUrl设置按钮图片
     */
    public createMoreGameButton(parentNode, isAutoClick, params?: any) {
        var moreGameBtn: Laya.Button = null;
        if (!params)
            params = {};
        if (params.hasOwnProperty('btnUrl')) {
            moreGameBtn = new Laya.Button(params.btnUrl);
        } else {
            moreGameBtn = new Laya.Button('youziTexture/btn-entrance-nogift.png');
        }
        moreGameBtn.mouseEnabled = true;
        moreGameBtn.stateNum = 1;
        moreGameBtn.width = params.hasOwnProperty('width') ? params.width : 119;
        moreGameBtn.height = params.hasOwnProperty('height') ? params.height : 119;
        var moreGameBtnX = params.hasOwnProperty('x') ? params.x : 0;
        var moreGameBtnY = params.hasOwnProperty('y') ? params.y : 0;
        moreGameBtn.pos(moreGameBtnX, moreGameBtnY);
        parentNode.addChild(moreGameBtn);
        if (isAutoClick) {
            moreGameBtn.dataSource = 1;
            // moreGameBtn.on(Laya.Event.CLICK,this,this.showMoreGameUI);
        }
        return moreGameBtn;
    }

    private showMoreGameUI(moreGameUI) {
        if (moreGameUI)
            moreGameUI.showMoreGameUI();
    }

    /**
     * 竖屏更多游戏
     * 1、此方法将会将界面添加到舞台上，并在展示时设置zorder为999，关闭时设置zorder为0
     * 2、此方法只会创建一次，之后没有销毁则不会重新创建，如果zorder生效，在任何一个界面都可以显示
     * @param moreGameBtn 创建的更多游戏按钮
     * @param params 传入json，{x:0,y:0,uiStateCall:function(uiID,msg){}}
     */
    public createMoreGameUIToStage(moreGameBtn: Laya.Button, params?: any) {
        if (!this.tempMoreGameUI) {
            this.tempMoreGameUI = new YouziMoreGame(params);
            this.tempMoreGameUI.setAddToStage(true);
            Laya.stage.addChild(this.tempMoreGameUI);
        }
        if (moreGameBtn && moreGameBtn.dataSource == 1) {
            moreGameBtn.on(Laya.Event.CLICK, this, this.showMoreGameUI, [this.tempMoreGameUI]);
        }
        return this.tempMoreGameUI;
    }

    /**
     * 竖屏更多游戏
     * 1、此方法将会将界面添加到舞台上，并在展示时设置zorder为999，关闭时设置zorder为0
     * 2、此方法只会创建一次，之后没有销毁则不会重新创建，如果zorder生效，在任何一个界面都可以显示
     * @param moreGameBtn 创建的更多游戏按钮
     * @param params 传入json，{x:0,y:0}
     */
    public createMoreGameUIHToStage(moreGameBtn: Laya.Button, params?: any) {
        if (!this.tempMoreGameUIH) {
            this.tempMoreGameUIH = new YouziMoreGameH(params);
            this.tempMoreGameUIH.setAddToStage(true);
            Laya.stage.addChild(this.tempMoreGameUIH);
        }
        if (moreGameBtn && moreGameBtn.dataSource == 1) {
            moreGameBtn.on(Laya.Event.CLICK, this, this.showMoreGameUI, [this.tempMoreGameUIH]);
        }
        return this.tempMoreGameUIH;
    }

    /**
     * 竖屏更多游戏UI
     * @param parentNode UI的父节点
     * @param moreGameBtn 创建的更多游戏按钮
     * @param params 传入json，{x:0,y:0}
     */
    public createMoreGameUI(parentNode, moreGameBtn: Laya.Button, params?: any) {
        var moreGameUI = new YouziMoreGame(params);
        if (moreGameBtn && moreGameBtn.dataSource == 1) {
            moreGameBtn.on(Laya.Event.CLICK, this, this.showMoreGameUI, [moreGameUI]);
        }
        parentNode.addChild(moreGameUI);
        return moreGameUI;
    }

    /**
     * 横屏更多游戏UI
     * @param parentNode UI的父节点
     * @param moreGameBtn 创建的更多游戏按钮
     * @param params 传入json，{x:0,y:0}
     */
    public createMoreGameUIH(parentNode, moreGameBtn: Laya.Button, params?: any) {
        var moreGameUIH = new YouziMoreGameH(params);
        if (moreGameBtn && moreGameBtn.dataSource == 1) {
            moreGameBtn.on(Laya.Event.CLICK, this, this.showMoreGameUI, [moreGameUIH]);
        }
        parentNode.addChild(moreGameUIH);
        return moreGameUIH;
    }

    /**
     * 创建抽屉按钮
     * @param parentNode 抽屉按钮父节点
     * @param leftOrRight true按钮在左边，false在右边
     * @param isAutoClick 是否有sdk自动完成点击注册,true交给sdk注册，false则开发者自行注册
     * @param params json{x:0,y:0,width:0,height:0}
     */
    public createSlideButton(parentNode, leftOrRight: boolean, isAutoClick: boolean, params?: any) {
        var slideBtn = new Laya.Button('youziTexture/btn_slide.png');
        slideBtn.mouseEnabled = true;
        slideBtn.stateNum = 1;
        if (!params) {
            params = {};
        }

        slideBtn.width = params.hasOwnProperty('width') ? params.width : 80;
        slideBtn.height = params.hasOwnProperty('height') ? params.width : 74;
        var slideBtnX = 0;
        var slideBtnY = params.hasOwnProperty('y') ? params.y : Laya.stage.height / 2;
        if (leftOrRight) {
            slideBtn.scaleX = -1;
            slideBtnX = params.hasOwnProperty('x') ? params.x : slideBtn.width;
        } else {
            slideBtnX = params.hasOwnProperty('x') ? params.x : Laya.stage.width - slideBtn.width;
        }
        slideBtn.pos(slideBtnX, slideBtnY);
        parentNode.addChild(slideBtn);
        if (isAutoClick) {
            slideBtn.dataSource = 1;
            // this.slideBtn.on(Laya.Event.CLICK,this,this.showSlideWindowUI);
        }
        return slideBtn;
    }

    private showSlideWindowUI(slideBtn, slideWindowUI) {
        if (slideWindowUI) {
            slideWindowUI.setSlideButton(slideBtn);
            slideWindowUI.showSlideWindow();
        }
    }

    public createSlideWindowToStage(slideBtn: Laya.Button, leftOrRight: boolean, params?: any) {
        if (!this.tempSlideWindowUI) {
            this.tempSlideWindowUI = new YouziSlideWindow(leftOrRight, params);
            this.tempSlideWindowUI.setAddToStage(true);
            this.tempSlideWindowUI.setSlideButton(slideBtn);
            this.tempSlideWindowUI.setSlideMask(this.createCacheSlideWindowMask());
            Laya.stage.addChild(this.createCacheSlideWindowMask());
            Laya.stage.addChild(this.tempSlideWindowUI);
        }
        if (slideBtn && slideBtn.dataSource == 1) {
            slideBtn.on(Laya.Event.CLICK, this, this.showSlideWindowUI, [slideBtn, this.tempSlideWindowUI]);
        }
        return this.tempSlideWindowUI
            ;
    }

    public createSlideWindowhToStage(slideBtn: Laya.Button, leftOrRight: boolean, params?: any) {
        if (!this.tempSlideWindowUIH) {
            this.tempSlideWindowUIH = new YouziSlideWindowH(leftOrRight, params);
            this.tempSlideWindowUIH.setAddToStage(true);
            this.tempSlideWindowUIH.setSlideButton(slideBtn);
            this.tempSlideWindowUIH.setSlideMask(this.createCacheSlideWindowMask());
            Laya.stage.addChild(this.createCacheSlideWindowMask());
            Laya.stage.addChild(this.tempSlideWindowUIH);
        }
        if (slideBtn && slideBtn.dataSource == 1) {
            slideBtn.on(Laya.Event.CLICK, this, this.showSlideWindowUI, [slideBtn, this.tempSlideWindowUIH]);
        }
        return this.tempSlideWindowUIH;
    }

    /**
     * 竖屏抽屉UI
     * @param parentNode UI的父节点
     * @param slideBtn 如果按钮使用的sdk自动注册，则在多界面使用此方法创建时需要传入创建的更多游戏按钮
     * @param leftOrRight true 左边，false 右边
     * @param params 传入json，{y:0,scaleX:1,scaleY:1}
     */
    public createSlideWindowUI(parentNode, slideBtn: Laya.Button, leftOrRight: boolean, params?: any) {
        var windowMask = this.createSlideWindowMask();
        var slideWindowUI = new YouziSlideWindow(leftOrRight, params);
        slideWindowUI.setSlideButton(slideBtn);
        slideWindowUI.setSlideMask(windowMask);
        if (slideBtn && slideBtn.dataSource == 1) {
            slideBtn.on(Laya.Event.CLICK, this, this.showSlideWindowUI, [slideBtn, slideWindowUI]);
        }
        parentNode.addChild(windowMask);
        parentNode.addChild(slideWindowUI);
        return slideWindowUI;
    }

    /**
     * 横屏屏抽屉UI
     * @param parentNode UI的父节点
     * @param slideBtn 如果按钮使用的sdk自动注册，则在多界面使用此方法创建时需要传入创建的更多游戏按钮
     * @param leftOrRight true 左边，false 右边
     * @param params 传入json，{x:0,y:0}
     * @param uiStateCall ui显示和隐藏回调
     */
    public createSlideWindowUIH(parentNode, slideBtn: Laya.Button, leftOrRight: boolean, params?: any) {
        var windowHMask = this.createSlideWindowMask();
        var slideWindowUIH = new YouziSlideWindowH(leftOrRight, params);
        slideWindowUIH.setSlideButton(slideBtn);
        slideWindowUIH.setSlideMask(windowHMask);
        if (slideBtn && slideBtn.dataSource == 1) {
            slideBtn.on(Laya.Event.CLICK, this, this.showSlideWindowUI, [slideBtn, slideWindowUIH]);
        }
        parentNode.addChild(windowHMask);
        parentNode.addChild(slideWindowUIH);
        return slideWindowUIH;
    }

    //创建抽屉遮罩，缓存在内存中
    private createCacheSlideWindowMask() {
        if (this.slideWindowMask) {
            return this.slideWindowMask;
        }
        else {
            this.slideWindowMask = this.createSlideWindowMask();
            return this.slideWindowMask;
        }
    }

    /**
     * 创建抽屉遮罩并不允许点击透过,节点应位于抽屉上面既绘制时在抽屉下面
     * 每次调用重新创建一个
     */
    private createSlideWindowMask() {
        var mask = new Laya.Button('youziTexture/blank.png');
        mask.width = Laya.stage.designWidth + 320;
        mask.height = Laya.stage.designHeight + 320;
        if (this.hw > 1.9) {
            mask.scale(1.8, 1.8);
        }
        mask.stateNum = 1;
        mask.centerX = 0;
        mask.centerY = 0;
        mask.visible = false;
        return mask;
    }


    /**
     * 底部推荐UI
     * @param parentNode UI的父节点
     * @param isOffSwich false:中心化sdk控制底部猜你喜欢、底部微信banner广告和底部游戏banner推荐的显示切换；true：由游戏端子机进行控制显示和隐藏
     * @param params 传入json，{x:0,y:0}
     */
    public createBottomBanner(parentNode, isOffSwich: boolean, params?: any) {
        var bottomBanner = new YouziBottomBanner(isOffSwich, params);
        parentNode.addChild(bottomBanner);
        return bottomBanner;
    }

    /**
     * 停止或者启动猜你喜欢List的tweento滚动列表
     * 1、如果猜你喜欢界面是重新创建的停止后可以不调用，创建时默认是启动滚动列表的
     * 2、当隐藏猜你喜欢并停止滚动列表并非是真的停止，列表回最后一次滚动到第一个或者最后一个才真正停止
     * @param startOrStop boolen值，false为启动，true为停止
     * @param bottomBannerTemp 游戏创建竖屏猜你喜欢对象，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建
     * 
     */
    public bottomBannerActionStopOrStart(startOrStop, bottomBannerTemp: YouziBottomBanner) {
        if (bottomBannerTemp) {
            if (startOrStop) {
                bottomBannerTemp.stopBottomBannerAcion();
            } else {
                bottomBannerTemp.starBottomBannerAction();
            }
        }
    }


    /**
     * 横向猜你喜欢UI
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0}
     */
    public createGuessLike(parentNode, params?: any) {
        var guessLike = new YouziGuessLike(params);
        parentNode.addChild(guessLike);
        return guessLike;
    }

    /**
     * 竖向猜你喜欢UI
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0}
     */
    public createGuessLikeH(parentNode, params?: any) {
        var guessLikeH = new YouziGuessLikeH(params);
        parentNode.addChild(guessLikeH);
        return guessLikeH;
    }

    /**
     * 停止或者启动猜你喜欢List的tweento滚动列表
     * 1、如果猜你喜欢界面是重新创建的停止后可以不调用，创建时默认是启动滚动列表的
     * 2、当隐藏猜你喜欢并停止滚动列表并非是真的停止，列表回最后一次滚动到第一个或者最后一个才真正停止
     * @param startOrStop boolen值，false为启动，true为停止
     * @param guessLikeTemp 游戏创建竖屏猜你喜欢对象，没有传null，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建
     * @param guessLikeHTemp 游戏创建竖屏猜你喜欢对象，没有传null，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建
     */
    public guessLikeListTweenStopOrStart(stopOrStart, guessLikeTemp: YouziGuessLike, guessLikeHTemp: YouziGuessLikeH) {

        if (guessLikeTemp) {
            if (stopOrStart) {
                guessLikeTemp.stopGuessLikeAcion();
            } else {
                guessLikeTemp.starGuessLikeAction();
            }
        }

        if (guessLikeHTemp) {
            if (stopOrStart) {
                guessLikeHTemp.stopGuessLikeHAcion();
            } else {
                guessLikeHTemp.starGuessLikeHAction();
            }
        }

    }

    /**
     * 主推
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0,scaleX:1,scaleY:1}
     */
    public createMainPush(parentNode, params?: any) {
        var mainPush = new YouziMainPush(params);
        parentNode.addChild(mainPush);
        return mainPush;
    }

    /**
     * 停止或者启动主推动画和循环切换主推内容
     * 1、主推创建时默认启动动画
     * @param stopOrStart boolen值，false为启动，true为停止
     * @param mainPushTemp 创建的主推对象，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建
     */
    public mainPushActionStopOrStart(stopOrStart, mainPushTemp: YouziMainPush) {
        if (stopOrStart) {
            mainPushTemp.clearTimerLoop();
        } else {
            mainPushTemp.startTimerLoop();
        }
    }

    /**
     * 
     * @param paramsJsonArray json数组,当前界面最多可以摆放的主推数组
     *  格式：[{parentNode:node,x:0,y:0,scaleX:1,scaleY:1}],parentNode:主推父节点，x，y为主推节点坐标
     */
    public createMultiMainPush(paramsJsonArray: Array<any>) {
        var youziMultiMainPushManager: YouziMultipleMainPushManager = new YouziMultipleMainPushManager(paramsJsonArray);
        return youziMultiMainPushManager;
    }

    /**
     * 停止或者启动多主推动画和循环切换主推内容
     * 1、主推创建时默认启动动画
     * @param stopOrStart boolen值，false为启动，true为停止
     * @param multiMainPushManager 多主推管理对象
     */
    public stopOrStartMultiMainPush(stopOrStart, multiMainPushManager: YouziMultipleMainPushManager) {
        if (!multiMainPushManager)
            return;
        if (stopOrStart) {
            multiMainPushManager.stopChangeTimeLoop();
        } else {
            multiMainPushManager.startChangeTimeLoop();
        }
    }

    /**
     * 竖屏离线推荐
     * @param parentNode UI的父节点
     * @param uiStateCall ui显示和隐藏回调 
     */
    public createOffline(uiStateCall?: Function) {
        if (!this.offLineTemp) {
            this.offLineTemp = new YouziOffLine();
            this.offLineTemp.setUIStateCall(uiStateCall);
            Laya.stage.addChild(this.offLineTemp);
        }
    }

    /**
     * 横屏离线推荐
     * @param uiStateCall ui显示和隐藏回调 
     */
    public createOfflineH(uiStateCall?: Function) {
        if (!this.offLineTemp) {
            this.offLineTemp = new YouziOffLineH();
            this.offLineTemp.setUIStateCall(uiStateCall);
            Laya.stage.addChild(this.offLineTemp);
        }


    }

    /**
     * 微信banner广告
     * @param {string} wechatBannerID 微信banner广告id 
     * @param {} posType 
     * @param {} offset 
     * @param {} isOffSwich false:中心化sdk控制底部猜你喜欢、底部微信banner广告和底部游戏banner推荐的显示切换；true：由游戏端子机进行控制显示和隐藏
     * @param {} isOffSwitchSelf 
     */
    public createYouzi_WechatBanner(wechatBannerID, posType = null, offset = null, isOffSwich = false, isOffSwitchSelf = false) {
        var youziWechatBanner: YouziWeChatBanner = new YouziWeChatBanner(wechatBannerID, posType, offset, isOffSwich, isOffSwitchSelf);
        return youziWechatBanner;
    }

    /**
     * 
     * @param {boolean} isOffSwitch false:中心化sdk控制底部猜你喜欢、底部微信banner广告和底部游戏banner推荐的显示切换；true：由游戏端子机进行控制显示和隐藏
     * @param {number} switchTime 微信banner广告是否自动更换。true交由中心化sdk调用switchBannerNow进行更换自身显示的内容
     * @param params 传入json，{x:0,y:0},默认请传null
     */
    public createYouzi_GameBanner(isOffSwitch, switchTime, params) {
        var youziGameBanner = new YouziGameBanner(isOffSwitch, switchTime);
        if (params) {
            youziGameBanner.setYouziPosition(params.x, params.y);
        }
        // this.youziGameBanner.onMyStart();
        return youziGameBanner;
    }

    /**
     * 小矩阵墙竖屏,注意不显示时请隐藏父节点
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0}
     */
    public createYouziSmallWall(parentNode, params?: any) {
        var youziSmallWall = new YouziSmallWall(params);
        parentNode.addChild(youziSmallWall);
        return youziSmallWall;
    }

    /**
    * 停止或者启动小矩阵墙竖屏List的tweento滚动列表
    * 1、如果小矩阵墙界面是重新创建的停止后可以不调用，创建时默认是启动滚动列表的
    * 2、当隐藏小矩阵墙竖屏并停止滚动列表并非是真的停止，列表回最后一次滚动到第一个或者最后一个才真正停止
    * @param startOrStop boolen值，false为启动，true为停止
    * @param smallWallTemp 游戏创建的小矩阵墙竖屏，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建的
    * 
    */
    public smallWallActionStopOrStart(startOrStop, smallWallTemp: YouziSmallWall) {
        if (smallWallTemp) {
            if (startOrStop) {
                smallWallTemp.stopSmallWallAcion();
            } else {
                smallWallTemp.starSmallWallAction();
            }
        }
    }

    /**
     * 大家都在玩儿横屏,注意不显示时请隐藏父节点
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0}
     */
    public createYouziSmallWallH(parentNode, params?: any) {
        var youziSmallWallH = new YouziSmallWallH(params);
        parentNode.addChild(youziSmallWallH);
        return youziSmallWallH;
    }

    /**
     * 停止或者启动小矩阵墙竖屏List的tweento滚动列表
     * 1、如果小矩阵墙界面是重新创建的停止后可以不调用，创建时默认是启动滚动列表的
     * 2、当隐藏小矩阵墙竖屏并停止滚动列表并非是真的停止，列表回最后一次滚动到第一个或者最后一个才真正停止
     * @param startOrStop boolen值，false为启动，true为停止
     * @param smallWallHTemp 游戏创建的小矩阵墙竖屏，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建的
     * 
     */
    public smallWallHActionStopOrStart(startOrStop, smallWallHTemp: YouziSmallWallH) {
        if (smallWallHTemp) {
            if (startOrStop) {
                smallWallHTemp.stopSmallWallAcion();
            } else {
                smallWallHTemp.starSmallWallAction();
            }
        }
    }

    /**
     * 根据配置显示全屏落地矩阵
     * @param fullMatrixType 全屏矩阵类型，不传则根据服务器配置显示，请使用sdk定义好 FullMartixType
     */
    public showFullMatrixAutoType(params?: any) {
        if (YouziData.getDataLoaded()) {
            this.fullScreenAutoCreate(params);
        }
        else {
            YouziData._loadedCallBacks.push(this.fullScreenAutoCreate.bind(this, null, [params]));
        }
    }

    private fullScreenAutoCreate(params?: any) {
        var fullType = 0;
        if (params) {
            fullType = params.hasOwnProperty('fullScreenType') ? params.fullScreenType : YouziData._fullScreenType;
        } else {
            fullType = YouziData._fullScreenType;
        }
        switch (fullType) {
            case FULL_SCREEN_TYEP.TYPE_FULL_MATRIX:
                this.showFullScreenMatrix(params);
                break;
            case FULL_SCREEN_TYEP.TYPE_RECENTLY_USED:
                this.showFullRecentlyUsed(params);
                break;
            case FULL_SCREEN_TYEP.TYPE_FULL_MIXBANNER:
                this.showFullMixBannerScreen(params);
                break;
            default:
                YouziData.youziLog('全屏落地页无需创建:', '没有可创建的全屏落地页类型');
                break;
        }
    }

    /**
   * 展示全屏落地页矩阵,全屏矩阵类型1
   * @param scale 放大UI
   */
    public showFullScreenMatrix(params?: any) {
        if (this.fullScreenMatrix) {
            if (this.vertical) {
                this.fullScreenMatrix.showFullScreen();
            } else {
                this.fullScreenMatrixH.showFullScreen();
            }
        } else {
            if (this.vertical) {
                this.fullScreenMatrix = new YouziFullMatrixScreen(params);
                this.fullScreenMatrixNode = Laya.stage.addChild(this.fullScreenMatrix)
                this.fullScreenMatrix.showFullScreen();
            } else {
                this.fullScreenMatrixH = new YouziFullMatrixScreenH(params);
                this.fullScreenMatrixNode = Laya.stage.addChild(this.fullScreenMatrixH)
                this.fullScreenMatrixH.showFullScreen();
            }
        }
    }

    private showFullRecentlyUsed(params?: any) {
        if (this.recentlyUsedScreen) {
            this.recentlyUsedScreen.showRecentlyUsed();
        }
        else {
            this.recentlyUsedScreen = new YouziRecentlyUsed(params);
            Laya.stage.addChild(this.recentlyUsedScreen);
            this.recentlyUsedScreen.showRecentlyUsed();
        }
    }

    private showFullMixBannerScreen(params?: any) {
        if (this.fullMixBanner) {
            this.fullMixBanner.showFullMixBanner();
        }
        else {
            this.fullMixBanner = new YouziMixBannerFullScreen(params);
            Laya.stage.addChild(this.fullMixBanner);
            this.fullMixBanner.showFullMixBanner();
        }
    }

}