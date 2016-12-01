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

    socket.on(this.channel, function(msg){
        var msgJSON = JSON.parse(msg);
        var userFrom = msgJSON["user"];
        console.log("User"+ uuid +"receive new events from "+userFrom);
        if(userFrom != uuid){
             var newEvent = Blockly.Events.fromJson(msgJSON["event"], workspace);
             Blockly.Events.disable();
             console.log(msgJSON["event"]);
             newEvent.run(true);
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

