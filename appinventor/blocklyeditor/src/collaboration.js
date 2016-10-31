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

    var socket = io.connect("http://localhost:3000", {autoConnect: true});
    console.log("new collaboration established, channel is "+channel+" user is "+this.user);
    socket.emit("channel", channel);

    socket.on(this.channel, function(msg){
        var msgJSON = JSON.parse(msg);
        var userFrom = msgJSON["user"];
        //var user = document.getElementById("userEmail").children[1].textContent;
        //console.log("User"+ user +"receive new events from "+userFrom);
        console.log(msgJSON["event"]);
        //if(userFrom != this.user){
             var newEvent = Blockly.Events.fromJson(msgJSON["event"], workspace);
             Blockly.Events.disable();
             newEvent.run(true);
             Blockly.Events.enable();
        //}
    });

    this.workspace.addChangeListener(function(event){
        if(event.type==Blockly.Events.UI){
            return;
        }
        //var user = document.getElementById("userEmail").children[1].textContent;
        var msg = {
            //"user" : user,
            "event" : event.toJson()
        }
        var eventJson = JSON.stringify(msg);
        console.log(eventJson);
        socket.emit("block", eventJson);
    });
}


