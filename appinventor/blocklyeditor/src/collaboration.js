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
    if(event.type==Blockly.Events.UI || event.type==AI.Events.SCREEN_SWITCH){
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

  var projectId = channel.split("_")[0];
  if(window.parent.userColorMap.has(projectId)){
    window.parent.userColorMap.get(projectId).forEach(function(v, k, m){
      if(!workspace.getParentSvg().getElementById("blocklyLockedPattern-"+k)){
        Blockly.Collaboration.createPattern(k, v);
      }
    });
  }
}

Blockly.Collaboration.createPattern = function(uuid, color){
  var defs = Blockly.mainWorkspace.getParentSvg().querySelector('defs');
  var patternId = "blocklyLockedPattern-"+uuid;
  var pattern = Blockly.utils.createSvgElement('pattern',
    {'id':patternId, 'patternUnits':"userSpaceOnUse", "width":"10", "height":"10"}, defs);
  Blockly.utils.createSvgElement('rect', {"width":"10", "height":"10", "fill":color}, pattern);
  Blockly.utils.createSvgElement("path", {"d":"M 0 0 L 10 10 M 10 0 L 0 10", "stroke":"#cc0"}, pattern);
  return;
}



