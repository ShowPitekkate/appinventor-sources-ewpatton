package com.google.appinventor.client;

import com.google.appinventor.client.editor.simple.components.FormChangeListener;
import com.google.appinventor.client.editor.simple.components.MockComponent;
import com.google.appinventor.client.editor.youngandroid.events.*;
import com.google.appinventor.client.explorer.project.Project;
import com.google.appinventor.client.wizards.FileUploadWizard;
import com.google.appinventor.common.version.AppInventorFeatures;
import com.google.appinventor.shared.rpc.project.ProjectNode;
import com.google.appinventor.shared.rpc.project.ProjectRootNode;
import com.google.appinventor.shared.rpc.project.youngandroid.YoungAndroidAssetsFolder;
import com.google.appinventor.shared.rpc.project.youngandroid.YoungAndroidProjectNode;
import com.google.gwt.core.client.JavaScriptObject;


/**
 * This class manages group collaboration.
 */
public class CollaborationManager implements FormChangeListener {
  public static final String FILE_UPLOAD = "file_upload";
  public static final String FILE_DELETE = "file_delete";

  private boolean broadcast;
  // TODO(xinyue): Modify this to support multi screen
  public String screenChannel;

  public CollaborationManager() {
    exportToJavascriptMethod();
    broadcast = true;
    screenChannel = "";
  }

  public void enableBroadcast() {
    broadcast = true;
  }

  public void disableBroadcast() {
    broadcast = false;
  }

  public void setScreenChannel(String screenChannel) {
    this.screenChannel = screenChannel;
  }

  public String getScreenChannel() {
    return this.screenChannel;
  }

  @Override
  public void onComponentPropertyChanged(MockComponent component, String propertyName, String propertyValue) {
    if(broadcast){
      ChangeProperty event = ChangeProperty.create(Ode.getCurrentChannel(), component.getUuid(), propertyName, propertyValue);
      broadcastComponentEvent(event.toJson());
    }
  }

  @Override
  public void onComponentRemoved(MockComponent component, boolean permanentlyDeleted) {
    if (broadcast) {
      DeleteComponent event = DeleteComponent.create(Ode.getCurrentChannel(), component.getUuid());
      broadcastComponentEvent(event.toJson());
    }
  }

  @Override
  public void onComponentAdded(MockComponent component) {
    if (broadcast) {
      CreateComponent event = CreateComponent.create(Ode.getCurrentChannel(), component.getUuid(), component.getType());
      broadcastComponentEvent(event.toJson());
    }
  }

  @Override
  public void onComponentRenamed(MockComponent component, String oldName) {
    if(broadcast){
      ChangeProperty event = ChangeProperty.create(Ode.getCurrentChannel(), component.getUuid(), MockComponent.PROPERTY_NAME_NAME, component.getName());
      broadcastComponentEvent(event.toJson());
    }
  }

  @Override
  public void onComponentMoved(MockComponent component, String newParentId, int index) {
    if(broadcast){
      MoveComponent event = MoveComponent.create(Ode.getCurrentChannel(), component.getUuid(), newParentId, index);
      broadcastComponentEvent(event.toJson());
    }
  }

  @Override
  public void onComponentSelectionChange(MockComponent component, boolean selected) {
    if (component.isForm()) {
      return;
    }
    if (AppInventorFeatures.enableComponentLocking()) {
      if (isComponentLocked(Ode.getCurrentChannel(), Ode.getCurrentUserEmail(), component.getUuid())) {
        return;
      }
    }
    if (broadcast) {
      SelectComponent event = SelectComponent.create(
          Ode.getCurrentChannel(), component.getUuid(), Ode.getInstance().getUser().getUserEmail(), selected);
      broadcastComponentEvent(event.toJson());
      if (AppInventorFeatures.enableComponentLocking()) {
        if (selected) {
          LockComponent lockEvent = LockComponent.create(
              Ode.getCurrentChannel(), component.getUuid(), Ode.getInstance().getUser().getUserEmail());
          lockEvent.run();
          broadcastComponentEvent(lockEvent.toJson());
          setLockedComponent(Ode.getCurrentChannel(), component.getUuid());
        } else {
          UnlockComponent unlockEvent = UnlockComponent.create(
              Ode.getCurrentChannel(), component.getUuid(), Ode.getInstance().getUser().getUserEmail());
          unlockEvent.run();
          broadcastComponentEvent(unlockEvent.toJson());
          removeLockedComponent(Ode.getCurrentChannel());
        }
      }
    }
  }

