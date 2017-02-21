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

  this.workspace.addChangeListener(function(event){
    if(event.type==Blockly.Events.UI){
      return;
    }
    var msg = {
      "channel": channel,
      "user": window.parent.userEmail,
      "source": "Block",
      "event" : event.toJson()
    };
    console.log(msg);
    window.parent.socket.emit("block", msg);
  });
}



