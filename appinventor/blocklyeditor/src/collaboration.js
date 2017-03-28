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
    if(event.type==AI.Events.SCREEN_SWITCH){
      return;
    }
    if(event.type==Blockly.Events.UI && event.element!="selected"){
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

goog.require('Blockly.FieldTextInput');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldColour');
goog.require('Blockly.Block');

function wrapFieldForCollaboration(f) {
  if (f.isWrapped) {
    return f;
  } else {
    var wrappedFunc = function() {
      // Suppress editing if the sourceBlock_ is logged
      var lockedBlocks = top.lockedBlocksByChannel && top.lockedBlocksByChannel[this.sourceBlock_.workspace.formName];
      if (lockedBlocks && this.sourceBlock_.id in lockedBlocks && lockedBlocks[this.sourceBlock_.id] !== top.userEmail) {
        return;
      }
      f.apply(this, Array.prototype.splice.call(arguments));
    };
    wrappedFunc.isWrapped = true;
    return wrappedFunc;
  }
}

function wrapForCollaboration(f) {
  if (f.isWrapped) {
    return f;
  } else {
    var wrappedFunc = function() {
      // Suppress editing if the sourceBlock_ is logged
      var lockedBlocks = top.lockedBlocksByChannel && top.lockedBlocksByChannel[this.workspace.formName];
      if (lockedBlocks && this.id in lockedBlocks && lockedBlocks[this.id] !== top.userEmail) {
        return false;
      }
      return f.apply(this, Array.prototype.splice.call(arguments));
    };
    wrappedFunc.isWrapped = true;
    return wrappedFunc;
  }
}

Blockly.FieldTextInput.prototype.showEditor_ = wrapFieldForCollaboration(Blockly.FieldTextInput.prototype.showEditor_);
Blockly.FieldDropdown.prototype.showEditor_ = wrapFieldForCollaboration(Blockly.FieldDropdown.prototype.showEditor_);
Blockly.FieldColour.prototype.showEditor_ = wrapFieldForCollaboration(Blockly.FieldColour.prototype.showEditor_);
Blockly.Block.prototype.isEditable = wrapForCollaboration(Blockly.Block.prototype.isEditable);