  public native void setLockedComponent(String channel, String componentId) /*-{
    $wnd.userLockedComponent[channel] = componentId;
  }-*/;

  public native void removeLockedComponent(String channel) /*-{
    delete $wnd.userLockedComponent[channel];
  }-*/;
  public native void broadcastComponentEvent(JavaScriptObject eventJson)/*-{
    var msg = {
      "channel": $wnd.Ode_getCurrentChannel(),
      "user": $wnd.userEmail,
      "source": "Designer",
      "event": eventJson
    };
    console.log(msg);
    $wnd.socket.emit("component", msg);
  }-*/;

  public native void broadcastFileEvent(String type, String projectId, String fileName) /*-{
    var msg = {
      "channel" : $wnd.Ode_getCurrentChannel(),
      "user": $wnd.userEmail,
      "source": "Media",
      "projectId": projectId,
      "type": type,
      "fileName": fileName
    };
    $wnd.socket.emit("file", msg);
  }-*/;

  public native void componentSocketEvent(String channel)/*-{
    console.log("component socket event "+channel);
    $wnd.socket.emit("screenChannel", channel);
    $wnd.subscribedChannel.add(channel);
    var workspace = Blockly.allWorkspaces[channel];
    // userLastSelection is the latest block selected by other user, mapped by user email
    // lockedComponent is the components locked by other users. Key is the component id, value is userEmail and timestamp
    // lockedBlock is the block locked by other users. Key is the block id, value is userEmail and timestamp
    workspace.userLastSelection = {};
    if($wnd.AIFeature_enableComponentLocking()){
      // get status of this channel from other users
      var getStatusMsg = {
        "channel" : channel,
        "user" : $wnd.userEmail,
        "source" : "GetStatus"
      };
      $wnd.socket.emit("getStatus", getStatusMsg);
      if(!(channel in $wnd.lockedComponentsByChannel)) {
        $wnd.lockedComponentsByChannel[channel] = {};
      }
      if(!(channel in $wnd.lockedBlocksByChannel)) {
        $wnd.lockedBlocksByChannel[channel] = {};
      }
    }
    if($wnd.socketEvents[channel]){
      return;
    }
    $wnd.socket.on(channel, function(msg){
      var msgJSON = JSON.parse(msg);
      var userFrom = msgJSON["user"];
      if($wnd.userEmail != userFrom){
        console.log(msgJSON);
        switch(msgJSON["source"]) {
          case "Designer":
            var componentEvent = AI.Events.ComponentEvent.fromJson(msgJSON["event"]);
            $wnd.Ode_disableBroadcast();
            componentEvent.run();
            $wnd.Ode_enableBroadcast();
            break;
          case "Block":
            var newEvent = Blockly.Events.fromJson(msgJSON["event"], workspace);
            Blockly.Events.disable();
            switch (newEvent.type) {
              case Blockly.Events.CREATE:
                newEvent.run(true);
                var block = workspace.getBlockById(newEvent.blockId);
                if (workspace.rendered) {
                  if(workspace.getParentSvg().parentNode.offsetParent){
                    block.initSvg();
                    block.render();
                  } else {
                    workspace.blocksNeedingRendering.push(block);
                  }
                } else {
                  workspace.blocksNeedingRendering.push(block);
                }
                break;
              case Blockly.Events.MOVE:
                if($wnd.AIFeature_enableComponentLocking()){
                  new AI.Events.UnlockBlock(channel, newEvent.blockId, userFrom).run();
                }
                newEvent.run(true);
                new AI.Events.SelectBlock(channel, newEvent.blockId, userFrom).run();
                break;
              case Blockly.Events.UI:
                new AI.Events.SelectBlock(channel, newEvent.newValue, userFrom).run();
                break;
              default:
                newEvent.run(true);
            }
            Blockly.Events.enable();
            break;
          case "Status":
            if(msgJSON["lockedComponentId"]){
              new AI.Events.LockComponent(channel, {id: msgJSON["lockedComponentId"], userEmail: userFrom}).run();
            }
            if(msgJSON["lockedBlockId"]){
              new AI.Events.SelectBlock(channel, msgJSON["lockedBlockId"], userFrom).run();
            }
            break;
          case "GetStatus":
            var msg = {
              "channel" : channel,
              "user" : $wnd.userEmail,
              "source" : "Status"
            };
            if(channel in $wnd.userLockedComponent){
              msg["lockedComponentId"] = $wnd.userLockedComponent[channel];
            }
            if(channel in $wnd.userLockedBlock){
              msg["lockedBlockId"] = $wnd.userLockedBlock[channel];
            }
            $wnd.socket.emit("status", msg);
            break;
          case "Media":
            console.log(msgJSON);
            $wnd.CollaborationManager_updateAsset(msgJSON["type"], msgJSON["projectId"], msgJSON["fileName"]);
        }
      }
      $wnd.socketEvents[channel] = true;
    });
  }-*/;

