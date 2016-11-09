/**
 * @license
 * @fileoverview Group collaboration for MIT App Inventor
 *
 * @author dxy0420@mit.edu (Xinyue Deng)
 */

'use strict'

goog.provide("AI2.Blockly.Collaboration");

goog.require("Blockly.Workspace");
goog.require("socket.io");

Blockly.Collaboration = function(workspace, channel){
    this.workspace = workspace;
    this.channel = channel;
    var uuid = generateUUID();

    var socket = io.connect("http://localhost:3000", {autoConnect: true});
    console.log("new collaboration established, channel is "+channel+" user is "+uuid);
    socket.emit("channel", channel);

    var colors = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#cab2d6', '#6a3d9a'];
    var userColorMap = new Map();
    var userCount = 0;
    socket.on(this.channel, function(msg){
        var msgJSON = JSON.parse(msg);
        var userFrom = msgJSON["user"];
        console.log("User"+ uuid +"receive new events from "+userFrom);
        console.log(msgJSON["event"]);
        if(userFrom != uuid){
             var newEvent = Blockly.Events.fromJson(msgJSON["event"], workspace);
             Blockly.Events.disable();
             console.log(newEvent); //blockId
             newEvent.run(true);
             var color = '';
             if(userColorMap.has(userFrom)){
                color = userColorMap.get(userFrom);
             }else{
                color = colors[userCount];
                userCount += 1;
                userColorMap.set(userFrom, color);
             }
             var block = Blockly.mainWorkspace.getBlockById(newEvent.blockId);
             block.svgGroup_.className += ' blockOtherSelected';
             block.svgPath_.setAttribute('stroke', color);
             Blockly.Events.enable();
        }
    });

    this.workspace.addChangeListener(function(event){
        if(event.type==Blockly.Events.UI){
            return;
        }
        var msg = {
            "user" : uuid,
            "event" : event.toJson()
        }
        var eventJson = JSON.stringify(msg);
        console.log(eventJson);
        socket.emit("block", eventJson);
    });
}

function generateUUID(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}



