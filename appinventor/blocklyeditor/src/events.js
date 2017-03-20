'use strict';

goog.provide('AI.Events');

goog.require('Blockly.Events');

/**
 * Type identifier used for serializing CompanionConnect events.
 * @const {string}
 */
AI.Events.COMPANION_CONNECT = 'companion.connect';

/**
 * Type identifier used for serializing CompanionDisconnect events.
 * @const {string}
 */
AI.Events.COMPANION_DISCONNECT = 'companion.disconnect';

/**
 * Type identifier used for serializing ScreenSwitch events.
 * @const {string}
 */
AI.Events.SCREEN_SWITCH = 'screen.switch';

/**
 * Type identifier used for serializing ScreenPush events.
 * @const {string}
 */
AI.Events.SCREEN_PUSH = 'screen.push';

/**
 * Type identifier used for serializing ScreenPop events.
 * @const {string}
 */
AI.Events.SCREEN_POP = 'screen.pop';

/**
 * Type identifier used for serializing ComponentAdd events.
 * @const {string}
 */
AI.Events.COMPONENT_CREATE = 'component.create';

/**
 * Type identifier used for serializing ComponentRemove events.
 * @const {string}
 */
AI.Events.COMPONENT_DELETE = 'component.delete';

/**
 * Type identifier used for serializing MoveComponent events.
 * @const {string}
 */
AI.Events.COMPONENT_MOVE = 'component.move';

/**
 * Type identifier used for serializing PropertyChange events.
 * @const {string}
 */
AI.Events.COMPONENT_PROPERTY = 'component.property';

/**
 * Type identifier used for serializing SelectComponent events.
 * @const {string}
 */
AI.Events.COMPONENT_SELECT = 'component.select';

/**
 * Type identifier used for serializing LockComponent events.
 * @type {string}
 */
AI.Events.COMPONENT_LOCK = 'component.lock';

/**
 * Type identifier used for serializing UnlockComponent events.
 * @type {string}
 */
AI.Events.COMPONENT_UNLOCK = 'component.unlock';

/**
 * Type identifier used for serializing LockBlock events.
 * @type {string}
 */
AI.Events.BLOCK_LOCK = 'block.lock';

/**
 * Type identifier used for serializing UnlockBlock events.
 * @type {string}
 */
AI.Events.BLOCK_UNLOCK = 'block.unlock';

AI.Events.BLOCK_SELECT = 'block.select';

/**
 * Abstract class for all App Inventor events.
 * @constructor
 */
AI.Events.Abstract = function() {
  this.group = Blockly.Events.group_;
  this.recordUndo = Blockly.Events.recordUndo;
};

// Make AI.Events.Abstract a superclass of Blockly.Events.Abstract
goog.inherits(Blockly.Events.Abstract, AI.Events.Abstract);

/**
 * Set realtime to true if the event is a realtime event that should be processed by the
 * collaboration runtime. Certain classes of events are marked realtime=true if they and their
 * subclasses are meant to be realtime.
 *
 * @type {boolean}
 */
AI.Events.Abstract.prototype.realtime = false;

// Blockly Events are real-time.
Blockly.Events.Abstract.prototype.realtime = true;

/**
 * If true, the event is transient and should not trigger a save action (e.g., companion connected)
 * @type {boolean}
 */
AI.Events.Abstract.prototype.isTransient = false;

/**
 * The project id that the event is associated.
 *
 * @type {number}
 */
AI.Events.Abstract.prototype.projectId = null;

/**
 * The user id of the user that generated the event.
 *
 * @type {number}
 */
AI.Events.Abstract.prototype.userId = null;

/**
 * Base class of the event hierarchy regarding companion events.
 *
 * @constructor
 */
AI.Events.CompanionEvent = function() {
  AI.Events.CompanionEvent.superClass_.constructor.call(this);
};
goog.inherits(AI.Events.CompanionEvent, AI.Events.Abstract);

AI.Events.CompanionEvent.prototype.isTransient = true;

