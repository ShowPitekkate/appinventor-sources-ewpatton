/**
* @license
* @fileoverview Group collaboration for MIT App Inventor
*
* @author dxy0420@mit.edu (Xinyue Deng)
*/

'use strict'

goog.provide("AI2.Blockly.Collaboration");

goog.require("Blockly.Workspace");

Blockly.Collaboration = function(workspace){
  this.workspace = workspace;
  var channel = window.parent.Ode_getCurrentChannel();

  var userLastSelection = new Map();
  var uuid = workspace.id;
  //var socket = io.connect("http://localhost:3000", {autoConnect: true});
  console.log("new collaboration established, channel is "+channel+" user is "+uuid);
  window.parent.socket.emit("screenChannel", channel);

  window.parent.socket.on(channel, function(msg){
    var msgJSON = JSON.parse(msg);
    var userFrom = msgJSON["user"];
    var eventJson = msgJSON["event"];
    console.log("User "+ uuid +" receive new events from "+userFrom);
    console.log(msgJSON);
    if(userFrom != uuid){
      var newEvent = Blockly.Events.fromJson(eventJson, workspace);
      Blockly.Events.disable();
      newEvent.run(true);
      if(eventJson["type"]==="delete"){
        Blockly.Events.enable();
        return;
      }
      var color = window.parent.userColorMap.get(msgJSON["email"]);
      var block = Blockly.mainWorkspace.getBlockById(newEvent.blockId);
      if(eventJson["type"]==="create"){
        if(!Blockly.mainWorkspace.rendered){
                Blockly.mainWorkspace.rendered = true;
              }
              block.initSvg();
              block.rendered = true;
      }
      if(userLastSelection.has(userFrom)){
        var prevSelected = userLastSelection.get(userFrom);
        prevSelected.svgGroup_.className.baseVal = 'blockDraggable';
        prevSelected.svgGroup_.className.animVal = 'blockDraggable';
        prevSelected.svgPath_.removeAttribute('stroke');
      }
      block.svgGroup_.className.baseVal += ' blocklyOtherSelected';
      block.svgGroup_.className.animVal += ' blocklyOtherSelected';
      block.svgPath_.setAttribute('stroke', color);
      userLastSelection.set(userFrom, block);
      Blockly.Events.enable();
    }
  });

  this.workspace.addChangeListener(function(event){
    if(event.type==Blockly.Events.UI){
      return;
    }
    var msg = {
      "channel": channel,
      "user" : uuid,
      "email": window.parent.userEmail,
      "event" : event.toJson()
    };
    var eventJson = JSON.stringify(msg);
    console.log(eventJson);
    window.parent.socket.emit("block", msg);
  });
}



