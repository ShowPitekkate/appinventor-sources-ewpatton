package com.google.appinventor.client.editor.youngandroid.events;

import com.google.gwt.core.client.JavaScriptObject;

public class CreateComponent extends JavaScriptObject implements DesignerEvent {
  public static final String TYPE;
  
  static {
    TYPE = init(CreateComponent.class);
  }

  protected CreateComponent() {}

  private static native String init(Class<CreateComponent> clazz)/*-{
    clazz.jsType = AI.Events.CreateComponent;
    return clazz.jsType.prototype.type;
  }-*/;

  public static native CreateComponent create(String projectId, String uuid, String componentType, String parentId, int beforeIndex)/*-{
    var component = {
      id: uuid,
      type: componentType,
      parent: parentId,
      beforeIndex: beforeIndex};
    return new AI.Events.CreateComponent(projectId, component);
  }-*/;

  @Override
  public final native boolean recordUndo()/*-{
    return this.recordUndo;
  }-*/;

  @Override
  public final native String getType()/*-{
    return this.type;
  }-*/;

  @Override
  public final native <T> T as(Class<T> eventType)/*-{
    return eventType && eventType.jsType && eventType.jsType.prototype.type == this.type ?
      this : null;
  }-*/;

  @Override
  public final native String getProjectId()/*-{
    return this.projectId;
  }-*/;

  @Override
  public final native boolean isRealtime()/*-{
    return this.realtime;
  }-*/;

  @Override
  public final native void setRealtime(boolean realtime)/*-{
    this.realtime = realtime;
  }-*/;

  public final native JavaScriptObject toJson() /*-{
    return this.toJson();
  }-*/;
}