/**
 * Event raised when a connection has been established between the Companion and the ReplMgr.
 *
 * @constructor
 */
AI.Events.CompanionConnect = function() {
  AI.Events.CompanionConnect.superClass_.constructor.call(this);
};
goog.inherits(AI.Events.CompanionConnect, AI.Events.CompanionEvent);

AI.Events.CompanionConnect.prototype.type = AI.Events.COMPANION_CONNECT;

/**
 * Event raised when an existing connection between the ReplMgr and the Companion has been dropped.
 *
 * @constructor
 */
AI.Events.CompanionDisconnect = function() {
  AI.Events.CompanionDisconnect.superClass_.constructor.call(this);
};
goog.inherits(AI.Events.CompanionDisconnect, AI.Events.CompanionEvent);

AI.Events.CompanionDisconnect.prototype.type = AI.Events.COMPANION_DISCONNECT;

/**
 * Base class of the event hierarchy regarding screen events.
 *
 * @param {number} projectId Project ID of the currently active project editor.
 * @param {string} screenName Name of the screen being switched to.
 * @constructor
 */
AI.Events.ScreenEvent = function(projectId, screenName) {
  AI.Events.ScreenEvent.superClass_.constructor.call(this);
  this.projectId = projectId;
  this.screenName = screenName;
};
goog.inherits(AI.Events.ScreenEvent, AI.Events.Abstract);

// Changing screens is transient behavior.
AI.Events.ScreenEvent.prototype.isTransient = true;

AI.Events.ScreenEvent.prototype.toJSON = function() {
  var json = {
    "type" : this.type
  };
  if(this.projectId){
    json["projectId"] = this.projectId;
  }
  if(this.componentId){
    json["screenName"] = this.screenName;
  }
  return json;
};
/**
 * Event raised when a screen switch occurs in a project editor.
 *
 * @param {number} projectId
 * @param {string} screenName
 * @constructor
 */
AI.Events.ScreenSwitch = function(projectId, screenName) {
  AI.Events.ScreenSwitch.superClass_.constructor.call(this, projectId, screenName);
};
goog.inherits(AI.Events.ScreenSwitch, AI.Events.ScreenEvent);

AI.Events.ScreenSwitch.prototype.type = AI.Events.SCREEN_SWITCH;

AI.Events.ScreenSwitch.prototype.toJson = function() {
  return AI.Events.ScreenSwitch.superClass_.toJSON.call(this);
};
/**
 * Event raised when a screen is pushed on the view stack in the Companion.
 *
 * @param {number} projectId
 * @param {string} screenName
 * @constructor
 */
AI.Events.ScreenPush = function(projectId, screenName) {
  AI.Events.ScreenPush.superClass_.constructor.call(this, projectId, screenName);
};
goog.inherits(AI.Events.ScreenPush, AI.Events.ScreenEvent);

AI.Events.ScreenPush.prototype.type = AI.Events.SCREEN_PUSH;

/**
 * Event raised when a screen is popped from the view stack in the Companion.
 *
 * @param {number} projectId
 * @constructor
 */
AI.Events.ScreenPop = function(projectId) {
  AI.Events.ScreenPop.superClass_.constructor.call(this, projectId);
};
goog.inherits(AI.Events.ScreenPop, AI.Events.ScreenEvent);

AI.Events.ScreenPop.prototype.type = AI.Events.SCREEN_POP;

/**
 * Base class for component-related events.
 *
 * @param {String} projectId_screenName which is the id of the designer editor is editing.
 * @param {{}} component id of the The newly created Component object.
 * @extends {AI.Events.Abstract}
 * @constructor
 */
AI.Events.ComponentEvent = function(editorId, component) {
  AI.Events.ComponentEvent.superClass_.constructor.call(this);
  this.editorId = editorId;
  this.projectId = editorId.split("_")[0];
  this.componentId = component.id;
};
goog.inherits(AI.Events.ComponentEvent, AI.Events.Abstract);

// Component events need to be sent while collaborating in real time.
AI.Events.ComponentEvent.prototype.realtime = true;
AI.Events.ComponentEvent.prototype.isTransient = true;

