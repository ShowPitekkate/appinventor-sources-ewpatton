package com.google.appinventor.client;

import com.google.appinventor.client.Ode;
import com.google.appinventor.client.editor.simple.components.FormChangeListener;
import com.google.appinventor.client.editor.simple.components.MockComponent;
import com.google.appinventor.client.editor.youngandroid.events.CreateComponent;
import com.google.appinventor.client.output.OdeLog;
import com.google.gwt.core.client.JavaScriptObject;

/**
 * Created by xinyue on 1/19/17.
 */
public class CollaborationManager implements FormChangeListener {

  private boolean broadcast;
  private String screenChannel;

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
    OdeLog.log("Collaboration Manager onComponentAdded Called");
    if (broadcast) {
      OdeLog.log("Raise Create Component Event");
      CreateComponent event = CreateComponent.create(Long.toString(Ode.getInstance().getCurrentYoungAndroidProjectId()), component.getUuid(), component.getType(), component.getContainer().getUuid(), component.getIndex());
      broadcastComponentEvent(event.toJson());
    }
  }

  @Override
  public void onComponentRenamed(MockComponent component, String oldName) {

  }

  @Override
  public void onComponentSelectionChange(MockComponent component, boolean selected) {

  }

  public native void broadcastComponentEvent(JavaScriptObject eventJson)/*-{
    var msg = {
      "channel": $wnd.Ode_getCurrentChannel(),
      "user": $wnd.userEmail,
      "event": eventJSON
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
        switch(event["type"]){
          case AI.Events.COMPONENT_CREATE:
            console.log("receive add component event");
            $wnd.Ode_runCreateComponent(event["parentId"], event["componentType"], event["beforeIndex"], event["componentId"]);
            break;
          case "RENAME":
            break;
          case AI.Events.COMPONENT_DELETE:
            console.log("receive remove component event");
            console.log(msgJSON);
            $wnd.Ode_runRemoveComponent(event["parentId"], event["componentId"]);
            break;
          case AI.Events.COMPONENT_PROPERTY:
            break;
          case "MOVE":
            break;
        }
        $wnd.Ode_enableBroadcast();
      }
    });
  }-*/;


}
