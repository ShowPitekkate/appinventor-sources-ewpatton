/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview The class representing one block.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Folder');

goog.require('Blockly.Instrument'); // lyn's instrumentation code
goog.require('Blockly.FolderSvg');
goog.require('Blockly.Blocks');
goog.require('Blockly.Comment');
goog.require('Blockly.Connection');
goog.require('Blockly.ContextMenu');
goog.require('Blockly.ErrorIcon');
goog.require('Blockly.Input');
goog.require('Blockly.Msg');
goog.require('Blockly.Mutator');
goog.require('Blockly.Warning');
goog.require('Blockly.WarningHandler');
goog.require('Blockly.Workspace');
goog.require('Blockly.Xml');
goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.string');
goog.require('Blockly.Block');

Blockly.FOLDER_CATEGORY_HUE = [241, 213, 146];

Blockly.ALL_FOLDERS = [];

/**
 * Class for one block.
 * @constructor
 */
Blockly.Folder = function() {
    // We assert this here because there may be users of the previous form of
    // this constructor, which took arguments.
    goog.asserts.assert(arguments.length == 0,
        'Please use Blockly.Folder.obtain.');
};

goog.inherits(Blockly.Folder,Blockly.Block);

/**
 * Obtain a newly created block.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @return {!Blockly.Folder} The created block
 */
Blockly.Folder.obtain = function(workspace, prototypeName) {
    if (Blockly.Realtime.isEnabled()) {
        return Blockly.Realtime.obtainBlock(workspace, prototypeName);
    } else {
        var newFolder = new Blockly.Folder();
        newFolder.initialize(workspace, prototypeName);
        return newFolder;
    }
};

/**
 * Initialization for one block.
 * @param {!Blockly.Workspace} workspace The new block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 */
Blockly.Folder.prototype.initialize = function(workspace, prototypeName) {
    this.id = Blockly.genUid();
    workspace.addTopBlock(this);
    if (!workspace.isFlyout) {
        Blockly.ALL_FOLDERS.push(this);
    }
    this.fill(workspace, prototypeName);
    // Bind an onchange function, if it exists.
    if (goog.isFunction(this.onchange)) {
        Blockly.bindEvent_(workspace.getCanvas(), 'blocklyWorkspaceChange', this,
            this.onchange);
    }
};

/**
 * Fill a block with initial values.
 * @param {!Blockly.Workspace} workspace The workspace to use.
 * @param {string} prototypeName The typename of the block.
 */
Blockly.Folder.prototype.fill = function(workspace, prototypeName) {
    this.outputConnection = null;
    this.nextConnection = null;
    this.previousConnection = null;
    this.inputList = [];
    this.inputsInline = false;
    this.rendered = false;
    this.disabled = false;
    this.tooltip = '';
    this.contextMenu = true;

    this.parentBlock_ = null;
    this.childBlocks_ = [];
    this.deletable_ = true;
    this.movable_ = true;
    this.editable_ = true;
    this.collapsed_ = false;

    this.miniworkspace = new Blockly.MiniWorkspace(this,
        Blockly.MiniWorkspace.getWorkspaceMetrics_,
        Blockly.MiniWorkspace.setWorkspaceMetrics_);
    this.expandedFolder_ = false;
    this.workspace = workspace;

    this.isInFlyout = workspace.isFlyout;

    // Copy the type-specific functions and data from the prototype.
    if (prototypeName) {
        this.type = prototypeName;
        var prototype = Blockly.Blocks[prototypeName];
        goog.asserts.assertObject(prototype,
            'Error: "%s" is an unknown language block.', prototypeName);
        goog.mixin(this, prototype);
    }
    // Call an initialization function, if it exists.
    if (goog.isFunction(this.init)) {
        this.init();
    }
    // Bind an onchange function, if it exists.
    if ((!this.isInFlyout) && goog.isFunction(this.onchange)) {
        Blockly.bindEvent_(workspace.getCanvas(), 'blocklyWorkspaceChange', this,
            this.onchange);
    }
};

/**
 * Returns a list of mutator, comment, and warning icons.
 * @return {!Array} List of icons.
 */
Blockly.Folder.prototype.getIcons = function() {
    var icons = [];
    if (this.mutator) {
        icons.push(this.mutator);
    }
    if (this.comment) {
        icons.push(this.comment);
    }
    if (this.warning) {
        icons.push(this.warning);
    }
    if (this.errorIcon) {
        icons.push(this.errorIcon);
    }
    if (this.folderIcon) {
        icons.push(this.folderIcon);
    }
    return icons;
};