AI.Events.ComponentEvent.prototype.fromJson = function(json) {
  this.editorId = json["editorId"];
  this.projectId = json["projectId"];
  this.componentId = json["componentId"];
};

AI.Events.ComponentEvent.prototype.toJson = function() {
  var json = {
    "type": this.type
  };
  if(this.editorId) {
    json["editorId"] = this.editorId;
  }
  if(this.projectId){
    json["projectId"] = this.projectId;
  }
  if(this.componentId){
    json["componentId"] = this.componentId;
  }
  return json;
};

AI.Events.ComponentEvent.fromJson = function(json) {
  var event;
  switch(json["type"]){
    case AI.Events.COMPONENT_CREATE:
      event = new AI.Events.CreateComponent(null, null);
      break;
    case AI.Events.COMPONENT_DELETE:
      event = new AI.Events.DeleteComponent(null, null);
      break;
    case AI.Events.COMPONENT_MOVE:
      event = new AI.Events.MoveComponent(null, null);
      break;
    case AI.Events.COMPONENT_PROPERTY:
      event = new AI.Events.ComponentProperty(null, null);
      break;
    case AI.Events.COMPONENT_SELECT:
      event = new AI.Events.SelectComponent(null, null);
      break;
    case AI.Events.COMPONENT_LOCK:
      event = new AI.Events.LockComponent(null, null);
      break;
    case AI.Events.COMPONENT_UNLOCK:
      event = new AI.Events.UnlockComponent(null, null);
      break;
    default:
      throw "Unknown component type: "+json["type"];
  }
  event.fromJson(json);
  return event;
};
/**
 * Event raised when a new Component has been dragged from the palette and dropped in the
 * Designer view.
 *
 * @param {String} editorId Editor ID of the project the designer editor is editing.
 * @param {{}} component The newly created Component object.
 * @extends {AI.Events.ComponentEvent}
 * @constructor
 */
AI.Events.CreateComponent = function(editorId, component) {
  if (!component) {
    return;  // Blank event to be populated by fromJson.
  }
  AI.Events.CreateComponent.superClass_.constructor.call(this, editorId, component);
  this.componentType = component.type;
};
goog.inherits(AI.Events.CreateComponent, AI.Events.ComponentEvent);

AI.Events.CreateComponent.prototype.type = AI.Events.COMPONENT_CREATE;

AI.Events.CreateComponent.prototype.fromJson = function(json) {
  console.log(json);
  AI.Events.CreateComponent.superClass_.fromJson.call(this, json);
  this.componentType = json["componentType"];
};

AI.Events.CreateComponent.prototype.toJson = function() {
  var json = AI.Events.CreateComponent.superClass_.toJson.call(this);
  json["componentType"] = this.componentType;
  console.log(json);
  return json;
};

AI.Events.CreateComponent.prototype.run = function() {
  console.log(this);
  var editor = top.getDesignerForForm(this.editorId);
  editor.addComponent(this.componentId, this.componentType);
};
/**
 * Event raised when a Component has been removed from the screen.
 *
 * @param {number} editorId Editor ID of the project the designer editor is editing.
 * @param {{}} component The deleted Component object.
 * @extends {AI.Events.ComponentEvent}
 * @constructor
 */
AI.Events.DeleteComponent = function(editorId, component) {
  if (!component) {
    return;  // Blank event for deserialization.
  }
  AI.Events.DeleteComponent.superClass_.constructor.call(this, editorId, component);
};
goog.inherits(AI.Events.DeleteComponent, AI.Events.ComponentEvent);

AI.Events.DeleteComponent.prototype.type = AI.Events.COMPONENT_DELETE;

AI.Events.DeleteComponent.prototype.fromJson = function(json) {
  AI.Events.DeleteComponent.superClass_.fromJson.call(this, json);
};

AI.Events.DeleteComponent.prototype.toJson = function() {
  var json = AI.Events.DeleteComponent.superClass_.toJson.call(this);
  return json;
};