  public native void connectCollaborationServer(String server, String userEmail) /*-{
    $wnd.socket = $wnd.io.connect(server, {autoConnect: true});
    $wnd.userEmail = userEmail;
    $wnd.colors = ['#999999','#f781bf','#a65628','#ffff33','#ff7f00','#984ea3','#4daf4a','#377eb8','#e41a1c'];
    $wnd.userColorMap = new $wnd.Map();
    $wnd.userColorMap.rmv = $wnd.userColorMap["delete"];
    $wnd.subscribedChannel = new $wnd.Set();
    $wnd.socketEvents = {};
    if($wnd.AIFeature_enableProjectLocking()){
      $wnd.projectLeader = {};
    }
    if($wnd.AIFeature_enableComponentLocking()){
      // track locked components and blocks by all users
      $wnd.lockedComponentsByChannel = {};
      $wnd.lockedBlocksByChannel = {};
    }
    // track locked component and block by client self
    $wnd.userLockedComponent = {};
    $wnd.userLockedBlock = {};
    $wnd.socket.emit("userChannel", userEmail);
    $wnd.socket.on(userEmail, function(msg){
      var msgJSON = JSON.parse(msg);
      var projectId = String(msgJSON["project"]);
      $wnd.Ode_addSharedProject(projectId);
    });
  }-*/;

  public native void joinProject(String projectId) /*-{
    $wnd.socket.emit("projectChannel", projectId);
    $wnd.project = projectId;
    $wnd.DesignToolbar_removeAllJoinedUser();
    var msg = {
      "project": projectId,
      "user": $wnd.userEmail
    };
    $wnd.socket.emit("userJoin", msg);
    if(!$wnd.userColorMap.has(projectId)){
      $wnd.userColorMap.set(projectId, new $wnd.Map());
      $wnd.userColorMap.get(projectId).rmv = $wnd.userColorMap.get(projectId)["delete"];
    }
    if($wnd.socketEvents[projectId]){
      return;
    }
    $wnd.socket.on(projectId, function(msg){
      var msgJSON = JSON.parse(msg);
      if(msgJSON["project"]!=$wnd.project){
        return;
      }
      var c = "";
      var user = msgJSON["user"];
      var colorMap = $wnd.userColorMap.get(msgJSON["project"]);
      if(user!==$wnd.userEmail){
        switch(msgJSON["type"]){
          case "join":
            if(!colorMap.has(user)){
              c = $wnd.colors.pop();
              colorMap.set(user, c);
            }
            $wnd.DesignToolbar_addJoinedUser(user, colorMap.get(user));
            if($wnd.AIFeature_enableComponentLocking()){
              if(Blockly.mainWorkspace && Blockly.mainWorkspace.getParentSvg()
                  && !Blockly.mainWorkspace.getParentSvg().getElementById("blocklyLockedPattern-"+user)){
                Blockly.Collaboration.createPattern(user, $wnd.userColorMap.get(msgJSON["project"]).get(user));
              }
            }
            break;
          case "leave":
            if(colorMap.has(user)){
              c = colorMap.get(user);
              $wnd.colors.push(c);
              colorMap.rmv(user);
            }
            $wnd.DesignToolbar_removeJoinedUser(user);
            if($wnd.AIFeature_enableComponentLocking()){
              for(var channel in $wnd.lockedComponentsByChannel) {
                if(channel.split('_')[0] == msgJSON["project"]) {
                  Blockly.Collaboration.removeLockedComponent(channel, user);
                }
              }
              for(var channel in $wnd.lockedBlocksByChannel) {
                if(channel.split('_')[0] == msgJSON["project"]) {
                  Blockly.Collaboration.removeLockedBlock(channel, user);
                }
              }
            }
            break;
          case "leader":
            $wnd.DesignToolbar_switchLeader(msgJSON["project"], msgJSON["leader"], msgJSON["leaderEmail"]);
            break;
        }
      }
    });
    $wnd.socketEvents[projectId] = true;
  }-*/;
  public native void leaveProject()/*-{
    var msg = {
      "project": $wnd.project,
      "user": $wnd.userEmail
    };
    $wnd.project = "";
    $wnd.CollaborationManager_setCurrentScreenChannel("");
    $wnd.socket.emit("userLeave", msg);
  }-*/;

