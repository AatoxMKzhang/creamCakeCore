import { YouziData } from "./YouziData";
import YouziMultipleMainPush from "./YouziMultipleMainPush";

export default class YouziMultipleMainPushManager {
    //多主推个数
    private multipleAmount = 1;
    private isUpdateMainPush = false;
    //创建的多主推
    private multipleMainPushObj:Array<YouziMultipleMainPush> = [];
    //多主推父节点参数json数组
    private paramsJsonArray = [];
    //从主推数组中随机取出几个元素的数组
    private randomData = [];

    private startTimerMulti = true;
    
    /**
     * 
     * @param jsonArray jso你数组，格式：[{parentNode:node,x:0,y:0,scaleX:1,scaleY:1}],parentNode:主推父节点，x，y为主推节点坐标,scaleX,scaleY节点缩放
     * @param amount 主推数量
     */
    constructor(jsonArray:Array<any>){
        this.paramsJsonArray = jsonArray;
        this.initShow();
    }

    private initShow(){
        if(YouziData.getDataLoaded()){
            this.creatYouziMultipleMainPush();
        }else{
            YouziData._loadedCallBacks.push(this.creatYouziMultipleMainPush.bind(this));
        }
    }

    private creatYouziMultipleMainPush()
    {
        var amountArr = YouziData.getMultiMainAmount(this.paramsJsonArray.length);
        this.multipleAmount = amountArr[0];
        this.isUpdateMainPush = amountArr[1];
        this.randomData = YouziData.getGamesIndex(YouziData.mainRecDatas.length,this.multipleAmount);
        
        for(var i=0;i<this.randomData.length;i++)
        {
            var multipleMainPush:YouziMultipleMainPush = new YouziMultipleMainPush(YouziData.mainRecDatas[this.randomData[i]]);
            var paramsJson = this.paramsJsonArray[i];
            if(this.paramsJsonArray[i])
            {
                if(paramsJson.hasOwnProperty('parentNode'))
                {
                    multipleMainPush.x = paramsJson.hasOwnProperty('x')?paramsJson.x:0;
                    multipleMainPush.y = paramsJson.hasOwnProperty('y')?paramsJson.y:0;
                    multipleMainPush.scaleX = paramsJson.hasOwnProperty('scaleX')?paramsJson.scaleX:1;
                    multipleMainPush.scaleY = paramsJson.hasOwnProperty('scaleY')?paramsJson.scaleY:1;
                    paramsJson.parentNode.addChild(multipleMainPush);
                    this.multipleMainPushObj.push(multipleMainPush);
                }else
                {
                    console.log('多主推数组参数下标'+i+"中父节点为空");
                }
            }
        }
        this.startChangeTimeLoop();
    }

    //开启计时器，进行更换
    startChangeTimeLoop()
    {
        if(this.startTimerMulti){
            this.startTimerMulti = false;
            if(this.isUpdateMainPush){
                Laya.timer.loop(5000,this,this.updateMultipleMainPush);
            }
            for(var k=0;k<this.multipleMainPushObj.length;k++){
                this.multipleMainPushObj[k].startTimerLoop();
            }
        }
        
    }

    //停止计时器，停止更换
    stopChangeTimeLoop()
    {
        if(this.isUpdateMainPush){
            Laya.timer.clear(this,this.updateMultipleMainPush);
        }
        for(var l=0;l<this.multipleMainPushObj.length;l++){
            this.multipleMainPushObj[l].clearTimerLoop();
        }
        this.startTimerMulti = true;
    }

    private updateMultipleMainPush()
    {
        this.randomData = YouziData.getGamesIndex(YouziData.mainRecDatas.length,this.multipleAmount);
        for(var j=0;j<this.multipleMainPushObj.length;j++){
            this.multipleMainPushObj[j].updateMainRecMultiple(YouziData.mainRecDatas[this.randomData[j]]);
        }
    }


}