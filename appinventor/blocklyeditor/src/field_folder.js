
/**
 * @fileoverview Editable field for the folder's name.
 */
 goog.provide('Blockly.AIFolder');


/**
 * Used to rename a folder and its miniworkspace
 * @param {string} newname the new name
 */
Blockly.AIFolder.renameFolder = function (newName) {
  // this is bound to field_textinput object
  var oldName = this.text_;
  
  // [lyn, 10/27/13] now check legality of identifiers
  newName = Blockly.LexicalVariable.makeLegalIdentifier(newName);

  // [lyn, 10/28/13] Prevent two folders from having the same name.
  var procBlocks = Blockly.AIFolder.getAllFolderBlocksExcept(this.sourceBlock_);
  var procNames = procBlocks.map(function (decl) { return decl.getFieldValue('NAME'); });
  newName = Blockly.FieldLexicalVariable.nameNotIn(newName, procNames);
  // Sets the name in the miniworkspace's header
  this.sourceBlock_.miniworkspace.updateTitle();
  return newName;
};

/**
 * Gets every folder block except the one passed by parameter
 * @param {Blockly.Block} block the block to ignore
 */
Blockly.AIFolder.getAllFolderBlocksExcept = function (block) {
  var topBlocks = Blockly.mainWorkspace.getTopBlocks();
  var blockArray = [];
  for (var i=0;i<topBlocks.length;i++){
    if(topBlocks[i].type === "folder") {
      if (topBlocks[i] !== block) {
        blockArray.push(topBlocks[i]);
      }
    }
  }
  return blockArray;
};