AI.Events.DeleteComponent.prototype.run = function() {
  console.log(this);
  var editor = top.getDesignerForForm(this.editorId);
  editor.removeComponent(this.componentId);
};
/**
 * Event raised when a Component has been moved in the component hierarchy.
 *
 * @param {number} editorId Editor ID of the project the designer editor is editing.
 * @param {{}} component The moved Component
 * @extends {AI.Events.ComponentEvent}
 * @constructor
 */
AI.Events.MoveComponent = function(editorId, component) {
  if (!component) {
    return;  // Blank event for deserialization.
  }
  AI.Events.MoveComponent.superClass_.constructor.call(this, editorId, component);
  this.parentId = component.parentId;
  this.index = component.index;
};
goog.inherits(AI.Events.MoveComponent, AI.Events.ComponentEvent);

AI.Events.MoveComponent.prototype.type = AI.Events.COMPONENT_MOVE;

AI.Events.MoveComponent.prototype.fromJson = function(json) {
  AI.Events.MoveComponent.superClass_.fromJson.call(this, json);
  this.parentId = json["parentId"];
  this.index = json["index"];
};

AI.Events.MoveComponent.prototype.toJson = function() {
  var json = AI.Events.MoveComponent.superClass_.toJson.call(this);
  json["parentId"] = this.parentId;
  json["index"] = this.index;
  return json;
};

AI.Events.MoveComponent.prototype.run = function() {
  console.log(this);
  var editor = top.getDesignerForForm(this.editorId);
  editor.moveComponent(this.componentId, this.parentId, this.index);
};

/**
 * Event raised when a Component's property is changed.
 *
 * @param {number} editorId Editor ID of the project the designer editor is editing.
 * @param {{}} component The changed Component
 * @extends {AI.Events.ComponentEvent}
 * @constructor
 */
AI.Events.ComponentProperty = function(editorId, component) {
  if (!component) {
    return;  // Blank event for deserialization.
  }
  AI.Events.ComponentProperty.superClass_.constructor.call(this, editorId, component);
  this.property = component.property;
  this.value = component.value;
};
goog.inherits(AI.Events.ComponentProperty, AI.Events.ComponentEvent);

AI.Events.ComponentProperty.prototype.type = AI.Events.COMPONENT_PROPERTY;

AI.Events.ComponentProperty.prototype.fromJson = function(json) {
  AI.Events.ComponentProperty.superClass_.fromJson.call(this, json);
  this.property = json["property"];
  this.value = json["value"];
};

AI.Events.ComponentProperty.prototype.toJson = function() {
  var json = AI.Events.ComponentProperty.superClass_.toJson.call(this);
  json["property"] = this.property;
  json["value"] = this.value;
  return json;
};

AI.Events.ComponentProperty.prototype.run = function() {
  console.log(this);
  var editor = top.getDesignerForForm(this.editorId);
  if(this.property=="Name"){
    editor.renameComponent(this.componentId, this.value);
  } else {
    editor.setProperty(this.componentId, this.property, this.value);
  }
};

/**
 * Event raised when a Component has been selected by a user.
 *
 * @param {number} editorId Editor ID of the project the designer editor is editing.
 * @param {{}} component The selected Component
 * @extends {AI.Events.ComponentEvent}
 * @constructor
 */
AI.Events.SelectComponent  = function(editorId, component) {
  if (!component) {
    return;  // Blank event for deserialization.
  }
  AI.Events.SelectComponent.superClass_.constructor.call(this, editorId, component);
  this.userEmail = component.userEmail;
  this.selected = component.selected;
};
goog.inherits(AI.Events.SelectComponent, AI.Events.ComponentEvent);

AI.Events.SelectComponent.prototype.type = AI.Events.COMPONENT_SELECT;

AI.Events.SelectComponent.prototype.fromJson = function(json) {
  AI.Events.SelectComponent.superClass_.fromJson.call(this, json);
  this.userEmail = json["userEmail"];
  this.selected = json["selected"];
};

