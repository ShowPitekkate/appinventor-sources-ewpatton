// -*- mode: javascript; js-indent-level: 2; -*-
// Copyright © 2017 MIT, All rights reserved
// Released under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0
/**
 * @license
 * @fileoverview Specialization of Blockly's FieldTextInput to handle logic of procedure renaming.
 * @author ewpatton@mit.edu (Evan W. Patton)
 */
'use strict';

goog.provide('AI.Blockly.FieldProcedureName');

goog.require('Blockly.FieldTextInput');

/**
 * FieldProcedureName is a specialization of {@link Blockly.FieldTextInput} that handles renaming
 * procedures in the {@link AI.Blockly.ProcedureDatabase} when the procedure's name is changed.
 * @param {?string} text
 * @constructor
 */
AI.Blockly.FieldProcedureName = function(text) {
  AI.Blockly.FieldProcedureName.superClass_.constructor.call(this, text,
    Blockly.AIProcedure.renameProcedure);
  this.value_ = text;
};
goog.inherits(AI.Blockly.FieldProcedureName, Blockly.FieldTextInput);

AI.Blockly.FieldProcedureName.prototype.value_ = '';

/**
 * Set the value of the field.
 *
 * @see Blockly.FieldTextInput.setValue
 * @param {?string} newValue The new value of the field.
 * @override
 */
AI.Blockly.FieldProcedureName.prototype.setValue = function(newValue) {
  if (newValue === null) {
    return;
  }
  if (this.sourceBlock_) {  // can only set the property of an existing block
    var oldValue = this.getValue();
    AI.Blockly.FieldProcedureName.superClass_.setValue.call(this, newValue);
    newValue = this.getText();  // asymmetry here due to how Blockly.Field.setValue is implemented.
    if (typeof newValue === 'string' && this.sourceBlock_) {
      var procDb = this.sourceBlock_.workspace.getProcedureDatabase();
      if (procDb) {
        if (procDb.getProcedure(this.sourceBlock_.id)) {
          procDb.renameProcedure(this.sourceBlock_.id, oldValue, newValue);
        } else {
          procDb.addProcedure(newValue, this.sourceBlock_);
        }
      }
    }
    this.value_ = newValue;
    this.oldName_ = undefined;
  } else {
    this.setText(newValue);
  }
};

AI.Blockly.FieldProcedureName.prototype.getValue = function() {
  return this.value_;
};
/*
AI.Blockly.FieldProcedureName.prototype.onHtmlInputChange_ = function(e) {
  if (e.type == 'keypress') {
    console.log('Suppressed keypress event');
    return;  // suppress change handling on key press
  }
  console.log("input's value is " + Blockly.FieldTextInput.htmlInput_.value);
  AI.Blockly.FieldProcedureName.superClass_.onHtmlInputChange_.call(this, e);
};
*/
