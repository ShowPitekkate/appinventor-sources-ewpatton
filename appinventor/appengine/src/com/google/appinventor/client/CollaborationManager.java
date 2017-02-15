package com.google.appinventor.client;

import com.google.appinventor.client.editor.simple.components.FormChangeListener;
import com.google.appinventor.client.editor.simple.components.MockComponent;
import com.google.appinventor.client.editor.youngandroid.events.ChangeProperty;
import com.google.appinventor.client.editor.youngandroid.events.CreateComponent;
import com.google.appinventor.client.editor.youngandroid.events.DeleteComponent;
import com.google.appinventor.client.editor.youngandroid.events.EventFactory;
import com.google.gwt.core.client.JavaScriptObject;

/**
 * This class manages group collaboration.
 */
public class CollaborationManager implements FormChangeListener {

  private boolean broadcast;

  public CollaborationManager() {
    broadcast = true;
    EventFactory.exportMethodToJavascript();
  }

  public void enableBroadcast() {
    broadcast = true;
  }

  public void disableBroadcast() {
    broadcast = false;
  }

  @Override
  public void onComponentPropertyChanged(MockComponent component, String propertyName, String propertyValue) {
    if(broadcast){
      ChangeProperty event = ChangeProperty.create(Long.toString(Ode.getInstance().getCurrentYoungAndroidProjectId()), component.getUuid(), propertyName, propertyValue);
      broadcastComponentEvent(event.toJson());
    }
  }

  @Override
  public void onComponentRemoved(MockComponent component, boolean permanentlyDeleted) {
    if (broadcast) {
      DeleteComponent event = DeleteComponent.create(Long.toString(Ode.getInstance().getCurrentYoungAndroidProjectId()), component.getUuid(), component.getContainer().getUuid(), permanentlyDeleted);
      broadcastComponentEvent(event.toJson());
    }
  }

  @Override
  public void onComponentAdded(MockComponent component) {
    if (broadcast) {
      CreateComponent event = CreateComponent.create(Long.toString(Ode.getInstance().getCurrentYoungAndroidProjectId()), component.getUuid(), component.getType(), component.getContainer().getUuid(), component.getIndex());
      broadcastComponentEvent(event.toJson());
    }
  }

  @Override
  public void onComponentRenamed(MockComponent component, String oldName) {
    if(broadcast){
      ChangeProperty event = ChangeProperty.create(Long.toString(Ode.getInstance().getCurrentYoungAndroidProjectId()), component.getUuid(), MockComponent.PROPERTY_NAME_NAME, component.getName());
      broadcastComponentEvent(event.toJson());
    }
  }

  @Override
  public void onComponentSelectionChange(MockComponent component, boolean selected) {

  }

  public native void broadcastComponentEvent(JavaScriptObject eventJson)/*-{
    var msg = {
      "channel": $wnd.Ode_getCurrentChannel(),
      "user": $wnd.userEmail,
      "event": eventJson
    };
    console.log(msg);
    $wnd.socket.emit("component", msg);
  }-*/;

  public native void componentSocketEvent(String channel)/*-{
    console.log("component socket event "+channel);
    $wnd.socket.emit("screenChannel", channel);
    $wnd.socket.on(channel, function(msg){
      var msgJSON = JSON.parse(msg);
      var event = msgJSON["event"];
      if($wnd.userEmail != msgJSON["user"]){
        console.log(event);
        $wnd.Ode_disableBroadcast();
        $wnd.EventFactory_run(event["type"], event);
        $wnd.Ode_enableBroadcast();
      }
    });
  }-*/;

  public native void connectCollaborationServer(String server, String userEmail) /*-{
    $wnd.socket = $wnd.io.connect(server, {autoConnect: true});
    $wnd.userEmail = userEmail;
    $wnd.colors = ['#999999','#f781bf','#a65628','#ffff33','#ff7f00','#984ea3','#4daf4a','#377eb8','#e41a1c'];
    $wnd.userColorMap = new $wnd.Map();
    $wnd.userColorMap.rmv = $wnd.userColorMap["delete"];
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
    var msg = {
      "project": projectId,
      "user": $wnd.userEmail
    };
    $wnd.socket.emit("userJoin", msg);
    $wnd.socket.on(projectId, function(msg){
      var msgJSON = JSON.parse(msg);
      var c = "";
      var user = msgJSON["user"];
      if(user!==$wnd.userEmail){
        switch(msgJSON["type"]){
          case "join":
            if(!$wnd.userColorMap.has(user)){
              c = $wnd.colors.pop();
              $wnd.userColorMap.set(user, c);
            }
            $wnd.DesignToolbar_addJoinedUser(user, $wnd.userColorMap.get(user));
            break;
          case "leave":
            if($wnd.userColorMap.has(user)){
              c = $wnd.userColorMap.get(user);
              $wnd.colors.push(c);
              $wnd.userColorMap.rmv(user);
            }
            $wnd.DesignToolbar_removeJoinedUser(user);
            break;
        }
      }
    });
  }-*/;

  public native void leaveProject()/*-{
    var msg = {
      "project": $wnd.project,
      "user": $wnd.userEmail
    };
    $wnd.project = "";
    $wnd.socket.emit("userLeave", msg);
  }-*/;

}