AI.Events.SelectComponent.prototype.toJson = function() {
  var json = AI.Events.SelectComponent.superClass_.toJson.call(this);
  json["userEmail"] = this.userEmail;
  json["selected"] = this.selected;
  return json;
};

AI.Events.SelectComponent.prototype.run = function() {
  console.log(this);
  var editor = top.getDesignerForForm(this.editorId);
  var component = editor.getComponentByUuid(this.componentId);
  if(this.selected) {
    if(window.parent.userColorMap){
      var color = window.parent.userColorMap.get(this.projectId).get(this.userEmail);
      component.select(color);
    }
  }else {
    component.deselect();
  }
};

/**
 * Event raised when a Component has been locked by a user.
 *
 * @param {number} editorId Editor ID of the project the designer editor is editing.
 * @param {{}} component The selected Component
 * @extends {AI.Events.ComponentEvent}
 * @constructor
 */
AI.Events.LockComponent  = function(editorId, component) {
  if (!component) {
    return;  // Blank event for deserialization.
  }
  AI.Events.LockComponent.superClass_.constructor.call(this, editorId, component);
  this.userEmail = component.userEmail;
};
goog.inherits(AI.Events.LockComponent, AI.Events.ComponentEvent);

AI.Events.LockComponent.prototype.type = AI.Events.COMPONENT_LOCK;

AI.Events.LockComponent.prototype.fromJson = function(json) {
  AI.Events.LockComponent.superClass_.fromJson.call(this, json);
  this.userEmail = json["userEmail"];
};

AI.Events.LockComponent.prototype.toJson = function() {
  var json = AI.Events.LockComponent.superClass_.toJson.call(this);
  json["userEmail"] = this.userEmail;
  return json;
};

AI.Events.LockComponent.prototype.run = function() {
  var lockedComponents = window.parent.lockedComponentsByChannel[this.editorId];
  lockedComponents[this.componentId] = this.userEmail;
  var editor = top.getDesignerForForm(this.editorId);
  var component = editor.getComponentByUuid(this.componentId);
  if(window.parent.userColorMap.get(this.projectId).has(this.userEmail)){
    component.setItemBackgroundColor(window.parent.userColorMap.get(this.projectId).get(this.userEmail));
  }
};

/**
 * Event raised when a Component has been unlocked by a user.
 *
 * @param {number} editorId Editor ID of the project the designer editor is editing.
 * @param {{}} component The selected Component
 * @extends {AI.Events.ComponentEvent}
 * @constructor
 */
AI.Events.UnlockComponent  = function(editorId, component) {
  if (!component) {
    return;  // Blank event for deserialization.
  }
  AI.Events.UnlockComponent.superClass_.constructor.call(this, editorId, component);
  this.userEmail = component.userEmail;
};
goog.inherits(AI.Events.UnlockComponent, AI.Events.ComponentEvent);

AI.Events.UnlockComponent.prototype.type = AI.Events.COMPONENT_UNLOCK;

AI.Events.UnlockComponent.prototype.fromJson = function(json) {
  AI.Events.UnlockComponent.superClass_.fromJson.call(this, json);
  this.userEmail = json["userEmail"];
};

AI.Events.UnlockComponent.prototype.toJson = function() {
  var json = AI.Events.UnlockComponent.superClass_.toJson.call(this);
  json["userEmail"] = this.userEmail;
  return json;
};

AI.Events.UnlockComponent.prototype.run = function() {
  var lockedComponents = window.parent.lockedComponentsByChannel[this.editorId];
  if(lockedComponents[this.componentId] == this.userEmail){
    delete lockedComponents[this.componentId];
  }
  var editor = top.getDesignerForForm(this.editorId);
  var component = editor.getComponentByUuid(this.componentId);
  component.clearItemBackgroundColor();
};

/**
 * Event raised when a Block has been locked by a user. The parents and children of this block
 * will also be locked.
 *
 * @param {String} workspaceId Workspace ID of the project the blocks editor is editing.
 * @param {String} blockId The selected block
 * @constructor
 */
