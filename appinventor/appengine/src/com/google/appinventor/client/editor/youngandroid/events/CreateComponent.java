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

  public final native boolean recordUndo()/*-{
    return this.recordUndo;
  }-*/;

  public final native String getType()/*-{
    return this.type;
  }-*/;

  public final native <T> T as(Class<T> eventType)/*-{
    return eventType && eventType.jsType && eventType.jsType.prototype.type == this.type ?
      this : null;
  }-*/;

  public final native String getProjectId()/*-{
    return this.projectId;
  }-*/;

  public final native boolean isRealtime()/*-{
    return this.realtime;
  }-*/;

  public final native void setRealtime(boolean realtime)/*-{
    this.realtime = realtime;
  }-*/;

  public final native String getComponentId() /*-{
    return this.componentId;
  }-*/;

  public final native String getComponentType()/*-{
    return this.componentType;
  }-*/;

  public final native String getParentId()/*-{
    return this.parentId;
  }-*/;

  public final native int getBeforeIndex()/*-{
    return this.beforeIndex;
  }-*/;

  public final native JavaScriptObject toJson() /*-{
    return this.toJson();
  }-*/;

  public static final native CreateComponent fromJson(JavaScriptObject json)/*-{
    var event = new AI.Events.CreateComponent(null, null);
    event.fromJson(json);
    return event;
  }-*/;

  public final native String getUserId()/*-{
    // TODO Auto-generated method stub
    return 0;
  }-*/;

  public final native boolean isTransient()/*-{
    return !this.persist;
  }-*/;

}