  public native void switchLeader(String leaderId, String leaderEmail)/*-{
    var msg = {
      "project": $wnd.project,
      "user": $wnd.userEmail,
      "leader": leaderId,
      "leaderEmail": leaderEmail
    }
    $wnd.socket.emit("leader", msg);
  }-*/;

  public static native boolean isComponentLocked(String channel, String userEmail, String componentId) /*-{
    if(componentId in $wnd.lockedComponentsByChannel[channel]){
      if($wnd.lockedComponentsByChannel[channel][componentId]!=userEmail) {
        return true;
      }
    }
    return false;
  }-*/;

  public static native boolean isBlockLocked(String channel, String userEmail, String blockId) /*-{
    if(blockId in $wnd.lockedBlocksByChannel[channel]){
      if($wnd.lockedBlocksByChannel[channel][blockId]!=userEmail) {
        return true;
      }
    }
    return false;
  }-*/;

  public static native void updateSourceTree(String channel, String userEmail) /*-{
    var lockedComponent = $wnd.lockedComponentsByChannel[channel];
    var editor = top.getDesignerForForm(channel);
    for (var componentId in lockedComponent) {
      if (lockedComponent.hasOwnProperty(componentId)) {
        var component = editor.getComponentByUuid(componentId);
        var userLocked = lockedComponent[componentId];
        if(userEmail!=userLocked){
          if($wnd.userColorMap.get(editor.projectId).has(userLocked)){
            component.setItemBackgroundColor($wnd.userColorMap.get(editor.projectId).get(userLocked));
          }
        }
      }
    }
  }-*/;

  public native void setWorkspaceReadOnly(String projectId, boolean readOnly) /*-{
    for(var formName in Blockly.allWorkspaces){
      if(formName.split('_')[0]==projectId){
        Blockly.allWorkspaces[formName].options.readOnly = readOnly;
      }
    }
    return;
  }-*/;

  public native void setProjectLeader(String project, String leader) /*-{
    $wnd.projectLeader[project] = leader;
  }-*/;

  public static void setCurrentScreenChannel(String channel) {
    Ode.getInstance().getCollaborationManager().setScreenChannel(channel);
  }

  public static void updateAsset(String type, String projectIdString, String fileName) {
    long projectId = Long.parseLong(projectIdString);
    Project project = Ode.getInstance().getProjectManager().getProject(projectId);
    if(type.equals(FILE_UPLOAD)){
      YoungAndroidAssetsFolder assetsFolder = ((YoungAndroidProjectNode) project.getRootNode()).getAssetsFolder();
      FileUploadWizard.finishUpload(assetsFolder, fileName, null);
      return;
    }
    if (type.equals(FILE_DELETE)) {
      ProjectNode deleteNode = project.getRootNode().findNode(fileName);
      project.deleteNode(deleteNode);
      return;
    }
    return;
  }

  public static native void exportToJavascriptMethod()/*-{
    $wnd.CollaborationManager_isComponentLocked =
        $entry(@com.google.appinventor.client.CollaborationManager::isComponentLocked(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;));
    $wnd.CollaborationManager_isBlockLocked =
        $entry(@com.google.appinventor.client.CollaborationManager::isBlockLocked(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;));
    $wnd.CollaborationManager_setCurrentScreenChannel =
        $entry(@com.google.appinventor.client.CollaborationManager::setCurrentScreenChannel(Ljava/lang/String;));
    $wnd.CollaborationManager_updateAsset =
        $entry(@com.google.appinventor.client.CollaborationManager::updateAsset(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;));
  }-*/;
}
