package com.google.appinventor.client;

import com.google.appinventor.client.Ode;
import com.google.appinventor.client.editor.simple.components.FormChangeListener;
import com.google.appinventor.client.editor.simple.components.MockComponent;
import com.google.appinventor.client.editor.youngandroid.events.ChangeProperty;
import com.google.appinventor.client.editor.youngandroid.events.CreateComponent;
import com.google.appinventor.client.editor.youngandroid.events.DeleteComponent;
import com.google.appinventor.client.editor.youngandroid.events.EventFactory;
import com.google.appinventor.client.output.OdeLog;
import com.google.gwt.core.client.JavaScriptObject;

/**
 * Created by xinyue on 1/19/17.
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

  }-*/;

  /*
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
   */

}
