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
 * Type identifier used for serializing ComponentMove events.
 * @const {string}
 */
AI.Events.COMPONENT_MOVE = 'component.move';

/**
 * Type identifier used for serializing PropertyChange events.
 * @const {string}
 */
AI.Events.COMPONENT_PROPERTY = 'component.property';

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
 * @param {number} projectId Project ID of the project the designer editor is editing.
 * @param {{}} component id of the The newly created Component object.
 * @extends {AI.Events.Abstract}
 * @constructor
 */
AI.Events.ComponentEvent = function(projectId, component) {
  AI.Events.ComponentEvent.superClass_.constructor.call(this);
  this.projectId = projectId;
  this.componentId = component.id;
};
goog.inherits(AI.Events.ComponentEvent, AI.Events.Abstract);

// Component events need to be sent while collaborating in real time.
//AI.Events.ComponentEvent.prototype.realtime = true;
AI.Events.ComponentEvent.prototype.fromJson = function(json) {
  this.projectId = json["projectId"];
  this.componentId = json["componentId"];
};

AI.Events.ComponentEvent.prototype.toJson = function() {
  var json = {
    "type": this.type
  };
  if(this.projectId){
    json["projectId"] = this.projectId;
  }
  if(this.componentId){
    json["componentId"] = this.componentId;
  }
  return json;
};
/**
 * Event raised when a new Component has been dragged from the palette and dropped in the
 * Designer view.
 *
 * @param {number} projectId Project ID of the project the designer editor is editing.
 * @param {{}} component The newly created Component object.
 * @extends {AI.Events.ComponentEvent}
 * @constructor
 */
AI.Events.CreateComponent = function(projectId, component) {
  if (!component) {
    return;  // Blank event to be populated by fromJson.
  }
  AI.Events.CreateComponent.superClass_.constructor.call(this, projectId, component);
  this.componentType = component.type;
  this.parentId = component.parent;
  this.beforeIndex = component.beforeIndex;
};
goog.inherits(AI.Events.CreateComponent, AI.Events.ComponentEvent);

AI.Events.CreateComponent.prototype.type = AI.Events.COMPONENT_CREATE;

AI.Events.CreateComponent.prototype.fromJson = function(json) {
   AI.Events.ComponentAdd.superClass_.fromJson.call(this, json);
   this.componentType = json["componentType"];
   this.parentId = json["parentId"];
   this.beforeIndex = json["beforeIndex"];
};

AI.Events.CreateComponent.prototype.toJson = function() {
   var json = AI.Events.ComponentAdd.superClass_.fromJson.call(this);
   json["componentType"] = this.componentType;
   json["parentId"] = this.parentId;
   json["beforeIndex"] = this.beforeIndex;
   return json;
};
/**
 * Event raised when a Component has been removed from the screen.
 *
 * @param {number} projectId Project ID of the project the designer editor is editing.
 * @param {{}} component The deleted Component object.
 * @extends {AI.Events.ComponentEvent}
 * @constructor
 */
AI.Events.DeleteComponent = function(projectId, component) {
  if (!component) {
    return;  // Blank event for deserialization.
  }
  AI.Events.DeleteComponent.superClass_.constructor.call(this, projectId, component);
  this.parentId = component.parent;
};
goog.inherits(AI.Events.DeleteComponent, AI.Events.ComponentEvent);

AI.Events.DeleteComponent.prototype.type = AI.Events.COMPONENT_DELETE;

AI.Events.DeleteComponent.prototype.fromJson = function(json) {
   AI.Events.ComponentRemove.superClass_.fromJson.call(this, json);
   this.parentId = json["parentId"];
};

AI.Events.DeleteComponent.prototype.toJson = function() {
   var json = AI.Events.ComponentRemove.superClass_.fromJson.call(this);
   json["parentId"] = this.parentId;
   return json;
};
/**
 * Event raised when a Component has been moved in the component hierarchy.
 *
 * @param {number} projectId Project ID of the project the designer editor is editing.
 * @param {{}} component The moved Component
 * @extends {AI.Events.ComponentEvent}
 * @constructor
 */
AI.Events.ComponentMove = function(projectId, component) {
  if (!component) {
    return;  // Blank event for deserialization.
  }
  AI.Events.ComponentMove.superClass_.constructor.call(this, projectId, component);
  var location = this.currentLocation_();
  this.oldParentUuid = location.parentUuid;
  this.oldIndex = location.index;
};
goog.inherits(AI.Events.ComponentMove, AI.Events.ComponentEvent);

AI.Events.ComponentMove.prototype.type = AI.Events.COMPONENT_MOVE;

/**
 *
 * @param projectId
 * @param component
 * @constructor
 */
AI.Events.ComponentProperty = function(projectId, component) {
  if (!component) {
    return;  // Blank event for deserialization.
  }
  this.property = component.property;
  this.oldValue = component.oldValue;
  this.newValue = componnet.newValue;
};
goog.inherits(AI.Events.ComponentProperty, AI.Events.ComponentEvent);

AI.Events.ComponentProperty.property.type = AI.Events.COMPONENT_PROPERTY;

AI.Events.ComponentProperty.prototype.fromJson = function(json) {
   AI.Events.ComponentProperty.superClass_.fromJson.call(this, json);
   this.property = json["property"];
   this.oldValue = json["oldValue"];
   this.newValue = json["newValue"];
};

AI.Events.ComponentProperty.prototype.toJson = function() {
   var json = AI.Events.ComponentProperty.superClass_.fromJson.call(this);
   json["property"] = this.property;
   json["oldValue"] = this.oldValue;
   json["newValue"] = this.newValue;
   return json;
};