/**
 * Change the field value for a folder (e.g. 'CHOOSE' or 'REMOVE').
 * @param {string} newValue Value to be the new field.
 * @param {string} name The name of the field.
 */
Blockly.Folder.prototype.setFieldValue = function(newValue, name) {
  Blockly.Block.prototype.setFieldValue.call(this, newValue, name);
  if(name.toLowerCase() == 'name'){
    this.miniworkspace.updateTitle();
  }
};

/**
 * Create and initialize the SVG representation of the block.
 */
Blockly.Folder.prototype.initSvg = function() {
    this.svg_ = new Blockly.FolderSvg(this);
    this.svg_.init();
    if (!Blockly.readOnly) {
        Blockly.bindEvent_(this.svg_.getRootElement(), 'mousedown', this,
            this.onMouseDown_);
    }
    this.workspace.getCanvas().appendChild(this.svg_.getRootElement());
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.Folder.terminateDrag_ = function() {
    if (Blockly.Folder.onMouseUpWrapper_) {
        Blockly.unbindEvent_(Blockly.Folder.onMouseUpWrapper_);
        Blockly.Folder.onMouseUpWrapper_ = null;
    }
    if (Blockly.Folder.onMouseMoveWrapper_) {
        Blockly.unbindEvent_(Blockly.Folder.onMouseMoveWrapper_);
        Blockly.Folder.onMouseMoveWrapper_ = null;
    }
    var selected = Blockly.selected;
    if (Blockly.Folder.dragMode_ == 2) {
        // Terminate a drag operation.
        if (selected) {
            // Update the connection locations.
            var xy = selected.getRelativeToSurfaceXY();
            var dx = xy.x - selected.startDragX;
            var dy = xy.y - selected.startDragY;
            selected.moveConnections_(dx, dy);
            delete selected.draggedBubbles_;
            selected.setDragging_(false);
            selected.render();
            goog.Timer.callOnce(
                selected.bumpNeighbours_, Blockly.BUMP_DELAY, selected);
            // Fire an event to allow scrollbars to resize.
            if(selected.startWorkspace && selected.startWorkspace.isMW) {
                Blockly.fireUiEvent(selected.startWorkspace.svgGroup_, 'resize');
            }
            Blockly.fireUiEvent(window, 'resize');
        }
    }
    if (selected) {
        selected.workspace.fireChangeEvent();
    }
    Blockly.Folder.dragMode_ = 0;
};

/**
 * Removes the folder from ALL_FOLDERS.
 * @param {Blockly.Folder} folder to remove.
 */
Blockly.Folder.prototype.removeFromAllFolders = function(folder) {
    var found = false;

    var index = this.indexOfFolder();
    if (index != -1){
        Blockly.ALL_FOLDERS.splice(index,1);
        found = true;
    }
    if (!found) {
        throw 'Folder not present in ALL_FOLDERS.';
    }
};

/**
 * Returns the index of this folder in ALL_FOLDERS.
 * @return {number} index of this folder in ALL_FOLDER.
 */
Blockly.Folder.prototype.indexOfFolder = function () {
    for (var f, x = 0; f = Blockly.ALL_FOLDERS[x]; x++) {
        if (f == this) {
            return x;
        }
    }
    return -1;
};

/**
 * Give this block an icon to expand/collapse a miniworkspace.
 * @param {Blockly.FolderIcon} folderIcon a new folderIcon.
 */
Blockly.Folder.prototype.setFolderIcon = function(folderIcon) {
    if (this.folderIcon && this.folderIcon !== folderIcon) {
        this.folderIcon.dispose();
    }
    if (folderIcon) {
        folderIcon.block_ = this;
        this.folderIcon = folderIcon;
        if (this.svg_) {
            folderIcon.createIcon();
        }
    }
};

/**
 * Ensure two identically-named folders don't exist.
 * @param {string} name Proposed folder name.
 * @param {!Blockly.Block} block Block to disambiguate.
 * @return {string} Non-colliding name.
 */
Blockly.Folder.findLegalName = function(name, block) {
  if (block.isInFlyout) {
    // Flyouts can have multiple folders called 'folder'.
    return name;
  }
  name = name.replace(/\s+/g, '');
  while (!Blockly.Folder.isLegalName(name, block.workspace, block)) {
    // Collision with another folder.
    var r = name.match(/^(.*?)(\d+)$/);
    if (!r) {
      name += '2';
    } else {
      name = r[1] + (parseInt(r[2], 10) + 1);
    }
  }
  return name;
};

/**
 * Does this folder have a legal name?  Illegal names include names of
 * procedures already defined.
 * @param {string} name The questionable name.
 * @param {!Blockly.Workspace} workspace The workspace to scan for collisions.
 * @param {Blockly.Block} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is legal.
 */
Blockly.Folder.isLegalName = function(name, workspace, opt_exclude) {
  var blocks = workspace.getAllBlocks();
  // Iterate through every block and check the name.
  for (var x = 0; x < blocks.length; x++) {
    if (blocks[x] == opt_exclude) {
      continue;
    }
    var func = blocks[x].getFolderName;
    if (func) {
      var folderName = func.call(blocks[x]);
      if (Blockly.Names.equals(folderName, name)) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Returns true if the mouse is over this block's miniworkspace.
 * @param {Event} e a mouse event 
 * @return {boolean} true if the mouse is over the mw, otherwise false.
 */
Blockly.Folder.prototype.isOverFolder = function(e) {
    if (this.expandedFolder_){
        var mouseXY = Blockly.mouseToSvg(e);
        var folderXY = Blockly.getSvgXY_(this.miniworkspace.svgGroup_);
        var width = this.miniworkspace.width_;
        var height = this.miniworkspace.height_;
        var over = (mouseXY.x > folderXY.x) &&
            (mouseXY.x < folderXY.x + width) &&
            (mouseXY.y > folderXY.y) &&
            (mouseXY.y < folderXY.y + height);
        return over;
    } else {
        return false;
    }
};

/**
 * Check if this Folder is this folder block is an ancestor of the 
 * folder block passed by parameter.
 * @param {Blockly.Folder} folder to compare.
 * @return {boolean} true if this block is an ancestor of the parameter
 */
Blockly.Folder.prototype.isAncestorOf = function(folder) {
    var current = folder;
    while(current){
        if(current == this){
            return true;
        } else {
            current = current.workspace.block_;
        }
    }
    return false;
};

/**
 * Move this block's miniworkspace to the top of ALL_FOLDER.
 */
Blockly.Folder.prototype.promote = function() {
    var index = this.indexOfFolder();
    var found = false;
    if (index != -1){
        found = true;
        Blockly.ALL_FOLDERS.splice(0, 0, Blockly.ALL_FOLDERS.splice(index, 1)[0]);
    }

    if (!found) {
        throw 'Folder not present in ALL_FOLDERS.';
    }
};

/**
 * Duplicate this folder and its miniworkspace
 * @return {!Blockly.Block} The duplicate.
 * @private
 */
Blockly.Folder.prototype.duplicate_ = function() {
    // Create a duplicate via XML.
    var xmlBlock = Blockly.Xml.blockToDom_(this);
    //Blockly.Xml.deleteNext(xmlBlock);
    var folderXML = Blockly.Xml.workspaceToDom(this.miniworkspace);

    var newBlock = Blockly.Xml.domToBlock((this.workspace), xmlBlock);
    newBlock.miniworkspace.renderWorkspace(newBlock, folderXML);
    // Move the duplicate next to the old block.

    var xy = this.getRelativeToSurfaceXY();
    if (Blockly.RTL) {
        xy.x -= Blockly.SNAP_RADIUS;
    } else {
        xy.x += Blockly.SNAP_RADIUS;
    }
    xy.y += Blockly.SNAP_RADIUS * 2;
    newBlock.moveBy(xy.x, xy.y);
    newBlock.select();
    return newBlock;
};

/**
 * Show a confirmation dialog if users intend to delete more that #DELETION_THRESHOLD blocks.
 * @returns {boolean} true if the miniworkspace contains 0 blocks to delete or the user
 * confirms deletion.
 */
Blockly.Folder.prototype.confirmDeletion = function(){
    if(this.miniworkspace.getTopBlocks().length == 0 ){
        return true;
    }
    var txt = ((this.miniworkspace.getAllBlocks().length == 1) ? 
            Blockly.Msg.WARNING_DELETE_FOLDER_BLOCK : Blockly.Msg.WARNING_DELETE_FOLDER_BLOCKS);
    return confirm(Blockly.Msg.WARNING_DELETE_FOLDER
            .replace('%1',this.miniworkspace.getAllBlocks().length)
            .replace('%2', txt));
};