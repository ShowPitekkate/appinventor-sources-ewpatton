package com.google.appinventor;

import com.google.appinventor.client.editor.simple.components.FormChangeListener;
import com.google.appinventor.client.editor.simple.components.MockComponent;

/**
 * Created by xinyue on 1/19/17.
 */
public class CollaborationManager implements FormChangeListener {

  private boolean broadcast;

  public CollaborationManager() {
    broadcast = true;
  }

  public void enableBroadcast() {
    broadcast = true;
  }

  public void disableBroadcast() {
    broadcast = false;
  }

  @Override
  public void onComponentPropertyChanged(MockComponent component, String propertyName, String propertyValue) {

  }

  @Override
  public void onComponentRemoved(MockComponent component, boolean permanentlyDeleted) {

  }

  @Override
  public void onComponentAdded(MockComponent component) {

  }

  @Override
  public void onComponentRenamed(MockComponent component, String oldName) {

  }

  @Override
  public void onComponentSelectionChange(MockComponent component, boolean selected) {

  }

  public native void componentSocketEvent(String channel)/*-{
    console.log("component socket event "+channel);
    $wnd.socket.emit("screenChannel", channel);
    $wnd.socket.on(channel, function(msg){
      var msgJSON = JSON.parse(msg);
      if($wnd.userEmail != msgJSON["user"]){
        switch(msgJSON["type"]){
          case "ADD":
            console.log("receive add component event");
            console.log(msgJSON);
            $wnd.Ode_runCreateComponent(msgJSON["parent"], msgJSON["componentType"], msgJSON["beforeIndex"], msgJSON["uuid"]);
            break;
          case "RENAME":
            break;
          case "REMOVE":
            console.log("receive remove component event");
            console.log(msgJSON);
            $wnd.Ode_runRemoveComponent(msgJSON["parent"], msgJSON["uuid"]);
            break;
          case "CHANGE":
            break;
          case "MOVE":
            break;
        }
      }
    });
  }-*/;
}