AI.Events.LockBlock = function(workspaceId, blockId, userEmail) {
  this.workspaceId = workspaceId;
  this.blockId = blockId;
  this.userEmail = userEmail;
};

AI.Events.LockBlock.prototype.type = AI.Events.BLOCK_LOCK;

AI.Events.LockBlock.prototype.run = function() {
  var workspace = Blockly.allWorkspaces[this.workspaceId];
  var rootBlock = workspace.getBlockById(this.blockId);
  var lockedBlock = window.parent.lockedBlocksByChannel[this.workspaceId];
  while(rootBlock.parentBlock_){
    rootBlock = rootBlock.parentBlock_;
  }
  var blockQueue = [rootBlock];
  while(blockQueue.length!=0) {
    var block = blockQueue.shift();
    block.svgPath_.setAttribute('fill', 'url(#blocklyLockedPattern-'+this.userEmail+')');
    lockedBlock[block.id] = this.userEmail;
    block.childBlocks_.forEach(function(e){
      blockQueue.push(e);
    });
  }
};

/**
 * Event raised when a Block has been unlocked by a user. The parents and children of this block
 * will also be unlocked.
 *
 * @param {String} workspaceId Workspace ID of the project the blocks editor is editing.
 * @param {String} blockId The selected block
 * @constructor
 */
AI.Events.UnlockBlock = function(workspaceId, blockId, userEmail) {
  this.workspaceId = workspaceId;
  this.blockId = blockId;
  this.userEmail = userEmail;
};

AI.Events.UnlockBlock.prototype.type = AI.Events.BLOCK_UNLOCK;

AI.Events.UnlockBlock.prototype.run = function() {
  var workspace = Blockly.allWorkspaces[this.workspaceId];
  var rootBlock = workspace.getBlockById(this.blockId);
  var lockedBlock = window.parent.lockedBlocksByChannel[this.workspaceId];
  while(rootBlock.parentBlock_){
    rootBlock = rootBlock.parentBlock_;
  }
  var blockQueue = [rootBlock];
  while(blockQueue.length!=0) {
    var block = blockQueue.shift();
    block.svgPath_.setAttribute('fill', block.colour_);
    if(lockedBlock[block.id] = this.userEmail) {
      delete lockedBlock[block.id];
    }
    block.childBlocks_.forEach(function(e){
      blockQueue.push(e);
    });
  }
};

AI.Events.SelectBlock = function(workspaceId, blockId, userEmail) {
  this.workspaceId = workspaceId;
  this.blockId = blockId;
  this.userEmail = userEmail;
};

AI.Events.SelectBlock.prototype.type = AI.Events.BLOCK_SELECT;

AI.Events.SelectBlock.prototype.run = function() {
  var workspace = Blockly.allWorkspaces[this.workspaceId];
  if(this.userEmail in workspace.userLastSelection){
    var prevSelected = workspace.userLastSelection[this.userEmail];
    if(prevSelected.svgGroup_){
      prevSelected.svgGroup_.className.baseVal = 'blockDraggable';
      prevSelected.svgGroup_.className.animVal = 'blockDraggable';
      prevSelected.svgPath_.removeAttribute('stroke');
    }
    delete workspace.userLastSelection[this.userEmail];
    if($wnd.AIFeature_enableComponentLocking()) {
      new AI.Events.UnlockBlock(this.workspaceId, prevSelected.id, this.userEmail).run();
    }
  }
  if(this.blockId) {
    var block = workspace.getBlockById(this.blockId);
    var color = window.parent.userColorMap.get(window.parent.project).get(this.userEmail);
    if(block.svgGroup_) {
      block.svgGroup_.className.baseVal += ' blocklyOtherSelected';
      block.svgGroup_.className.animVal += ' blocklyOtherSelected';
      block.svgPath_.setAttribute('stroke', color);
    }
    workspace.userLastSelection[this.userEmail] = block;
    if($wnd.AIFeature_enableComponentLocking()) {
      new AI.Events.LockBlock(this.workspaceId, block.id, this.userEmail).run();
    }
  }
};