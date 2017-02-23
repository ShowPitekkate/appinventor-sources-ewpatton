package com.google.appinventor.client.editor.youngandroid.events;

import com.google.gwt.core.client.JavaScriptObject;

public class DeleteComponent extends JavaScriptObject {
  public static final String TYPE;
  static {
    TYPE = init(DeleteComponent.class);
  }

  protected DeleteComponent() {}

  private static native String init(Class<DeleteComponent> clazz)/*-{
    clazz.jsType = AI.Events.DeleteComponent;
    return clazz.jsType.prototype.type;
  }-*/;

  public static native DeleteComponent create(String projectId, String uuid, String parentId, boolean permanentlyDeleted)/*-{
    var component = {
      id: uuid,
      parent: parentId,
      deleted: permanentlyDeleted};
    return new AI.Events.DeleteComponent(projectId, component);
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

  public final native String getParentId() /*-{
    return this.parentId;
  }-*/;

  public final native boolean getDeleted() /*-{
    return this.deleted;
  }-*/;

  public final native JavaScriptObject toJson() /*-{
    return this.toJson();
  }-*/;

  public final native static DeleteComponent fromJson(JavaScriptObject json) /*-{
    var event = new AI.Events.DeleteComponent(null, null);
    event.fromJson(json);
    return event;
  }-*/;

  public final boolean isTransient() {
    // TODO Auto-generated method stub
    return false;
  }

}
